use serde::{Serialize, Deserialize};
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CrashDiagnostic {
    pub exit_code: i32,
    pub primary_cause: String,
    pub detailed_reason: String,
    pub offending_mod: Option<String>,
    pub recommended_action: String,
    pub raw_snippet: String,
    pub timestamp: String,
}

/// Analiza la carpeta .crystaltides/crash-reports o los logs de Minecraft para diagnosticar el fallo
#[tauri::command]
pub fn analyze_game_crash(game_dir: String, exit_code: i32) -> Result<CrashDiagnostic, String> {
    let crash_reports_dir = Path::new(&game_dir).join("crash-reports");
    let logs_dir = Path::new(&game_dir).join("logs");

    let mut latest_crash_content = String::new();
    let mut crash_time = "Reciente".to_string();

    // 1. Buscar el último crash-report.txt
    if crash_reports_dir.exists() {
        let mut newest_file = None;
        let mut newest_time = std::time::SystemTime::UNIX_EPOCH;

        for entry in WalkDir::new(&crash_reports_dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("txt") {
                if let Ok(metadata) = fs::metadata(path) {
                    if let Ok(modified) = metadata.modified() {
                        if modified > newest_time {
                            newest_time = modified;
                            newest_file = Some(path.to_path_buf());
                        }
                    }
                }
            }
        }

        if let Some(file_path) = newest_file {
            if let Ok(content) = fs::read_to_string(&file_path) {
                latest_crash_content = content;
                if let Some(name) = file_path.file_name().and_then(|n| n.to_str()) {
                    crash_time = name.to_string();
                }
            }
        }
    }

    // 2. Si no hay crash report, intentar leer latest.log
    if latest_crash_content.is_empty() && logs_dir.exists() {
        let latest_log = logs_dir.join("latest.log");
        if latest_log.exists() {
            if let Ok(content) = fs::read_to_string(&latest_log) {
                // Tomar las últimas 150 líneas
                let lines: Vec<&str> = content.lines().collect();
                let start = if lines.len() > 150 { lines.len() - 150 } else { 0 };
                latest_crash_content = lines[start..].join("\n");
            }
        }
    }

    // 3. Analizador sintáctico de patrones de fallo conocidos
    let lower_content = latest_crash_content.to_lowercase();
    let mut primary_cause = "Error Desconocido de Ejecución".to_string();
    let mut detailed_reason = "El juego se cerró de manera inesperada.".to_string();
    let mut offending_mod: Option<String> = None;
    let mut recommended_action = "Intenta reiniciar el launcher o reparar el perfil.".to_string();

    if lower_content.contains("java.lang.outofmemoryerror") || lower_content.contains("out of memory") {
        primary_cause = "Memoria RAM Insuficiente (OutOfMemoryError)".to_string();
        detailed_reason = "El juego se quedó sin memoria RAM disponible para cargar texturas y mods.".to_string();
        recommended_action = "Aumenta la memoria RAM asignada en los ajustes del perfil usando el Auto-Calculador.".to_string();
    } else if lower_content.contains("incompatiblemodexception") || lower_content.contains("mixin") {
        primary_cause = "Incompatibilidad o Conflicto de Mods".to_string();
        detailed_reason = "Un mod o Mixin está intentando modificar clases del juego incompatibles.".to_string();
        recommended_action = "Verifica los mods agregados recientemente o ejecuta la reparación automática.".to_string();
        
        // Intentar identificar el mod culpable
        for line in latest_crash_content.lines() {
            if line.contains("Mod File:") || line.contains("Failure message:") {
                offending_mod = Some(line.trim().to_string());
                break;
            }
        }
    } else if lower_content.contains("missingmodexception") || lower_content.contains("requires version") {
        primary_cause = "Dependencia de Mod Faltante".to_string();
        detailed_reason = "Uno de los mods requiere una librería o mod base que no está instalado.".to_string();
        recommended_action = "Descarga la dependencia sugerida o reinstala el modpack oficial.".to_string();
    } else if lower_content.contains("org.lwjgl.opengl") || lower_content.contains("driver") || lower_content.contains("pixel format") {
        primary_cause = "Fallo de Controlador Gráfico (OpenGL / GPU)".to_string();
        detailed_reason = "Tu tarjeta gráfica no pudo inicializar el contexto de OpenGL.".to_string();
        recommended_action = "Actualiza los controladores de tu tarjeta de vídeo (NVIDIA/AMD/Intel).".to_string();
    }

    let snippet_lines: Vec<&str> = latest_crash_content.lines().take(40).collect();
    let raw_snippet = snippet_lines.join("\n");

    Ok(CrashDiagnostic {
        exit_code,
        primary_cause,
        detailed_reason,
        offending_mod,
        recommended_action,
        raw_snippet,
        timestamp: crash_time,
    })
}
