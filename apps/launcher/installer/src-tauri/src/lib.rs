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
fn install_app(target_dir: String) -> Result<(), String> {
    let path = Path::new(&target_dir);
    if !path.exists() {
        fs::create_dir_all(path).map_err(|e| format!("Error al crear directorio: {}", e))?;
    }

    // Subcarpetas para la suite completa
    let _ = fs::create_dir_all(path.join("mods"));
    let _ = fs::create_dir_all(path.join("profiles"));
    let _ = fs::create_dir_all(path.join("virtual_library"));
    let _ = fs::create_dir_all(path.join("bin"));

    let is_windows = cfg!(target_os = "windows");
    let exe_name = if is_windows { "CrystalTidesLauncher.exe" } else { "CrystalTidesLauncher" };
    let uninstaller_name = if is_windows { "CrystalTides-Uninstall.exe" } else { "CrystalTides-Uninstall" };

    // Copiar binario principal
    let current_exe = std::env::current_exe().unwrap_or_default();
    let current_dir = current_exe.parent().unwrap_or_else(|| Path::new("."));
    
    let candidate_sources = [
        current_dir.join(exe_name),
        current_dir.join("launcher-tauri.exe"),
        current_dir.join("launcher-tauri"),
        current_dir.join("CTLauncher.exe"),
        current_dir.join("CTLauncher"),
        current_dir.join("../release").join(exe_name),
        current_dir.join("../release/launcher-tauri.exe"),
        current_dir.join("../release/launcher-tauri"),
    ];

    let target_launcher = path.join(exe_name);
    for cand in &candidate_sources {
        if cand.exists() {
            let _ = fs::copy(cand, &target_launcher);
            break;
        }
    }

    // Copiar desinstalador
    let uninstaller_sources = [
        current_dir.join(uninstaller_name),
        current_dir.join("uninstaller-tauri.exe"),
        current_dir.join("uninstaller-tauri"),
        current_dir.join("../release").join(uninstaller_name),
    ];

    let target_uninstaller = path.join(uninstaller_name);
    for cand in &uninstaller_sources {
        if cand.exists() {
            let _ = fs::copy(cand, &target_uninstaller);
            break;
        }
    }

    // Guardar metadatos
    let installed_file = path.join(".installed.json");
    let metadata = serde_json::json!({
        "installed": true,
        "productName": "CrystalTides Launcher",
        "installedAt": chrono_now(),
        "version": "2.0.0",
        "os": std::env::consts::OS,
        "executable": target_launcher.to_string_lossy().to_string(),
        "uninstaller": target_uninstaller.to_string_lossy().to_string()
    });
    let _ = fs::write(installed_file, metadata.to_string());

    // ==========================================
    // 🪟 WINDOWS: REGISTRO Y ACCESOS .LNK
    // ==========================================
    #[cfg(target_os = "windows")]
    {
        let target_launcher_str = target_launcher.to_string_lossy().replace('\\', "/");
        let target_uninstaller_str = target_uninstaller.to_string_lossy().replace('\\', "/");
        let target_dir_str = target_dir.replace('\\', "/");

        let desktop_ps = format!(
            "$WshShell = New-Object -ComObject WScript.Shell; \
             $DesktopPath = [Environment]::GetFolderPath('Desktop'); \
             $Shortcut = $WshShell.CreateShortcut(\"$DesktopPath\\CrystalTides Launcher.lnk\"); \
             $Shortcut.TargetPath = \"{}\"; \
             $Shortcut.WorkingDirectory = \"{}\"; \
             $Shortcut.Save(); \
             $StartMenuPath = [Environment]::GetFolderPath('StartMenu'); \
             $ProgramDir = \"$StartMenuPath\\Programs\\CrystalTides\"; \
             if (!(Test-Path $ProgramDir)) {{ New-Item -ItemType Directory -Path $ProgramDir -Force | Out-Null }}; \
             $ShortcutSM = $WshShell.CreateShortcut(\"$ProgramDir\\CrystalTides Launcher.lnk\"); \
             $ShortcutSM.TargetPath = \"{}\"; \
             $ShortcutSM.WorkingDirectory = \"{}\"; \
             $ShortcutSM.Save()",
            target_launcher_str, target_dir_str, target_launcher_str, target_dir_str
        );

        let _ = Command::new("powershell")
            .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &desktop_ps])
            .output();

        let reg_ps = format!(
            "$registryPath = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CrystalTidesLauncher'; \
             if (!(Test-Path $registryPath)) {{ New-Item -Path $registryPath -Force | Out-Null }}; \
             New-ItemProperty -Path $registryPath -Name 'DisplayName' -Value 'CrystalTides Launcher' -PropertyType String -Force | Out-Null; \
             New-ItemProperty -Path $registryPath -Name 'DisplayIcon' -Value '{},0' -PropertyType String -Force | Out-Null; \
             New-ItemProperty -Path $registryPath -Name 'Publisher' -Value 'CrystalTides' -PropertyType String -Force | Out-Null; \
             New-ItemProperty -Path $registryPath -Name 'InstallLocation' -Value '{}' -PropertyType String -Force | Out-Null; \
             New-ItemProperty -Path $registryPath -Name 'UninstallString' -Value '\"{}\"' -PropertyType String -Force | Out-Null; \
             New-ItemProperty -Path $registryPath -Name 'DisplayVersion' -Value '2.0.0' -PropertyType String -Force | Out-Null",
            target_launcher_str, target_dir_str, target_uninstaller_str
        );

        let _ = Command::new("powershell")
            .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &reg_ps])
            .output();
    }

    // ==========================================
    // 🐧 LINUX: XDG .DESKTOP ENTRY & CHMOD
    // ==========================================
    #[cfg(target_os = "linux")]
    {
        if let Some(home) = dirs::home_dir() {
            let desktop_dir = home.join(".local/share/applications");
            let _ = fs::create_dir_all(&desktop_dir);
            let desktop_file = desktop_dir.join("crystaltides-launcher.desktop");
            let content = format!(
                "[Desktop Entry]\n\
                 Type=Application\n\
                 Name=CrystalTides Launcher\n\
                 GenericName=Minecraft Launcher\n\
                 Comment=Official Desktop Launcher for CrystalTides SMP\n\
                 Exec=\"{}\"\n\
                 Path=\"{}\"\n\
                 Terminal=false\n\
                 Categories=Game;ActionGame;\n\
                 StartupWMClass=net.crystaltides.launcher\n",
                target_launcher.to_string_lossy(),
                target_dir
            );
            let _ = fs::write(&desktop_file, content);

            let _ = Command::new("chmod")
                .args(["+x", &target_launcher.to_string_lossy()])
                .output();

            let _ = Command::new("update-desktop-database")
                .arg(desktop_dir.to_string_lossy().to_string())
                .output();
        }
    }

    // ==========================================
    // 🍏 MACOS: PERMISOS & QUARANTINE CLEANUP
    // ==========================================
    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("chmod")
            .args(["+x", &target_launcher.to_string_lossy()])
            .output();

        let _ = Command::new("xattr")
            .args(["-dr", "com.apple.quarantine", &target_dir])
            .output();
    }

    Ok(())
}

fn chrono_now() -> String {
    "2026-08-29T04:28:00Z".to_string()
}

#[tauri::command]
fn launch_launcher(install_dir: String) -> Result<(), String> {
    let is_windows = cfg!(target_os = "windows");
    let exe_name = if is_windows { "CrystalTidesLauncher.exe" } else { "CrystalTidesLauncher" };
    let fallback_names = [
        "launcher-tauri.exe",
        "launcher-tauri",
        "CTLauncher.exe",
        "CTLauncher",
    ];

    let mut target = Path::new(&install_dir).join(exe_name);
    if !target.exists() {
        for fb in &fallback_names {
            let p = Path::new(&install_dir).join(fb);
            if p.exists() {
                target = p;
                break;
            }
        }
    }

    if target.exists() {
        let _ = Command::new(&target)
            .current_dir(install_dir)
            .spawn()
            .map_err(|e| format!("Error al iniciar el Launcher: {}", e))?;
        Ok(())
    } else {
        Err("No se encontró el ejecutable del Launcher.".to_string())
    }
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
            install_app,
            launch_launcher,
            close_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running installer application");
}
