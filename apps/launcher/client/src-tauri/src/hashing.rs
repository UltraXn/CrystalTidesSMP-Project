use crate::errors::NativeResult;
use sha1::{Digest, Sha1};
use std::io::Read;
use std::path::Path;

pub fn calculate_sha1(path_str: &str) -> NativeResult<String> {
    let mut file = std::fs::File::open(Path::new(path_str))?;
    let mut hasher = Sha1::new();
    let mut buffer = [0; 8192];

    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }

    Ok(hex::encode(hasher.finalize()))
}
