use std::path::{Path, PathBuf};
use std::fs;
use std::io::{Read, Write};

// Data structures for Adoptium API response
#[derive(serde::Deserialize, Debug)]
struct AdoptiumBinary {
    package: AdoptiumPackage,
}

#[derive(serde::Deserialize, Debug)]
struct AdoptiumPackage {
    link: String,
    #[allow(dead_code)]
    name: String,
}

#[derive(serde::Deserialize, Debug)]
struct AdoptiumRelease {
    binaries: Vec<AdoptiumBinary>,
    #[allow(dead_code)]
    version_data: serde_json::Value,
}

pub fn get_os_arch() -> (String, String) {
    let os = std::env::consts::OS; // "windows", "linux", "macos"
    let arch = std::env::consts::ARCH; // "x86_64", "aarch64"

    let api_os = match os {
        "windows" => "windows",
        "linux" => "linux",
        "macos" => "mac",
        _ => "unknown",
    };

    let api_arch = match arch {
        "x86_64" => "x64",
        "aarch64" => "aarch64",
        "x86" => "x32",
        _ => "x64", // Default fallback
    };

    (api_os.to_string(), api_arch.to_string())
}

pub fn fetch_java_download_url(version: u8) -> Result<String, String> {
    let (os, arch) = get_os_arch();
    let client = reqwest::blocking::Client::new();
    
    // https://api.adoptium.net/v3/assets/latest/17/hotspot?os=windows&architecture=x64
    let url = format!(
        "https://api.adoptium.net/v3/assets/latest/{}/hotspot?vendor=eclipse&os={}&architecture={}&image_type=jre", // requesting JRE specifically for smaller size
        version, os, arch
    );

    println!("[Rust] Fetching Java {} from: {}", version, url);

    let resp = client.get(&url)
        .header("User-Agent", "CrystalTides-Launcher")
        .send()
        .map_err(|e| format!("Request failed: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("API Error: {}", resp.status()));
    }

    let releases: Vec<AdoptiumRelease> = resp.json()
        .map_err(|e| format!("JSON Parse Error: {}", e))?;

    if let Some(release) = releases.first() {
        if let Some(binary) = release.binaries.first() {
            return Ok(binary.package.link.clone());
        }
    }

    Err("No binaries found".to_string())
}

// Callback signature: progress (0.0 to 1.0)
pub type ProgressCallback = extern "C" fn(f32);

pub fn download_and_install_java(
    version: u8, 
    install_dir: &Path, 
    callback: Option<ProgressCallback>
) -> Result<PathBuf, String> {
    // 1. Get URL
    let download_url = fetch_java_download_url(version)?;
    println!("[Rust] Download URL: {}", download_url);

    // 2. Download
    let temp_dir = install_dir.join(".temp");
    fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;
    
    let file_name = download_url.split('/').last().unwrap_or("java.zip");
    let zip_path = temp_dir.join(file_name);

    let mut response = reqwest::blocking::get(&download_url)
        .map_err(|e| format!("Download failed: {}", e))?;
    
    let total_size = response.content_length().unwrap_or(0);
    let mut file = fs::File::create(&zip_path).map_err(|e| e.to_string())?;
    
    let mut downloaded: u64 = 0;
    let mut buffer = [0; 8192];

    loop {
        let count = response.read(&mut buffer).map_err(|e| e.to_string())?;
        if count == 0 { break; }
        
        file.write_all(&buffer[..count]).map_err(|e| e.to_string())?;
        
        downloaded += count as u64;
        if total_size > 0 {
            let progress = downloaded as f32 / total_size as f32;
            if let Some(cb) = callback {
                cb(progress);
            }
        }
    }
    
    // 3. Extract
    println!("[Rust] Extracting to {:?}", install_dir);
    let file = fs::File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let outpath = match file.enclosed_name() {
            Some(path) => install_dir.join(path),
            None => continue,
        };

        if file.is_dir() || (*file.name()).ends_with('/') {
            let _ = fs::create_dir_all(&outpath);
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                     let _ = fs::create_dir_all(p);
                }
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    // 4. Find Java Executable
    // The extraction usually creates a subfolder like 'jdk-17.0.1...'
    // We need to hunt for bin/java.exe (Windows) or bin/java (*nix)
    
    let java_exe = find_java_binary(install_dir).ok_or("Java binary not found after extraction")?;
    
    // Cleanup
    let _ = fs::remove_dir_all(temp_dir);

    Ok(java_exe)
}

pub fn find_java_binary(root: &Path) -> Option<PathBuf> {
    let binary_name = if cfg!(windows) { "javaw.exe" } else { "java" };
    
    for entry in walkdir::WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
        if entry.file_name() == binary_name {
            // Check if it's in a 'bin' directory to be sure
            if let Some(parent) = entry.path().parent() {
                if parent.file_name().unwrap_or_default() == "bin" {
                    return Some(entry.path().to_path_buf());
                }
            }
        }
    }
    None
}
