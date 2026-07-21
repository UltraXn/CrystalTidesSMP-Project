use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use std::path::{Path, PathBuf};

use walkdir::WalkDir;
use windows::core::{PCWSTR, PWSTR};
use windows::Win32::Foundation::{
    CloseHandle, GetLastError, ERROR_ALREADY_EXISTS, ERROR_NO_MORE_ITEMS, HANDLE,
};
use windows::Win32::Storage::FileSystem::{MoveFileExW, MOVEFILE_DELAY_UNTIL_REBOOT};
use windows::Win32::System::Registry::{
    RegCloseKey, RegDeleteTreeW, RegEnumKeyExW, RegOpenKeyExW, RegQueryValueExW, HKEY,
    HKEY_CURRENT_USER, KEY_READ, REG_EXPAND_SZ, REG_SZ, REG_VALUE_TYPE,
};
use windows::Win32::System::Threading::{
    CreateMutexW, GetCurrentProcess, SetPriorityClass, HIGH_PRIORITY_CLASS, NORMAL_PRIORITY_CLASS,
};

static mut INSTANCE_MUTEX: Option<HANDLE> = None;

const UNINSTALL_ROOT: &str = "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall";
const KNOWN_UNINSTALL_KEY: &str = "CrystalLauncher";

pub fn check_single_instance() -> bool {
    let mutex_name: Vec<u16> = "Global\\CrystalLauncher_Instance_Mutex\0"
        .encode_utf16()
        .collect();

    unsafe {
        match CreateMutexW(None, true, PCWSTR(mutex_name.as_ptr())) {
            Ok(handle) => {
                if GetLastError() == ERROR_ALREADY_EXISTS {
                    let _ = CloseHandle(handle);
                    return false;
                }
                INSTANCE_MUTEX = Some(handle);
                true
            }
            Err(_) => false,
        }
    }
}

pub fn set_high_priority() -> bool {
    unsafe { SetPriorityClass(GetCurrentProcess(), HIGH_PRIORITY_CLASS).is_ok() }
}

pub fn set_normal_priority() -> bool {
    unsafe { SetPriorityClass(GetCurrentProcess(), NORMAL_PRIORITY_CLASS).is_ok() }
}

pub fn create_hard_link(source: &str, target: &str) -> i32 {
    let source_path = Path::new(source);
    let target_path = Path::new(target);

    // Ensure target parent directory exists
    if let Some(parent) = target_path.parent() {
        if std::fs::create_dir_all(parent).is_err() {
            return -3;
        }
    }

    match std::fs::hard_link(source_path, target_path) {
        Ok(_) => 1,
        Err(e) => {
            eprintln!(
                "[Rust Native] Hardlink failed: {} -> {} (Error: {})",
                source, target, e
            );
            -10
        }
    }
}

pub fn perform_uninstallation(install_dir: &str) -> i32 {
    println!("[Rust Native] Starting native uninstallation flow...");

    let install_dir_normalized = normalize_pathish(install_dir);

    remove_uninstall_registry_entries(&install_dir_normalized);
    remove_shortcuts();

    1
}

pub fn schedule_self_deletion(install_dir: &str) -> i32 {
    let install_path = Path::new(install_dir);
    if !install_path.exists() {
        return 1;
    }

    if std::fs::remove_dir_all(install_path).is_ok() {
        return 1;
    }

    if schedule_tree_delete_on_reboot(install_path) {
        1
    } else {
        -4
    }
}

fn remove_uninstall_registry_entries(install_dir_normalized: &str) {
    let mut keys_to_remove = vec![KNOWN_UNINSTALL_KEY.to_string()];

    let uninstall_root_wide = to_wide_null(OsStr::new(UNINSTALL_ROOT));
    let mut uninstall_root = HKEY::default();

    unsafe {
        let open_status = RegOpenKeyExW(
            HKEY_CURRENT_USER,
            PCWSTR(uninstall_root_wide.as_ptr()),
            0,
            KEY_READ,
            &mut uninstall_root,
        );

        if open_status.0 == 0 {
            let mut index = 0u32;
            loop {
                let mut key_name = [0u16; 260];
                let mut key_name_len = key_name.len() as u32;

                let enum_status = RegEnumKeyExW(
                    uninstall_root,
                    index,
                    PWSTR(key_name.as_mut_ptr()),
                    &mut key_name_len,
                    None,
                    PWSTR::null(),
                    None,
                    None,
                );

                if enum_status == ERROR_NO_MORE_ITEMS {
                    break;
                }

                if enum_status.0 != 0 {
                    index += 1;
                    continue;
                }

                let key = String::from_utf16_lossy(&key_name[..key_name_len as usize]);
                if should_remove_uninstall_key(uninstall_root, &key, install_dir_normalized)
                    && !keys_to_remove
                        .iter()
                        .any(|existing| existing.eq_ignore_ascii_case(&key))
                {
                    keys_to_remove.push(key);
                }

                index += 1;
            }

            let _ = RegCloseKey(uninstall_root);
        }
    }

    for key in keys_to_remove {
        let full_subkey = format!("{}\\{}", UNINSTALL_ROOT, key);
        let full_subkey_wide = to_wide_null(OsStr::new(&full_subkey));

        unsafe {
            let delete_status =
                RegDeleteTreeW(HKEY_CURRENT_USER, PCWSTR(full_subkey_wide.as_ptr()));
            if delete_status.0 != 0 && delete_status.0 != 2 {
                println!(
                    "[Rust Native] Could not delete uninstall registry key {} (error {})",
                    full_subkey, delete_status.0
                );
            }
        }
    }
}

fn should_remove_uninstall_key(root: HKEY, subkey: &str, install_dir_normalized: &str) -> bool {
    if subkey.eq_ignore_ascii_case(KNOWN_UNINSTALL_KEY) {
        return true;
    }

    let subkey_wide = to_wide_null(OsStr::new(subkey));
    let mut subkey_handle = HKEY::default();

    unsafe {
        if RegOpenKeyExW(
            root,
            PCWSTR(subkey_wide.as_ptr()),
            0,
            KEY_READ,
            &mut subkey_handle,
        )
        .0 != 0
        {
            return false;
        }
    }

    let uninstall_string = read_registry_string_value(subkey_handle, "UninstallString");
    let display_icon = read_registry_string_value(subkey_handle, "DisplayIcon");
    let install_location = read_registry_string_value(subkey_handle, "InstallLocation");

    unsafe {
        let _ = RegCloseKey(subkey_handle);
    }

    [uninstall_string, display_icon, install_location]
        .into_iter()
        .flatten()
        .any(|value| normalize_pathish(&value).contains(install_dir_normalized))
}

fn read_registry_string_value(hkey: HKEY, value_name: &str) -> Option<String> {
    let value_name_wide = to_wide_null(OsStr::new(value_name));

    let mut value_type = REG_VALUE_TYPE(0);
    let mut data_len: u32 = 0;

    unsafe {
        let size_status = RegQueryValueExW(
            hkey,
            PCWSTR(value_name_wide.as_ptr()),
            None,
            Some(&mut value_type),
            None,
            Some(&mut data_len),
        );

        if size_status.0 != 0 || data_len < 2 {
            return None;
        }

        if value_type != REG_SZ && value_type != REG_EXPAND_SZ {
            return None;
        }

        let mut data = vec![0u8; data_len as usize];
        let query_status = RegQueryValueExW(
            hkey,
            PCWSTR(value_name_wide.as_ptr()),
            None,
            Some(&mut value_type),
            Some(data.as_mut_ptr()),
            Some(&mut data_len),
        );

        if query_status.0 != 0 || data_len < 2 {
            return None;
        }

        let utf16_data: Vec<u16> = data[..data_len as usize]
            .chunks_exact(2)
            .map(|chunk| u16::from_le_bytes([chunk[0], chunk[1]]))
            .take_while(|code_unit| *code_unit != 0)
            .collect();

        if utf16_data.is_empty() {
            return None;
        }

        Some(String::from_utf16_lossy(&utf16_data))
    }
}

fn remove_shortcuts() {
    let desktop_path = std::env::var_os("USERPROFILE")
        .map(|path| PathBuf::from(path).join("Desktop"))
        .unwrap_or_else(|| PathBuf::from("C:\\"));

    let appdata_path = std::env::var_os("APPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("C:\\"));

    let start_menu_dir =
        appdata_path.join("Microsoft\\Windows\\Start Menu\\Programs\\CrystalTides");

    let shortcuts = [
        desktop_path.join("Crystal Launcher.lnk"),
        desktop_path.join("CrystalTides Launcher.lnk"),
        start_menu_dir.join("Crystal Launcher.lnk"),
        start_menu_dir.join("CrystalTides Launcher.lnk"),
    ];

    for shortcut in shortcuts {
        if shortcut.exists() {
            let _ = std::fs::remove_file(shortcut);
        }
    }

    if start_menu_dir.exists() {
        let has_entries = std::fs::read_dir(&start_menu_dir)
            .map(|mut entries| entries.next().is_some())
            .unwrap_or(true);

        if !has_entries {
            let _ = std::fs::remove_dir(start_menu_dir);
        }
    }
}

fn schedule_tree_delete_on_reboot(root: &Path) -> bool {
    let mut ok = true;

    for entry in WalkDir::new(root).contents_first(true).into_iter() {
        let entry = match entry {
            Ok(value) => value,
            Err(error) => {
                println!(
                    "[Rust Native] Walk error while scheduling cleanup: {}",
                    error
                );
                ok = false;
                continue;
            }
        };

        if !schedule_single_path_delete_on_reboot(entry.path()) {
            println!(
                "[Rust Native] Failed to schedule reboot deletion for: {}",
                entry.path().display()
            );
            ok = false;
        }
    }

    ok
}

fn schedule_single_path_delete_on_reboot(path: &Path) -> bool {
    let wide_path = to_wide_null(path.as_os_str());
    unsafe {
        MoveFileExW(
            PCWSTR(wide_path.as_ptr()),
            PCWSTR::null(),
            MOVEFILE_DELAY_UNTIL_REBOOT,
        )
        .is_ok()
    }
}

fn to_wide_null(value: &OsStr) -> Vec<u16> {
    value.encode_wide().chain(std::iter::once(0)).collect()
}

fn normalize_pathish(value: &str) -> String {
    value
        .trim_matches('"')
        .replace('/', "\\")
        .to_ascii_lowercase()
}
