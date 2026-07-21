use crate::errors::{NativeError, NativeResult};
use serde::{Deserialize, Serialize};
use std::path::{Component, Path};
use std::sync::Arc;
use tauri::Emitter;
use tokio::sync::Semaphore;

#[derive(Deserialize, Serialize, Clone)]
pub struct ModInfo {
    pub name: String,
    pub url: String,
    pub sha1: String,
}

#[tauri::command]
pub async fn download_mods_parallel(
    app_handle: tauri::AppHandle,
    mods: Vec<ModInfo>,
    output_dir: String,
    max_concurrent: i32,
) -> Result<(), String> {
    download_mods_parallel_internal(&app_handle, mods, &output_dir, max_concurrent)
        .await
        .map_err(|e| e.to_string())
}

async fn download_mods_parallel_internal(
    app_handle: &tauri::AppHandle,
    mods: Vec<ModInfo>,
    output_dir_str: &str,
    max_concurrent: i32,
) -> NativeResult<()> {
    let output_path = Path::new(output_dir_str);

    if !output_path.exists() {
        std::fs::create_dir_all(output_path)?;
    }

    let client = reqwest::Client::new();
    let semaphore = Arc::new(Semaphore::new(max_concurrent as usize));
    let mut handles = vec![];

    for (idx, mod_info) in mods.into_iter().enumerate() {
        let client = client.clone();
        let sem = semaphore.clone();
        let output_dir = output_dir_str.to_string();
        let idx = idx as i32;
        let app = app_handle.clone();

        let handle = tokio::spawn(async move {
            let _permit = sem.acquire().await.map_err(|_| NativeError::Unknown)?;

            let safe_name = sanitize_mod_name(&mod_info.name).map_err(NativeError::InvalidInput)?;

            let file_path = Path::new(&output_dir).join(&safe_name);

            download_and_verify(&client, &mod_info.url, &file_path, &mod_info.sha1).await?;

            let _ = app.emit("mod-download-progress", idx);
            Ok::<(), NativeError>(())
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.await.map_err(|_| NativeError::Unknown)??;
    }

    Ok(())
}

async fn download_and_verify(
    client: &reqwest::Client,
    url: &str,
    output_path: &Path,
    expected_sha1: &str,
) -> NativeResult<()> {
    use sha1::{Digest, Sha1};

    let response = client.get(url).send().await.map_err(NativeError::Network)?;

    let response = response.error_for_status().map_err(NativeError::Network)?;

    let bytes = response.bytes().await.map_err(NativeError::Network)?;

    let mut hasher = Sha1::new();
    hasher.update(&bytes);
    let hash = hex::encode(hasher.finalize());

    if hash != expected_sha1 {
        return Err(NativeError::Archive(format!(
            "SHA1 mismatch: expected {}, got {}",
            expected_sha1, hash
        )));
    }

    if let Some(parent) = output_path.parent() {
        if !parent.exists() {
            tokio::fs::create_dir_all(parent).await?;
        }
    }
    tokio::fs::write(output_path, &bytes).await?;

    Ok(())
}

fn sanitize_mod_name(name: &str) -> Result<String, String> {
    let path = Path::new(name);
    let mut components = path.components();
    let component = components.next().ok_or("Empty mod name")?;

    if components.next().is_some() {
        return Err("Nested path in mod name".into());
    }

    match component {
        Component::Normal(value) => {
            let filename = value.to_string_lossy().to_string();
            if filename.is_empty() || filename == "." || filename == ".." {
                return Err(format!("Invalid mod name: {}", name));
            }
            Ok(filename)
        }
        _ => Err(format!("Invalid mod name: {}", name)),
    }
}
