use std::fs;
use std::path::Path;
use std::process::Command;

#[tauri::command]
fn get_home_dir() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "No se pudo obtener el directorio home".to_string())
}

#[tauri::command]
fn perform_uninstallation(target_dir: String) -> Result<(), String> {
    let path = Path::new(&target_dir);

    // 1. Clean registry key via PowerShell
    let reg_ps = format!(
        "$ErrorActionPreference = 'SilentlyContinue'; \
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
         Remove-Item (Join-Path $Desktop 'CTLauncher.lnk') -Force; \
         Remove-Item (Join-Path $Desktop 'Crystal Launcher.lnk') -Force; \
         Remove-Item (Join-Path $StartMenu 'Programs\\CrystalTides') -Recurse -Force"
    );
    let _ = Command::new("powershell")
        .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &shortcut_ps])
        .output();

    // 3. Delete target directory contents if present
    if path.exists() {
        let _ = fs::remove_dir_all(path);
    }

    Ok(())
}

#[tauri::command]
fn schedule_self_deletion(target_dir: String) -> Result<(), String> {
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

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_home_dir,
            perform_uninstallation,
            schedule_self_deletion
        ])
        .run(tauri::generate_context!())
        .expect("error while running uninstaller application");
}
