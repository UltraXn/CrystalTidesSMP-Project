mod agent;
mod anticheat;
mod archive;
mod core_init;
mod crash_reporter;
mod errors;
mod github_release;
mod gpu_preset;
mod hardware;
mod hashing;
mod java_manager;
mod mod_library;
mod mod_loaders;
mod neoforge;
mod r2_sync;
mod system;

use tauri::Manager;

#[tauri::command]
fn init_core() -> bool {
    core_init::init_core()
}

#[tauri::command]
fn calculate_sha1(path: String) -> Result<String, String> {
    hashing::calculate_sha1(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_hard_link(source: String, target: String) -> i32 {
    system::create_hard_link(&source, &target)
}

#[tauri::command]
fn extract_archive(archive_path: String, output_path: String) -> Result<(), String> {
    archive::extract_archive(&archive_path, &output_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn check_single_instance() -> bool {
    system::check_single_instance()
}

#[tauri::command]
fn set_high_priority() -> bool {
    system::set_high_priority()
}

#[tauri::command]
fn set_normal_priority() -> bool {
    system::set_normal_priority()
}

#[tauri::command]
fn install_neoforge(neo_version: String, game_dir: String, java_path: String) -> Result<i32, String> {
    neoforge::install_neoforge(&neo_version, &game_dir, &java_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn install_mod_loader(
    loader_type: String,
    loader_version: String,
    mc_version: String,
    game_dir: String,
    java_path: String,
) -> Result<i32, String> {
    mod_loaders::install_mod_loader(&loader_type, &loader_version, &mc_version, &game_dir, &java_path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn sync_mods(target_dir: String, mod_list_json: String) -> Result<(), String> {
    mod_library::sync_mods(&target_dir, &mod_list_json).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_mods(target_dir: String) -> Result<String, String> {
    mod_library::list_mods(&target_dir).map_err(|e| e.to_string())
}

#[tauri::command]
fn set_mod_enabled(target_dir: String, filename: String, enabled: bool) -> Result<(), String> {
    mod_library::set_mod_enabled(&target_dir, &filename, enabled).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_mod(target_dir: String, filename: String) -> Result<(), String> {
    mod_library::delete_mod(&target_dir, &filename).map_err(|e| e.to_string())
}

#[tauri::command]
fn extract_mod_icon(target_dir: String, filename: String) -> Result<Option<String>, String> {
    mod_library::extract_mod_icon(&target_dir, &filename).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_mod_metadata(target_dir: String, filename: String) -> Result<Option<serde_json::Value>, String> {
    mod_library::get_mod_metadata(&target_dir, &filename).map_err(|e| e.to_string())
}

#[tauri::command]
fn upload_to_github(repo: String, tag: String, file_path: String, token: String) -> Result<(), String> {
    github_release::upload_to_github(&repo, &tag, &file_path, &token).map_err(|e| e.to_string())
}

#[tauri::command]
async fn install_java_runtime(
    app_handle: tauri::AppHandle,
    version: i32,
    install_dir: String,
) -> Result<String, String> {
    use tauri::Emitter;
    let path = java_manager::download_and_install_java(version as u8, std::path::Path::new(&install_dir), |progress| {
        let _ = app_handle.emit("java-install-progress", progress);
    })
    .map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn check_java_status(install_dir: String) -> Option<String> {
    java_manager::find_java_binary(std::path::Path::new(&install_dir))
        .map(|path| path.to_string_lossy().to_string())
}

#[tauri::command]
fn perform_uninstallation(install_dir: String) -> i32 {
    system::perform_uninstallation(&install_dir)
}

#[tauri::command]
fn schedule_self_deletion(install_dir: String) -> i32 {
    system::schedule_self_deletion(&install_dir)
}

#[tauri::command]
fn get_home_dir() -> Option<String> {
    dirs::home_dir().map(|path| path.to_string_lossy().to_string())
}

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_text_file(path: String, content: String) -> Result<(), String> {
    // Ensure parent directory exists
    if let Some(parent) = std::path::Path::new(&path).parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    std::fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn launch_minecraft(java_path: String, args: Vec<String>, game_dir: String) -> Result<(), String> {
    std::process::Command::new(java_path)
        .args(&args)
        .current_dir(game_dir)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn http_post(url: String, headers: std::collections::HashMap<String, String>, body: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut req = client.post(&url);
    for (key, val) in headers {
        req = req.header(key, val);
    }
    let res = req.body(body).send().await.map_err(|e| e.to_string())?;
    let text = res.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

#[tauri::command]
async fn http_get(url: String, headers: std::collections::HashMap<String, String>) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut req = client.get(&url);
    for (key, val) in headers {
        req = req.header(key, val);
    }
    let res = req.send().await.map_err(|e| e.to_string())?;
    let text = res.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

#[tauri::command]
async fn http_put(url: String, headers: std::collections::HashMap<String, String>, body: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut req = client.put(&url);
    for (key, val) in headers {
        req = req.header(key, val);
    }
    let res = req.body(body).send().await.map_err(|e| e.to_string())?;
    let text = res.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

#[tauri::command]
async fn http_delete(url: String, headers: std::collections::HashMap<String, String>) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut req = client.delete(&url);
    for (key, val) in headers {
        req = req.header(key, val);
    }
    let res = req.send().await.map_err(|e| e.to_string())?;
    let text = res.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

#[tauri::command]
async fn fetch_image_base64(url: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| format!("Failed to build reqwest client: {}", e))?;

    let res = client.get(&url).send().await.map_err(|e| format!("Failed to send request: {}", e))?;
    
    if !res.status().is_success() {
        return Err(format!("Request failed with status code: {}", res.status()));
    }

    let bytes = res.bytes().await.map_err(|e| format!("Failed to read response bytes: {}", e))?;
    
    use base64::Engine;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:image/png;base64,{}", b64))
}

#[tauri::command]
async fn open_microsoft_auth_window(app_handle: tauri::AppHandle) -> Result<String, String> {
    use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
    use std::sync::{Arc, Mutex};
    use tokio::sync::oneshot;

    // Destroy existing window if already open
    if let Some(existing) = app_handle.get_webview_window("microsoft-login-window") {
        let _ = existing.destroy();
    }

    let auth_url = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=3974b918-cd84-4d60-8955-2ad65234d16b&response_type=code&redirect_uri=https%3A%2F%2Flogin.live.com%2Foauth20_desktop.srf&scope=XboxLive.SignIn%20XboxLive.offline_access&prompt=select_account";

    let (tx, rx) = oneshot::channel::<Result<String, String>>();
    let tx_mutex = Arc::new(Mutex::new(Some(tx)));
    let tx_nav = tx_mutex.clone();

    let window = WebviewWindowBuilder::new(
        &app_handle,
        "microsoft-login-window",
        WebviewUrl::External(auth_url.parse().map_err(|e| format!("Invalid URL: {}", e))?)
    )
    .title("CrystalTides - Iniciar sesión con Microsoft")
    .inner_size(520.0, 680.0)
    .resizable(false)
    .always_on_top(true)
    .on_navigation(move |url| {
        let url_str = url.as_str();
        if url_str.starts_with("https://crystaltidessmp.net/ms-callback.html")
            || url_str.starts_with("http://localhost:5173/ms-callback.html")
            || url_str.starts_with("https://login.live.com/oauth20_desktop.srf")
        {
            if let Some(query) = url.query() {
                for pair in query.split('&') {
                    let mut parts = pair.splitn(2, '=');
                    if let (Some(k), Some(v)) = (parts.next(), parts.next()) {
                        if k == "code" {
                            if let Some(sender) = tx_nav.lock().unwrap().take() {
                                let _ = sender.send(Ok(v.to_string()));
                            }
                            return false;
                        } else if k == "error" {
                            if let Some(sender) = tx_nav.lock().unwrap().take() {
                                let _ = sender.send(Err(format!("Error de Microsoft: {}", v)));
                            }
                            return false;
                        }
                    }
                }
            }
        }
        true
    })
    .build()
    .map_err(|e| format!("Failed to create auth window: {}", e))?;

    let window_clone = window.clone();
    let tx_close = tx_mutex.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { .. } = event {
            if let Some(sender) = tx_close.lock().unwrap().take() {
                let _ = sender.send(Err("El usuario cerró la ventana de inicio de sesión.".to_string()));
            }
        }
    });

    let code_res = rx.await.map_err(|_| "La ventana de inicio de sesión se cerró inesperadamente.".to_string())?;

    // Close window upon completion
    let _ = window_clone.destroy();

    code_res
}

#[tauri::command]
async fn start_ms_oauth_server(app_handle: tauri::AppHandle) -> Result<u16, String> {
    use tokio::net::TcpListener;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    use tokio::time::{timeout, Duration};
    use tauri::Emitter;

    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| format!("No se pudo levantar el servidor local: {}", e))?;
    
    let port = listener.local_addr().unwrap().port();

    tokio::spawn(async move {
        let mut code: Option<String> = None;
        if let Ok(Ok((mut stream, _))) = timeout(Duration::from_secs(180), listener.accept()).await {
            let mut buf = [0; 2048];
            if let Ok(n) = stream.read(&mut buf).await {
                let request = String::from_utf8_lossy(&buf[..n]);
                if let Some(first_line) = request.lines().next() {
                    let parts: Vec<&str> = first_line.split_whitespace().collect();
                    if parts.len() >= 2 && parts[0] == "GET" {
                        let path = parts[1];
                        if let Some(query_idx) = path.find('?') {
                            let query = &path[query_idx + 1..];
                            for pair in query.split('&') {
                                let mut kv = pair.splitn(2, '=');
                                if let (Some(k), Some(v)) = (kv.next(), kv.next()) {
                                    if k == "code" {
                                        code = Some(v.to_string());
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                let (status, body) = if code.is_some() {
                    ("200 OK", r#"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>CrystalTides Launcher - Autenticación</title>
                        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
                        <style>
                            body {
                                background: #06070B;
                                background-image: radial-gradient(circle at 50% 30%, #0d2825 0%, #06070b 70%);
                                color: #F3F4F6;
                                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                min-height: 100vh;
                                margin: 0;
                                padding: 20px;
                                box-sizing: border-box;
                            }
                            .card {
                                background: rgba(255, 255, 255, 0.02);
                                backdrop-filter: blur(20px);
                                -webkit-backdrop-filter: blur(20px);
                                border: 1px solid rgba(45, 212, 191, 0.15);
                                border-radius: 24px;
                                padding: 48px 40px;
                                max-width: 440px;
                                width: 100%;
                                text-align: center;
                                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 
                                            0 0 40px rgba(45, 212, 191, 0.03);
                                transform: translateY(0);
                                animation: float 6s ease-in-out infinite;
                            }
                            @keyframes float {
                                0% { transform: translateY(0px); }
                                50% { transform: translateY(-8px); }
                                100% { transform: translateY(0px); }
                            }
                            .icon-container {
                                width: 72px;
                                height: 72px;
                                background: radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, rgba(45, 212, 191, 0.02) 100%);
                                border: 1px solid rgba(45, 212, 191, 0.3);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin: 0 auto 24px;
                                box-shadow: 0 0 20px rgba(45, 212, 191, 0.1);
                            }
                            .icon {
                                font-size: 32px;
                                color: #2DD4BF;
                                animation: pulse 2s infinite;
                            }
                            @keyframes pulse {
                                0% { transform: scale(1); opacity: 0.9; }
                                50% { transform: scale(1.08); opacity: 1; }
                                100% { transform: scale(1); opacity: 0.9; }
                            }
                            h1 {
                                font-size: 24px;
                                font-weight: 700;
                                margin: 0 0 12px;
                                color: #FFFFFF;
                                letter-spacing: -0.5px;
                            }
                            p {
                                font-size: 14px;
                                line-height: 1.6;
                                color: rgba(243, 244, 246, 0.65);
                                margin: 0 0 32px;
                            }
                            .progress-bar {
                                width: 100%;
                                height: 4px;
                                background: rgba(255, 255, 255, 0.05);
                                border-radius: 10px;
                                overflow: hidden;
                                margin-bottom: 8px;
                            }
                            .progress-fill {
                                height: 100%;
                                width: 100%;
                                background: linear-gradient(90deg, #2DD4BF, #0D9488);
                                border-radius: 10px;
                                animation: shrink 3s linear forwards;
                            }
                            @keyframes shrink {
                                from { width: 100%; }
                                to { width: 0%; }
                            }
                            .footer-text {
                                font-size: 11px;
                                color: rgba(243, 244, 246, 0.35);
                                margin: 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <div class="icon-container">
                                <span class="icon">🌊</span>
                            </div>
                            <h1>¡Conexión Completada!</h1>
                            <p>Tu cuenta de Microsoft ha sido vinculada correctamente. Ya puedes cerrar esta pestaña de forma segura y volver al launcher para comenzar tu aventura en CrystalTides.</p>
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <p class="footer-text">Esta pestaña se cerrará automáticamente...</p>
                        </div>
                        <script>
                            setTimeout(function() {
                                window.close();
                            }, 3000);
                        </script>
                    </body>
                    </html>
                    "#)
                } else {
                    ("400 Bad Request", "No se encontró el código de autorización.")
                };

                let response = format!(
                    "HTTP/1.1 {}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                    status,
                    body.len(),
                    body
                );
                let _ = stream.write_all(response.as_bytes()).await;
                let _ = stream.flush().await;
            }
        }

        // Emit code event or failure event to the frontend
        if let Some(c) = code {
            let _ = app_handle.emit("oauth-code-received", c.clone());
            let _ = app_handle.emit_to("main", "oauth-code-received", c);

            // Automatically close the login window from the backend after 2.5 seconds (gives user time to see the success card)
            let app_clone = app_handle.clone();
            tokio::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_millis(2500)).await;
                use tauri::Manager;
                if let Some(w) = app_clone.get_webview_window("microsoft-login-window") {
                    let _ = w.destroy();
                }
            });
        } else {
            let _ = app_handle.emit("oauth-code-failed", "El inicio de sesión expiró o fue cancelado.".to_string());
            let _ = app_handle.emit_to("main", "oauth-code-failed", "El inicio de sesión expiró o fue cancelado.".to_string());
        }
    });

    Ok(port)
}

#[tauri::command]
fn log_frontend(msg: String) {
    println!("[Frontend] {}", msg);
}

#[tauri::command]
fn open_folder(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        let _ = std::fs::create_dir_all(p);
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(p.as_os_str())
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(p.as_os_str())
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(p.as_os_str())
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // ── Single Instance: prevent duplicate launcher processes ──
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.unminimize();
                let _ = w.show();
                let _ = w.set_focus();
            }
        }))
        // ── Window State: remember position, size & monitor across restarts ──
        .plugin(tauri_plugin_window_state::Builder::new().build())
        // ── Deep Link: handle crystaltides:// protocol URLs ──
        .plugin(tauri_plugin_deep_link::init())
        // ── Positioner: center / tray-anchor window placement ──
        .plugin(tauri_plugin_positioner::init())
        // ── Existing plugins ──
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            log_frontend,
            open_folder,
            init_core,
            calculate_sha1,
            create_hard_link,
            extract_archive,
            check_single_instance,
            set_high_priority,
            set_normal_priority,
            install_neoforge,
            install_mod_loader,
            sync_mods,
            list_mods,
            set_mod_enabled,
            delete_mod,
            extract_mod_icon,
            get_mod_metadata,
            upload_to_github,
            install_java_runtime,
            check_java_status,
            perform_uninstallation,
            schedule_self_deletion,
            get_home_dir,
            read_text_file,
            write_text_file,
            launch_minecraft,
            http_post,
            http_get,
            http_put,
            http_delete,
            fetch_image_base64,
            start_ms_oauth_server,
            open_microsoft_auth_window,
            hardware::detect_hardware_profile,
            r2_sync::download_mods_parallel,
            anticheat::generate_integrity_report,
            crash_reporter::analyze_game_crash,
            gpu_preset::detect_gpu_profile,
            gpu_preset::apply_gpu_options,
            agent::prepare_crystal_agent,
            agent::get_agent_jvm_args,
            agent::get_agent_benchmark_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
