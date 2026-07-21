use crate::errors::{NativeError, NativeResult};

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

pub fn upload_to_github(repo: &str, tag: &str, file_path: &str, token: &str) -> NativeResult<()> {
    let client = reqwest::blocking::Client::builder()
        .user_agent("CrystalTides-Launcher/1.0.0")
        .build()?;

    let release_url = format!(
        "https://api.github.com/repos/{}/releases/tags/{}",
        repo, tag
    );
    let response = client
        .get(&release_url)
        .header("Authorization", format!("token {}", token))
        .header("Accept", "application/vnd.github.v3+json")
        .send()?;

    let response = response.error_for_status().map_err(NativeError::Network)?;
    let release: GithubRelease = response.json()?;

    let file_name = std::path::Path::new(file_path)
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| NativeError::InvalidInput("Invalid file path for upload".into()))?;

    if let Some(asset) = release.assets.iter().find(|a| a.name == file_name) {
        println!(
            "[Rust] Asset '{}' already exists (ID: {}). Deleting for clobber...",
            file_name, asset.id
        );
        let delete_url = format!(
            "https://api.github.com/repos/{}/releases/assets/{}",
            repo, asset.id
        );
        let _ = client
            .delete(&delete_url)
            .header("Authorization", format!("token {}", token))
            .header("Accept", "application/vnd.github.v3+json")
            .send();
    }

    let upload_url = format!(
        "https://uploads.github.com/repos/{}/releases/{}/assets?name={}",
        repo, release.id, file_name
    );

    let file_data = std::fs::read(file_path)?;

    let upload_resp = client
        .post(&upload_url)
        .header("Authorization", format!("token {}", token))
        .header("Content-Type", "application/octet-stream")
        .body(file_data)
        .send()?;

    upload_resp
        .error_for_status()
        .map_err(NativeError::Network)?;

    Ok(())
}
