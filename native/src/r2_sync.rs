use aws_sdk_s3::{Client, primitives::ByteStream};
use aws_config::{BehaviorVersion, Region};
use aws_credential_types::Credentials;
use tokio::runtime::Runtime;
use std::ffi::CStr;
use std::os::raw::c_char;
use std::sync::Arc;
use tokio::sync::Semaphore;
use std::path::Path;

// Callback type for progress updates
// Simplified to just an index to avoid Isolate issues in Dart FFI
type R2SyncCallback = extern "C" fn(i32);

/// Upload multiple files to R2 in parallel
/// 
/// # Arguments
/// * `files_json` - JSON array of file paths: ["path1.jar", "path2.jar", ...]
/// * `access_key` - R2 Access Key ID
/// * `secret_key` - R2 Secret Access Key
/// * `endpoint` - R2 endpoint (e.g., "xxx.r2.cloudflarestorage.com")
/// * `bucket` - Bucket name
/// * `max_concurrent` - Maximum concurrent uploads (recommended: 10)
/// * `callback` - Progress callback function
/// 
/// # Returns
/// * 0 on success
/// * -1 on error
#[unsafe(no_mangle)]
pub extern "C" fn upload_mods_parallel(
    files_json: *const c_char,
    access_key: *const c_char,
    secret_key: *const c_char,
    endpoint: *const c_char,
    bucket: *const c_char,
    max_concurrent: i32,
    callback: R2SyncCallback,
) -> i32 {
    let rt = match Runtime::new() {
        Ok(r) => r,
        Err(_) => return -1,
    };

    rt.block_on(async {
        // Parse inputs
        let files = match parse_files_json(files_json) {
            Ok(f) => f,
            Err(_) => return -1,
        };

        let access_key_str = unsafe { CStr::from_ptr(access_key).to_str().unwrap() };
        let secret_key_str = unsafe { CStr::from_ptr(secret_key).to_str().unwrap() };
        let endpoint_str = unsafe { CStr::from_ptr(endpoint).to_str().unwrap() };
        let bucket_str = unsafe { CStr::from_ptr(bucket).to_str().unwrap() };

        // Build S3 client
        let client = match build_s3_client(endpoint_str, access_key_str, secret_key_str).await {
            Ok(c) => c,
            Err(_) => return -1,
        };

        // Semaphore for concurrency control
        let semaphore = Arc::new(Semaphore::new(max_concurrent as usize));

        // Spawn parallel upload tasks
        let tasks: Vec<_> = files
            .into_iter()
            .enumerate()
            .map(|(idx, path)| {
                let client = client.clone();
                let bucket = bucket_str.to_string();
                let sem = semaphore.clone();

                tokio::spawn(async move {
                    let _permit = sem.acquire().await.unwrap();

                    // Upload file
                    upload_single_file(&client, &bucket, &path).await?;

                    // Progress callback
                    callback(idx as i32);

                    Ok::<_, anyhow::Error>(())
                })
            })
            .collect();

        // Wait for all uploads
        for task in tasks {
            if let Err(_) = task.await.unwrap() {
                return -1;
            }
        }

        0
    })
}

/// Download multiple files from R2 in parallel with SHA1 verification
/// 
/// # Arguments
/// * `mods_json` - JSON array of mod objects: [{"name": "mod.jar", "url": "...", "sha1": "..."}]
/// * `output_dir` - Directory to save downloaded files
/// * `max_concurrent` - Maximum concurrent downloads (recommended: 10)
/// * `callback` - Progress callback function
/// 
/// # Returns
/// * 0 on success
/// * -1 on error
#[unsafe(no_mangle)]
pub extern "C" fn download_mods_parallel(
    mods_json: *const c_char,
    output_dir: *const c_char,
    max_concurrent: i32,
    callback: R2SyncCallback,
) -> i32 {
    let rt = match Runtime::new() {
        Ok(r) => r,
        Err(_) => return -1,
    };

    rt.block_on(async {
        // Parse inputs
        let mods = match parse_mods_json(mods_json) {
            Ok(m) => m,
            Err(_) => return -1,
        };

        let output_dir_str = unsafe { CStr::from_ptr(output_dir).to_str().unwrap() };

        let client = reqwest::Client::new();
        let semaphore = Arc::new(Semaphore::new(max_concurrent as usize));
        let _total = mods.len();

        // Spawn parallel download tasks
        let tasks: Vec<_> = mods
            .into_iter()
            .enumerate()
            .map(|(idx, mod_info)| {
                let client = client.clone();
                let output_dir = output_dir_str.to_string();
                let sem = semaphore.clone();

                tokio::spawn(async move {
                    let _permit = sem.acquire().await.unwrap();

                    // Download and verify file
                    let file_path = format!("{}/{}", output_dir, mod_info.name);
                    download_and_verify(&client, &mod_info.url, &file_path, &mod_info.sha1).await?;

                    // Progress callback
                    callback(idx as i32);

                    Ok::<_, anyhow::Error>(())
                })
            })
            .collect();

        // Wait for all downloads
        for task in tasks {
            if let Err(_) = task.await.unwrap() {
                return -1;
            }
        }

        0
    })
}

// Helper functions

fn parse_files_json(files_json: *const c_char) -> Result<Vec<String>, anyhow::Error> {
    let json_str = unsafe { CStr::from_ptr(files_json).to_str()? };
    let files: Vec<String> = serde_json::from_str(json_str)?;
    Ok(files)
}

#[derive(serde::Deserialize)]
struct ModInfo {
    name: String,
    url: String,
    sha1: String,
}

fn parse_mods_json(mods_json: *const c_char) -> Result<Vec<ModInfo>, anyhow::Error> {
    let json_str = unsafe { CStr::from_ptr(mods_json).to_str()? };
    let mods: Vec<ModInfo> = serde_json::from_str(json_str)?;
    Ok(mods)
}

async fn build_s3_client(
    endpoint: &str,
    access_key: &str,
    secret_key: &str,
) -> Result<Client, anyhow::Error> {
    let creds = Credentials::new(access_key, secret_key, None, None, "r2");

    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(Region::new("auto"))
        .endpoint_url(format!("https://{}", endpoint))
        .credentials_provider(creds)
        .load()
        .await;

    Ok(Client::new(&config))
}

async fn upload_single_file(
    client: &Client,
    bucket: &str,
    file_path: &str,
) -> Result<(), anyhow::Error> {
    let file_name = Path::new(file_path)
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("Invalid file path"))?
        .to_str()
        .ok_or_else(|| anyhow::anyhow!("Invalid UTF-8 in filename"))?;

    let body = ByteStream::from_path(file_path).await?;

    client
        .put_object()
        .bucket(bucket)
        .key(file_name)
        .body(body)
        .send()
        .await?;

    Ok(())
}

async fn download_and_verify(
    client: &reqwest::Client,
    url: &str,
    output_path: &str,
    expected_sha1: &str,
) -> Result<(), anyhow::Error> {
    use sha1::{Sha1, Digest};
    use tokio::fs::File;
    use tokio::io::AsyncWriteExt;

    // Stream download
    let response = client.get(url).send().await?;
    let bytes = response.bytes().await?;

    // Verify SHA1
    let mut hasher = Sha1::new();
    hasher.update(&bytes);
    let hash = hex::encode(hasher.finalize());

    if hash != expected_sha1 {
        return Err(anyhow::anyhow!(
            "SHA1 mismatch: expected {}, got {}",
            expected_sha1,
            hash
        ));
    }

    // Write to disk
    let mut file = File::create(output_path).await?;
    file.write_all(&bytes).await?;

    Ok(())
}
