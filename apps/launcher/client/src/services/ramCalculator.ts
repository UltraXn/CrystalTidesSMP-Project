export interface RecommendedRam {
  minRam: number;
  maxRam: number;
  totalSystemRamGb: number;
  recommendationReason: string;
}

export const calculateRecommendedRam = (totalSystemMemoryBytes?: number): RecommendedRam => {
  // Fallback to navigator.deviceMemory if available (in GB) or default 16GB
  const deviceMemoryGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 16;
  const totalGb = totalSystemMemoryBytes 
    ? Math.round(totalSystemMemoryBytes / (1024 * 1024 * 1024))
    : deviceMemoryGb;

  let minRam = 2048;
  let maxRam = 4096;
  let reason = "Configuración estándar para 8GB o menos de RAM.";

  if (totalGb >= 32) {
    minRam = 4096;
    maxRam = 8192;
    reason = "Sistema con 32GB+ RAM: 8GB asignados a Minecraft con amplio margen para el SO.";
  } else if (totalGb >= 16) {
    minRam = 3072;
    maxRam = 6144;
    reason = "Sistema con 16GB RAM: 6GB asignados a Minecraft para máximo rendimiento con shaders y mods.";
  } else if (totalGb >= 12) {
    maxRam = 5120;
    reason = "Sistema con 12GB RAM: 5GB asignados a Minecraft.";
  }

  return {
    minRam,
    maxRam,
    totalSystemRamGb: totalGb,
    recommendationReason: reason,
  };
};
