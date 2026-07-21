use crate::errors::{NativeError, NativeResult};
use std::path::Path;

/// Nombre del manifiesto que registra qué archivos de la carpeta mods
/// son gestionados por la sincronización oficial del servidor.
const MANIFEST_NAME: &str = ".crystaltides_sync.json";

/// Lee el manifiesto de sincronización. Si no existe, devuelve lista vacía.
fn read_manifest(target_dir: &Path) -> Vec<String> {
    let path = target_dir.join(MANIFEST_NAME);
    match std::fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => Vec::new(),
    }
}

/// Escribe el manifiesto de sincronización con la lista oficial actual.
fn write_manifest(target_dir: &Path, files: &[String]) -> NativeResult<()> {
    let path = target_dir.join(MANIFEST_NAME);
    let json = serde_json::to_string_pretty(files)?;
    std::fs::write(path, json)?;
    Ok(())
}

/// Valida que un nombre de archivo no contenga rutas relativas ni separadores.
fn validate_filename(filename: &str) -> NativeResult<()> {
    if filename.is_empty()
        || filename.contains("..")
        || filename.contains('/')
        || filename.contains('\\')
    {
        return Err(NativeError::InvalidInput(format!(
            "Nombre de archivo inválido: {filename}"
        )));
    }
    Ok(())
}

pub fn sync_mods(target_dir_str: &str, mod_list_json: &str) -> NativeResult<()> {
    let target_dir = Path::new(target_dir_str);

    // 1. Ensure target directory exists
    if !target_dir.exists() {
        std::fs::create_dir_all(target_dir)?;
    }

    // 2. Parse mod list (JSON array of { "source": "path", "filename": "name" })
    let mods: Vec<serde_json::Value> = serde_json::from_str(mod_list_json)?;

    // 3. Create hardlinks for every intended official mod
    let mut intended_filenames: Vec<String> = Vec::new();

    for m in mods {
        let source_path_str = m["source"]
            .as_str()
            .ok_or_else(|| NativeError::InvalidInput("Missing 'source' in mod object".into()))?;
        let filename = m["filename"]
            .as_str()
            .ok_or_else(|| NativeError::InvalidInput("Missing 'filename' in mod object".into()))?;

        validate_filename(filename)?;

        let source_path = Path::new(source_path_str);
        let target_path = target_dir.join(filename);

        intended_filenames.push(filename.to_string());

        // Only create hardlink if it doesn't already exist
        if !target_path.exists() {
            if source_path.exists() {
                std::fs::hard_link(source_path, &target_path)?;
            } else {
                println!(
                    "[Rust] Warning: Source mod file not found: {}",
                    source_path_str
                );
            }
        }
    }

    // 4. Cleanup NO destructivo: solo elimina archivos que el manifiesto
    //    anterior marcaba como oficiales y que ya no están en la lista del
    //    servidor. Los mods instalados por el usuario NUNCA se tocan.
    let previous_manifest = read_manifest(target_dir);
    for old_file in previous_manifest {
        if !intended_filenames.contains(&old_file) {
            let stale_path = target_dir.join(&old_file);
            if stale_path.exists() {
                let _ = std::fs::remove_file(stale_path);
            }
        }
    }

    // 5. Persist the new manifest
    write_manifest(target_dir, &intended_filenames)?;

    Ok(())
}

/// Lista los mods instalados en la carpeta mods como JSON:
/// [{ "filename", "size_bytes", "enabled", "official" }]
/// - `.jar`          → enabled = true
/// - `.jar.disabled` → enabled = false
/// - official        → presente en el manifiesto de sincronización
pub fn list_mods(target_dir_str: &str) -> NativeResult<String> {
    let target_dir = Path::new(target_dir_str);
    let mut entries: Vec<serde_json::Value> = Vec::new();

    if target_dir.exists() {
        let official: std::collections::HashSet<String> =
            read_manifest(target_dir).into_iter().collect();

        for entry in std::fs::read_dir(target_dir)? {
            let entry = entry?;
            if !entry.file_type()?.is_file() {
                continue;
            }

            let name = entry.file_name().to_string_lossy().to_string();
            let enabled = if name.ends_with(".jar") {
                true
            } else if name.ends_with(".jar.disabled") {
                false
            } else {
                continue;
            };

            // Nombre base sin el sufijo .disabled para comparar con el manifiesto
            let base_name = name.trim_end_matches(".disabled").to_string();
            let size_bytes = entry.metadata().map(|m| m.len()).unwrap_or(0);

            entries.push(serde_json::json!({
                "filename": name,
                "size_bytes": size_bytes,
                "enabled": enabled,
                "official": official.contains(&base_name),
            }));
        }
    }

    entries.sort_by(|a, b| {
        let fa = a["filename"].as_str().unwrap_or("").to_lowercase();
        let fb = b["filename"].as_str().unwrap_or("").to_lowercase();
        fa.cmp(&fb)
    });

    Ok(serde_json::to_string(&entries)?)
}

/// Activa o desactiva un mod renombrando el archivo:
/// `mod.jar` ↔ `mod.jar.disabled` (convención estándar de los loaders).
pub fn set_mod_enabled(target_dir_str: &str, filename: &str, enabled: bool) -> NativeResult<()> {
    validate_filename(filename)?;

    let target_dir = Path::new(target_dir_str);
    let from = target_dir.join(filename);

    if !from.exists() {
        return Err(NativeError::InvalidInput(format!(
            "El archivo no existe: {filename}"
        )));
    }

    let to = if enabled {
        if !filename.ends_with(".jar.disabled") {
            return Ok(()); // Ya está activado
        }
        target_dir.join(filename.trim_end_matches(".disabled"))
    } else {
        if filename.ends_with(".jar.disabled") {
            return Ok(()); // Ya está desactivado
        }
        target_dir.join(format!("{filename}.disabled"))
    };

    std::fs::rename(&from, &to)?;
    Ok(())
}

/// Elimina un archivo de mod de la carpeta mods.
pub fn delete_mod(target_dir_str: &str, filename: &str) -> NativeResult<()> {
    validate_filename(filename)?;

    let path = Path::new(target_dir_str).join(filename);
    if path.exists() {
        std::fs::remove_file(&path)?;
    }
    Ok(())
}
