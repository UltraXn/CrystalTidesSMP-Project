import React, { useState, useEffect } from "react";
import { CrystalCard } from "./CrystalCard";
import { CrystalPageHeader } from "./CrystalPageHeader";
import {
  syncOfficialMods,
  fetchOfficialModsList,
  searchModrinth,
  installModFromModrinth,
  searchCurseForge,
  installModFromCurseForge,
  type ServerModItem,
  type ModrinthSearchResult
} from "../services/modService";
import { getActiveProfile, resolveProfileGameDir } from "../services/profileService";
import { fetchVanillaVersions } from "../services/minecraftMetadataService";
import {
  listInstalledMods,
  setModEnabled,
  deleteInstalledMod,
  getModsRegistry,
  registerInstalledMod,
  unregisterMod,
  prettyModName,
  formatModSize,
  type InstalledMod,
  type ModRegistryEntry,
} from "../services/modManagerService";
import { invoke } from "@tauri-apps/api/core";
import { openPath } from "@tauri-apps/plugin-opener";

const CATEGORIES = [
  { label: "🚀 Optimización", value: "optimization" },
  { label: "🧭 Aventura", value: "adventure" },
  { label: "⚙️ Tecnología", value: "technology" },
  { label: "🎨 Decoración", value: "decoration" },
  { label: "🌳 Mundo", value: "worldgen" },
  { label: "📂 Librería", value: "library" }
];

export const ModManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"installed" | "sync" | "search">("installed");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [modsList, setModsList] = useState<ServerModItem[]>([]);
  const [isLoadingMods, setIsLoadingMods] = useState(true);

  // Installed mods (gestor)
  const [installedMods, setInstalledMods] = useState<InstalledMod[]>([]);
  const [modsRegistry, setModsRegistry] = useState<Record<string, ModRegistryEntry>>({});
  const [isLoadingInstalled, setIsLoadingInstalled] = useState(true);
  const [installedFilter, setInstalledFilter] = useState("");
  const [busyModFile, setBusyModFile] = useState<string | null>(null);

  // Modrinth / CurseForge Search states
  const [selectedSource, setSelectedSource] = useState<"modrinth" | "curseforge">("modrinth");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ModrinthSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installStatus, setInstallStatus] = useState<{ [id: string]: string }>({});
  
  // CurseForge API Key setup
  const [cfApiKeyInput, setCfApiKeyInput] = useState(localStorage.getItem("crystaltides_cf_api_key") || "");
  const [hasCfApiKey, setHasCfApiKey] = useState(true);

  // Search Filters
  const [selectedVersion, setSelectedVersion] = useState("1.21.1");
  const [selectedLoader, setSelectedLoader] = useState("neoforge");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState("relevance");
  const [versionsList, setVersionsList] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const activeProfile = getActiveProfile();

  useEffect(() => {
    loadData();
    loadSearchFilters();
    loadInstalled();
  }, []);

  // Whenever filters change, trigger a fresh search
  useEffect(() => {
    if (activeTab === "search") {
      triggerFreshSearch();
    }
  }, [selectedVersion, selectedLoader, selectedCategory, selectedSort, selectedSource, pageSize]);

  const loadData = async () => {
    setIsLoadingMods(true);
    try {
      const mods = await fetchOfficialModsList();
      setModsList(mods);
    } catch (e) {
      console.error(e);
    }
    setIsLoadingMods(false);
  };

  const loadSearchFilters = async () => {
    try {
      const versions = await fetchVanillaVersions();
      setVersionsList(versions);
      // Auto-set filters based on active profile
      if (activeProfile) {
        setSelectedVersion(activeProfile.mcVersion || "1.21.1");
        setSelectedLoader(activeProfile.loaderType || "neoforge");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveCfApiKey = () => {
    if (cfApiKeyInput.trim()) {
      localStorage.setItem("crystaltides_cf_api_key", cfApiKeyInput.trim());
      setHasCfApiKey(true);
      alert("Clave API de CurseForge guardada correctamente.");
      triggerFreshSearch();
    } else {
      localStorage.removeItem("crystaltides_cf_api_key");
      setHasCfApiKey(true);
      alert("Clave API de CurseForge de respaldo reactivada.");
    }
  };

  const triggerFreshSearch = async () => {
    setCurrentPage(1);
    await performSearch(1, pageSize);
  };

  const performSearch = async (page: number, size: number) => {
    if (selectedSource === "curseforge" && !hasCfApiKey) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    const currentOffset = (page - 1) * size;

    try {
      let res;
      if (selectedSource === "curseforge") {
        res = await searchCurseForge(
          searchQuery,
          selectedLoader,
          selectedVersion,
          selectedCategory || undefined,
          selectedSort,
          currentOffset,
          size
        );
      } else {
        res = await searchModrinth(
          searchQuery,
          selectedLoader,
          selectedVersion,
          selectedCategory || undefined,
          selectedSort,
          currentOffset,
          size
        );
      }
      
      setSearchResults(res.hits || []);
      setTotalResults(res.total || 0);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerFreshSearch();
  };

  const handlePageChange = async (newPage: number) => {
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    if (newPage < 1 || newPage > totalPages || isSearching) return;
    setCurrentPage(newPage);
    await performSearch(newPage, pageSize);
    
    // Scroll page content to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatus("Resolviendo directorios...");
    setSyncProgress(0);

    try {
      const homeDir: string | null = await invoke("get_home_dir");
      if (!homeDir) throw new Error("No se pudo obtener el directorio personal.");

      const resolvedGameDir = resolveProfileGameDir(activeProfile, homeDir);

      await syncOfficialMods(resolvedGameDir, (status, progress) => {
        setSyncStatus(status);
        setSyncProgress(progress);
      });
      setSyncStatus("✅ Sincronización completada.");
      setSyncProgress(1);
      setTimeout(() => {
        setSyncStatus(null);
        setSyncProgress(0);
      }, 4000);
    } catch (err: any) {
      setSyncError(err.message || String(err));
      setSyncStatus(null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInstallMod = async (mod: ModrinthSearchResult) => {
    setInstallingId(mod.id);
    setInstallStatus((prev) => ({ ...prev, [mod.id]: "Instalando..." }));

    try {
      const homeDir: string | null = await invoke("get_home_dir");
      if (!homeDir) throw new Error("No se pudo obtener el directorio personal.");

      const resolvedGameDir = resolveProfileGameDir(activeProfile, homeDir);

      let fileName = "";
      if (selectedSource === "curseforge") {
        fileName = await installModFromCurseForge(resolvedGameDir, mod.id, selectedLoader, selectedVersion);
      } else {
        fileName = await installModFromModrinth(resolvedGameDir, mod.id, selectedLoader, selectedVersion);
      }
      // Guardar metadata para mostrar icono/título en la pestaña Instalados
      await registerInstalledMod(resolvedGameDir, fileName, {
        title: mod.title,
        iconUrl: mod.icon_url,
        source: selectedSource,
        projectId: mod.id,
      });
      setInstallStatus((prev) => ({ ...prev, [mod.id]: `✅ ${fileName}` }));
    } catch (err: any) {
      console.error(err);
      setInstallStatus((prev) => ({ ...prev, [mod.id]: `❌ Falló` }));
    } finally {
      setInstallingId(null);
    }
  };

  /* ── Gestor de mods instalados ── */

  const resolveGameDir = async (): Promise<string | null> => {
    const homeDir: string | null = await invoke("get_home_dir");
    if (!homeDir) return null;
    return resolveProfileGameDir(getActiveProfile(), homeDir);
  };

  const loadInstalled = async () => {
    setIsLoadingInstalled(true);
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error("No se pudo resolver el directorio de juego.");
      const [mods, registry] = await Promise.all([
        listInstalledMods(dir),
        getModsRegistry(dir),
      ]);
      setInstalledMods(mods);
      setModsRegistry(registry);
    } catch (e) {
      console.error("Error cargando mods instalados:", e);
      setInstalledMods([]);
    }
    setIsLoadingInstalled(false);
  };

  const handleToggleMod = async (mod: InstalledMod) => {
    if (mod.official || busyModFile) return;
    setBusyModFile(mod.filename);
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error("No se pudo resolver el directorio de juego.");
      await setModEnabled(dir, mod.filename, !mod.enabled);
      await loadInstalled();
    } catch (e: any) {
      alert(`No se pudo cambiar el estado del mod: ${e.message || e}`);
    }
    setBusyModFile(null);
  };

  const handleDeleteMod = async (mod: InstalledMod) => {
    if (mod.official || busyModFile) return;
    if (!window.confirm(`¿Eliminar "${prettyModName(mod.filename)}"? Esta acción no se puede deshacer.`)) return;
    setBusyModFile(mod.filename);
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error("No se pudo resolver el directorio de juego.");
      await deleteInstalledMod(dir, mod.filename);
      await unregisterMod(dir, mod.filename);
      await loadInstalled();
    } catch (e: any) {
      alert(`No se pudo eliminar el mod: ${e.message || e}`);
    }
    setBusyModFile(null);
  };

  const handleOpenModsFolder = async () => {
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error("No se pudo resolver el directorio de juego.");
      const modsPath = `${dir.replace(/\\/g, "/")}/mods`;
      try {
        await openPath(modsPath);
      } catch {
        await invoke("open_folder", { path: modsPath });
      }
    } catch (e: any) {
      alert(`No se pudo abrir la carpeta: ${e.message || e}`);
    }
  };

  const formatDownloads = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
  };

  const formatRelativeDate = (iso?: string): string => {
    if (!iso) return "";
    try {
      const date = new Date(iso);
      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const getCategoryColor = (cat?: string): string => {
    switch (cat) {
      case "Audio": return "rgba(168, 85, 247, 0.15)";
      case "Mundo": return "rgba(34, 197, 94, 0.15)";
      case "Optimización": return "rgba(45, 212, 191, 0.15)";
      case "Interfaz": return "rgba(59, 130, 246, 0.15)";
      case "Biblioteca": return "rgba(234, 179, 8, 0.15)";
      default: return "rgba(255, 255, 255, 0.08)";
    };
  };

  const getCategoryTextColor = (cat?: string): string => {
    switch (cat) {
      case "Audio": return "#C084FC";
      case "Mundo": return "#4ADE80";
      case "Optimización": return "var(--accent)";
      case "Interfaz": return "#60A5FA";
      case "Biblioteca": return "#FACC15";
      default: return "rgba(255,255,255,0.6)";
    };
  };

  return (
    <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", overflowY: "auto" }}>
      <CrystalPageHeader
        eyebrow="Biblioteca"
        title="Gestión de Mods"
      />

      {/* Tabs Menu */}
      <div style={{
        display: "flex",
        gap: 8,
        borderBottom: "1px solid var(--border-low)",
        paddingBottom: 0,
        marginTop: 20,
        marginBottom: 20,
      }}>
        <button
          onClick={() => setActiveTab("installed")}
          className={`tab-btn ${activeTab === "installed" ? "active" : ""}`}
        >
          📂 Mods Instalados
        </button>
        <button
          onClick={() => setActiveTab("sync")}
          className={`tab-btn ${activeTab === "sync" ? "active" : ""}`}
        >
          📦 Sincronizar Oficiales
        </button>
        <button
          onClick={() => {
            setActiveTab("search");
            if (searchResults.length === 0) {
              triggerFreshSearch();
            }
          }}
          className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
        >
          🔍 Buscador de Mods
        </button>
      </div>

      {activeTab === "installed" ? (
        <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
          {/* Left Column: Installed Mods List */}
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Search Input and action buttons */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                borderRadius: 12,
                border: "1.5px solid var(--border-low)",
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                padding: "4px 14px",
                height: 44,
                boxSizing: "border-box",
                transition: "all 0.2s ease",
              }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.5)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45, 212, 191, 0.08)";
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-low)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 16, marginRight: 10 }}>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar en tus mods instalados..."
                  value={installedFilter}
                  onChange={(e) => setInstalledFilter(e.target.value)}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 13,
                    outline: "none",
                    padding: 0,
                    width: "100%",
                  }}
                />
              </div>

              <button
                onClick={handleOpenModsFolder}
                className="btn btn-secondary pressable"
                style={{ height: 44, display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}
              >
                📂 Carpeta Mods
              </button>

              <button
                onClick={loadInstalled}
                className="btn btn-secondary pressable"
                style={{ height: 44, width: 44, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Recargar"
              >
                🔄
              </button>
            </div>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", borderTop: "1.5px solid rgba(255,255,255,0.03)", marginTop: 8 }}>
              {isLoadingInstalled ? (
                <div style={{ padding: "80px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                  Cargando mods instalados...
                </div>
              ) : installedMods.length === 0 ? (
                <div style={{ padding: "80px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                  No hay mods instalados en este perfil. Usa el buscador o sincroniza los oficiales para añadir mods.
                </div>
              ) : (() => {
                const filtered = installedMods.filter(m => {
                  const reg = modsRegistry[m.filename] || modsRegistry[m.filename.replace(/\.disabled$/, "")] || {};
                  const title = reg.title || prettyModName(m.filename);
                  return title.toLowerCase().includes(installedFilter.toLowerCase()) ||
                    m.filename.toLowerCase().includes(installedFilter.toLowerCase());
                });

                if (filtered.length === 0) {
                  return (
                    <div style={{ padding: "80px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                      No se encontraron mods que coincidan con la búsqueda.
                    </div>
                  );
                }

                return filtered.map((mod) => {
                  const reg = modsRegistry[mod.filename] || modsRegistry[mod.filename.replace(/\.disabled$/, "")] || {};
                  const title = reg.title || prettyModName(mod.filename);
                  const isBusy = busyModFile === mod.filename;

                  return (
                    <div key={mod.filename} className="reveal-up" style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "14px 8px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      textAlign: "left",
                      gap: 16,
                      opacity: mod.enabled ? 1 : 0.5,
                      transition: "opacity 0.2s ease",
                    }}>
                      {/* Icon */}
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        overflow: "hidden",
                        backgroundColor: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-low)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {reg.iconUrl ? (
                          <img src={reg.iconUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 20 }}>🧩</span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: "bold", color: "#FFFFFF" }}>{title}</span>
                          {mod.official && (
                            <span style={{
                              fontSize: 10,
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor: "rgba(45, 212, 191, 0.1)",
                              color: "var(--accent)",
                              fontWeight: "bold",
                            }}>
                              Oficial
                            </span>
                          )}
                          {reg.source && (
                            <span style={{
                              fontSize: 10,
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor: reg.source === "curseforge" ? "rgba(249, 115, 22, 0.1)" : "rgba(34, 197, 94, 0.1)",
                              color: reg.source === "curseforge" ? "#F97316" : "#22C55E",
                              textTransform: "capitalize",
                              fontWeight: "bold",
                            }}>
                              {reg.source}
                            </span>
                          )}
                          {!mod.official && !reg.source && (
                            <span style={{
                              fontSize: 10,
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              color: "rgba(255, 255, 255, 0.5)",
                              fontWeight: "bold",
                            }}>
                              Manual
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.35)", marginTop: 2, display: "flex", gap: 8 }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{mod.filename}</span>
                          <span>•</span>
                          <span>{formatModSize(mod.sizeBytes)}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {/* Switch */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: mod.enabled ? "var(--accent)" : "rgba(255,255,255,0.3)" }}>
                            {mod.enabled ? "Activo" : "Inactivo"}
                          </span>
                          <input
                            type="checkbox"
                            checked={mod.enabled}
                            disabled={mod.official || isBusy}
                            onChange={() => handleToggleMod(mod)}
                            style={{
                              width: 32,
                              height: 18,
                              appearance: "none",
                              backgroundColor: mod.enabled ? "rgba(45, 212, 191, 0.3)" : "rgba(255, 255, 255, 0.1)",
                              border: `1px solid ${mod.enabled ? "var(--accent)" : "rgba(255, 255, 255, 0.2)"}`,
                              borderRadius: 9,
                              position: "relative",
                              cursor: mod.official ? "not-allowed" : "pointer",
                              outline: "none",
                              transition: "all 0.2s ease",
                            }}
                            className="mod-toggle-switch"
                          />
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteMod(mod)}
                          disabled={mod.official || isBusy}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: mod.official ? "not-allowed" : "pointer",
                            opacity: mod.official ? 0.2 : 0.6,
                            padding: 6,
                            color: "var(--danger)",
                            fontSize: 16,
                            transition: "all 0.2s ease",
                          }}
                          className={mod.official ? "" : "pressable"}
                          title={mod.official ? "Los mods oficiales no se pueden eliminar" : "Eliminar mod"}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Right Column: Sidebar Stats & Help */}
          <div style={{ flex: 0.9, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Profile Info card */}
            <div style={{
              textAlign: "left",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-low)",
              borderRadius: 12,
              padding: 20,
            }}>
              <span className="section-label">Perfil Activo</span>
              <h3 style={{ margin: "4px 0 0 0", color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>
                {activeProfile ? activeProfile.name : "Ninguno"}
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Versión MC:</span>
                  <span style={{ color: "#FFFFFF", fontWeight: "bold" }}>{activeProfile ? activeProfile.mcVersion : "-"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Cargador:</span>
                  <span style={{ color: "#FFFFFF", fontWeight: "bold", textTransform: "capitalize" }}>{activeProfile ? activeProfile.loaderType : "-"}</span>
                </div>
                <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Mods Instalados:</span>
                  <span style={{ color: "var(--accent)", fontWeight: "bold" }}>{installedMods.length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Activos:</span>
                  <span style={{ color: "var(--success)", fontWeight: "bold" }}>{installedMods.filter(m => m.enabled).length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Inactivos:</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: "bold" }}>{installedMods.filter(m => !m.enabled).length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Oficiales:</span>
                  <span style={{ color: "#38BDF8", fontWeight: "bold" }}>{installedMods.filter(m => m.official).length}</span>
                </div>
              </div>
            </div>

            {/* Help / Tips */}
            <div style={{
              textAlign: "left",
              backgroundColor: "rgba(45, 212, 191, 0.03)",
              border: "1px solid rgba(45, 212, 191, 0.15)",
              borderRadius: 12,
              padding: 20,
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
            }}>
              <span style={{ display: "block", color: "var(--accent)", fontWeight: "bold", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                💡 Consejos de Uso
              </span>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li style={{ marginBottom: 6 }}>Puedes activar o desactivar mods individuales para hacer pruebas de rendimiento o compatibilidad sin borrarlos.</li>
                <li style={{ marginBottom: 6 }}>Los mods oficiales del servidor están bloqueados para garantizar que puedas conectarte al SMP sin problemas.</li>
                <li>Si descargas un mod manualmente (`.jar`), puedes colocarlo directamente haciendo click en **Carpeta Mods**.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : activeTab === "sync" ? (
        <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
          {/* Left Column: Sync Controls + Info */}
          <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: 20 }}>
            <CrystalCard style={{ padding: 24 }} enableHoverEffect={false}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>📦</span>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: "bold", color: "#FFFFFF" }}>
                      Sincronización de Mods Oficiales
                    </h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                      Sincroniza los mods requeridos por CrystalTides SMP en el perfil activo: <strong>{activeProfile.name}</strong>.
                      Usa enlaces físicos (hardlinks) para evitar duplicar archivos y ahorrar espacio.
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {syncStatus && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--accent)" }}>
                      <span>{syncStatus}</span>
                      <span>{Math.round(syncProgress * 100)}%</span>
                    </div>
                    <div style={{ width: "100%", height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div style={{
                        width: `${syncProgress * 100}%`,
                        height: "100%",
                        backgroundColor: "var(--accent)",
                        boxShadow: "0 0 8px var(--accent)",
                        transition: "width 200ms ease",
                      }} />
                    </div>
                  </div>
                )}

                {syncError && (
                  <div style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid var(--danger)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: "#FFBABA",
                    fontSize: 13,
                    textAlign: "left",
                  }}>
                    ⚠️ {syncError}
                  </div>
                )}

                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="btn btn-primary btn-md pressable"
                  style={{ width: "100%" }}
                >
                  {isSyncing ? "Sincronizando..." : "Sincronizar Mods"}
                </button>
              </div>
            </CrystalCard>

            <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: "bold", color: "#FFFFFF" }}>
                  ¿Cómo funciona la biblioteca virtual?
                </h4>
                <ul style={{ margin: 0, padding: "0 0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
                  <li>Los archivos jar se bajan directamente desde el CDN seguro del servidor.</li>
                  <li>Se almacenan de forma indexada en <code>~/.crystaltides/virtual_library</code>.</li>
                  <li>Se vinculan a la carpeta del juego sin crear copias repetidas en tu disco duro.</li>
                  <li>Se verifica el hash SHA-1 de cada mod en cada inicio para autodetectar actualizaciones.</li>
                </ul>
              </div>
            </CrystalCard>
          </div>

          {/* Right Column: List of Server Mods */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <CrystalCard style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", minHeight: 400 }} enableHoverEffect={false}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: "bold", color: "#FFFFFF", textAlign: "left" }}>
                📚 Mods del Servidor ({modsList.length})
              </h3>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4, maxHeight: 340 }}>
                {isLoadingMods ? (
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, padding: "40px 0" }}>Cargando lista de mods...</div>
                ) : modsList.length === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, padding: "40px 0" }}>No hay mods registrados.</div>
                ) : (
                  modsList.map((mod) => (
                    <div key={mod.sha1} style={{
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid var(--border-low)",
                      backgroundColor: "rgba(255, 255, 255, 0.01)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      textAlign: "left",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#FFFFFF",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "70%",
                        }} title={mod.name}>
                          {mod.name.replace(/\.jar$/, "")}
                        </span>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          backgroundColor: getCategoryColor(mod.category),
                          color: getCategoryTextColor(mod.category),
                          fontSize: 10,
                          fontWeight: 600,
                        }}>
                          {mod.category || "General"}
                        </span>
                      </div>
                      {mod.description && (
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
                          {mod.description}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CrystalCard>
          </div>
        </div>
      ) : (
        /* Redesigned Search Tab with advanced modern inputs and layout */
        <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
          
          {/* Left Column: Search Results */}
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Search Input and Sort control */}
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                borderRadius: 12,
                border: "1.5px solid var(--border-low)",
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                padding: "4px 14px",
                height: 44,
                boxSizing: "border-box",
                transition: "all 0.2s ease",
              }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.5)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45, 212, 191, 0.08)";
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-low)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 16, marginRight: 10 }}>🔍</span>
                <input
                  type="text"
                  placeholder={`Buscar mods en ${selectedSource === "curseforge" ? "CurseForge" : "Modrinth"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 13,
                    outline: "none",
                    padding: 0,
                    width: "100%",
                  }}
                />
              </div>
              
              {/* Custom Sort selector */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                border: "1.5px solid var(--border-low)",
                borderRadius: 12,
                padding: "0 14px",
                height: 44,
                boxSizing: "border-box",
              }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>Ordenar por:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  style={{
                    width: "auto",
                    background: "none",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 13,
                    outline: "none",
                    cursor: "pointer",
                    padding: "0 24px 0 0",
                    height: "100%",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundPosition: "right 0 center",
                  }}
                >
                  <option value="relevance" style={{ backgroundColor: "#0b0d14" }}>Popularidad</option>
                  <option value="downloads" style={{ backgroundColor: "#0b0d14" }}>Descargas</option>
                  <option value="newest" style={{ backgroundColor: "#0b0d14" }}>Más nuevos</option>
                  <option value="updated" style={{ backgroundColor: "#0b0d14" }}>Actualizados</option>
                </select>
              </div>

              {/* Custom Page Size selector */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                border: "1.5px solid var(--border-low)",
                borderRadius: 12,
                padding: "0 14px",
                height: 44,
                boxSizing: "border-box",
              }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>Cantidad:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{
                    width: "auto",
                    background: "none",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 13,
                    outline: "none",
                    cursor: "pointer",
                    padding: "0 24px 0 0",
                    height: "100%",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundPosition: "right 0 center",
                  }}
                >
                  <option value={10} style={{ backgroundColor: "#0b0d14" }}>10</option>
                  <option value={15} style={{ backgroundColor: "#0b0d14" }}>15</option>
                  <option value={25} style={{ backgroundColor: "#0b0d14" }}>25</option>
                  <option value={50} style={{ backgroundColor: "#0b0d14" }}>50</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary pressable"
                style={{ height: 44, padding: "0 24px" }}
              >
                {isSearching && searchResults.length === 0 ? "Buscando..." : "Buscar"}
              </button>
            </form>

            {/* CurseForge API Key configuration warning banner */}
            {selectedSource === "curseforge" && !hasCfApiKey && (
              <CrystalCard style={{ padding: "16px 20px", border: "1px solid var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.05)", textAlign: "left" }} enableHoverEffect={false}>
                <h4 style={{ margin: 0, color: "#FF8A8A", fontSize: 14, fontWeight: "bold" }}>⚠️ Requiere CurseForge API Key</h4>
                <p style={{ margin: "4px 0 12px 0", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                  Para buscar y descargar mods desde CurseForge, ingresa tu clave API personal de CurseForge a continuación. La clave se guardará de forma segura en tu navegador.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="password"
                    placeholder="Clave API (x-api-key)..."
                    value={cfApiKeyInput}
                    onChange={(e) => setCfApiKeyInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.15)",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "#FFFFFF",
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={saveCfApiKey}
                    className="btn btn-primary pressable"
                    style={{
                      borderRadius: 8,
                      padding: "0 20px",
                      fontSize: 12,
                      height: 38,
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </CrystalCard>
            )}

            {/* Results list */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1.5px solid rgba(255,255,255,0.03)",
              marginTop: 8,
            }}>
              {searchResults.length === 0 && !isSearching ? (
                <div style={{ padding: "80px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                  {selectedSource === "curseforge" && !hasCfApiKey
                    ? "Ingrese su clave API de CurseForge arriba para habilitar la búsqueda."
                    : "No se encontraron resultados. Intenta ajustar los filtros de búsqueda o ingresa otras palabras clave."}
                </div>
              ) : (
                <>
                  {searchResults.map((result) => {
                    const status = installStatus[result.id];
                    const isInstalling = installingId === result.id;
                    const cats = (result.categories || [])
                      .filter((c) => c !== selectedLoader && c !== "minecraft")
                      .slice(0, 2);

                    return (
                      <div key={result.id} className="reveal-up" style={{
                        animationDelay: `${Math.min(searchResults.indexOf(result) * 30, 300)}ms`,
                        display: "flex",
                        alignItems: "center",
                        padding: "16px 8px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        textAlign: "left",
                        gap: 16,
                      }}>
                        {/* Mod Icon */}
                        <div style={{
                          width: 52,
                          height: 52,
                          borderRadius: 12,
                          overflow: "hidden",
                          backgroundColor: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--border-low)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {result.icon_url ? (
                            <img src={result.icon_url} alt={result.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: 22 }}>🧩</span>
                          )}
                        </div>

                        {/* Mod details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 15, fontWeight: "bold", color: "#FFFFFF" }}>{result.title}</span>
                            <span style={{ fontSize: 12, color: "var(--accent)" }}>✓</span>
                          </div>
                          
                          <p style={{
                            margin: "4px 0 6px 0",
                            fontSize: 12,
                            color: "rgba(255,255,255,0.55)",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}>
                            {result.description}
                          </p>

                          {/* Footer row */}
                          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 11 }}>👤</span>
                              <span>{result.author}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 11 }}>⚙️</span>
                              <span style={{ textTransform: "capitalize" }}>{selectedLoader}</span>
                            </div>
                            {cats.length > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span>📁</span>
                                <span style={{ textTransform: "capitalize" }}>{cats[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right columns: downloads count & Action buttons */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0, width: 220 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                            <span>⬇️ {formatDownloads(result.downloads)}</span>
                            <span>•</span>
                            <span>Act: {formatRelativeDate(result.date_modified)}</span>
                          </div>

                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {status && (
                              <span style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: status.includes("❌") ? "#FF8A8A" : status.includes("✅") ? "var(--accent)" : "#FFA726",
                                maxWidth: 100,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }} title={status}>
                                {status}
                              </span>
                            )}
                            <button
                              onClick={() => handleInstallMod(result)}
                              disabled={isInstalling}
                              className={`btn ${status ? "btn-secondary" : "btn-primary"} btn-sm pressable`}
                            >
                              {isInstalling ? "Bajando..." : status ? "Reinstalar" : "Instalar"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Premium Pagination Bar */}
                  {totalResults > 0 && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "20px 0",
                      borderTop: "1.5px solid rgba(255, 255, 255, 0.03)",
                      marginTop: 16,
                    }}>
                      <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.45)" }}>
                        Página {currentPage} de {Math.max(1, Math.ceil(totalResults / pageSize))} ({totalResults} resultados)
                      </span>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {/* First Page Button */}
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1 || isSearching}
                          className="pressable"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.06)",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            color: currentPage === 1 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                            fontSize: 13,
                          }}
                          title="Primera página"
                        >
                          «
                        </button>

                        {/* Prev Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || isSearching}
                          className="pressable"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.06)",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            color: currentPage === 1 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                          }}
                          title="Página anterior"
                        >
                          ‹
                        </button>
                        
                        {/* Page Numbers wrapper without fixed-width (the sliding window has constant width itself) */}
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}>
                          {(() => {
                            const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
                            const maxButtons = 5;
                            let startPage = Math.max(1, currentPage - 2);
                            let endPage = Math.min(totalPages, startPage + maxButtons - 1);
                            
                            if (endPage - startPage < maxButtons - 1) {
                              startPage = Math.max(1, endPage - (maxButtons - 1));
                            }
                            
                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(i);
                            }

                            return pages.map((p) => {
                              const isCurrent = p === currentPage;
                              return (
                                <button
                                  key={`page-${p}`}
                                  onClick={() => handlePageChange(p)}
                                  disabled={isSearching}
                                  className="pressable"
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    border: isCurrent ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.06)",
                                    backgroundColor: isCurrent ? "rgba(45, 212, 191, 0.12)" : "rgba(255,255,255,0.02)",
                                    color: isCurrent ? "var(--accent)" : "rgba(255,255,255,0.75)",
                                    fontSize: 13,
                                    fontWeight: isCurrent ? "bold" : "normal",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  {p}
                                </button>
                              );
                            });
                          })()}
                        </div>
                        
                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.max(1, Math.ceil(totalResults / pageSize)) || isSearching}
                          className="pressable"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.06)",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            color: currentPage === Math.max(1, Math.ceil(totalResults / pageSize)) ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)",
                            cursor: currentPage === Math.max(1, Math.ceil(totalResults / pageSize)) ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                          }}
                          title="Página siguiente"
                        >
                          ›
                        </button>

                        {/* Last Page Button */}
                        <button
                          onClick={() => handlePageChange(Math.max(1, Math.ceil(totalResults / pageSize)))}
                          disabled={currentPage === Math.max(1, Math.ceil(totalResults / pageSize)) || isSearching}
                          className="pressable"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.06)",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            color: currentPage === Math.max(1, Math.ceil(totalResults / pageSize)) ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)",
                            cursor: currentPage === Math.max(1, Math.ceil(totalResults / pageSize)) ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                            fontSize: 13,
                          }}
                          title="Última página"
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar Filters */}
          <div style={{ flex: 0.9, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Source Switcher */}
            <div style={{ textAlign: "left" }}>
              <span className="section-label">Plataforma de Búsqueda</span>
              <div style={{
                display: "flex",
                gap: 6,
                marginTop: 6,
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                padding: 4,
                borderRadius: 12,
                border: "1.5px solid var(--border-low)"
              }}>
                <button
                  onClick={() => setSelectedSource("modrinth")}
                  className={`chip pressable ${selectedSource === "modrinth" ? "active" : ""}`}
                  style={{ flex: 1, borderRadius: 8, justifyContent: "center", gap: 8 }}
                >
                  <div style={{
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    backgroundColor: selectedSource === "modrinth" ? "var(--accent)" : "rgba(255,255,255,0.5)",
                    maskImage: "url(/icons/modrinth.svg)",
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskImage: "url(/icons/modrinth.svg)",
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    transition: "background-color 0.2s ease",
                  }} />
                  Modrinth
                </button>
                <button
                  onClick={() => setSelectedSource("curseforge")}
                  className={`chip pressable ${selectedSource === "curseforge" ? "active" : ""}`}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    justifyContent: "center",
                    gap: 8,
                    ...(selectedSource === "curseforge" ? {
                      backgroundColor: "rgba(249, 115, 22, 0.12)",
                      color: "#F97316",
                      borderColor: "rgba(249, 115, 22, 0.35)",
                    } : {}),
                  }}
                >
                  <div style={{
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    backgroundColor: selectedSource === "curseforge" ? "#F97316" : "rgba(255,255,255,0.5)",
                    maskImage: "url(/icons/curseforge.svg)",
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskImage: "url(/icons/curseforge.svg)",
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    transition: "background-color 0.2s ease",
                  }} />
                  CurseForge
                </button>
              </div>
            </div>

            {/* Version Select */}
            <div style={{ textAlign: "left" }}>
              <span className="section-label">Versión de Minecraft</span>
              <div style={{ marginTop: 6 }}>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                >
                  {versionsList.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loader Select */}
            <div style={{ textAlign: "left" }}>
              <span className="section-label">Cargador (Mod Loader)</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {["fabric", "forge", "neoforge", "quilt"].map((loader) => (
                  <button
                    key={loader}
                    onClick={() => setSelectedLoader(loader)}
                    className={`chip pressable ${selectedLoader === loader ? "active" : ""}`}
                  >
                    {loader === "neoforge" ? "NeoForge" : loader.charAt(0).toUpperCase() + loader.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Select */}
            <div style={{ textAlign: "left" }}>
              <span className="section-label">Categorías de Mods</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`chip pressable ${selectedCategory === null ? "active-white" : ""}`}
                >
                  🌟 Todos
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`chip pressable ${selectedCategory === cat.value ? "active-white" : ""}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Destination info card */}
            <div style={{
              textAlign: "left",
              backgroundColor: "rgba(45, 212, 191, 0.03)",
              border: "1px solid rgba(45, 212, 191, 0.15)",
              borderRadius: 10,
              padding: 14,
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.5,
              marginTop: 10,
            }}>
              <span style={{ display: "block", color: "var(--accent)", fontWeight: "bold", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                ⚙️ Destino de Instalación
              </span>
              Los mods descargados se guardarán en la carpeta de juego de tu perfil actual:
              <strong style={{ display: "block", color: "#FFFFFF", marginTop: 4 }}>
                "{activeProfile.name}" ({activeProfile.mcVersion})
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
