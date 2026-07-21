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
fn install_app(target_dir: String) -> Result<(), String> {
    let path = Path::new(&target_dir);
    if !path.exists() {
        fs::create_dir_all(path).map_err(|e| format!("Error al crear directorio: {}", e))?;
    }

    // Create subfolders
    let _ = fs::create_dir_all(path.join("mods"));
    let _ = fs::create_dir_all(path.join("profiles"));
    let _ = fs::create_dir_all(path.join("virtual_library"));

    let is_windows = cfg!(target_os = "windows");
    let exe_name = if is_windows { "CTLauncher.exe" } else { "CTLauncher" };
    let source_name = if is_windows { "launcher-tauri.exe" } else { "launcher-tauri" };

    // Copy launcher binary if available
    let current_exe = std::env::current_exe().unwrap_or_default();
    let release_dir = current_exe.parent().unwrap_or_else(|| Path::new("."));
    let launcher_source = release_dir.join(source_name);
    let target_launcher = path.join(exe_name);

    if launcher_source.exists() {
        let _ = fs::copy(&launcher_source, &target_launcher);
    }

    // Write installation metadata
    let installed_file = path.join(".installed.json");
    let metadata = serde_json::json!({
        "installed": true,
        "installedAt": chrono_now(),
        "version": "0.1.0",
        "os": std::env::consts::OS,
        "executable": target_launcher.to_string_lossy().to_string()
    });
    let _ = fs::write(installed_file, metadata.to_string());

    #[cfg(target_os = "windows")]
    {
        let target_launcher_str = target_launcher.to_string_lossy().replace('\\', "/");
        let target_dir_str = target_dir.replace('\\', "/");

        let desktop_ps = format!(
            "$WshShell = New-Object -ComObject WScript.Shell; \
             $DesktopPath = [Environment]::GetFolderPath('Desktop'); \
             $Shortcut = $WshShell.CreateShortcut(\"$DesktopPath\\CTLauncher.lnk\"); \
             $Shortcut.TargetPath = \"{}\"; \
             $Shortcut.WorkingDirectory = \"{}\"; \
             $Shortcut.Save(); \
             $StartMenuPath = [Environment]::GetFolderPath('StartMenu'); \
             $ProgramDir = \"$StartMenuPath\\Programs\\CrystalTides\"; \
             if (!(Test-Path $ProgramDir)) {{ New-Item -ItemType Directory -Path $ProgramDir -Force | Out-Null }}; \
             $ShortcutSM = $WshShell.CreateShortcut(\"$ProgramDir\\CTLauncher.lnk\"); \
             $ShortcutSM.TargetPath = \"{}\"; \
             $ShortcutSM.WorkingDirectory = \"{}\"; \
             $ShortcutSM.Save()",
            target_launcher_str, target_dir_str, target_launcher_str, target_dir_str
        );

        let _ = Command::new("powershell")
            .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &desktop_ps])
            .output();

        let reg_ps = format!(
            "$registryPath = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CTLauncher'; \
             if (!(Test-Path $registryPath)) {{ New-Item -Path $registryPath -Force | Out-Null }}; \
             New-ItemProperty -Path $registryPath -Name 'DisplayName' -Value 'CTLauncher' -PropertyType String -Force | Out-Null; \
             New-ItemProperty -Path $registryPath -Name 'DisplayIcon' -Value '{}' -PropertyType String -Force | Out-Null; \
             New-ItemProperty -Path $registryPath -Name 'Publisher' -Value 'CrystalTides' -PropertyType String -Force | Out-Null; \
             New-ItemProperty -Path $registryPath -Name 'DisplayVersion' -Value '0.1.0' -PropertyType String -Force | Out-Null",
            target_launcher_str
        );

        let _ = Command::new("powershell")
            .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &reg_ps])
            .output();
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(home) = dirs::home_dir() {
            let desktop_file = home.join(".local/share/applications/ctlauncher.desktop");
            let desktop_dir = desktop_file.parent().unwrap();
            let _ = fs::create_dir_all(desktop_dir);
            let content = format!(
                "[Desktop Entry]\n\
                 Name=CTLauncher\n\
                 Exec={}\n\
                 Path={}\n\
                 Terminal=false\n\
                 Type=Application\n\
                 Categories=Game;\n",
                target_launcher.to_string_lossy(),
                target_dir
            );
            let _ = fs::write(desktop_file, content);
        }
    }

    Ok(())
}

fn chrono_now() -> String {
    "2026-07-20T21:03:00Z".to_string()
}

#[tauri::command]
fn launch_launcher(install_dir: String) -> Result<(), String> {
    let is_windows = cfg!(target_os = "windows");
    let exe_name = if is_windows { "CTLauncher.exe" } else { "CTLauncher" };
    let fallback_name = if is_windows { "launcher-tauri.exe" } else { "launcher-tauri" };

    let exe_path = Path::new(&install_dir).join(exe_name);
    let fallback_path = Path::new(&install_dir).join(fallback_name);

    let target = if exe_path.exists() {
        exe_path
    } else if fallback_path.exists() {
        fallback_path
    } else {
        return Err("No se encontró el ejecutable del Launcher.".to_string());
    };

    let _ = Command::new(target)
        .current_dir(install_dir)
        .spawn();

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_home_dir,
            install_app,
            launch_launcher
        ])
        .run(tauri::generate_context!())
        .expect("error while running installer application");
}
