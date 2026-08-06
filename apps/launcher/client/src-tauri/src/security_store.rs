use std::fs;
use std::path::PathBuf;
use base64::Engine;

fn get_security_store_dir() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or_else(|| "No se pudo obtener la carpeta del usuario.".to_string())?;
    let dir = home.join(".crystaltides").join("security");
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    }
    Ok(dir)
}

#[cfg(target_os = "windows")]
pub fn encrypt_data(data: &[u8]) -> Result<Vec<u8>, String> {
    use windows::Win32::Foundation::LocalFree;
    use windows::Win32::Security::Cryptography::{CryptProtectData, CRYPT_INTEGER_BLOB as CRYPTOAPI_BLOB};
    use std::ptr::null_mut;

    let mut input_blob = CRYPTOAPI_BLOB {
        cbData: data.len() as u32,
        pbData: data.as_ptr() as *mut u8,
    };
    let mut output_blob = CRYPTOAPI_BLOB {
        cbData: 0,
        pbData: null_mut(),
    };

    unsafe {
        CryptProtectData(
            &mut input_blob,
            None,
            None,
            None,
            None,
            0,
            &mut output_blob,
        )
        .map_err(|e| format!("Error en DPAPI CryptProtectData: {}", e))?;

        let slice = std::slice::from_raw_parts(output_blob.pbData, output_blob.cbData as usize);
        let result = slice.to_vec();
        let _ = LocalFree(windows::Win32::Foundation::HLOCAL(output_blob.pbData as _));
        Ok(result)
    }
}

#[cfg(not(target_os = "windows"))]
pub fn encrypt_data(data: &[u8]) -> Result<Vec<u8>, String> {
    // Simple obfuscation fallback for non-windows unix dev targets
    Ok(data.iter().map(|b| b ^ 0x5A).collect())
}

#[cfg(target_os = "windows")]
pub fn decrypt_data(data: &[u8]) -> Result<Vec<u8>, String> {
    use windows::Win32::Foundation::LocalFree;
    use windows::Win32::Security::Cryptography::{CryptUnprotectData, CRYPT_INTEGER_BLOB as CRYPTOAPI_BLOB};
    use std::ptr::null_mut;

    let mut input_blob = CRYPTOAPI_BLOB {
        cbData: data.len() as u32,
        pbData: data.as_ptr() as *mut u8,
    };
    let mut output_blob = CRYPTOAPI_BLOB {
        cbData: 0,
        pbData: null_mut(),
    };

    unsafe {
        CryptUnprotectData(
            &mut input_blob,
            None,
            None,
            None,
            None,
            0,
            &mut output_blob,
        )
        .map_err(|e| format!("Error en DPAPI CryptUnprotectData: {}", e))?;

        let slice = std::slice::from_raw_parts(output_blob.pbData, output_blob.cbData as usize);
        let result = slice.to_vec();
        let _ = LocalFree(windows::Win32::Foundation::HLOCAL(output_blob.pbData as _));
        Ok(result)
    }
}

#[cfg(not(target_os = "windows"))]
pub fn decrypt_data(data: &[u8]) -> Result<Vec<u8>, String> {
    Ok(data.iter().map(|b| b ^ 0x5A).collect())
}

#[tauri::command]
pub fn save_secure_token(key: String, secret_value: String) -> Result<(), String> {
    let dir = get_security_store_dir()?;
    let encrypted = encrypt_data(secret_value.as_bytes())?;
    let b64_encoded = base64::engine::general_purpose::STANDARD.encode(&encrypted);
    
    // Sanitize key filename
    let safe_key = key.chars().filter(|c| c.is_alphanumeric() || *c == '_').collect::<String>();
    let file_path = dir.join(format!("{}.dat", safe_key));

    fs::write(file_path, b64_encoded).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_secure_token(key: String) -> Result<Option<String>, String> {
    let dir = get_security_store_dir()?;
    let safe_key = key.chars().filter(|c| c.is_alphanumeric() || *c == '_').collect::<String>();
    let file_path = dir.join(format!("{}.dat", safe_key));

    if !file_path.exists() {
        return Ok(None);
    }

    let b64_encoded = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    let encrypted_bytes = base64::engine::general_purpose::STANDARD
        .decode(b64_encoded.trim())
        .map_err(|e| e.to_string())?;

    let decrypted = decrypt_data(&encrypted_bytes)?;
    let secret = String::from_utf8(decrypted).map_err(|e| e.to_string())?;
    
    Ok(Some(secret))
}

#[tauri::command]
pub fn delete_secure_token(key: String) -> Result<bool, String> {
    let dir = get_security_store_dir()?;
    let safe_key = key.chars().filter(|c| c.is_alphanumeric() || *c == '_').collect::<String>();
    let file_path = dir.join(format!("{}.dat", safe_key));

    if file_path.exists() {
        fs::remove_file(file_path).map_err(|e| e.to_string())?;
        Ok(true)
    } else {
        Ok(false)
    }
}
