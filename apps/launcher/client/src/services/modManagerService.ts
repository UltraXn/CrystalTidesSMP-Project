import { invoke } from "@tauri-apps/api/core";

/**
 * modManagerService — gestión de mods INSTALADOS (distinto de modService,
 * que se ocupa de la sincronización oficial y la descarga desde fuentes).
 *
 * Convenciones:
 * - Un mod activo es un archivo `.jar`; uno desactivado es `.jar.disabled`
 *   (los loaders de mods ignoran los archivos que no terminan en .jar).
 * - Los mods "oficiales" (gestionados por el servidor vía sync_mods) se
 *   identifican por el manifiesto `.crystaltides_sync.json` y no se pueden
 *   desactivar ni eliminar desde el launcher: el sync los restauraría.
 */

export interface InstalledMod {
  /** Nombre real del archivo en disco (incluye .disabled si aplica) */
  filename: string;
  sizeBytes: number;
  enabled: boolean;
  official: boolean;
}

/** Metadata opcional guardada al instalar desde Explorar (Modrinth/CurseForge) */
export interface ModRegistryEntry {
  title?: string;
  iconUrl?: string;
  source?: "modrinth" | "curseforge";
  projectId?: string;
}

interface RawModFile {
  filename: string;
  size_bytes: number;
  enabled: boolean;
  official: boolean;
}

const modsDirOf = (gameDir: string): string =>
  `${gameDir.replace(/\\/g, "/")}/mods`;

const registryPathOf = (gameDir: string): string =>
  `${gameDir.replace(/\\/g, "/")}/mods_registry.json`;

export const listInstalledMods = async (gameDir: string): Promise<InstalledMod[]> => {
  const json: string = await invoke("list_mods", { targetDir: modsDirOf(gameDir) });
  const raw: RawModFile[] = JSON.parse(json);
  return raw.map((r) => ({
    filename: r.filename,
    sizeBytes: r.size_bytes,
    enabled: r.enabled,
    official: r.official,
  }));
};

export const setModEnabled = async (
  gameDir: string,
  filename: string,
  enabled: boolean
): Promise<void> => {
  await invoke("set_mod_enabled", { targetDir: modsDirOf(gameDir), filename, enabled });
};

export const deleteInstalledMod = async (gameDir: string, filename: string): Promise<void> => {
  await invoke("delete_mod", { targetDir: modsDirOf(gameDir), filename });
};

/* ── Registro de metadata (iconos/títulos de mods instalados desde Explorar) ── */

export const getModsRegistry = async (
  gameDir: string
): Promise<Record<string, ModRegistryEntry>> => {
  try {
    const text: string = await invoke("read_text_file", { path: registryPathOf(gameDir) });
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export const registerInstalledMod = async (
  gameDir: string,
  filename: string,
  entry: ModRegistryEntry
): Promise<void> => {
  const registry = await getModsRegistry(gameDir);
  registry[filename] = entry;
  await invoke("write_text_file", {
    path: registryPathOf(gameDir),
    content: JSON.stringify(registry, null, 2),
  });
};

export const unregisterMod = async (gameDir: string, filename: string): Promise<void> => {
  const registry = await getModsRegistry(gameDir);
  // El archivo puede haberse renombrado (.disabled); limpiamos cualquier variante
  const base = filename.replace(/\.disabled$/, "");
  delete registry[filename];
  delete registry[base];
  delete registry[`${base}.disabled`];
  await invoke("write_text_file", {
    path: registryPathOf(gameDir),
    content: JSON.stringify(registry, null, 2),
  });
};

/* ── Helpers de presentación ── */

/** "jei-1.20.1-forge-15.3.0.4.jar.disabled" → "jei 1.20.1 forge 15.3.0.4" */
export const prettyModName = (filename: string): string =>
  filename
    .replace(/\.jar(\.disabled)?$/i, "")
    .replace(/[-_+]/g, " ")
    .trim();

export const formatModSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};
