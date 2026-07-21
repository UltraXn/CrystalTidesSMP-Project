export interface Profile {
  id: string;
  name: string;
  mcVersion: string;
  loaderType: "vanilla" | "neoforge" | "fabric" | "forge" | "";
  loaderVersion: string;
  iconPath: string; // E.g., "🌊", "🎮", "🧱"
  gameDir?: string; // Custom game directory
  isolateSaves: boolean;
  minRam?: number; // In MB, optional override
  maxRam?: number; // In MB, optional override
  useOptimization: boolean;
  javaArgs?: string;
  javaPath?: string;
  created: string;
  lastUsed?: string;
}

const STORAGE_KEY = "crystaltides_profiles";
const ACTIVE_PROFILE_KEY = "crystaltides_active_profile_id";

const DEFAULT_PROFILE: Profile = {
  id: "default-profile-id",
  name: "Default",
  mcVersion: "1.21.1",
  loaderType: "neoforge",
  loaderVersion: "21.1.65",
  iconPath: "🌊",
  isolateSaves: false,
  useOptimization: true,
  created: new Date().toISOString(),
};

export const getProfiles = (): Profile[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Seed default profile if none exists
    const profiles = [DEFAULT_PROFILE];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return profiles;
  }
  try {
    const parsed = JSON.parse(data) as Profile[];
    if (parsed.length === 0) {
      const profiles = [DEFAULT_PROFILE];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      return profiles;
    }
    return parsed;
  } catch {
    return [DEFAULT_PROFILE];
  }
};

export const getProfile = (id: string): Profile | undefined => {
  const profiles = getProfiles();
  return profiles.find((p) => p.id === id);
};

export const createProfile = (profileData: Omit<Profile, "id" | "created">): Profile => {
  const profiles = getProfiles();
  const newProfile: Profile = {
    ...profileData,
    id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created: new Date().toISOString(),
  };
  profiles.push(newProfile);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return newProfile;
};

export const updateProfile = (profile: Profile): Profile => {
  const profiles = getProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index !== -1) {
    profiles[index] = { ...profile, lastUsed: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return profiles[index];
  }
  throw new Error(`Profile with id ${profile.id} not found.`);
};

export const deleteProfile = (id: string): void => {
  if (id === "default-profile-id") {
    throw new Error("No se puede eliminar el perfil por defecto.");
  }
  const profiles = getProfiles();
  const filtered = profiles.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  // If the deleted profile was active, reset active selection
  const activeId = getSelectedProfileId();
  if (activeId === id) {
    setSelectedProfileId("default-profile-id");
  }
};

export const cloneProfile = (id: string): Profile => {
  const original = getProfile(id);
  if (!original) throw new Error(`Profile ${id} not found.`);

  const profiles = getProfiles();
  const newProfile: Profile = {
    ...original,
    id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${original.name} (Copia)`,
    created: new Date().toISOString(),
    lastUsed: undefined,
  };

  profiles.push(newProfile);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return newProfile;
};

export const getSelectedProfileId = (): string => {
  const id = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (!id) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, "default-profile-id");
    return "default-profile-id";
  }
  return id;
};

export const setSelectedProfileId = (id: string): void => {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
};

export const getActiveProfile = (): Profile => {
  const activeId = getSelectedProfileId();
  const profile = getProfile(activeId);
  if (!profile) {
    // Fallback to first profile or default if not found
    const profiles = getProfiles();
    const fallback = profiles[0] || DEFAULT_PROFILE;
    setSelectedProfileId(fallback.id);
    return fallback;
  }
  return profile;
};

export const resolveProfileGameDir = (profile: Profile, homeDir: string): string => {
  const normalizedHome = homeDir.replace(/\\/g, "/");
  
  if (profile.gameDir && profile.gameDir.trim().length > 0) {
    return profile.gameDir.trim().replace(/\\/g, "/");
  }

  if (profile.isolateSaves) {
    return `${normalizedHome}/.crystaltides/profiles/${profile.id}`;
  }

  return `${normalizedHome}/.crystaltides`;
};
