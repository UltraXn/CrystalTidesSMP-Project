import { invoke } from "@tauri-apps/api/core";

export const fetchVanillaVersions = async (): Promise<string[]> => {
  try {
    const url = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
    const responseText: string = await invoke("http_get", { url, headers: {} });
    const data = JSON.parse(responseText);
    const versions: any[] = data.versions || [];
    return versions
      .filter((v) => v.type === "release")
      .map((v) => v.id);
  } catch (err) {
    console.error("Error fetching vanilla versions:", err);
    return ["1.21.1", "1.21", "1.20.4", "1.20.1", "1.19.4", "1.18.2", "1.16.5"];
  }
};

export const fetchFabricLoaderVersions = async (): Promise<string[]> => {
  try {
    const url = "https://meta.fabricmc.net/v2/versions/loader";
    const responseText: string = await invoke("http_get", { url, headers: {} });
    const loaders: any[] = JSON.parse(responseText);
    return loaders
      .filter((l) => l.stable === true)
      .map((l) => l.version);
  } catch (err) {
    console.error("Error fetching Fabric loaders:", err);
    return ["0.15.11", "0.15.10", "0.15.7"];
  }
};

export const fetchNeoForgeVersions = async (mcVersion: string): Promise<string[]> => {
  try {
    const url = "https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge";
    const responseText: string = await invoke("http_get", { url, headers: {} });
    const data = JSON.parse(responseText);
    const versions: string[] = data.versions || [];
    
    // Filter NeoForge versions matching this Minecraft version
    const filtered = versions.filter((v) => {
      const parts = v.split(".");
      if (parts.length < 2) return false;
      const major = parts[0];
      const minor = parts[1];
      
      let mappedMc = `1.${major}`;
      if (major === "20" || major === "21") {
        if (minor !== "0") {
          mappedMc = `1.${major}.${minor}`;
        }
      } else if (major === "47") {
        mappedMc = "1.20.1";
      }
      
      return mappedMc === mcVersion;
    });

    // Sort descending
    return filtered.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  } catch (err) {
    console.error("Error fetching NeoForge versions:", err);
    if (mcVersion === "1.20.1") return ["47.1.3", "47.1.0"];
    if (mcVersion.startsWith("1.21")) return ["21.1.65", "21.0.8"];
    return [];
  }
};

export const fetchForgeVersions = async (mcVersion: string): Promise<string[]> => {
  try {
    const url = `https://bmclapi2.bangbang93.com/forge/${mcVersion}`;
    const responseText: string = await invoke("http_get", { url, headers: {} });
    const forges: any[] = JSON.parse(responseText);
    const versions = forges.map((f) => f.version as string);
    // Sort descending
    return versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  } catch (err) {
    console.error(`Error fetching Forge versions for ${mcVersion}:`, err);
    if (mcVersion === "1.20.1") return ["47.2.0", "47.1.3"];
    return [];
  }
};
