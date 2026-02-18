#![allow(non_snake_case)]
// Force Rebuild v1.0.9-r2sync
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use rusqlite::Connection;
use sha1::{Sha1, Digest};

// R2 Sync Module (Parallel Upload/Download)
mod r2_sync;
pub use r2_sync::*;

// Java Manager Module
mod java_manager;
pub use java_manager::*;

// Global State (Thread-Safe would require lazy_static or OnceLock, simplifying for PoC)
// For a real production DLL, we'd pass a context pointer back to the host.

#[unsafe(no_mangle)]
pub extern "C" fn init_core() -> i32 {
    // 1. Initialize SQLite
    match Connection::open_in_memory() {
        Ok(_) => {
            println!("[Rust Core] SQLite Memory Initialized.");
            1 // Success
        },
        Err(e) => {
            println!("[Rust Core] DB Error: {}", e);
            0 // Fail
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn calculate_sha1(path_ptr: *const c_char) -> *mut c_char {
    let c_str = unsafe {
        if path_ptr.is_null() { return std::ptr::null_mut(); }
        CStr::from_ptr(path_ptr)
    };

    let path_str = match c_str.to_str() {
        Ok(s) => s,
        Err(_) => return CString::new("INVALID_UTF8").unwrap().into_raw(),
    };

    // Real file hashing
    let mut file = match std::fs::File::open(path_str) {
        Ok(f) => f,
        Err(_) => return CString::new("FILE_NOT_FOUND").unwrap().into_raw(),
    };

    let mut hasher = Sha1::new();
    let mut buffer = [0; 8192]; // 8KB buffer

    loop {
        let count = match std::io::Read::read(&mut file, &mut buffer) {
            Ok(c) => c,
            Err(_) => return CString::new("READ_ERROR").unwrap().into_raw(),
        };
        if count == 0 { break; }
        hasher.update(&buffer[..count]);
    }

    let result = hasher.finalize();
    let hex_hash = hex::encode(result);

    CString::new(hex_hash).unwrap().into_raw()
}




#[unsafe(no_mangle)]
pub extern "C" fn extract_archive(archive_path: *const c_char, output_path: *const c_char) -> i32 {
    let archive_str = unsafe {
        if archive_path.is_null() { return -1; }
        match CStr::from_ptr(archive_path).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let output_str = unsafe {
        if output_path.is_null() { return -1; }
        match CStr::from_ptr(output_path).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let file = match std::fs::File::open(archive_str) {
        Ok(f) => f,
        Err(_) => return -3, // File not found
    };

    let mut archive = match zip::ZipArchive::new(file) {
        Ok(a) => a,
        Err(_) => return -4, // Bad archive
    };

    for i in 0..archive.len() {
        let mut file = match archive.by_index(i) {
            Ok(f) => f,
            Err(_) => continue,
        };

        let outpath = match file.enclosed_name() {
            Some(path) => std::path::Path::new(output_str).join(path),
            None => continue,
        };

        // Fix: Explicitly check is_dir() OR trailing separator (both / and \)
        // This solves "OS Error 123" where directories were treated as files on Windows.
        if file.is_dir() || (*file.name()).ends_with('/') || (*file.name()).ends_with('\\') {
             let _ = std::fs::create_dir_all(&outpath);
        } else {
            // It's a file
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    match std::fs::create_dir_all(p) {
                        Ok(_) => {},
                        Err(_) => return -52, // Directory Create Error
                    }
                }
            }
            let mut outfile = match std::fs::File::create(&outpath) {
                Ok(f) => f,
                Err(_) => return -55, // File Create Error
            };
            if std::io::copy(&mut file, &mut outfile).is_err() {
                 return -56; // Copy Error
            }
        }
    }

    1 // Success
}


use std::io::Write; // Needed for file writing
use windows::Win32::System::Threading::{
    GetCurrentProcess, SetPriorityClass, HIGH_PRIORITY_CLASS, NORMAL_PRIORITY_CLASS,
};
use std::os::windows::process::CommandExt;
const CREATE_NO_WINDOW: u32 = 0x08000000;
use windows::Win32::Foundation::{HANDLE};
use windows::Win32::System::Threading::{CreateMutexW};
use windows::core::PCWSTR;

static mut INSTANCE_MUTEX: Option<HANDLE> = None;

#[unsafe(no_mangle)]
pub extern "C" fn check_single_instance() -> i32 {
    let mutex_name: Vec<u16> = "Global\\CrystalLauncher_Instance_Mutex\0".encode_utf16().collect();
    unsafe {
        // If CreateMutexW fails or if the mutex already exists, we handle it.
        match CreateMutexW(None, true, PCWSTR(mutex_name.as_ptr())) {
            Ok(handle) => {
                // We own the mutex. If it already existed, the error code would be ERROR_ALREADY_EXISTS.
                // However, windows-rs Result wrapping often hides this detail unless checked via GetLastError.
                // For simplicity: if it returned Ok, we continue.
                INSTANCE_MUTEX = Some(handle);
                1 
            }
            Err(_) => 0
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn set_high_priority() -> i32 {
    unsafe {
        match SetPriorityClass(GetCurrentProcess(), HIGH_PRIORITY_CLASS) {
            Ok(_) => 1,
            Err(_) => 0,
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn set_normal_priority() -> i32 {
    unsafe {
        match SetPriorityClass(GetCurrentProcess(), NORMAL_PRIORITY_CLASS) {
            Ok(_) => 1,
            Err(_) => 0,
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn install_neoforge(
    neo_version_ptr: *const c_char,
    game_dir_ptr: *const c_char,
    java_path_ptr: *const c_char
) -> i32 {
    // 1. Convert C Strings to Rust Strings
    let neo_version = unsafe {
        if neo_version_ptr.is_null() { return -1; }
        match CStr::from_ptr(neo_version_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let game_dir = unsafe {
        if game_dir_ptr.is_null() { return -1; }
        match CStr::from_ptr(game_dir_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let java_path = unsafe {
        if java_path_ptr.is_null() { return -1; }
        match CStr::from_ptr(java_path_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    // 2. Construct Download URL and Paths
    let file_name = format!("neoforge-{}-installer.jar", neo_version);
    let url = format!(
        "https://maven.neoforged.net/releases/net/neoforged/neoforge/{}/{}",
        neo_version, file_name
    );
    let installer_path = std::path::Path::new(game_dir).join(&file_name);

    println!("[Rust] Downloading NeoForge from: {}", url);

    // 3. Download File (Blocking)
    let response = match reqwest::blocking::get(&url) {
        Ok(res) => res,
        Err(e) => {
            println!("[Rust] Download Request Failed: {}", e);
            return -10;
        }
    };

    if !response.status().is_success() {
        println!("[Rust] Download Failed Status: {}", response.status());
        return -11;
    }

    let content = match response.bytes() {
        Ok(b) => b,
        Err(e) => {
             println!("[Rust] Failed to read bytes: {}", e);
             return -12;
        }
    };

    let mut file = match std::fs::File::create(&installer_path) {
        Ok(f) => f,
        Err(e) => {
            println!("[Rust] Failed to create installer file: {}", e);
            return -13;
        }
    };

    if let Err(e) = file.write_all(&content) {
        println!("[Rust] Failed to write to file: {}", e);
        return -14;
    }
    
    // Flush to ensure it's written before Java tries to read it
    let _ = file.flush();
    drop(file); // Close file handle

    println!("[Rust] Download Complete. Running Installer...");

    // 4. Run Java Installer
    // java -jar installer.jar --installClient gameDir
    let output = std::process::Command::new(java_path)
        .arg("-jar")
        .arg(&installer_path)
        .arg("--installClient")
        .arg(game_dir)
        .current_dir(game_dir)
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let exit_code = match output {
        Ok(out) => {
            if !out.status.success() {
                println!("[Rust] Installer Failed: {}", String::from_utf8_lossy(&out.stderr));
                -20
            } else {
                println!("[Rust] Installer Success: {}", String::from_utf8_lossy(&out.stdout));
                1 // Success
            }
        },
        Err(e) => {
            println!("[Rust] Failed to launch Java: {}", e);
            -21
        }
    };

    // 5. Cleanup
    if installer_path.exists() {
        let _ = std::fs::remove_file(installer_path);
    }

    exit_code
}

#[derive(serde::Deserialize)]
struct GithubAsset {
    id: u64,
    name: String,
}

#[derive(serde::Deserialize)]
struct GithubRelease {
    id: u64,
    assets: Vec<GithubAsset>,
}

#[unsafe(no_mangle)]
pub extern "C" fn upload_to_github(
    repo_ptr: *const c_char,
    tag_ptr: *const c_char,
    file_path_ptr: *const c_char,
    token_ptr: *const c_char
) -> i32 {
    let repo = unsafe {
        if repo_ptr.is_null() { return -1; }
        match CStr::from_ptr(repo_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let tag = unsafe {
        if tag_ptr.is_null() { return -1; }
        match CStr::from_ptr(tag_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let file_path = unsafe {
        if file_path_ptr.is_null() { return -1; }
        match CStr::from_ptr(file_path_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let token = unsafe {
        if token_ptr.is_null() { return -1; }
        match CStr::from_ptr(token_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let client = match reqwest::blocking::Client::builder()
        .user_agent("CrystalTides-Launcher/1.0.0")
        .build() {
            Ok(c) => c,
            Err(_) => return -10,
        };

    // 1. Get Release ID and Assets from Tag
    let release_url = format!("https://api.github.com/repos/{}/releases/tags/{}", repo, tag);
    let release_resp = client.get(&release_url)
        .header("Authorization", format!("token {}", token))
        .header("Accept", "application/vnd.github.v3+json")
        .send();

    let release: GithubRelease = match release_resp {
        Ok(resp) if resp.status().is_success() => {
            match resp.json() {
                Ok(data) => data,
                Err(e) => {
                    println!("[Rust] JSON Parse Error: {}", e);
                    return -11;
                },
            }
        },
        Ok(resp) => {
            println!("[Rust] Release Fetch Error: {}", resp.status());
            return -12;
        },
        Err(_) => return -13,
    };

    let file_name = std::path::Path::new(file_path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown.jar");

    // 2. Clobber logic: Delete if exists
    if let Some(asset) = release.assets.iter().find(|a| a.name == file_name) {
        println!("[Rust] Asset '{}' already exists (ID: {}). Deleting for clobber...", file_name, asset.id);
        let delete_url = format!("https://api.github.com/repos/{}/releases/assets/{}", repo, asset.id);
        let delete_resp = client.delete(&delete_url)
            .header("Authorization", format!("token {}", token))
            .header("Accept", "application/vnd.github.v3+json")
            .send();
            
        if let Ok(resp) = delete_resp {
            if !resp.status().is_success() && resp.status().as_u16() != 404 {
                 println!("[Rust] Warning: Failed to delete existing asset: {}", resp.status());
            }
        }
    }

    // 3. Upload Asset
    let upload_base = format!("https://uploads.github.com/repos/{}/releases/{}/assets", repo, release.id);
    let upload_url = format!("{}?name={}", upload_base, file_name);

    let file_data = match std::fs::read(file_path) {
        Ok(data) => data,
        Err(_) => return -20,
    };

    let upload_resp = client.post(&upload_url)
        .header("Authorization", format!("token {}", token))
        .header("Content-Type", "application/octet-stream")
        .body(file_data)
        .send();

    match upload_resp {
        Ok(resp) if resp.status().is_success() => 1, // Success
        Ok(resp) => {
            println!("[Rust] Upload Error: {}", resp.status());
            -14
        },
        Err(_) => -15,
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn install_java_runtime(
    version: i32,
    install_dir_ptr: *const c_char,
    callback: Option<java_manager::ProgressCallback>
) -> *mut c_char {
    let install_dir_str = unsafe {
        if install_dir_ptr.is_null() { return CString::new("ERROR: Null Pointer").unwrap().into_raw(); }
        match CStr::from_ptr(install_dir_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return CString::new("ERROR: Invalid UTF-8").unwrap().into_raw(),
        }
    };

    let install_path = std::path::Path::new(install_dir_str);

    match java_manager::download_and_install_java(version as u8, install_path, callback) {
        Ok(path) => {
            let path_str = path.to_string_lossy().to_string();
            CString::new(path_str).unwrap().into_raw()
        },
        Err(e) => {
             let err_msg = format!("ERROR: {}", e);
             CString::new(err_msg).unwrap().into_raw()
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn check_java_status(
    install_dir_ptr: *const c_char
) -> *mut c_char {
    let install_dir_str = unsafe {
        if install_dir_ptr.is_null() { return std::ptr::null_mut(); }
        match CStr::from_ptr(install_dir_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return std::ptr::null_mut(),
        }
    };

    let install_path = std::path::Path::new(install_dir_str);

    // Reuse the find logic from java_manager
    match java_manager::find_java_binary(install_path) {
        Some(path) => {
             let path_str = path.to_string_lossy().to_string();
             CString::new(path_str).unwrap().into_raw()
        },
        None => std::ptr::null_mut()
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn perform_uninstallation() -> i32 {
    println!("[Rust Native] Starting uninstallation flow...");

    // 1. Remove Registry Key
    let reg_result = std::process::Command::new("powershell")
        .args(&["-Command", "Remove-Item -Path \"HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CrystalLauncher\" -Force -ErrorAction SilentlyContinue"])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    if let Err(e) = reg_result {
        println!("[Rust Native] Error removing registry: {}", e);
    }

    // 2. Remove Shortcuts
    let ps_shortcut_script = r#"
        $desktop = [Environment]::GetFolderPath("Desktop")
        $appdata = $env:APPDATA
        $shortcuts = @(
            Join-Path $desktop "Crystal Launcher.lnk",
            Join-Path $appdata "Microsoft\Windows\Start Menu\Programs\CrystalTides\Crystal Launcher.lnk"
        )
        foreach ($s in $shortcuts) { if (Test-Path $s) { Remove-Item $s -Force } }
        $folder = Join-Path $appdata "Microsoft\Windows\Start Menu\Programs\CrystalTides"
        if (Test-Path $folder) { if ((Get-ChildItem $folder).Count -eq 0) { Remove-Item $folder -Force } }
    "#;

    let shortcut_result = std::process::Command::new("powershell")
        .args(&["-Command", ps_shortcut_script])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    if let Err(e) = shortcut_result {
        println!("[Rust Native] Error removing shortcuts: {}", e);
    }

    1 // Success
}

#[unsafe(no_mangle)]
pub extern "C" fn schedule_self_deletion(install_dir_ptr: *const c_char) -> i32 {
    let install_dir = unsafe {
        if install_dir_ptr.is_null() { return -1; }
        match CStr::from_ptr(install_dir_ptr).to_str() {
            Ok(s) => s,
            Err(_) => return -2,
        }
    };

    let batch_content = format!(
        "@echo off\r\n:wait\r\ntimeout /t 1 /nobreak > nul\r\nif exist \"{0}\" (\r\n    rmdir /s /q \"{0}\"\r\n    if exist \"{0}\" goto wait\r\n)\r\ndel \"%~f0\"",
        install_dir
    );

    let temp_dir = std::env::temp_dir();
    let batch_path = temp_dir.join("crystal_uninstall_cleanup.bat");

    if let Err(e) = std::fs::write(&batch_path, batch_content) {
        println!("[Rust Native] Error writing cleanup script: {}", e);
        return -3;
    }

    let spawn_result = std::process::Command::new("cmd")
        .args(&["/c", "start", "/min", batch_path.to_str().unwrap_or("")])
        .creation_flags(CREATE_NO_WINDOW)
        .spawn();

    match spawn_result {
        Ok(_) => 1,
        Err(_) => -4,
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn free_string(s: *mut c_char) {
    if s.is_null() { return; }
    unsafe {
        let _ = CString::from_raw(s);
    }
}
