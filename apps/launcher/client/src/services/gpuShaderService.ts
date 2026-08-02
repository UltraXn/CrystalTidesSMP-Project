import { invoke } from "@tauri-apps/api/core";

export interface GpuProfile {
  vendor: string;
  model: string;
  tier: "ULTRA" | "MEDIUM" | "LOW" | "INTEGRATED";
  recommended_render_distance: number;
  recommended_shader: string;
  recommended_simulation_distance: number;
  max_fps: number;
}

export const fetchGpuProfile = async (): Promise<GpuProfile> => {
  try {
    return await invoke<GpuProfile>("detect_gpu_profile");
  } catch (err) {
    console.warn("GPU Profile detection fallback:", err);
    return {
      vendor: "Desconocido",
      model: "Gráficos Estándar",
      tier: "MEDIUM",
      recommended_render_distance: 12,
      recommended_shader: "ComplementaryReimagined_Medium.zip",
      recommended_simulation_distance: 10,
      max_fps: 120,
    };
  }
};

export const applyOptimalGpuOptions = async (gameDir: string, profile: GpuProfile): Promise<void> => {
  try {
    await invoke("apply_gpu_options", {
      gameDir,
      renderDistance: profile.recommended_render_distance,
      maxFps: profile.max_fps,
    });
  } catch (err) {
    console.error("Failed to apply GPU options:", err);
  }
};
