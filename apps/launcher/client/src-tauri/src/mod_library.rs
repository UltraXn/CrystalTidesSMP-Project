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

pub fn get_mod_metadata(target_dir_str: &str, filename: &str) -> NativeResult<Option<serde_json::Value>> {
    validate_filename(filename)?;
    let path = Path::new(target_dir_str).join(filename);
    if !path.exists() {
        return Ok(None);
    }
    let (title, icon) = extract_jar_metadata(&path);
    Ok(Some(serde_json::json!({
        "title": title,
        "icon_data": icon,
    })))
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

/// Extrae el título y la imagen original embebida dentro de un archivo .jar de Minecraft
pub fn extract_jar_metadata(jar_path: &Path) -> (Option<String>, Option<String>) {
    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    use std::io::Read;

    let file = match std::fs::File::open(jar_path) {
        Ok(f) => f,
        Err(_) => return (None, None),
    };
    let mut archive = match zip::ZipArchive::new(file) {
        Ok(a) => a,
        Err(_) => return (None, None),
    };

    let mut mod_name: Option<String> = None;
    let mut candidate_icons: Vec<String> = Vec::new();

    // 1. Inspect fabric.mod.json
    if let Ok(mut fab_file) = archive.by_name("fabric.mod.json") {
        let mut content = String::new();
        if fab_file.read_to_string(&mut content).is_ok() {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(name_str) = json["name"].as_str() {
                    if !name_str.trim().is_empty() {
                        mod_name = Some(name_str.trim().to_string());
                    }
                }
                if let Some(icon_str) = json["icon"].as_str() {
                    candidate_icons.push(icon_str.trim_start_matches('/').to_string());
                } else if let Some(icon_obj) = json["icon"].as_object() {
                    for key in ["512", "128", "64", "32", "16"] {
                        if let Some(path) = icon_obj.get(key).and_then(|v| v.as_str()) {
                            candidate_icons.push(path.trim_start_matches('/').to_string());
                        }
                    }
                    if candidate_icons.is_empty() {
                        if let Some(first_val) = icon_obj.values().next().and_then(|v| v.as_str()) {
                            candidate_icons.push(first_val.trim_start_matches('/').to_string());
                        }
                    }
                }
            }
        }
    }

    // 2. Inspect quilt.mod.json
    if mod_name.is_none() {
        if let Ok(mut q_file) = archive.by_name("quilt.mod.json") {
            let mut content = String::new();
            if q_file.read_to_string(&mut content).is_ok() {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                    let meta = &json["quilt_loader"]["metadata"];
                    if let Some(name_str) = meta["name"].as_str() {
                        if !name_str.trim().is_empty() {
                            mod_name = Some(name_str.trim().to_string());
                        }
                    }
                    if let Some(icon_str) = meta["icon"].as_str() {
                        candidate_icons.push(icon_str.trim_start_matches('/').to_string());
                    }
                }
            }
        }
    }

    // 3. Inspect neoforge.mods.toml or mods.toml
    let toml_file_name = if archive.by_name("META-INF/neoforge.mods.toml").is_ok() {
        Some("META-INF/neoforge.mods.toml")
    } else if archive.by_name("META-INF/mods.toml").is_ok() {
        Some("META-INF/mods.toml")
    } else {
        None
    };

    if let Some(fname) = toml_file_name {
        if let Ok(mut toml_file) = archive.by_name(fname) {
            let mut content = String::new();
            if toml_file.read_to_string(&mut content).is_ok() {
                for line in content.lines() {
                    let trimmed = line.trim();
                    if trimmed.starts_with('#') {
                        continue;
                    }
                    if mod_name.is_none() && (trimmed.starts_with("displayName") || trimmed.starts_with("name")) {
                        if let Some((_, val)) = trimmed.split_once('=') {
                            let clean = val.trim().trim_matches('"').trim_matches('\'');
                            if !clean.is_empty() && clean != "Example Mod" {
                                mod_name = Some(clean.to_string());
                            }
                        }
                    }
                    if trimmed.starts_with("logoFile") {
                        if let Some((_, val)) = trimmed.split_once('=') {
                            let logo = val.trim().trim_matches('"').trim_matches('\'').trim_start_matches('/');
                            if !logo.is_empty() {
                                candidate_icons.push(logo.to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    // 4. Inspect mcmod.info (old Forge format)
    if mod_name.is_none() {
        if let Ok(mut mc_file) = archive.by_name("mcmod.info") {
            let mut content = String::new();
            if mc_file.read_to_string(&mut content).is_ok() {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                    let list = json.as_array().or_else(|| json["modList"].as_array());
                    if let Some(arr) = list {
                        if let Some(first) = arr.first() {
                            if let Some(n) = first["name"].as_str() {
                                if !n.trim().is_empty() {
                                    mod_name = Some(n.trim().to_string());
                                }
                            }
                            if let Some(logo) = first["logoFile"].as_str() {
                                candidate_icons.push(logo.trim_start_matches('/').to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    // Extract Icon Data
    let mut icon_data: Option<String> = None;

    for name in &candidate_icons {
        if let Ok(mut zip_entry) = archive.by_name(name) {
            let mut buffer = Vec::new();
            if zip_entry.read_to_end(&mut buffer).is_ok() && !buffer.is_empty() {
                let mime = if name.ends_with(".jpg") || name.ends_with(".jpeg") { "image/jpeg" } else { "image/png" };
                let encoded = BASE64.encode(&buffer);
                icon_data = Some(format!("data:{mime};base64,{encoded}"));
                break;
            }
        }
    }

    if icon_data.is_none() {
        let mut best_icon_index: Option<usize> = None;
        for i in 0..archive.len() {
            if let Ok(file) = archive.by_index(i) {
                let name = file.name().to_lowercase();
                if name.ends_with(".png") || name.ends_with(".jpg") || name.ends_with(".jpeg") {
                    if name == "icon.png" || name == "logo.png" || name.contains("assets/") && (name.ends_with("/icon.png") || name.ends_with("/logo.png") || name.ends_with("/icon.jpg") || name.ends_with("/pack.png")) {
                        best_icon_index = Some(i);
                        break;
                    }
                }
            }
        }

        if let Some(idx) = best_icon_index {
            if let Ok(mut zip_entry) = archive.by_index(idx) {
                let name = zip_entry.name().to_lowercase();
                let mut buffer = Vec::new();
                if zip_entry.read_to_end(&mut buffer).is_ok() && !buffer.is_empty() {
                    let mime = if name.ends_with(".jpg") || name.ends_with(".jpeg") { "image/jpeg" } else { "image/png" };
                    let encoded = BASE64.encode(&buffer);
                    icon_data = Some(format!("data:{mime};base64,{encoded}"));
                }
            }
        }
    }

    (mod_name, icon_data)
}

pub fn extract_mod_icon(target_dir_str: &str, filename: &str) -> NativeResult<Option<String>> {
    validate_filename(filename)?;
    let path = Path::new(target_dir_str).join(filename);
    if !path.exists() {
        return Ok(None);
    }
    let (_, icon) = extract_jar_metadata(&path);
    Ok(icon)
}
