use sha2::{Sha256, Digest};
use std::fs;
use std::path::Path;
use serde::{Serialize, Deserialize};
use walkdir::WalkDir;

#[derive(Serialize, Deserialize, Debug)]
pub struct IntegrityReport {
    pub total_mods: usize,
    pub combined_hash: String,
    pub hwid: String,
    pub timestamp: u64,
}

/// Genera un fingerprint único del hardware del usuario (HWID) usando identificadores de plataforma
pub fn generate_hwid() -> String {
    let mut hasher = Sha256::new();
    let os_info = std::env::consts::OS;
    let arch = std::env::consts::ARCH;
    let hostname = sysinfo::System::host_name().unwrap_or_else(|| "unknown-host".to_string());
    
    hasher.update(os_info.as_bytes());
    hasher.update(arch.as_bytes());
    hasher.update(hostname.as_bytes());
    
    hex::encode(hasher.finalize())
}

/// Calcula un hash determinista SHA-256 de todos los mods instalados en el directorio del perfil
#[tauri::command]
pub fn generate_integrity_report(game_dir: String) -> Result<IntegrityReport, String> {
    let mods_dir = Path::new(&game_dir).join("mods");
    let mut hashes: Vec<String> = Vec::new();

    if mods_dir.exists() {
        for entry in WalkDir::new(&mods_dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("jar") {
                if let Ok(bytes) = fs::read(path) {
                    let mut file_hasher = Sha256::new();
                    file_hasher.update(&bytes);
                    hashes.push(format!("{:x}", file_hasher.finalize()));
                }
            }
        }
    }

    // Ordenar hashes para garantizar determinismo sin importar orden de archivos
    hashes.sort();

    let mut combined_hasher = Sha256::new();
    for h in &hashes {
        combined_hasher.update(h.as_bytes());
    }
    let combined_hash = format!("{:x}", combined_hasher.finalize());

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    Ok(IntegrityReport {
        total_mods: hashes.len(),
        combined_hash,
        hwid: generate_hwid(),
        timestamp: now,
    })
}
