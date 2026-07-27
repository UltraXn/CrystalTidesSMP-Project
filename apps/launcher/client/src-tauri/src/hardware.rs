use sysinfo::{System, CpuRefreshKind, RefreshKind};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CpuInfo {
    pub brand: String,
    pub vendor: String,
    pub physical_cores: usize,
    pub logical_cores: usize,
    pub has_hyperthreading: bool,
    pub is_hybrid: bool,
    pub is_xeon_or_legacy: bool,
    pub recommended_affinity_mask: u64,
    pub jvm_recommended_flags: Vec<String>,
}

#[tauri::command]
pub fn detect_hardware_profile() -> CpuInfo {
    let mut sys = System::new_with_specifics(
        RefreshKind::new().with_cpu(CpuRefreshKind::everything())
    );
    sys.refresh_cpu_all();

    let cpus = sys.cpus();
    let logical_cores = cpus.len();
    let physical_cores = sys.physical_core_count().unwrap_or(logical_cores);
    
    let brand = if !cpus.is_empty() {
        cpus[0].brand().to_string()
    } else {
        "Unknown CPU".to_string()
    };

    let vendor = if !cpus.is_empty() {
        cpus[0].vendor_id().to_string()
    } else {
        "Unknown Vendor".to_string()
    };

    let brand_lower = brand.to_lower();
    let has_hyperthreading = logical_cores > physical_cores;
    let is_xeon_or_legacy = brand_lower.contains("xeon") || brand_lower.contains("v3") || brand_lower.contains("v4") || brand_lower.contains("fx-");
    
    // Detect Hybrid P/E Core architecture (Intel 12th+ / Core Ultra)
    let is_hybrid = brand_lower.contains("12th") || brand_lower.contains("13th") || brand_lower.contains("14th") || brand_lower.contains("ultra");

    // Calculate optimal CPU Affinity mask
    let mut mask: u64 = 0;
    if is_hybrid {
        // For hybrid, assign first N physical performance cores (even thread indices: 0, 2, 4, 6...)
        let target_cores = (physical_cores / 2).max(4).min(8);
        for i in 0..target_cores {
            mask |= 1 << (i * 2);
        }
    } else if has_hyperthreading {
        // For Xeon / High Core CPUs, use primary physical threads only (0, 2, 4, 6, 8, 10, 12, 14)
        let target_cores = physical_cores.min(8);
        for i in 0..target_cores {
            mask |= 1 << (i * 2);
        }
    } else {
        // Standard CPUs: use all available cores
        for i in 0..logical_cores.min(64) {
            mask |= 1 << i;
        }
    }

    // Recommended JVM Flags tailored for the detected architecture
    let mut jvm_flags = vec![
        "-XX:+UseG1GC".to_string(),
        "-XX:+ParallelRefProcEnabled".to_string(),
        "-XX:MaxGCPauseMillis=200".to_string(),
    ];

    if is_xeon_or_legacy {
        jvm_flags.push("-XX:G1ReservePercent=20".to_string());
        jvm_flags.push("-XX:InitiatingHeapOccupancyPercent=15".to_string());
        jvm_flags.push("-XX:G1MixedGCLiveThresholdPercent=90".to_string());
    } else {
        jvm_flags.push("-XX:G1NewSizePercent=30".to_string());
        jvm_flags.push("-XX:G1MaxNewSizePercent=40".to_string());
        jvm_flags.push("-XX:G1HeapRegionSize=8M".to_string());
    }

    CpuInfo {
        brand,
        vendor,
        physical_cores,
        logical_cores,
        has_hyperthreading,
        is_hybrid,
        is_xeon_or_legacy,
        recommended_affinity_mask: mask,
        jvm_recommended_flags: jvm_flags,
    }
}
