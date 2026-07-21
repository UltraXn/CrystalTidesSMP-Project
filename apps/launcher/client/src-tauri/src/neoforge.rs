use std::io::Write;
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;

use crate::errors::{NativeError, NativeResult};

pub fn install_neoforge(neo_version: &str, game_dir: &str, java_path: &str) -> NativeResult<i32> {
    let file_name = format!("neoforge-{}-installer.jar", neo_version);
    let url = format!(
        "https://maven.neoforged.net/releases/net/neoforged/neoforge/{}/{}",
        neo_version, file_name
    );
    let installer_path = std::path::Path::new(game_dir).join(&file_name);

    println!("[Rust] Downloading NeoForge from: {}", url);

    let response = reqwest::blocking::get(&url)?;
    let response = response.error_for_status().map_err(NativeError::Network)?;
    let content = response.bytes()?;

    let mut file = std::fs::File::create(&installer_path)?;
    file.write_all(&content)?;
    file.flush()?;
    drop(file);

    println!("[Rust] Download Complete. Running Installer...");

    let output = std::process::Command::new(java_path)
        .arg("-jar")
        .arg(&installer_path)
        .arg("--installClient")
        .arg(game_dir)
        .current_dir(game_dir)
        .creation_flags(CREATE_NO_WINDOW)
        .output()?;

    let exit_code = if !output.status.success() {
        println!(
            "[Rust] Installer Failed: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        -20
    } else {
        println!(
            "[Rust] Installer Success: {}",
            String::from_utf8_lossy(&output.stdout)
        );
        1
    };

    if installer_path.exists() {
        let _ = std::fs::remove_file(installer_path);
    }

    Ok(exit_code)
}
