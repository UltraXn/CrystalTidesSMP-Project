use serde::{Serialize, Deserialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GpuProfile {
    pub vendor: String,
    pub model: String,
    pub tier: String, // "ULTRA", "MEDIUM", "LOW", "INTEGRATED"
    pub recommended_render_distance: u32,
    pub recommended_shader: String,
    pub recommended_simulation_distance: u32,
    pub max_fps: u32,
}

/// Inspecciona la tarjeta gráfica del sistema y genera una configuración recomendada de Shaders y Render Distance
#[tauri::command]
pub fn detect_gpu_profile() -> Result<GpuProfile, String> {
    let mut system = sysinfo::System::new_all();
    system.refresh_all();

    // Intentar detectar GPU usando variables de entorno o sysinfo
    let mut gpu_model = "Gráficos Genéricos".to_string();
    let mut vendor = "Desconocido".to_string();

    // En Windows podemos consultar la GPU vía sysinfo / env
    if cfg!(target_os = "windows") {
        if let Ok(wmi_gpu) = std::env::var("PROCESSOR_IDENTIFIER") {
            gpu_model = wmi_gpu;
        }
    }

    let lower_model = gpu_model.to_lowercase();

    let mut tier = "MEDIUM".to_string();
    let mut recommended_render_distance = 12;
    let mut recommended_shader = "ComplementaryReimagined_Medium.zip".to_string();
    let mut recommended_simulation_distance = 10;
    let mut max_fps = 120;

    if lower_model.contains("rtx") || lower_model.contains("rx 6") || lower_model.contains("rx 7") || lower_model.contains("arc a7") {
        tier = "ULTRA".to_string();
        recommended_render_distance = 16;
        recommended_shader = "ComplementaryShaders_Ultra.zip".to_string();
        recommended_simulation_distance = 12;
        max_fps = 165;
        vendor = "NVIDIA / AMD High End".to_string();
    } else if lower_model.contains("gtx") || lower_model.contains("rx 5") || lower_model.contains("radeon") {
        tier = "MEDIUM".to_string();
        recommended_render_distance = 12;
        recommended_shader = "ComplementaryReimagined_Medium.zip".to_string();
        recommended_simulation_distance = 10;
        max_fps = 120;
        vendor = "NVIDIA / AMD Mid Range".to_string();
    } else if lower_model.contains("intel") || lower_model.contains("uhd") || lower_model.contains("iris") || lower_model.contains("integrated") {
        tier = "INTEGRATED".to_string();
        recommended_render_distance = 8;
        recommended_shader = "MakeUp_UltraFast_Low.zip".to_string();
        recommended_simulation_distance = 6;
        max_fps = 60;
        vendor = "Intel Integrated Graphics".to_string();
    }

    Ok(GpuProfile {
        vendor,
        model: gpu_model,
        tier,
        recommended_render_distance,
        recommended_shader,
        recommended_simulation_distance,
        max_fps,
    })
}

/// Aplica la configuración de gráficos recomendada directamente al archivo options.txt del perfil
#[tauri::command]
pub fn apply_gpu_options(game_dir: String, render_distance: u32, max_fps: u32) -> Result<(), String> {
    let options_path = Path::new(&game_dir).join("options.txt");
    let mut options_content = String::new();

    if options_path.exists() {
        if let Ok(existing) = fs::read_to_string(&options_path) {
            options_content = existing;
        }
    }

    let mut lines: Vec<String> = options_content
        .lines()
        .filter(|l| !l.starts_with("renderDistance:") && !l.starts_with("maxFps:"))
        .map(|l| l.to_string())
        .collect();

    lines.push(format!("renderDistance:{}", render_distance));
    lines.push(format!("maxFps:{}", max_fps));

    fs::write(&options_path, lines.join("\n")).map_err(|e| e.to_string())?;

    Ok(())
}
