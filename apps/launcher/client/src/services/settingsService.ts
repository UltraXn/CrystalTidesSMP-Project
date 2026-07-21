export interface LauncherSettings {
  mcVersion: string;
  loaderType: string;
  loaderVersion: string;
  minRam: number; // in MB
  maxRam: number; // in MB
  useOptimization: boolean;
  javaPath?: string;
  width: number;
  height: number;
  fullscreen: boolean;
  gameDir: string;
  autoConnect: boolean;
  serverHost: string;
  serverPort: number;
  selectedProfileId?: string;
  avatarPreference?: "web" | "minecraft";
}

const DEFAULT_SETTINGS: LauncherSettings = {
  mcVersion: "1.21.1",
  loaderType: "neoforge",
  loaderVersion: "21.1.65",
  minRam: 2048,
  maxRam: 4096,
  useOptimization: true,
  javaPath: "",
  width: 1280,
  height: 720,
  fullscreen: false,
  gameDir: "",
  autoConnect: true,
  serverHost: "mc.crystaltidesSMP.net",
  serverPort: 25565,
  selectedProfileId: "default-profile-id",
  avatarPreference: "web",
};

export const getSettings = (): LauncherSettings => {
  const data = localStorage.getItem("crystaltides_settings");
  if (!data) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Partial<LauncherSettings>) => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem("crystaltides_settings", JSON.stringify(updated));
  return updated;
};
