import { invoke } from "@tauri-apps/api/core";
import { supabase } from "./supabaseClient";

const CF_API_KEY = "$2a$10$c3w/Utx0iBp.ELSa0hKO.O1b5wXQCeCuqA7kd2FexE3zXTKS1M2t2";

export const getCurseForgeKey = (): string => {
  return (
    CF_API_KEY ||
    import.meta.env.VITE_CURSEFORGE_API_KEY ||
    localStorage.getItem("crystaltides_curseforge_key:v1") ||
    localStorage.getItem("crystaltides_cf_api_key") ||
    ""
  );
};

export interface ModInfo {
  name: string;
  url: string;
  sha1: string;
}

export const syncOfficialMods = async (
  gameDir: string,
  onProgress?: (status: string, progress: number) => void
): Promise<void> => {
  try {
    onProgress?.("Obteniendo lista de mods...", 0.05);

    // 1. Fetch official mods list from Supabase
    const { data: remoteMods, error } = await supabase
      .from("official_mods")
      .select("name, download_url, sha1");

    if (error) throw error;
    if (!remoteMods) throw new Error("No se encontraron mods oficiales en el servidor.");

    // 2. Resolve virtual library directory path
    const homeDir: string | null = await invoke("get_home_dir");
    if (!homeDir) throw new Error("No se pudo obtener el directorio personal del usuario.");

    const virtualLibraryDir = `${homeDir.replace(/\\/g, "/")}/.crystaltides/virtual_library`;
    const targetModsDir = `${gameDir.replace(/\\/g, "/")}/mods`;

    // 3. Prepare downloads list
    onProgress?.("Analizando archivos locales...", 0.2);

    const modsToDownload: ModInfo[] = [];
    const syncList: { source: string; filename: string }[] = [];

    for (const mod of remoteMods) {
      const name = mod.name;
      const sha1 = mod.sha1.toLowerCase();
      const libraryFileName = `${sha1}.jar`;
      const virtualPath = `${virtualLibraryDir}/${libraryFileName}`;

      modsToDownload.push({
        name: libraryFileName,
        url: mod.download_url,
        sha1: sha1,
      });

      syncList.push({
        source: virtualPath,
        filename: name,
      });
    }

    // 4. Download mods to Virtual Library via Rust parallel downloader
    if (modsToDownload.length > 0) {
      onProgress?.("Descargando mods (Virtual Library)...", 0.3);
      
      await invoke("download_mods_parallel", {
        mods: modsToDownload,
        outputDir: virtualLibraryDir,
        maxConcurrent: 4,
      });
    }

    // 5. Create hardlinks using sync_mods native command
    onProgress?.("Sincronizando mods en el cliente...", 0.8);
    
    await invoke("sync_mods", {
      targetDir: targetModsDir,
      modListJson: JSON.stringify(syncList),
    });

    onProgress?.("Sincronización de mods completada.", 1.0);
  } catch (err) {
    console.error("Error in syncOfficialMods:", err);
    throw err;
  }
};

export interface ServerModItem {
  name: string;
  category?: string;
  description?: string;
  sha1: string;
}

export const fetchOfficialModsList = async (): Promise<ServerModItem[]> => {
  try {
    const { data, error } = await supabase
      .from("official_mods")
      .select("name, sha1");

    if (error || !data || data.length === 0) {
      // Fallback local list representing typical mods
      return [
        { name: "AmbientSounds_v6.0.2_mc1.20.1.jar", category: "Audio", description: "Sonidos ambientales realistas en 3D.", sha1: "a1b2c3d4" },
        { name: "Architectury-9.2.14-forge.jar", category: "Biblioteca", description: "API intermedia requerida por múltiples mods.", sha1: "e5f6g7h8" },
        { name: "BiomesOPlenty-1.20.1-18.0.0.598.jar", category: "Mundo", description: "Nuevos biomas terrestres llenos de vegetación y árboles únicos.", sha1: "i9j0k1l2" },
        { name: "Clumps-forge-1.20.1-12.0.0.4.jar", category: "Optimización", description: "Agrupa orbes de experiencia para evitar lag.", sha1: "m3n4o5p6" },
        { name: "FerriteCore-6.0.1-forge.jar", category: "Optimización", description: "Reduce drásticamente el consumo de memoria RAM de Minecraft.", sha1: "q7r8s9t0" },
        { name: "Jei-1.20.1-forge-15.3.0.4.jar", category: "Interfaz", description: "Visualizador completo de recetas y bloques en pantalla.", sha1: "u1v2w3x4" },
        { name: "JourneyMap-1.20.1-5.9.18-forge.jar", category: "Utilidad", description: "Minimapa y mapa interactivo a pantalla completa.", sha1: "y5z6a7b8" }
      ];
    }

    return data.map((mod: { name: string; sha1?: string }) => {
      // Clean up names for presentation
      let cat = "Utilidad";
      let desc = "Mod de soporte oficial de CrystalTides.";
      const lower = mod.name.toLowerCase();
      if (lower.includes("sound") || lower.includes("audio")) {
        cat = "Audio";
        desc = "Efectos sonoros inmersivos.";
      } else if (lower.includes("biom")) {
        cat = "Mundo";
        desc = "Expansión de biomas y generación de terreno.";
      } else if (lower.includes("optim") || lower.includes("core") || lower.includes("clump") || lower.includes("fps")) {
        cat = "Optimización";
        desc = "Mejora el rendimiento y reduce el uso de memoria.";
      } else if (lower.includes("jei") || lower.includes("recipe") || lower.includes("hud")) {
        cat = "Interfaz";
        desc = "Mejoras a la interfaz de usuario.";
      } else if (lower.includes("api") || lower.includes("lib") || lower.includes("architect")) {
        cat = "Biblioteca";
        desc = "Librería requerida para el funcionamiento de otros mods.";
      }

      return {
        name: mod.name,
        category: cat,
        description: desc,
        sha1: mod.sha1 || "",
      };
    });
  } catch (err) {
    console.warn("Error loading mods list, using fallback:", err);
    return [
      { name: "AmbientSounds_v6.0.2_mc1.20.1.jar", category: "Audio", description: "Sonidos ambientales realistas en 3D.", sha1: "a1b2c3d4" },
      { name: "Architectury-9.2.14-forge.jar", category: "Biblioteca", description: "API intermedia requerida por múltiples mods.", sha1: "e5f6g7h8" },
      { name: "BiomesOPlenty-1.20.1-18.0.0.598.jar", category: "Mundo", description: "Nuevos biomas terrestres llenos de vegetación y árboles únicos.", sha1: "i9j0k1l2" },
      { name: "Clumps-forge-1.20.1-12.0.0.4.jar", category: "Optimización", description: "Agrupa orbes de experiencia para evitar lag.", sha1: "m3n4o5p6" },
      { name: "FerriteCore-6.0.1-forge.jar", category: "Optimización", description: "Reduce drásticamente el consumo de memoria RAM de Minecraft.", sha1: "q7r8s9t0" },
      { name: "Jei-1.20.1-forge-15.3.0.4.jar", category: "Interfaz", description: "Visualizador completo de recetas y bloques en pantalla.", sha1: "u1v2w3x4" },
      { name: "JourneyMap-1.20.1-5.9.18-forge.jar", category: "Utilidad", description: "Minimapa y mapa interactivo a pantalla completa.", sha1: "y5z6a7b8" }
    ];
  }
};

export interface ModrinthSearchResult {
  id: string;
  title: string;
  description: string;
  downloads: number;
  icon_url?: string;
  author: string;
  categories: string[];
  date_modified?: string;
}

export interface SearchResponse {
  hits: ModrinthSearchResult[];
  total: number;
}

export const searchModrinth = async (
  query: string,
  loader: string,
  gameVersion: string,
  category?: string,
  sortBy: string = "relevance",
  offset: number = 0,
  limit: number = 20
): Promise<SearchResponse> => {
  try {
    const facetList: string[][] = [
      [`categories:${loader}`],
      [`versions:${gameVersion}`],
      ["client_side:required", "client_side:optional"]
    ];

    if (category) {
      facetList.push([`categories:${category}`]);
    }

    const facets = JSON.stringify(facetList);
    const index = sortBy === "relevance" ? "relevance" : sortBy === "downloads" ? "downloads" : sortBy === "newest" ? "newest" : "updated";

    const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&facets=${encodeURIComponent(facets)}&index=${index}&offset=${offset}&limit=${limit}`;
    const responseText = await invoke<string>("http_get", {
      url,
      headers: { "User-Agent": "UltraXn/CrystalTides-Launcher/1.0.0" }
    });

    const data = JSON.parse(responseText);
    return {
      hits: (data.hits || []).map((hit: { project_id: string; title: string; description?: string; downloads?: number; icon_url?: string; author?: string; categories?: string[]; date_modified?: string; date_created?: string }) => ({
        id: hit.project_id,
        title: hit.title,
        description: hit.description,
        downloads: hit.downloads,
        icon_url: hit.icon_url,
        author: hit.author,
        categories: hit.categories || [],
        date_modified: hit.date_modified || hit.date_created,
      })),
      total: data.total_hits || 0
    };
  } catch (err) {
    console.error("Error searching Modrinth:", err);
    return { hits: [], total: 0 };
  }
};

export const installModFromModrinth = async (
  gameDir: string,
  projectId: string,
  loader: string,
  gameVersion: string
): Promise<string> => {
  const url = `https://api.modrinth.com/v2/project/${projectId}/version?loaders=["${loader}"]&game_versions=["${gameVersion}"]`;
  const responseText = await invoke<string>("http_get", {
    url,
    headers: { "User-Agent": "UltraXn/CrystalTides-Launcher/1.0.0" }
  });

  const versions = JSON.parse(responseText);
  if (!versions || versions.length === 0) {
    throw new Error("No se encontraron versiones compatibles con este cargador y versión de Minecraft.");
  }

  const latestVersion = versions[0];
  const file = latestVersion.files.find((f: { primary?: boolean }) => f.primary) || latestVersion.files[0];

  const downloadUrl = file.url;
  const fileName = file.filename;
  const sha1 = file.hashes?.sha1 || "";

  const targetModsDir = `${gameDir.replace(/\\/g, "/")}/mods`;

  await invoke("download_mods_parallel", {
    mods: [{
      name: fileName,
      url: downloadUrl,
      sha1: sha1,
    }],
    outputDir: targetModsDir,
    maxConcurrent: 1,
  });

  return fileName;
};

export const searchCurseForge = async (
  query: string,
  loader: string,
  gameVersion: string,
  category?: string,
  sortBy: string = "relevance",
  offset: number = 0,
  limit: number = 20
): Promise<SearchResponse> => {
  try {
    const apiKey = getCurseForgeKey();
    if (!apiKey) {
      console.warn("CurseForge API Key is missing.");
      return { hits: [], total: 0 };
    }

    let modLoaderType = 0; // Any
    if (loader === "forge") modLoaderType = 1;
    if (loader === "fabric") modLoaderType = 4;
    if (loader === "quilt") modLoaderType = 5;
    if (loader === "neoforge") modLoaderType = 6;

    let sortField = 2; // Popularity / Downloads
    if (sortBy === "relevance") sortField = 1; // Featured
    if (sortBy === "newest") sortField = 4; // DateCreated
    if (sortBy === "updated") sortField = 3; // LastUpdated

    let url = `https://api.curseforge.com/v1/mods/search?gameId=432&classId=6&sortField=${sortField}&sortOrder=desc&pageSize=${limit}&index=${offset}`;
    if (query) url += `&searchFilter=${encodeURIComponent(query)}`;
    if (gameVersion) url += `&gameVersion=${gameVersion}`;
    if (modLoaderType !== 0) url += `&modLoaderType=${modLoaderType}`;

    if (category === "optimization") {
      url += "&categoryId=6814"; // Performance
    } else if (category === "worldgen") {
      url += "&categoryId=406"; // World Gen
    } else if (category === "adventure") {
      url += "&categoryId=422"; // Adventure and RPG
    } else if (category === "technology") {
      url += "&categoryId=412"; // Technology
    } else if (category === "decoration") {
      url += "&categoryId=424"; // Cosmetic
    } else if (category === "library") {
      url += "&categoryId=421"; // API and Library
    }

    const responseText = await invoke<string>("http_get", {
      url,
      headers: {
        "Accept": "application/json",
        "x-api-key": apiKey
      }
    });

    const data = JSON.parse(responseText);
    return {
      hits: (data.data || []).map((mod: { id: number; name: string; summary?: string; logo?: { url?: string }; authors?: { name: string }[]; categories?: { name: string }[]; downloadCount?: number; dateModified?: string; dateCreated?: string }) => ({
        id: mod.id.toString(),
        title: mod.name,
        description: mod.summary,
        icon_url: mod.logo?.url,
        author: mod.authors?.[0]?.name || "Unknown",
        categories: (mod.categories || []).map((c: { name: string }) => c.name),
        downloads: mod.downloadCount || 0,
        date_modified: mod.dateModified || mod.dateCreated,
      })),
      total: data.pagination?.totalCount || 0
    };
  } catch (err) {
    console.error("Error searching CurseForge:", err);
    return { hits: [], total: 0 };
  }
};

export const installModFromCurseForge = async (
  gameDir: string,
  projectId: string,
  loader: string,
  gameVersion: string
): Promise<string> => {
  const apiKey = getCurseForgeKey();
  if (!apiKey) {
    throw new Error("Clave API de CurseForge faltante. Ingrésela en los Ajustes o configure VITE_CURSEFORGE_API_KEY en su archivo .env.");
  }

  let modLoaderType = 0;
  if (loader === "forge") modLoaderType = 1;
  if (loader === "fabric") modLoaderType = 4;
  if (loader === "quilt") modLoaderType = 5;
  if (loader === "neoforge") modLoaderType = 6;

  const url = `https://api.curseforge.com/v1/mods/${projectId}/files?gameVersion=${gameVersion}&modLoaderType=${modLoaderType}`;
  const responseText = await invoke<string>("http_get", {
    url,
    headers: {
      "Accept": "application/json",
      "x-api-key": apiKey
    }
  });

  const data = JSON.parse(responseText);
  const files = data.data || [];
  if (files.length === 0) {
    throw new Error("No se encontraron archivos compatibles en CurseForge para esta versión.");
  }

  const file = files[0];
  const downloadUrl = file.downloadUrl;
  if (!downloadUrl) {
    throw new Error("Este archivo de CurseForge no permite descargas directas a través de la API.");
  }

  const fileName = file.fileName;
  const targetModsDir = `${gameDir.replace(/\\/g, "/")}/mods`;

  await invoke("download_mods_parallel", {
    mods: [{
      name: fileName,
      url: downloadUrl,
      sha1: "",
    }],
    outputDir: targetModsDir,
  });

  return fileName;
};

export const cleanModNameForSearch = (filename: string, title?: string): string => {
  let name = (title || filename)
    .replace(/\.jar(\.disabled)?$/i, "")
    .replace(/^[\d.]+\s*/, "")
    .replace(/v?\d+\.\d+(\.\d+)?/gi, "")
    .replace(/\b(neoforge|forge|fabric|quilt|beta|alpha|mc|snapshot|release)\b/gi, "")
    .replace(/[-_+.]+/g, " ")
    .trim();

  if (name.length < 2) {
    name = (title || filename).replace(/\.jar(\.disabled)?$/i, "").trim();
  }
  return name;
};

export interface ResolvedModInfo {
  title?: string;
  iconUrl?: string;
  source?: "modrinth" | "curseforge";
  projectId?: string;
}

interface ModrinthHit {
  title?: string;
  slug?: string;
  id?: string;
  project_id?: string;
  icon_url?: string;
}

interface CurseForgeHit {
  id?: number;
  name?: string;
  slug?: string;
  logo?: { url?: string };
}

const selectBestModrinthHit = (hits: ModrinthHit[], query: string) => {
  if (!hits || hits.length === 0) return null;
  const cleanQ = query.toLowerCase().replace(/[^a-z0-9]/g, "");

  const exact = hits.find((h: ModrinthHit) => {
    const cleanTitle = (h.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanSlug = (h.slug || h.id || h.project_id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanTitle === cleanQ || cleanSlug === cleanQ;
  });
  if (exact) return exact;

  const startsWith = hits.find((h: ModrinthHit) => {
    const cleanTitle = (h.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanTitle.startsWith(cleanQ);
  });
  if (startsWith) return startsWith;

  const matches = hits.filter((h: ModrinthHit) => {
    const cleanTitle = (h.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanTitle.includes(cleanQ);
  });

  if (matches.length > 0) {
    matches.sort((a: ModrinthHit, b: ModrinthHit) => Math.abs((a.title || "").length - query.length) - Math.abs((b.title || "").length - query.length));
    return matches[0];
  }

  return hits[0];
};

const selectBestCurseForgeHit = (hits: CurseForgeHit[], query: string) => {
  if (!hits || hits.length === 0) return null;
  const cleanQ = query.toLowerCase().replace(/[^a-z0-9]/g, "");

  const exact = hits.find((h: CurseForgeHit) => {
    const cleanTitle = (h.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanSlug = (h.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanTitle === cleanQ || cleanSlug === cleanQ;
  });
  if (exact) return exact;

  const startsWith = hits.find((h: CurseForgeHit) => {
    const cleanTitle = (h.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanTitle.startsWith(cleanQ);
  });
  if (startsWith) return startsWith;

  const matches = hits.filter((h: CurseForgeHit) => {
    const cleanTitle = (h.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanTitle.includes(cleanQ);
  });

  if (matches.length > 0) {
    matches.sort((a: CurseForgeHit, b: CurseForgeHit) => Math.abs((a.name || "").length - query.length) - Math.abs((b.name || "").length - query.length));
    return matches[0];
  }

  return hits[0];
};

export const fetchModDetailsFromAPIs = async (filename: string, title?: string): Promise<ResolvedModInfo | null> => {
  const query = cleanModNameForSearch(filename, title);
  if (!query || query.length < 2) return null;

  // 1. Modrinth search (fetch top 10 to select best match)
  try {
    const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=10`;
    const resText = await invoke<string>("http_get", {
      url,
      headers: { "User-Agent": "UltraXn/CrystalTides-Launcher/1.0.0" },
    });
    const data = JSON.parse(resText);
    const bestHit = selectBestModrinthHit(data?.hits || [], query);
    if (bestHit) {
      return {
        title: bestHit.title,
        iconUrl: bestHit.icon_url || undefined,
        source: "modrinth",
        projectId: bestHit.project_id || bestHit.id,
      };
    }
  } catch (e) {
    console.debug("Modrinth icon lookup failed:", e);
  }

  // 2. CurseForge fallback search (fetch top 10 to select best match)
  try {
    const apiKey = getCurseForgeKey();
    if (apiKey) {
      const url = `https://api.curseforge.com/v1/mods/search?gameId=432&classId=6&searchFilter=${encodeURIComponent(query)}&pageSize=10`;
      const resText = await invoke<string>("http_get", {
        url,
        headers: { Accept: "application/json", "x-api-key": apiKey },
      });
      const data = JSON.parse(resText);
      const bestHit = selectBestCurseForgeHit(data?.data || [], query);
      if (bestHit) {
        return {
          title: bestHit.name,
          iconUrl: bestHit.logo?.url || undefined,
          source: "curseforge",
          projectId: bestHit.id?.toString(),
        };
      }
    }
  } catch (e) {
    console.debug("CurseForge icon lookup failed:", e);
  }

  return null;
};

export const fetchModIconFromAPIs = async (filename: string, title?: string): Promise<string | null> => {
  const info = await fetchModDetailsFromAPIs(filename, title);
  return info?.iconUrl || null;
};
