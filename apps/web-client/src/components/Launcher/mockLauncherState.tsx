/* eslint-disable react-refresh/only-export-components, @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";

/* Bump this version when mock defaults change to clear stale localStorage */
const MOCK_DATA_VERSION = "v5-clean-registry-icons";
const MOCK_VERSION_KEY = "crystaltides_mock_version_v1";
(() => {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MOCK_VERSION_KEY) !== MOCK_DATA_VERSION) {
    ["crystaltides_settings", "crystaltides_profiles", "crystaltides_active_profile_id",
     "crystaltides_logs", "crystaltides_mock_accounts", "crystaltides_mods_registry"].forEach(k => localStorage.removeItem(k));
    localStorage.setItem(MOCK_VERSION_KEY, MOCK_DATA_VERSION);
  }
})();

/* ==========================================================================
   1. TYPES & INTERFACES
   ========================================================================== */

export type AuthType = "guest" | "microsoft" | "crystal" | "none";

export interface UserSession {
  id: string;
  username: string;
  type: AuthType;
  skinUrl?: string;
  uuid?: string;
  accessToken?: string;
  refreshToken?: string;
  role?: string;
}

export interface CrystalWebSession {
  username: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export interface SavedAccount {
  id: string;
  username: string;
  type: AuthType;
  uuid?: string;
  skinUrl?: string;
  lastUsed: string;
}

export interface MicrosoftDeviceCode {
  user_code: string;
  device_code: string;
  verification_uri: string;
  interval: number;
  expires_in: number;
}

export interface MicrosoftAuthResult {
  username: string;
  uuid: string;
  accessToken: string;
  refreshToken?: string;
}

export interface MinecraftCape {
  id: string;
  state: "ACTIVE" | "INACTIVE";
  url: string | null;
  alias?: string;
}

export interface MinecraftProfileData {
  id: string;
  name: string;
  capes: MinecraftCape[];
}

export interface Profile {
  id: string;
  name: string;
  mcVersion: string;
  loaderType: "vanilla" | "neoforge" | "fabric" | "forge" | "";
  loaderVersion: string;
  iconPath: string;
  gameDir?: string;
  isolateSaves: boolean;
  minRam?: number;
  maxRam?: number;
  useOptimization: boolean;
  javaArgs?: string;
  javaPath?: string;
  created: string;
  lastUsed?: string;
}

export interface LauncherSettings {
  mcVersion: string;
  loaderType: string;
  loaderVersion: string;
  minRam: number;
  maxRam: number;
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

export interface ServerStatus {
  online: boolean;
  playersOnline: number | null;
  playersMax: number | null;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
}

export interface InstalledMod {
  filename: string;
  sizeBytes: number;
  enabled: boolean;
  official: boolean;
}

export interface ModRegistryEntry {
  title?: string;
  iconUrl?: string;
  source?: "modrinth" | "curseforge";
  projectId?: string;
}

export interface ModInfo {
  name: string;
  url: string;
  sha1: string;
}

export interface ServerModItem {
  name: string;
  download_url: string;
  sha1: string;
  category?: string;
  description?: string;
}

export interface SearchModResult {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  icon_url?: string;
  author: string;
  downloads: number;
  source: "modrinth" | "curseforge";
  categories?: string[];
  date_modified?: string;
}

export type ModrinthSearchResult = {
  hits: SearchModResult[];
  total: number;
};

export interface ModVersionFile {
  id: string;
  versionNumber: string;
  name: string;
  downloadUrl: string;
  filename: string;
}

export interface LaunchParams {
  username: string;
  uuid: string;
  accessToken: string;
  mcVersion: string;
  loaderType: string;
  loaderVersion: string;
  minRam: number;
  maxRam: number;
  useOptimization: boolean;
  gameDir?: string;
  javaArgs?: string;
  javaPath?: string;
}

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category?: string;
  message: string;
}

/* ==========================================================================
   2. AUTH PROVIDER & CONTEXT
   ========================================================================== */

interface AuthContextType {
  currentSession: UserSession | null;
  crystalSession: CrystalWebSession | null;
  savedAccounts: SavedAccount[];
  isLoading: boolean;
  msDeviceCode: MicrosoftDeviceCode | null;
  loginGuest: (username: string) => Promise<void>;
  loginCrystal: (email: string, password?: string) => Promise<void>;
  logoutCrystal: () => Promise<void>;
  loginMicrosoft: () => Promise<void>;
  selectAccount: (accountId: string) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_SAVED_ACCOUNTS: SavedAccount[] = [
  {
    id: "account_invitado",
    username: "Invitado",
    type: "microsoft",
    uuid: "069a79f4-44e9-4726-a5be-fef90e38aaf5",
    skinUrl: "https://mc-heads.net/body/Invitado/100",
    lastUsed: new Date().toISOString(),
  },
  {
    id: "account_killuwu",
    username: "Killuwu",
    type: "microsoft",
    uuid: "98765432-1234-4321-8765-123456789abc",
    skinUrl: "https://mc-heads.net/body/Killuwu/100",
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_USER_SESSION: UserSession = {
  id: "account_invitado",
  username: "Invitado",
  type: "microsoft",
  uuid: "069a79f4-44e9-4726-a5be-fef90e38aaf5",
  skinUrl: "https://mc-heads.net/body/Invitado/100",
  role: "INVITADO",
};

const DEFAULT_CRYSTAL_SESSION: CrystalWebSession = {
  username: "Invitado",
  email: "invitado@crystaltides.net",
  avatarUrl: "https://mc-heads.net/avatar/Invitado/36",
  role: "INVITADO",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(DEFAULT_USER_SESSION);
  const [crystalSession, setCrystalSession] = useState<CrystalWebSession | null>(DEFAULT_CRYSTAL_SESSION);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(DEFAULT_SAVED_ACCOUNTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [msDeviceCode] = useState<MicrosoftDeviceCode | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("crystaltides_mock_accounts_v1");
      if (stored) {
        setSavedAccounts(JSON.parse(stored));
      } else {
        localStorage.setItem("crystaltides_mock_accounts_v1", JSON.stringify(DEFAULT_SAVED_ACCOUNTS));
      }
    } catch {
      setSavedAccounts(DEFAULT_SAVED_ACCOUNTS);
    }
  }, []);

  const saveAccountsList = (list: SavedAccount[]) => {
    setSavedAccounts(list);
    try {
      localStorage.setItem("crystaltides_mock_accounts_v1", JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const loginGuest = React.useCallback(async (username: string) => {
    setIsLoading(true);
    const accountId = `guest_${username.toLowerCase()}`;
    const newAccount: SavedAccount = {
      id: accountId,
      username,
      type: "guest",
      uuid: `00000000-0000-0000-0000-${Date.now()}`,
      skinUrl: `https://mc-heads.net/body/${username}/100`,
      lastUsed: new Date().toISOString(),
    };

    const updated = [newAccount, ...savedAccounts.filter((a) => a.id !== accountId)];
    saveAccountsList(updated);

    setCurrentSession({
      id: newAccount.id,
      username: newAccount.username,
      type: "guest",
      uuid: newAccount.uuid,
      skinUrl: newAccount.skinUrl,
      role: "Aventurero",
    });
    setIsLoading(false);
  }, [savedAccounts]);

  const loginCrystal = React.useCallback(async (email: string, _password?: string) => {
    setIsLoading(true);
    const username = email.split("@")[0] || "CrystalUser";
    const session: CrystalWebSession = {
      username,
      email,
      avatarUrl: `https://mc-heads.net/avatar/${username}/36`,
      role: "Miembro Oficial",
    };
    setCrystalSession(session);
    setIsLoading(false);
  }, []);

  const logoutCrystal = React.useCallback(async () => {
    setCrystalSession(null);
  }, []);

  const loginMicrosoft = React.useCallback(async () => {
    setIsLoading(true);
    const mockMsAccount: SavedAccount = {
      id: "account_invitado",
      username: "Invitado",
      type: "microsoft",
      uuid: "069a79f4-44e9-4726-a5be-fef90e38aaf5",
      skinUrl: "https://mc-heads.net/body/Invitado/100",
      lastUsed: new Date().toISOString(),
    };
    saveAccountsList([mockMsAccount, ...savedAccounts.filter((a) => a.id !== mockMsAccount.id)]);
    setCurrentSession(DEFAULT_USER_SESSION);
    setIsLoading(false);
  }, [savedAccounts]);

  const selectAccount = React.useCallback(async (accountId: string) => {
    const account = savedAccounts.find((a) => a.id === accountId);
    if (!account) return;

    setCurrentSession({
      id: account.id,
      username: account.username,
      type: account.type,
      uuid: account.uuid,
      skinUrl: account.skinUrl || `https://mc-heads.net/body/${account.username}/100`,
      role: account.username === "Invitado" ? "INVITADO" : "Aventurero",
    });

    const updated = savedAccounts.map((a) =>
      a.id === accountId ? { ...a, lastUsed: new Date().toISOString() } : a
    );
    saveAccountsList(updated);
  }, [savedAccounts]);

  const removeAccount = React.useCallback(async (accountId: string) => {
    const updated = savedAccounts.filter((a) => a.id !== accountId);
    saveAccountsList(updated);
    if (currentSession?.id === accountId) {
      if (updated.length > 0) {
        selectAccount(updated[0].id);
      } else {
        setCurrentSession(null);
      }
    }
  }, [savedAccounts, currentSession?.id, selectAccount]);

  const logout = React.useCallback(async () => {
    setCurrentSession(null);
  }, []);

  const authContextValue = React.useMemo(() => ({
    currentSession,
    crystalSession,
    savedAccounts,
    isLoading,
    msDeviceCode,
    loginGuest,
    loginCrystal,
    logoutCrystal,
    loginMicrosoft,
    selectAccount,
    removeAccount,
    logout,
  }), [
    currentSession,
    crystalSession,
    savedAccounts,
    isLoading,
    msDeviceCode,
    loginGuest,
    loginCrystal,
    logoutCrystal,
    loginMicrosoft,
    selectAccount,
    removeAccount,
    logout,
  ]);

  return (
    <AuthContext.Provider
      value={authContextValue}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ==========================================================================
   3. PROFILES MOCK STATE
   ========================================================================== */

const PROFILES_STORAGE_KEY = "crystaltides_profiles_v1";
const ACTIVE_PROFILE_KEY = "crystaltides_active_profile_id_v1";

const DEFAULT_PROFILES: Profile[] = [
  {
    id: "default",
    name: "Default",
    mcVersion: "1.21.1",
    loaderType: "neoforge",
    loaderVersion: "21.1.65",
    iconPath: "/logo.png",
    isolateSaves: false,
    useOptimization: true,
    created: new Date().toISOString(),
  },
  {
    id: "vanilla-1-20-4",
    name: "Vanilla Oficial 1.20.4",
    mcVersion: "1.20.4",
    loaderType: "vanilla",
    loaderVersion: "",
    iconPath: "🧱",
    isolateSaves: true,
    useOptimization: false,
    created: new Date().toISOString(),
  },
];

export const getProfiles = (): Profile[] => {
  const data = localStorage.getItem(PROFILES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
    return DEFAULT_PROFILES;
  }
  try {
    const parsed = JSON.parse(data) as Profile[];
    return parsed.length > 0 ? parsed : DEFAULT_PROFILES;
  } catch {
    return DEFAULT_PROFILES;
  }
};

export const getProfile = (id: string): Profile | undefined => {
  const profiles = getProfiles();
  return profiles.find((p) => p.id === id);
};

export const createProfile = (profileData: Partial<Profile>, _extra?: any): Profile => {
  const profiles = getProfiles();
  const newProfile: Profile = {
    id: profileData.id || `profile-${Date.now()}`,
    name: profileData.name || "Nuevo Perfil",
    mcVersion: profileData.mcVersion || "1.21.1",
    loaderType: profileData.loaderType || "neoforge",
    loaderVersion: profileData.loaderVersion || "21.1.65",
    iconPath: profileData.iconPath || "🎮",
    isolateSaves: profileData.isolateSaves || false,
    useOptimization: profileData.useOptimization !== false,
    created: new Date().toISOString(),
    ...profileData,
  };
  profiles.push(newProfile);
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  return newProfile;
};

export const updateProfile = (id: string, profileData: Partial<Profile>, _extra?: any): Profile | undefined => {
  const profiles = getProfiles();
  const index = profiles.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  profiles[index] = { ...profiles[index], ...profileData };
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  return profiles[index];
};

export const deleteProfile = (id: string): boolean => {
  let profiles = getProfiles();
  if (profiles.length <= 1) return false;

  profiles = profiles.filter((p) => p.id !== id);
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));

  if (getActiveProfileId() === id) {
    setActiveProfileId(profiles[0].id);
  }
  return true;
};

export const getActiveProfileId = (): string => {
  const id = localStorage.getItem(ACTIVE_PROFILE_KEY);
  const profiles = getProfiles();
  if (id && profiles.some((p) => p.id === id)) {
    return id;
  }
  return profiles[0].id;
};

export const setActiveProfileId = (id: string): void => {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
};

export const setSelectedProfileId = (id: string): void => {
  setActiveProfileId(id);
};

export const cloneProfile = (id: string): Profile | undefined => {
  const source = getProfile(id);
  if (!source) return undefined;
  return createProfile({
    ...source,
    name: `${source.name} (Copia)`,
  });
};

export const getActiveProfile = (): Profile => {
  const activeId = getActiveProfileId();
  return getProfile(activeId) || getProfiles()[0];
};

export const resolveProfileGameDir = (profile?: Profile | null, _homeDir?: string): string => {
  if (profile?.gameDir) return profile.gameDir;
  return "~/.crystaltides";
};

/* ==========================================================================
   4. SETTINGS MOCK STATE
   ========================================================================== */

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
  gameDir: "~/.crystaltides",
  autoConnect: true,
  serverHost: "mc.crystaltidesSMP.net",
  serverPort: 25565,
  selectedProfileId: "default",
  avatarPreference: "web",
};

export const getSettings = (): LauncherSettings => {
  const data = localStorage.getItem("crystaltides_settings_v1");
  if (!data) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Partial<LauncherSettings>): LauncherSettings => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem("crystaltides_settings_v1", JSON.stringify(updated));
  return updated;
};

/* ==========================================================================
   5. SERVER STATUS MOCK
   ========================================================================== */

export const fetchServerStatus = async (
  _host?: string,
  _port = 25565
): Promise<ServerStatus> => {
  return {
    online: true,
    playersOnline: 100,
    playersMax: 100,
  };
};

/* ==========================================================================
   6. NEWS MOCK
   ========================================================================== */

const MOCK_NEWS: NewsPost[] = [
  {
    id: "1",
    title: "¡Lanzamiento Oficial de la Temporada 4: Mareas de Sangre!",
    content: "Explora la nueva dimensión submarina, adquiere cristales inestables y compite en las nuevas maestrías.",
    category: "Anuncio",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Actualización del Cliente Nivel 2.4.0 (Tauri 64-bit)",
    content: "Sincronización instantánea de modpacks, rendimiento +140% FPS y consumo reducido a 38.4 MB de RAM.",
    category: "Actualización",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Torneo de Maestrías y Rangos de Gremio",
    content: "Este fin de semana competiremos en la arena PvP. ¡Los primeros clasificados obtendrán el rango Donador y 5,000 KC!",
    category: "Evento",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const fetchNews = async (_limit = 20): Promise<NewsPost[]> => {
  return MOCK_NEWS;
};

/* ==========================================================================
   7. MODS & MOD MANAGER MOCK
   ========================================================================== */

const MOCK_INSTALLED_MODS: InstalledMod[] = [
  { filename: "sodium-fabric-0.5.8.jar", sizeBytes: 1420000, enabled: true, official: true },
  { filename: "iris-1.6.14.jar", sizeBytes: 2850000, enabled: true, official: true },
  { filename: "voicechat-fabric-1.20.4-2.4.32.jar", sizeBytes: 4120000, enabled: true, official: true },
  { filename: "lithium-fabric-0.12.1.jar", sizeBytes: 980000, enabled: true, official: true },
  { filename: "ferritecore-6.0.1.jar", sizeBytes: 320000, enabled: true, official: true },
  { filename: "crystaltides-core-mod.jar", sizeBytes: 1850000, enabled: true, official: true },
  { filename: "appleskin-fabric-2.5.1.jar", sizeBytes: 240000, enabled: true, official: false },
  { filename: "rei-fabric-14.0.688.jar", sizeBytes: 3600000, enabled: true, official: false },
];

export const MOCK_SEARCH_MODS: SearchModResult[] = [
  {
    id: "sodium",
    title: "Sodium",
    description: "A high-performance rendering engine replacement for Minecraft, which greatly improves frame rates and reduces micro-stutter.",
    iconUrl: "https://raw.githubusercontent.com/CaffeineMC/sodium-fabric/1.20.x/dev/logo.png",
    icon_url: "https://raw.githubusercontent.com/CaffeineMC/sodium-fabric/1.20.x/dev/logo.png",
    author: "jellysquid3",
    downloads: 190800000,
    source: "modrinth",
    categories: ["optimization", "neoforge", "fabric"],
    date_modified: new Date().toISOString(),
  },
  {
    id: "iris",
    title: "Iris Shaders",
    description: "A modern shader pack loader for Minecraft intended to be compatible with existing OptiFine shader packs.",
    iconUrl: "https://raw.githubusercontent.com/IrisShaders/Iris/main/logo.png",
    icon_url: "https://raw.githubusercontent.com/IrisShaders/Iris/main/logo.png",
    author: "coderbot",
    downloads: 148600000,
    source: "modrinth",
    categories: ["shaders", "neoforge", "decoration"],
    date_modified: new Date().toISOString(),
  },
  {
    id: "voicechat",
    title: "Simple Voice Chat",
    description: "A proximity voice chat mod for Minecraft with high audio quality and spatial 3D audio.",
    iconUrl: "https://raw.githubusercontent.com/henkelmax/simple-voice-chat/main/logo.png",
    icon_url: "https://raw.githubusercontent.com/henkelmax/simple-voice-chat/main/logo.png",
    author: "henkelmax",
    downloads: 143700000,
    source: "modrinth",
    categories: ["audio", "neoforge", "utility"],
    date_modified: new Date().toISOString(),
  },
  {
    id: "ferritecore",
    title: "FerriteCore",
    description: "Memory usage optimizations for Minecraft.",
    iconUrl: "https://raw.githubusercontent.com/malte0811/FerriteCore/1.20/logo.png",
    icon_url: "https://raw.githubusercontent.com/malte0811/FerriteCore/1.20/logo.png",
    author: "malte0811",
    downloads: 138800000,
    source: "modrinth",
    categories: ["optimization", "neoforge"],
    date_modified: new Date().toISOString(),
  },
  {
    id: "rei",
    title: "Roughly Enough Items (REI)",
    description: "Clean and customizable recipe viewer mod for Minecraft.",
    iconUrl: "https://raw.githubusercontent.com/shedaniel/RoughlyEnoughItems/main/icon.png",
    icon_url: "https://raw.githubusercontent.com/shedaniel/RoughlyEnoughItems/main/icon.png",
    author: "shedaniel",
    downloads: 122100000,
    source: "modrinth",
    categories: ["item-viewing", "neoforge", "utility"],
    date_modified: new Date().toISOString(),
  },
];

export const listInstalledMods = async (_gameDir?: string): Promise<InstalledMod[]> => {
  return MOCK_INSTALLED_MODS;
};

export const setModEnabled = async (
  _gameDir: string,
  filename: string,
  enabled: boolean
): Promise<void> => {
  const mod = MOCK_INSTALLED_MODS.find((m) => m.filename === filename);
  if (mod) {
    mod.enabled = enabled;
  }
};

export const deleteModFile = async (_gameDir?: string, filename?: string): Promise<void> => {
  if (!filename) return;
  const index = MOCK_INSTALLED_MODS.findIndex((m) => m.filename === filename);
  if (index !== -1) {
    MOCK_INSTALLED_MODS.splice(index, 1);
  }
};

export const deleteInstalledMod = deleteModFile;

const MOCK_REGISTRY: Record<string, ModRegistryEntry> = {
  "sodium-fabric-0.5.8.jar": {
    title: "Sodium",
    source: "modrinth",
    iconUrl: "https://raw.githubusercontent.com/CaffeineMC/sodium-fabric/1.20.x/dev/logo.png",
  },
  "iris-1.6.14.jar": {
    title: "Iris Shaders",
    source: "modrinth",
    iconUrl: "https://raw.githubusercontent.com/IrisShaders/Iris/main/logo.png",
  },
  "voicechat-fabric-1.20.4-2.4.32.jar": {
    title: "Simple Voice Chat",
    source: "modrinth",
    iconUrl: "https://raw.githubusercontent.com/henkelmax/simple-voice-chat/main/logo.png",
  },
  "ferritecore-6.0.1.jar": {
    title: "FerriteCore",
    source: "modrinth",
    iconUrl: "https://raw.githubusercontent.com/malte0811/FerriteCore/1.20/logo.png",
  },
};

export const getModRegistry = async (_gameDir?: string): Promise<Record<string, ModRegistryEntry>> => {
  return { ...MOCK_REGISTRY };
};

export const getModsRegistry = getModRegistry;

export const recordModInRegistry = async (
  _gameDir?: string,
  filename?: string,
  entry?: ModRegistryEntry
): Promise<void> => {
  if (filename && entry) {
    MOCK_REGISTRY[filename] = entry;
  }
};

export const registerInstalledMod = recordModInRegistry;

export const removeModFromRegistry = async (_gameDir?: string, _filename?: string): Promise<void> => {};

export const unregisterMod = removeModFromRegistry;

export const prettyModName = (filename: string): string => {
  const base = filename.replace(/\.jar(\.disabled)?$/, "");
  return base.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export const formatModSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const fetchOfficialModsList = async (_gameDir?: string): Promise<ServerModItem[]> => {
  return [
    { name: "sodium-fabric-0.5.8.jar", download_url: "", sha1: "abc1", category: "Rendimiento", description: "Motor de renderizado optimizado." },
    { name: "iris-1.6.14.jar", download_url: "", sha1: "abc2", category: "Gráficos", description: "Soporte nativo de shaders." },
    { name: "voicechat-fabric-1.20.4-2.4.32.jar", download_url: "", sha1: "abc3", category: "Audio", description: "Chat de voz por proximidad." },
    { name: "lithium-fabric-0.12.1.jar", download_url: "", sha1: "abc4", category: "Rendimiento", description: "Optimización de física y tics." },
    { name: "ferritecore-6.0.1.jar", download_url: "", sha1: "abc5", category: "Memoria", description: "Reducción de consumo de RAM." },
    { name: "crystaltides-core-mod.jar", download_url: "", sha1: "abc6", category: "Servidor", description: "Modpack exclusivo CrystalTides." },
  ];
};

export const syncOfficialMods = async (
  _gameDir: string,
  onProgress?: (status: string, progress: number) => void
): Promise<void> => {
  onProgress?.("Obteniendo lista de mods oficiales...", 0.1);
  await new Promise((r) => setTimeout(r, 150));
  onProgress?.("Verificando firmas SHA-1...", 0.6);
  await new Promise((r) => setTimeout(r, 150));
  onProgress?.("¡Mods oficiales sincronizados!", 1.0);
};

export const searchModrinthMods = async (
  query = "",
  _mcVersion?: string,
  _loader?: string,
  _offset?: number,
  _limit?: number,
  _extra1?: any,
  _extra2?: any
): Promise<ModrinthSearchResult> => {
  const filtered = query
    ? MOCK_SEARCH_MODS.filter(
        (m) => m.title.toLowerCase().includes(query.toLowerCase()) || m.description.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_SEARCH_MODS;

  return {
    hits: filtered,
    total: filtered.length,
  };
};

export const searchModrinth = searchModrinthMods;

export const installModFromModrinth = async (
  _gameDir?: string,
  modId?: string,
  versionId?: string,
  _extra1?: any
): Promise<string> => {
  return `${modId || "mod"}-${versionId || "1.0.0"}.jar`;
};


export const searchCurseForgeMods = async (
  query = "",
  _mcVersion?: string,
  _loader?: string,
  _offset?: number,
  _limit?: number,
  _extra1?: any,
  _extra2?: any
): Promise<ModrinthSearchResult> => {
  return searchModrinthMods(query, _mcVersion, _loader, _offset, _limit, _extra1, _extra2);
};

export const searchCurseForge = searchCurseForgeMods;

export const installModFromCurseForge = async (
  _gameDir?: string,
  modId?: string,
  fileId?: string | number,
  _extra1?: any
): Promise<string> => {
  return `${modId || "mod"}-${fileId || 100}.jar`;
};



/* ==========================================================================
   8. LAUNCHER EXECUTION & JAVA MOCK
   ========================================================================== */

export const launchGame = async (
  params: LaunchParams,
  onProgress?: (status: string, progress: number) => void
): Promise<void> => {
  onProgress?.("Comprobando entorno de Java...", 0.1);
  await new Promise((resolve) => setTimeout(resolve, 200));

  onProgress?.(`Cargando versión ${params.mcVersion} (${params.loaderType || "Vanilla"})...`, 0.35);
  await new Promise((resolve) => setTimeout(resolve, 200));

  onProgress?.("Sincronizando mods oficiales de CrystalTides...", 0.7);
  await new Promise((resolve) => setTimeout(resolve, 250));

  onProgress?.("¡Lanzando Minecraft en segundo plano!", 1.0);
  await new Promise((resolve) => setTimeout(resolve, 150));
};



/* ==========================================================================
   9. MINECRAFT METADATA MOCK
   ========================================================================== */

export const fetchVanillaVersions = async (): Promise<string[]> => {
  return ["1.20.4", "1.20.2", "1.20.1", "1.19.4", "1.18.2", "1.16.5"];
};

export const fetchFabricLoaderVersions = async (): Promise<string[]> => {
  return ["0.15.11", "0.15.10", "0.15.7"];
};

export const fetchNeoForgeVersions = async (mcVersion: string): Promise<string[]> => {
  if (mcVersion === "1.20.1") return ["47.1.3", "47.1.0"];
  if (mcVersion.startsWith("1.21")) return ["21.1.65", "21.0.8"];
  return ["20.4.80"];
};

export const fetchForgeVersions = async (mcVersion: string): Promise<string[]> => {
  if (mcVersion === "1.20.1") return ["47.2.0", "47.1.3"];
  return ["47.2.0"];
};

/* ==========================================================================
   10. LOGGING MOCK
   ========================================================================== */

const LOG_KEY = "crystaltides_logs_v1";
const MAX_LOG_LINES = 500;

const DEFAULT_INITIAL_LOGS: LogEntry[] = [
  { timestamp: new Date(Date.now() - 3600000).toISOString(), level: "info", category: "System", message: "CrystalTides Launcher v2.4.0 (Tauri 64-bit Web Preview) inicializado." },
  { timestamp: new Date(Date.now() - 3500000).toISOString(), level: "info", category: "Auth", message: "Sesión restaurada para el usuario 'Invitado'." },
  { timestamp: new Date(Date.now() - 3400000).toISOString(), level: "info", category: "Modpack", message: "24 mods oficiales verificados (SHA-1 100% Sync)." },
];

const getStoredLogs = (): LogEntry[] => {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) {
      localStorage.setItem(LOG_KEY, JSON.stringify(DEFAULT_INITIAL_LOGS));
      return DEFAULT_INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_LOGS;
  }
};

const saveLogs = (logs: LogEntry[]) => {
  const trimmed = logs.slice(-MAX_LOG_LINES);
  localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
};

export const log = (
  message: string,
  opts?: { level?: LogLevel; category?: string }
) => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: opts?.level || "info",
    category: opts?.category,
    message,
  };

  const logs = getStoredLogs();
  logs.push(entry);
  saveLogs(logs);

  const prefix = entry.category ? `[${entry.category}] ` : "";
  switch (entry.level) {
    case "error":
      console.error(`${prefix}${message}`);
      break;
    case "warn":
      console.warn(`${prefix}${message}`);
      break;
    case "debug":
      console.debug(`${prefix}${message}`);
      break;
    default:
      console.log(`${prefix}${message}`);
  }
};

export const getLogs = (): LogEntry[] => getStoredLogs();

export const clearLogs = () => {
  localStorage.setItem(LOG_KEY, JSON.stringify(DEFAULT_INITIAL_LOGS));
};

export const getLogText = (): string => {
  return getStoredLogs()
    .map((e) => {
      const cat = e.category ? `[${e.category}] ` : "";
      return `[${e.timestamp}] [${e.level.toUpperCase()}] ${cat}${e.message}`;
    })
    .join("\n");
};

/* ==========================================================================
   11. MICROSOFT AUTH STUBS
   ========================================================================== */





export const fetchMinecraftProfile = async (
  _accessToken: string
): Promise<MinecraftProfileData | null> => {
  return {
    id: "069a79f4-44e9-4726-a5be-fef90e38aaf5",
    name: "Invitado",
    capes: [
      {
        id: "cape_founder",
        state: "ACTIVE",
        url: "https://textures.minecraft.net/texture/234057235235",
        alias: "Capa Oficial Fundador",
      },
    ],
  };
};

export const setActiveCape = async (
  _accessToken: string,
  _capeId: string
): Promise<boolean> => {
  return true;
};

export const hideCape = async (_accessToken: string): Promise<boolean> => {
  return true;
};

/* ==========================================================================
   12. SUPABASE MOCK STUB
   ========================================================================== */


