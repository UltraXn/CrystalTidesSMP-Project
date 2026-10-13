import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  syncOfficialMods,
  fetchOfficialModsList,
  searchModrinth,
  installModFromModrinth,
  searchCurseForge,
  installModFromCurseForge,
  type ServerModItem,
  type SearchModResult,
  getActiveProfile,
  resolveProfileGameDir,
  fetchVanillaVersions,
  listInstalledMods,
  setModEnabled,
  deleteInstalledMod,
  getModsRegistry,
  registerInstalledMod,
  unregisterMod,
  prettyModName,
  type InstalledMod,
  type ModRegistryEntry,
} from '../mockLauncherState';
import { openPath } from '@tauri-apps/plugin-opener';
import type { ModSource } from './SearchFilterSidebar';

const invoke = async (_cmd: string, _args?: unknown): Promise<string | null> => null;

const CONSTANTS = {
  CF_API_KEY_STORAGE: 'crystaltides_cf_api_key_v1',
  DEFAULT_MC_VERSION: '1.21.1',
  DEFAULT_LOADER: 'neoforge',
  DEFAULT_SORT: 'relevance',
  SOURCE_MODRINTH: 'modrinth' as const,
  SOURCE_CURSEFORGE: 'curseforge' as const,
} as const;

const ERR_NO_GAME_DIR = 'No se pudo resolver el directorio de juego.';

const resolveGameDir = async (): Promise<string | null> => {
  const homeDir: string | null = await invoke('get_home_dir').catch(() => null);
  return resolveProfileGameDir(getActiveProfile(), homeDir ?? undefined);
};

function extractTotalCount(res: {
  hits: SearchModResult[];
  total?: number;
  total_hits?: number;
}): number {
  if (typeof res.total === 'number') return res.total;
  if (typeof res.total_hits === 'number') return res.total_hits;
  return res.hits.length;
}

export function useModManager() {
  const [activeTab, setActiveTab] = useState<'installed' | 'sync' | 'search'>('installed');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [modsList, setModsList] = useState<ServerModItem[]>([]);
  const [isLoadingMods, setIsLoadingMods] = useState(true);

  const [installedMods, setInstalledMods] = useState<InstalledMod[]>([]);
  const [modsRegistry, setModsRegistry] = useState<Record<string, ModRegistryEntry>>({});
  const [isLoadingInstalled, setIsLoadingInstalled] = useState(true);
  const [installedFilter, setInstalledFilter] = useState('');
  const [busyModFile, setBusyModFile] = useState<string | null>(null);

  const [selectedSource, setSelectedSource] = useState<ModSource>(CONSTANTS.SOURCE_MODRINTH);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchModResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installStatus, setInstallStatus] = useState<Record<string, string>>({});

  const [cfApiKeyInput, setCfApiKeyInput] = useState(
    () => localStorage.getItem(CONSTANTS.CF_API_KEY_STORAGE) ?? '',
  );
  const [hasCfApiKey, setHasCfApiKey] = useState(true);

  const [selectedVersion, setSelectedVersion] = useState<string>(CONSTANTS.DEFAULT_MC_VERSION);
  const [selectedLoader, setSelectedLoader] = useState<string>(CONSTANTS.DEFAULT_LOADER);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>(CONSTANTS.DEFAULT_SORT);
  const [versionsList, setVersionsList] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const activeProfile = useMemo(() => getActiveProfile(), []);

  const loadInstalled = useCallback(async () => {
    setIsLoadingInstalled(true);
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error(ERR_NO_GAME_DIR);
      const [mods, registry] = await Promise.all([listInstalledMods(dir), getModsRegistry(dir)]);
      setInstalledMods(mods);
      setModsRegistry(registry);
    } catch (e: unknown) {
      console.error('Error cargando mods instalados:', e);
      setInstalledMods([]);
    } finally {
      setIsLoadingInstalled(false);
    }
  }, []);

  const loadSearchFilters = useCallback(async () => {
    try {
      const versions = await fetchVanillaVersions();
      setVersionsList(versions);
      if (activeProfile) {
        setSelectedVersion(activeProfile.mcVersion || CONSTANTS.DEFAULT_MC_VERSION);
        setSelectedLoader(activeProfile.loaderType || CONSTANTS.DEFAULT_LOADER);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  }, [activeProfile]);

  const performSearch = useCallback(
    async (page: number, size: number) => {
      if (selectedSource === CONSTANTS.SOURCE_CURSEFORGE && !hasCfApiKey) {
        setSearchResults([]);
        setTotalResults(0);
        return;
      }

      setIsSearching(true);
      const currentOffset = (page - 1) * size;

      try {
        const res =
          selectedSource === CONSTANTS.SOURCE_CURSEFORGE
            ? await searchCurseForge(
                searchQuery,
                selectedVersion,
                selectedLoader,
                currentOffset,
                size,
                selectedCategory ?? undefined,
                selectedSort,
              )
            : await searchModrinth(
                searchQuery,
                selectedVersion,
                selectedLoader,
                currentOffset,
                size,
                selectedCategory ?? undefined,
                selectedSort,
              );

        setSearchResults(res.hits);
        setTotalResults(extractTotalCount(res));
      } catch (err: unknown) {
        console.error('Error buscando mods:', err);
        setSearchResults([]);
        setTotalResults(0);
      } finally {
        setIsSearching(false);
      }
    },
    [
      selectedSource,
      hasCfApiKey,
      searchQuery,
      selectedVersion,
      selectedLoader,
      selectedCategory,
      selectedSort,
    ],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      performSearch(newPage, pageSize);
    },
    [pageSize, performSearch],
  );

  const handleSearchSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch(1, pageSize);
  };

  const handleSaveCfApiKey = () => {
    const key = cfApiKeyInput.trim();
    if (key) {
      localStorage.setItem(CONSTANTS.CF_API_KEY_STORAGE, key);
      setHasCfApiKey(true);
      performSearch(1, pageSize);
    } else {
      localStorage.removeItem(CONSTANTS.CF_API_KEY_STORAGE);
      setHasCfApiKey(false);
    }
  };

  const handleSyncMods = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncError(null);
    setSyncProgress(0);

    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error('No se pudo resolver la carpeta del juego.');

      await syncOfficialMods(dir, (msg, pct) => {
        setSyncStatus(msg);
        setSyncProgress(pct);
      });

      setSyncStatus('¡Sincronización completada con éxito!');
      await loadInstalled();
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      setSyncError(`Error durante la sincronización: ${err}`);
      setSyncStatus(null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInstallMod = async (mod: SearchModResult) => {
    setInstallingId(mod.id);
    setInstallStatus((prev) => ({ ...prev, [mod.id]: 'Descargando...' }));

    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error(ERR_NO_GAME_DIR);

      const isCf = selectedSource === CONSTANTS.SOURCE_CURSEFORGE;
      const filename = isCf
        ? await installModFromCurseForge(mod.id, dir, selectedVersion, selectedLoader)
        : await installModFromModrinth(mod.id, dir, selectedVersion, selectedLoader);

      await registerInstalledMod(dir, filename, {
        title: mod.title,
        source: selectedSource,
        projectId: mod.id,
        iconUrl: mod.icon_url,
      });

      setInstallStatus((prev) => ({ ...prev, [mod.id]: '✅ Instalado' }));
      await loadInstalled();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setInstallStatus((prev) => ({ ...prev, [mod.id]: `❌ ${msg}` }));
    } finally {
      setInstallingId(null);
    }
  };

  const handleToggleMod = async (mod: InstalledMod) => {
    if (mod.official || busyModFile) return;
    setBusyModFile(mod.filename);
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error(ERR_NO_GAME_DIR);
      await setModEnabled(dir, mod.filename, !mod.enabled);
      await loadInstalled();
    } catch (e: unknown) {
      alert(`No se pudo cambiar el estado del mod: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusyModFile(null);
    }
  };

  const handleDeleteMod = async (mod: InstalledMod) => {
    if (mod.official || busyModFile) return;
    if (
      !window.confirm(
        `¿Eliminar "${prettyModName(mod.filename)}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    setBusyModFile(mod.filename);
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error(ERR_NO_GAME_DIR);
      await deleteInstalledMod(dir, mod.filename);
      await unregisterMod(dir, mod.filename);
      await loadInstalled();
    } catch (e: unknown) {
      alert(`No se pudo eliminar el mod: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusyModFile(null);
    }
  };

  const handleOpenModsFolder = useCallback(async () => {
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error(ERR_NO_GAME_DIR);
      const modsPath = `${dir.replaceAll('\\', '/')}/mods`;
      try {
        await openPath(modsPath);
      } catch {
        await invoke('open_folder', { path: modsPath });
      }
    } catch (e: unknown) {
      alert(`No se pudo abrir la carpeta: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  useEffect(() => {
    loadInstalled();
    loadSearchFilters();
    fetchOfficialModsList()
      .then(setModsList)
      .finally(() => setIsLoadingMods(false));
  }, [loadInstalled, loadSearchFilters]);

  useEffect(() => {
    if (selectedSource === CONSTANTS.SOURCE_CURSEFORGE) {
      setHasCfApiKey(Boolean(localStorage.getItem(CONSTANTS.CF_API_KEY_STORAGE)));
    } else {
      setHasCfApiKey(true);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (activeTab === 'search') {
      performSearch(1, pageSize);
    }
  }, [activeTab, performSearch, pageSize]);

  return {
    activeTab,
    setActiveTab,
    isSyncing,
    syncStatus,
    syncProgress,
    syncError,
    modsList,
    isLoadingMods,
    installedMods,
    modsRegistry,
    isLoadingInstalled,
    installedFilter,
    setInstalledFilter,
    busyModFile,
    selectedSource,
    setSelectedSource,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    installingId,
    installStatus,
    cfApiKeyInput,
    setCfApiKeyInput,
    hasCfApiKey,
    selectedVersion,
    setSelectedVersion,
    selectedLoader,
    setSelectedLoader,
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
    versionsList,
    totalResults,
    currentPage,
    pageSize,
    setPageSize,
    activeProfile,
    loadInstalled,
    handlePageChange,
    handleSearchSubmit,
    handleSaveCfApiKey,
    handleSyncMods,
    handleInstallMod,
    handleToggleMod,
    handleDeleteMod,
    handleOpenModsFolder,
  };
}
