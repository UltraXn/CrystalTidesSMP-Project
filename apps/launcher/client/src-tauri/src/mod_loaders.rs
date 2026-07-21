use std::io::Write;
use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::Command;

const CREATE_NO_WINDOW: u32 = 0x08000000;

use crate::errors::{NativeError, NativeResult};

pub fn install_mod_loader(
    loader_type: &str,
    loader_version: &str,
    mc_version: &str,
    game_dir: &str,
    java_path: &str,
) -> NativeResult<i32> {
    match loader_type {
        "fabric" => install_fabric(loader_version, mc_version, game_dir, java_path),
        "quilt" => install_quilt(loader_version, mc_version, game_dir, java_path),
        "neoforge" | "forge" => {
            install_forge_family(loader_type, loader_version, game_dir, java_path)
        }
        _ => Err(NativeError::InvalidInput(format!(
            "Unknown loader type: {}",
            loader_type
        ))),
    }
}

fn install_fabric(
    loader_version: &str,
    mc_version: &str,
    game_dir: &str,
    java_path: &str,
) -> NativeResult<i32> {
    let installer_url =
        "https://maven.fabricmc.net/net/fabricmc/fabric-installer/1.0.1/fabric-installer-1.0.1.jar";
    let installer_path = Path::new(game_dir).join("fabric-installer.jar");

    download_file(installer_url, &installer_path)?;

    println!("[Rust] Running Fabric Installer...");
    let output = Command::new(java_path)
        .arg("-jar")
        .arg(&installer_path)
        .arg("client")
        .arg("-mcversion")
        .arg(mc_version)
        .arg("-loader")
        .arg(loader_version)
        .arg("-dir")
        .arg(game_dir)
        .arg("-noprofile")
        .creation_flags(CREATE_NO_WINDOW)
        .output()?;

    let _ = std::fs::remove_file(installer_path);

    if !output.status.success() {
        println!(
            "[Rust] Fabric Installer Failed: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        return Ok(-21);
    }

    Ok(1)
}

fn install_quilt(
    loader_version: &str,
    mc_version: &str,
    game_dir: &str,
    java_path: &str,
) -> NativeResult<i32> {
    let installer_url = "https://maven.quiltmc.org/repository/release/org/quiltmc/quilt-installer/0.9.2/quilt-installer-0.9.2.jar";
    let installer_path = Path::new(game_dir).join("quilt-installer.jar");

    download_file(installer_url, &installer_path)?;

    println!("[Rust] Running Quilt Installer...");
    let output = Command::new(java_path)
        .arg("-jar")
        .arg(&installer_path)
        .arg("install")
        .arg("client")
        .arg(mc_version)
        .arg("--loader-version")
        .arg(loader_version)
        .arg("--install-dir")
        .arg(game_dir)
        .arg("--no-profile")
        .creation_flags(CREATE_NO_WINDOW)
        .output()?;

    let _ = std::fs::remove_file(installer_path);

    if !output.status.success() {
        println!(
            "[Rust] Quilt Installer Failed: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        return Ok(-21);
    }

    Ok(1)
}

fn install_forge_family(
    loader_type: &str,
    version: &str,
    game_dir: &str,
    java_path: &str,
) -> NativeResult<i32> {
    let (url, file_name) = match loader_type {
        "neoforge" => {
            let name = format!("neoforge-{}-installer.jar", version);
            (
                format!(
                    "https://maven.neoforged.net/releases/net/neoforged/neoforge/{}/{}",
                    version, name
                ),
                name,
            )
        }
        "forge" => {
            let name = format!("forge-{}-installer.jar", version);
            (
                format!(
                    "https://maven.minecraftforge.net/net/minecraftforge/forge/{}/{}",
                    version, name
                ),
                name,
            )
        }
        _ => unreachable!(),
    };

    let installer_path = Path::new(game_dir).join(&file_name);
    download_file(&url, &installer_path)?;

    println!("[Rust] Running {} Installer...", loader_type);
    let output = Command::new(java_path)
        .arg("-jar")
        .arg(&installer_path)
        .arg("--installClient")
        .arg(game_dir)
        .current_dir(game_dir)
        .creation_flags(CREATE_NO_WINDOW)
        .output()?;

    let _ = std::fs::remove_file(installer_path);

    if !output.status.success() {
        println!(
            "[Rust] {} Installer Failed: {}",
            loader_type,
            String::from_utf8_lossy(&output.stderr)
        );
        return Ok(-20);
    }

    Ok(1)
}

fn download_file(url: &str, path: &Path) -> NativeResult<()> {
    println!("[Rust] Downloading: {}", url);
    let response = reqwest::blocking::get(url)?;
    let response = response.error_for_status().map_err(NativeError::Network)?;
    let content = response.bytes()?;
    let mut file = std::fs::File::create(path)?;
    file.write_all(&content)?;
    file.flush()?;
    Ok(())
}
