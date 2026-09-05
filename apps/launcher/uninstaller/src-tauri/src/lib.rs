use std::fs;
use std::path::Path;
use std::process::Command;

#[tauri::command]
fn get_home_dir() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "No se pudo obtener el directorio personal".to_string())
}

#[tauri::command]
fn get_default_install_dir() -> Result<String, String> {
    if let Some(home) = dirs::home_dir() {
        #[cfg(target_os = "windows")]
        {
            let p = home.join(".crystaltides");
            return Ok(p.to_string_lossy().to_string());
        }

        #[cfg(target_os = "linux")]
        {
            let p = home.join(".local/share/crystaltides");
            return Ok(p.to_string_lossy().to_string());
        }

        #[cfg(target_os = "macos")]
        {
            let p = home.join("Applications/CrystalTides");
            return Ok(p.to_string_lossy().to_string());
        }

        #[allow(unreachable_code)]
        Ok(home.join(".crystaltides").to_string_lossy().to_string())
    } else {
        Err("No se pudo resolver la ruta base del sistema".to_string())
    }
}

#[tauri::command]
fn perform_uninstallation(target_dir: String, remove_user_data: Option<bool>) -> Result<(), String> {
    let path = Path::new(&target_dir);
    let remove_all = remove_user_data.unwrap_or(true);

    // ==========================================
    // 🪟 WINDOWS: REGISTRO Y ACCESOS .LNK
    // ==========================================
    #[cfg(target_os = "windows")]
    {
        // 1. Clean registry key via PowerShell
        let reg_ps = format!(
            "$ErrorActionPreference = 'SilentlyContinue'; \
             Remove-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CrystalTidesLauncher' -Recurse -Force; \
             Remove-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CrystalTidesLauncherPapyrus' -Recurse -Force; \
             Remove-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CTLauncher' -Recurse -Force; \
             Remove-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CrystalLauncher' -Recurse -Force"
        );
        let _ = Command::new("powershell")
            .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &reg_ps])
            .output();

        // 2. Clean shortcuts via PowerShell
        let shortcut_ps = format!(
            "$ErrorActionPreference = 'SilentlyContinue'; \
             $Desktop = [Environment]::GetFolderPath('Desktop'); \
             $StartMenu = [Environment]::GetFolderPath('StartMenu'); \
             Remove-Item (Join-Path $Desktop 'CrystalTides Launcher.lnk') -Force; \
             Remove-Item (Join-Path $Desktop 'CTLauncher.lnk') -Force; \
             Remove-Item (Join-Path $Desktop 'Crystal Launcher.lnk') -Force; \
             Remove-Item (Join-Path $StartMenu 'Programs\\CrystalTides') -Recurse -Force"
        );
        let _ = Command::new("powershell")
            .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &shortcut_ps])
            .output();
    }

    // ==========================================
    // 🐧 LINUX: LIMPIEZA XDG .DESKTOP
    // ==========================================
    #[cfg(target_os = "linux")]
    {
        if let Some(home) = dirs::home_dir() {
            let desktop_app = home.join(".local/share/applications/crystaltides-launcher.desktop");
            let desktop_user = home.join("Desktop/crystaltides-launcher.desktop");
            let _ = fs::remove_file(desktop_app);
            let _ = fs::remove_file(desktop_user);
        }
    }

    // ==========================================
    // 🍏 MACOS: LIMPIEZA DE APP BUNDLE
    // ==========================================
    #[cfg(target_os = "macos")]
    {
        if let Some(home) = dirs::home_dir() {
            let app_bundle = home.join("Applications/CrystalTides Launcher.app");
            let _ = fs::remove_dir_all(app_bundle);
        }
    }

    // ==========================================
    // 📂 LIMPIEZA DE ARCHIVOS
    // ==========================================
    if path.exists() {
        if remove_all {
            let _ = fs::remove_dir_all(path);
        } else {
            let exe_candidates = [
                "CrystalTidesLauncher.exe",
                "CrystalTidesLauncher",
                "launcher-tauri.exe",
                "launcher-tauri",
                "CTLauncher.exe",
                "CTLauncher",
                ".installed.json",
            ];
            for exe in &exe_candidates {
                let p = path.join(exe);
                if p.exists() {
                    let _ = fs::remove_file(p);
                }
            }
        }
    }

    Ok(())
}

#[tauri::command]
fn schedule_self_deletion(target_dir: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let escaped = target_dir.replace('"', "\"\"");
        let script = format!(
            "Start-Sleep -Seconds 2; Remove-Item -LiteralPath \"{}\" -Recurse -Force -ErrorAction SilentlyContinue",
            escaped
        );

        let _ = Command::new("powershell")
            .args([
                "-NoProfile",
                "-WindowStyle",
                "Hidden",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                &script,
            ])
            .spawn();
    }

    #[cfg(not(target_os = "windows"))]
    {
        let escaped = target_dir.replace('"', "\\\"");
        let script = format!("sleep 2 && rm -rf \"{}\"", escaped);
        let _ = Command::new("sh")
            .args(["-c", &script])
            .spawn();
    }

    Ok(())
}

#[tauri::command]
fn close_app(window: tauri::Window) {
    let _ = window.close();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_home_dir,
            get_default_install_dir,
            perform_uninstallation,
            schedule_self_deletion,
            close_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running uninstaller application");
}
