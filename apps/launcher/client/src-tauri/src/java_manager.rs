use crate::errors::{NativeError, NativeResult};
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

// Data structures for Adoptium API response
#[derive(serde::Deserialize, Debug)]
struct AdoptiumBinary {
    package: AdoptiumPackage,
}

#[derive(serde::Deserialize, Debug)]
struct AdoptiumPackage {
    link: String,
}

#[derive(serde::Deserialize, Debug)]
struct AdoptiumRelease {
    binary: AdoptiumBinary,
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

pub fn fetch_java_download_url(version: u8) -> NativeResult<String> {
    let (os, arch) = get_os_arch();
    let client = reqwest::blocking::Client::builder()
        .user_agent("CrystalTides-Launcher")
        .build()?;

    let url = format!(
        "https://api.adoptium.net/v3/assets/latest/{}/hotspot?vendor=eclipse&os={}&architecture={}&image_type=jre",
        version, os, arch
    );

    println!("[Rust] Fetching Java {} from: {}", version, url);

    let resp = client.get(&url).send()?;

    if !resp.status().is_success() {
        return Err(NativeError::Java(format!(
            "Adoptium API Error: {}",
            resp.status()
        )));
    }

    let releases: Vec<AdoptiumRelease> = resp.json()?;

    if let Some(release) = releases.first() {
        return Ok(release.binary.package.link.clone());
    }

    Err(NativeError::Java(
        "No Java binaries found for this platform".into(),
    ))
}

pub fn download_and_install_java<F>(
    version: u8,
    install_dir: &Path,
    mut on_progress: F,
) -> NativeResult<PathBuf>
where
    F: FnMut(f32),
{
    let version_dir = install_dir.join(format!("java-{}", version));

    // 1. Get URL
    let download_url = fetch_java_download_url(version)?;

    // 2. Download
    let temp_dir = install_dir.join(".temp");
    fs::create_dir_all(&temp_dir)?;

    let file_name = download_url.split('/').next_back().unwrap_or("java.zip");
    let zip_path = temp_dir.join(file_name);

    let mut response = reqwest::blocking::get(&download_url)?;
    let total_size = response.content_length().unwrap_or(0);
    let mut file = fs::File::create(&zip_path)?;

    let mut downloaded: u64 = 0;
    let mut buffer = [0; 8192];

    loop {
        let count = response.read(&mut buffer)?;
        if count == 0 {
            break;
        }

        file.write_all(&buffer[..count])?;
        downloaded += count as u64;

        if total_size > 0 {
            on_progress(downloaded as f32 / total_size as f32);
        }
    }

    // 3. Extract
    if version_dir.exists() {
        let _ = remove_dir_all_with_retry(&version_dir);
    }
    fs::create_dir_all(&version_dir)?;

    println!("[Rust] Extracting Java to {:?}", version_dir);
    let zip_file = fs::File::open(&zip_path)?;
    let mut archive =
        zip::ZipArchive::new(zip_file).map_err(|e| NativeError::Archive(e.to_string()))?;

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| NativeError::Archive(e.to_string()))?;
        let outpath = match file.enclosed_name() {
            Some(path) => version_dir.join(path),
            None => continue,
        };

        if file.is_dir() || (*file.name()).ends_with('/') {
            fs::create_dir_all(&outpath)?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p)?;
                }
            }
            let mut outfile = fs::File::create(&outpath)?;
            std::io::copy(&mut file, &mut outfile)?;
        }
    }

    // 4. Find Java Executable
    let java_exe = find_java_binary(&version_dir)
        .ok_or_else(|| NativeError::Java("Java binary not found after extraction".into()))?;

    // Cleanup
    let _ = fs::remove_dir_all(temp_dir);

    Ok(java_exe)
}

pub fn find_java_binary(root: &Path) -> Option<PathBuf> {
    let binary_name = if cfg!(windows) { "javaw.exe" } else { "java" };

    for entry in walkdir::WalkDir::new(root)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_name() == binary_name {
            if let Some(parent) = entry.path().parent() {
                if parent.file_name().unwrap_or_default() == "bin" {
                    return Some(entry.path().to_path_buf());
                }
            }
        }
    }
    None
}

fn remove_dir_all_with_retry(path: &Path) -> std::io::Result<()> {
    let mut last_err = None;
    for _ in 0..3 {
        match fs::remove_dir_all(path) {
            Ok(_) => return Ok(()),
            Err(e) => {
                if e.kind() == std::io::ErrorKind::NotFound {
                    return Ok(());
                }
                last_err = Some(e);
                std::thread::sleep(std::time::Duration::from_millis(100));
            }
        }
    }
    Err(last_err
        .unwrap_or_else(|| std::io::Error::other("Failed to remove directory after retries")))
}
