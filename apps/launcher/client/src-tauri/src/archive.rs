use crate::errors::{NativeError, NativeResult};

pub fn extract_archive(archive_path: &str, output_path: &str) -> NativeResult<()> {
    let file = std::fs::File::open(archive_path).map_err(NativeError::Io)?;

    let mut archive =
        zip::ZipArchive::new(file).map_err(|e| NativeError::Archive(e.to_string()))?;

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| NativeError::Archive(e.to_string()))?;

        let outpath = match file.enclosed_name() {
            Some(path) => std::path::Path::new(output_path).join(path),
            None => continue,
        };

        if file.is_dir() || (*file.name()).ends_with('/') || (*file.name()).ends_with('\\') {
            std::fs::create_dir_all(&outpath)?;
        } else {
            if let Some(parent) = outpath.parent() {
                if !parent.exists() {
                    std::fs::create_dir_all(parent)?;
                }
            }

            let mut outfile = std::fs::File::create(&outpath)?;
            std::io::copy(&mut file, &mut outfile)?;
        }
    }

    Ok(())
}
