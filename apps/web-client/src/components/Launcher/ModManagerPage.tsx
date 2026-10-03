import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CrystalCard } from './CrystalCard';
import { CrystalPageHeader } from './CrystalPageHeader';
import {
  syncOfficialMods,
  fetchOfficialModsList,
  searchModrinth,
  installModFromModrinth,
  searchCurseForge,
  installModFromCurseForge,
  type ServerModItem,
  type SearchModResult,
  MOCK_SEARCH_MODS,
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
  formatModSize,
  type InstalledMod,
  type ModRegistryEntry,
} from './mockLauncherState';
import { openPath } from '@tauri-apps/plugin-opener';

const invoke = async (_cmd: string, _args?: unknown): Promise<string | null> => null;

const CONSTANTS = {
  CF_API_KEY_STORAGE: 'crystaltides_cf_api_key_v1',
  DEFAULT_MC_VERSION: '1.21.1',
  DEFAULT_LOADER: 'neoforge',
  DEFAULT_SORT: 'relevance',
  SOURCE_MODRINTH: 'modrinth' as const,
  SOURCE_CURSEFORGE: 'curseforge' as const,
  INPUT_TRANSITION:
    'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
  MUTED_WHITE_COLOR: 'rgba(255, 255, 255, 0.4)',
  DARK_BG_COLOR: 'rgba(0, 0, 0, 0.25)',
  BORDER_LOW: '1px solid var(--border-low)',
} as const;

type ModSource = typeof CONSTANTS.SOURCE_MODRINTH | typeof CONSTANTS.SOURCE_CURSEFORGE;

const CATEGORIES = [
  { label: '🚀 Optimización', value: 'optimization' },
  { label: '🧭 Aventura', value: 'adventure' },
  { label: '⚙️ Tecnología', value: 'technology' },
  { label: '🎨 Decoración', value: 'decoration' },
  { label: '🌳 Mundo', value: 'worldgen' },
  { label: '📂 Librería', value: 'library' },
];

const KNOWN_MOD_ICONS: ReadonlyArray<{ pattern: string; url: string }> = [
  {
    pattern: 'sodium',
    url: 'https://raw.githubusercontent.com/CaffeineMC/sodium-fabric/1.20.x/dev/logo.png',
  },
  { pattern: 'iris', url: 'https://raw.githubusercontent.com/IrisShaders/Iris/main/logo.png' },
  {
    pattern: 'voice',
    url: 'https://raw.githubusercontent.com/henkelmax/simple-voice-chat/main/logo.png',
  },
  {
    pattern: 'ferrite',
    url: 'https://raw.githubusercontent.com/malte0811/FerriteCore/1.20/logo.png',
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Audio: { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC' },
  Mundo: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ADE80' },
  Optimización: { bg: 'rgba(45, 212, 191, 0.15)', text: 'var(--accent)' },
  Interfaz: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA' },
  Biblioteca: { bg: 'rgba(234, 179, 8, 0.15)', text: '#FACC15' },
};

const resolveGameDir = async (): Promise<string | null> => {
  const homeDir: string | null = await invoke('get_home_dir').catch(() => null);
  return resolveProfileGameDir(getActiveProfile(), homeDir || undefined);
};

const formatDownloads = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
};

const formatRelativeDate = (iso?: string): string => {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    return date.toLocaleDateString();
  } catch {
    return '';
  }
};

const getCategoryColor = (cat?: string): string => {
  if (!cat || !CATEGORY_COLORS[cat]) return 'rgba(255, 255, 255, 0.08)';
  return CATEGORY_COLORS[cat].bg;
};

const getCategoryTextColor = (cat?: string): string => {
  if (!cat || !CATEGORY_COLORS[cat]) return 'rgba(255, 255, 255, 0.6)';
  return CATEGORY_COLORS[cat].text;
};

const getModInitials = (title: string): string => {
  return (
    title
      .replace(/^[0-9.]+\s*/, '')
      .replace(/\.jar(\.disabled)?$/i, '')
      .split(/[\s-_+.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'MD'
  );
};

const resolveFallbackIcon = (filename: string, title: string): string | null => {
  const f = filename.toLowerCase();
  const t = title.toLowerCase();
  for (const item of KNOWN_MOD_ICONS) {
    if (f.includes(item.pattern) || t.includes(item.pattern)) {
      return item.url;
    }
  }
  return null;
};

// ============================================================================
// SUBCOMPONENT: InstalledModCard
// ============================================================================

interface InstalledModCardProps {
  mod: InstalledMod;
  registry?: ModRegistryEntry;
  isBusy: boolean;
  onToggle: (mod: InstalledMod) => void;
  onDelete: (mod: InstalledMod) => void;
}

const InstalledModCard: React.FC<Readonly<InstalledModCardProps>> = ({
  mod,
  registry,
  isBusy,
  onToggle,
  onDelete,
}) => {
  const title = registry?.title || prettyModName(mod.filename);
  const initials = getModInitials(title);

  const catalogMatch = MOCK_SEARCH_MODS.find((m: SearchModResult) => {
    const f = mod.filename.toLowerCase();
    const t = title.toLowerCase();
    const id = m.id.toLowerCase();
    const mTitle = m.title.toLowerCase();
    return f.includes(id) || t.includes(id) || mTitle.includes(t) || t.includes(mTitle);
  });

  const resolvedIconUrl =
    registry?.iconUrl ||
    catalogMatch?.icon_url ||
    catalogMatch?.iconUrl ||
    resolveFallbackIcon(mod.filename, title);

  const getSourceBadge = () => {
    if (mod.official) {
      return (
        <span
          style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: 'rgba(45, 212, 191, 0.1)',
            color: 'var(--accent)',
            fontWeight: 'bold',
          }}
        >
          Oficial
        </span>
      );
    }
    if (registry?.source) {
      const isCf = registry.source === CONSTANTS.SOURCE_CURSEFORGE;
      return (
        <span
          style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: isCf ? 'rgba(249, 115, 22, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            color: isCf ? '#F97316' : '#22C55E',
            textTransform: 'capitalize',
            fontWeight: 'bold',
          }}
        >
          {registry.source}
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.5)',
          fontWeight: 'bold',
        }}
      >
        Manual
      </span>
    );
  };

  return (
    <div
      className="reveal-up"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'left',
        gap: 16,
        opacity: mod.enabled ? 1 : 0.5,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          overflow: 'hidden',
          background: resolvedIconUrl
            ? 'rgba(0,0,0,0.3)'
            : 'linear-gradient(135deg, rgba(15,118,110,0.4) 0%, rgba(45,212,191,0.15) 100%)',
          border: '1px solid rgba(45, 212, 191, 0.25)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#2DD4BF',
          fontWeight: 900,
          fontSize: 13,
          letterSpacing: '0.05em',
        }}
      >
        {resolvedIconUrl ? (
          <img
            src={resolvedIconUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerText = initials;
              }
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' }}>{title}</span>
          {getSourceBadge()}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.35)',
            marginTop: 2,
            display: 'flex',
            gap: 8,
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 400,
            }}
          >
            {mod.filename}
          </span>
          <span>•</span>
          <span>{formatModSize(mod.sizeBytes)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{ fontSize: 11, color: mod.enabled ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }}
          >
            {mod.enabled ? 'Activo' : 'Inactivo'}
          </span>
          <input
            aria-label={`Activar o desactivar mod ${title || mod.filename}`}
            type="checkbox"
            checked={mod.enabled}
            disabled={mod.official || isBusy}
            onChange={() => onToggle(mod)}
            style={{
              width: 32,
              height: 18,
              appearance: 'none',
              backgroundColor: mod.enabled ? 'rgba(45, 212, 191, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${mod.enabled ? 'var(--accent)' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 9,
              position: 'relative',
              cursor: mod.official ? 'not-allowed' : 'pointer',
              outline: 'none',
              transition: CONSTANTS.INPUT_TRANSITION,
            }}
            className="mod-toggle-switch"
          />
        </div>

        <button
          type="button"
          onClick={() => onDelete(mod)}
          disabled={mod.official || isBusy}
          style={{
            background: 'none',
            border: 'none',
            cursor: mod.official ? 'not-allowed' : 'pointer',
            opacity: mod.official ? 0.2 : 0.6,
            padding: 6,
            color: 'var(--danger)',
            fontSize: 16,
            transition: CONSTANTS.INPUT_TRANSITION,
          }}
          className={mod.official ? '' : 'pressable'}
          title={mod.official ? 'Los mods oficiales no se pueden eliminar' : 'Eliminar mod'}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENT: InstalledModsSidebar
// ============================================================================

interface InstalledModsSidebarProps {
  activeProfile: ReturnType<typeof getActiveProfile>;
  installedMods: InstalledMod[];
}

const InstalledModsSidebar: React.FC<Readonly<InstalledModsSidebarProps>> = ({
  activeProfile,
  installedMods,
}) => {
  const activeCount = useMemo(() => installedMods.filter((m) => m.enabled).length, [installedMods]);
  const inactiveCount = useMemo(
    () => installedMods.filter((m) => !m.enabled).length,
    [installedMods],
  );
  const officialCount = useMemo(
    () => installedMods.filter((m) => m.official).length,
    [installedMods],
  );

  return (
    <div style={{ flex: 0.9, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          textAlign: 'left',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: CONSTANTS.BORDER_LOW,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <span className="section-label">Perfil Activo</span>
        <h3 style={{ margin: '4px 0 0 0', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
          {activeProfile ? activeProfile.name : 'Ninguno'}
        </h3>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginTop: 16,
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Versión MC:</span>
            <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
              {activeProfile ? activeProfile.mcVersion : '-'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cargador:</span>
            <span style={{ color: '#FFFFFF', fontWeight: 'bold', textTransform: 'capitalize' }}>
              {activeProfile ? activeProfile.loaderType : '-'}
            </span>
          </div>
          <div
            style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '4px 0' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mods Instalados:</span>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
              {installedMods.length}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Activos:</span>
            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{activeCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Inactivos:</span>
            <span style={{ color: CONSTANTS.MUTED_WHITE_COLOR, fontWeight: 'bold' }}>
              {inactiveCount}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Oficiales:</span>
            <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>{officialCount}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: 'left',
          backgroundColor: 'rgba(45, 212, 191, 0.03)',
          border: '1px solid rgba(45, 212, 191, 0.15)',
          borderRadius: 12,
          padding: 20,
          fontSize: 12,
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.6,
        }}
      >
        <span
          style={{
            display: 'block',
            color: 'var(--accent)',
            fontWeight: 'bold',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
          }}
        >
          💡 Consejos de Uso
        </span>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li style={{ marginBottom: 6 }}>
            Puedes activar o desactivar mods individuales para hacer pruebas de rendimiento o
            compatibilidad sin borrarlos.
          </li>
          <li style={{ marginBottom: 6 }}>
            Los mods oficiales del servidor están bloqueados para garantizar que puedas conectarte
            al SMP sin problemas.
          </li>
          <li>
            Si descargas un mod manualmente (`.jar`), puedes colocarlo directamente haciendo click
            en **Carpeta Mods**.
          </li>
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENT: InstalledModsTab
// ============================================================================

interface InstalledModsTabProps {
  installedMods: InstalledMod[];
  modsRegistry: Record<string, ModRegistryEntry>;
  isLoading: boolean;
  filter: string;
  busyModFile: string | null;
  activeProfile: ReturnType<typeof getActiveProfile>;
  onFilterChange: (text: string) => void;
  onRefresh: () => void;
  onOpenFolder: () => void;
  onToggleMod: (mod: InstalledMod) => void;
  onDeleteMod: (mod: InstalledMod) => void;
}

const InstalledModsTab: React.FC<Readonly<InstalledModsTabProps>> = ({
  installedMods,
  modsRegistry,
  isLoading,
  filter,
  busyModFile,
  activeProfile,
  onFilterChange,
  onRefresh,
  onOpenFolder,
  onToggleMod,
  onDeleteMod,
}) => {
  const filteredMods = useMemo(() => {
    return installedMods.filter((m) => {
      const reg =
        modsRegistry[m.filename] || modsRegistry[m.filename.replace(/\.disabled$/, '')] || {};
      const title = reg.title || prettyModName(m.filename);
      return (
        title.toLowerCase().includes(filter.toLowerCase()) ||
        m.filename.toLowerCase().includes(filter.toLowerCase())
      );
    });
  }, [installedMods, modsRegistry, filter]);

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 12,
              border: '1.5px solid var(--border-low)',
              backgroundColor: CONSTANTS.DARK_BG_COLOR,
              padding: '4px 14px',
              height: 44,
              boxSizing: 'border-box',
              transition: CONSTANTS.INPUT_TRANSITION,
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.08)';
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-low)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 16, marginRight: 10 }}>
              🔍
            </span>
            <input
              aria-label="Filtrar mods instalados por nombre"
              type="text"
              placeholder="Buscar en tus mods instalados..."
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 13,
                outline: 'none',
                padding: 0,
                width: '100%',
              }}
            />
          </div>

          <button
            aria-label="Abrir carpeta de mods local"
            type="button"
            onClick={onOpenFolder}
            className="btn btn-secondary pressable"
            style={{ height: 44, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px' }}
          >
            📂 Carpeta Mods
          </button>

          <button
            aria-label="Recargar lista de mods instalados"
            type="button"
            onClick={onRefresh}
            className="btn btn-secondary pressable"
            style={{
              height: 44,
              width: 44,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🔄
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1.5px solid rgba(255,255,255,0.03)',
            marginTop: 8,
          }}
        >
          {isLoading && (
            <div style={{ padding: '80px 0', color: CONSTANTS.MUTED_WHITE_COLOR, fontSize: 13 }}>
              Cargando mods instalados...
            </div>
          )}
          {!isLoading && installedMods.length === 0 && (
            <div style={{ padding: '80px 0', color: CONSTANTS.MUTED_WHITE_COLOR, fontSize: 13 }}>
              No hay mods instalados en este perfil. Usa el buscador o sincroniza los oficiales para
              añadir mods.
            </div>
          )}
          {!isLoading && installedMods.length > 0 && filteredMods.length === 0 && (
            <div style={{ padding: '80px 0', color: CONSTANTS.MUTED_WHITE_COLOR, fontSize: 13 }}>
              No se encontraron mods que coincidan con la búsqueda.
            </div>
          )}
          {!isLoading &&
            filteredMods.map((mod) => (
              <InstalledModCard
                key={mod.filename}
                mod={mod}
                registry={
                  modsRegistry[mod.filename] ||
                  modsRegistry[mod.filename.replace(/\.disabled$/, '')]
                }
                isBusy={busyModFile === mod.filename}
                onToggle={onToggleMod}
                onDelete={onDeleteMod}
              />
            ))}
        </div>
      </div>

      <InstalledModsSidebar activeProfile={activeProfile} installedMods={installedMods} />
    </div>
  );
};

// ============================================================================
// SUBCOMPONENT: SyncOfficialModsTab
// ============================================================================

interface SyncOfficialModsTabProps {
  isSyncing: boolean;
  syncStatus: string | null;
  syncProgress: number;
  syncError: string | null;
  modsList: ServerModItem[];
  isLoadingMods: boolean;
  activeProfileName: string;
  onSync: () => void;
}

const SyncOfficialModsTab: React.FC<Readonly<SyncOfficialModsTabProps>> = ({
  isSyncing,
  syncStatus,
  syncProgress,
  syncError,
  modsList,
  isLoadingMods,
  activeProfileName,
  onSync,
}) => {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <CrystalCard style={{ padding: 24 }} enableHoverEffect={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>📦</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>
                  Sincronización de Mods Oficiales
                </h3>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.5,
                  }}
                >
                  Sincroniza los mods requeridos por CrystalTides SMP en el perfil activo:{' '}
                  <strong>{activeProfileName}</strong>. Usa enlaces físicos (hardlinks) para evitar
                  duplicar archivos y ahorrar espacio.
                </p>
              </div>
            </div>

            {syncStatus && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--accent)',
                  }}
                >
                  <span>{syncStatus}</span>
                  <span>{Math.round(syncProgress * 100)}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${syncProgress * 100}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent)',
                      boxShadow: '0 0 8px var(--accent)',
                      transition: 'width 200ms ease',
                    }}
                  />
                </div>
              </div>
            )}

            {syncError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--danger)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: '#FFBABA',
                  fontSize: 13,
                  textAlign: 'left',
                }}
              >
                ⚠️ {syncError}
              </div>
            )}

            <button
              aria-label="Sincronizar mods con el servidor"
              aria-busy={isSyncing}
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              className="btn btn-primary btn-md pressable"
              style={{ width: '100%' }}
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Mods'}
            </button>
          </div>
        </CrystalCard>

        <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' }}>
              ¿Cómo funciona la biblioteca virtual?
            </h4>
            <ul
              style={{
                margin: 0,
                padding: '0 0 0 20px',
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7,
              }}
            >
              <li>Los archivos jar se bajan directamente desde el CDN seguro del servidor.</li>
              <li>
                Se almacenan de forma indexada en <code>~/.crystaltides/virtual_library</code>.
              </li>
              <li>
                Se vinculan a la carpeta del juego sin crear copias repetidas en tu disco duro.
              </li>
              <li>
                Se verifica el hash SHA-1 de cada mod en cada inicio para autodetectar
                actualizaciones.
              </li>
            </ul>
          </div>
        </CrystalCard>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CrystalCard
          style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}
          enableHoverEffect={false}
        >
          <h3
            style={{
              margin: '0 0 16px 0',
              fontSize: 16,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textAlign: 'left',
            }}
          >
            📚 Mods del Servidor ({modsList.length})
          </h3>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              paddingRight: 4,
              maxHeight: 340,
            }}
          >
            {isLoadingMods && (
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, padding: '40px 0' }}>
                Cargando lista de mods...
              </div>
            )}
            {!isLoadingMods && modsList.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, padding: '40px 0' }}>
                No hay mods registrados.
              </div>
            )}
            {!isLoadingMods &&
              modsList.map((mod) => (
                <div
                  key={mod.sha1}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: CONSTANTS.BORDER_LOW,
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#FFFFFF',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '70%',
                      }}
                      title={mod.name}
                    >
                      {mod.name.replace(/\.jar$/, '')}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: getCategoryColor(mod.category),
                        color: getCategoryTextColor(mod.category),
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {mod.category || 'General'}
                    </span>
                  </div>
                  {mod.description && (
                    <span
                      style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}
                    >
                      {mod.description}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </CrystalCard>
      </div>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENT: SearchModCard
// ============================================================================

interface SearchModCardProps {
  result: SearchModResult;
  index: number;
  status?: string;
  isInstalling: boolean;
  selectedLoader: string;
  onInstall: (mod: SearchModResult) => void;
}

const SearchModCard: React.FC<Readonly<SearchModCardProps>> = ({
  result,
  index,
  status,
  isInstalling,
  selectedLoader,
  onInstall,
}) => {
  const cats = (result.categories || [])
    .filter((c) => c !== selectedLoader && c !== 'minecraft')
    .slice(0, 2);

  const getStatusColor = (msg: string) => {
    if (msg.includes('❌')) return '#FF8A8A';
    if (msg.includes('✅')) return 'var(--accent)';
    return '#FFA726';
  };

  return (
    <div
      className="reveal-up"
      style={{
        animationDelay: `${Math.min(index * 30, 300)}ms`,
        display: 'flex',
        alignItems: 'center',
        padding: '16px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'left',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: CONSTANTS.BORDER_LOW,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {result.icon_url ? (
          <img
            src={result.icon_url}
            alt={result.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<span style="font-size: 22px">🧩</span>';
              }
            }}
          />
        ) : (
          <span style={{ fontSize: 22 }}>🧩</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' }}>{result.title}</span>
          <span style={{ fontSize: 12, color: 'var(--accent)' }}>✓</span>
        </div>

        <p
          style={{
            margin: '4px 0 6px 0',
            fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {result.description}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 11,
            color: CONSTANTS.MUTED_WHITE_COLOR,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11 }}>👤</span>
            <span>{result.author}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11 }}>⚙️</span>
            <span style={{ textTransform: 'capitalize' }}>{selectedLoader}</span>
          </div>
          {cats.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>📁</span>
              <span style={{ textTransform: 'capitalize' }}>{cats[0]}</span>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          flexShrink: 0,
          width: 220,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          <span>⬇️ {formatDownloads(result.downloads)}</span>
          <span>•</span>
          <span>Act: {formatRelativeDate(result.date_modified)}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {status && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: getStatusColor(status),
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={status}
            >
              {status}
            </span>
          )}
          <button
            aria-label={`${status ? 'Reinstalar' : 'Instalar'} mod ${result.title}`}
            aria-busy={isInstalling}
            type="button"
            onClick={() => onInstall(result)}
            disabled={isInstalling}
            className={`btn ${status ? 'btn-secondary' : 'btn-primary'} btn-sm pressable`}
          >
            {isInstalling ? 'Bajando...' : status ? 'Reinstalar' : 'Instalar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENT: SearchPagination
// ============================================================================

interface SearchPaginationProps {
  currentPage: number;
  totalResults: number;
  pageSize: number;
  isSearching: boolean;
  onPageChange: (newPage: number) => void;
}

const SearchPagination: React.FC<Readonly<SearchPaginationProps>> = ({
  currentPage,
  totalResults,
  pageSize,
  isSearching,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  const pageButtons = useMemo(() => {
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - (maxButtons - 1));
    }
    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: CONSTANTS.INPUT_TRANSITION,
    fontSize: 13,
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 0',
        borderTop: '1.5px solid rgba(255, 255, 255, 0.03)',
        marginTop: 16,
      }}
    >
      <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.45)' }}>
        Página {currentPage} de {totalPages} ({totalResults} resultados)
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isSearching}
          className="pressable"
          style={navBtnStyle(currentPage === 1 || isSearching)}
          title="Primera página"
        >
          «
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isSearching}
          className="pressable"
          style={navBtnStyle(currentPage === 1 || isSearching)}
          title="Página anterior"
        >
          ‹
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {pageButtons.map((p) => {
            const isCurrent = p === currentPage;
            return (
              <button
                aria-label={`Ir a página ${p}`}
                aria-current={isCurrent ? 'page' : undefined}
                type="button"
                key={`page-${p}`}
                onClick={() => onPageChange(p)}
                disabled={isSearching}
                className="pressable"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: isCurrent
                    ? '1px solid var(--accent)'
                    : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: isCurrent
                    ? 'rgba(45, 212, 191, 0.12)'
                    : 'rgba(255,255,255,0.02)',
                  color: isCurrent ? 'var(--accent)' : 'rgba(255,255,255,0.75)',
                  fontSize: 13,
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: CONSTANTS.INPUT_TRANSITION,
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isSearching}
          className="pressable"
          style={navBtnStyle(currentPage === totalPages || isSearching)}
          title="Página siguiente"
        >
          ›
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || isSearching}
          className="pressable"
          style={navBtnStyle(currentPage === totalPages || isSearching)}
          title="Última página"
        >
          »
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENT: SearchFilterSidebar
// ============================================================================

interface SearchFilterSidebarProps {
  selectedSource: ModSource;
  selectedVersion: string;
  selectedLoader: string;
  selectedCategory: string | null;
  versionsList: string[];
  activeProfile: ReturnType<typeof getActiveProfile>;
  onSourceChange: (source: ModSource) => void;
  onVersionChange: (version: string) => void;
  onLoaderChange: (loader: string) => void;
  onCategoryChange: (category: string | null) => void;
}

const SearchFilterSidebar: React.FC<Readonly<SearchFilterSidebarProps>> = ({
  selectedSource,
  selectedVersion,
  selectedLoader,
  selectedCategory,
  versionsList,
  activeProfile,
  onSourceChange,
  onVersionChange,
  onLoaderChange,
  onCategoryChange,
}) => {
  return (
    <div style={{ flex: 0.9, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'left' }}>
        <span className="section-label">Plataforma de Búsqueda</span>
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginTop: 6,
            backgroundColor: CONSTANTS.DARK_BG_COLOR,
            padding: 4,
            borderRadius: 12,
            border: '1.5px solid var(--border-low)',
          }}
        >
          <button
            aria-label="Buscar en Modrinth"
            aria-pressed={selectedSource === CONSTANTS.SOURCE_MODRINTH}
            type="button"
            onClick={() => onSourceChange(CONSTANTS.SOURCE_MODRINTH)}
            className={`chip pressable ${selectedSource === CONSTANTS.SOURCE_MODRINTH ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 8, justifyContent: 'center', gap: 8 }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
                backgroundColor:
                  selectedSource === CONSTANTS.SOURCE_MODRINTH
                    ? 'var(--accent)'
                    : 'rgba(255,255,255,0.5)',
                maskImage: 'url(/icons/modrinth.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: 'url(/icons/modrinth.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                transition: 'background-color 0.2s ease',
              }}
            />
            Modrinth
          </button>
          <button
            aria-label="Buscar en CurseForge"
            aria-pressed={selectedSource === CONSTANTS.SOURCE_CURSEFORGE}
            type="button"
            onClick={() => onSourceChange(CONSTANTS.SOURCE_CURSEFORGE)}
            className={`chip pressable ${selectedSource === CONSTANTS.SOURCE_CURSEFORGE ? 'active' : ''}`}
            style={{
              flex: 1,
              borderRadius: 8,
              justifyContent: 'center',
              gap: 8,
              ...(selectedSource === CONSTANTS.SOURCE_CURSEFORGE
                ? {
                    backgroundColor: 'rgba(249, 115, 22, 0.12)',
                    color: '#F97316',
                    borderColor: 'rgba(249, 115, 22, 0.35)',
                  }
                : {}),
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
                backgroundColor:
                  selectedSource === CONSTANTS.SOURCE_CURSEFORGE
                    ? '#F97316'
                    : 'rgba(255,255,255,0.5)',
                maskImage: 'url(/icons/curseforge.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: 'url(/icons/curseforge.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                transition: 'background-color 0.2s ease',
              }}
            />
            CurseForge
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'left' }}>
        <span className="section-label">Versión de Minecraft</span>
        <div style={{ marginTop: 6 }}>
          <select
            aria-label="Filtrar por versión de Minecraft"
            value={selectedVersion}
            onChange={(e) => onVersionChange(e.target.value)}
          >
            {versionsList.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ textAlign: 'left' }}>
        <span className="section-label">Cargador (Mod Loader)</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {['fabric', 'forge', 'neoforge', 'quilt'].map((loader) => (
            <button
              aria-label={`Filtrar por cargador ${loader}`}
              aria-pressed={selectedLoader === loader}
              type="button"
              key={loader}
              onClick={() => onLoaderChange(loader)}
              className={`chip pressable ${selectedLoader === loader ? 'active' : ''}`}
            >
              {loader === 'neoforge'
                ? 'NeoForge'
                : loader.charAt(0).toUpperCase() + loader.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'left' }}>
        <span className="section-label">Categorías de Mods</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          <button
            aria-label="Mostrar todas las categorías de mods"
            aria-pressed={selectedCategory === null}
            type="button"
            onClick={() => onCategoryChange(null)}
            className={`chip pressable ${selectedCategory === null ? 'active-white' : ''}`}
          >
            🌟 Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              aria-label={`Filtrar categoría ${cat.label}`}
              aria-pressed={selectedCategory === cat.value}
              type="button"
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`chip pressable ${selectedCategory === cat.value ? 'active-white' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          textAlign: 'left',
          backgroundColor: 'rgba(45, 212, 191, 0.03)',
          border: '1px solid rgba(45, 212, 191, 0.15)',
          borderRadius: 10,
          padding: 14,
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.5,
          marginTop: 10,
        }}
      >
        <span
          style={{
            display: 'block',
            color: 'var(--accent)',
            fontWeight: 'bold',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          ⚙️ Destino de Instalación
        </span>
        <span>Los mods descargados se guardarán en la carpeta de juego de tu perfil actual:</span>
        <strong style={{ display: 'block', color: '#FFFFFF', marginTop: 4 }}>
          "{activeProfile.name}" ({activeProfile.mcVersion})
        </strong>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: ModManagerPage
// ============================================================================

export const ModManagerPage: React.FC = () => {
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
    () => localStorage.getItem(CONSTANTS.CF_API_KEY_STORAGE) || '',
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

  const activeProfile = getActiveProfile();

  const loadInstalled = useCallback(async () => {
    setIsLoadingInstalled(true);
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error('No se pudo resolver el directorio de juego.');
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
                selectedCategory || undefined,
                selectedSort,
              )
            : await searchModrinth(
                searchQuery,
                selectedVersion,
                selectedLoader,
                currentOffset,
                size,
                selectedCategory || undefined,
                selectedSort,
              );

        setSearchResults(res.hits || []);
        setTotalResults(res.total || 0);
      } catch (err: unknown) {
        console.error(err);
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

  const triggerFreshSearch = useCallback(async () => {
    setCurrentPage(1);
    await performSearch(1, pageSize);
  }, [performSearch, pageSize]);

  useEffect(() => {
    let ignore = false;
    const runLoad = async () => {
      setIsLoadingMods(true);
      try {
        const mods = await fetchOfficialModsList();
        if (!ignore) setModsList(mods);
      } catch (e: unknown) {
        console.error(e);
      } finally {
        if (!ignore) setIsLoadingMods(false);
      }
    };
    runLoad();
    loadSearchFilters();
    loadInstalled();
    return () => {
      ignore = true;
    };
  }, [loadSearchFilters, loadInstalled]);

  useEffect(() => {
    let ignore = false;
    if (activeTab === 'search') {
      (async () => {
        if (!ignore) setCurrentPage(1);
        await performSearch(1, pageSize);
      })();
    }
    return () => {
      ignore = true;
    };
  }, [
    activeTab,
    selectedVersion,
    selectedLoader,
    selectedCategory,
    selectedSort,
    selectedSource,
    pageSize,
    performSearch,
  ]);

  const saveCfApiKey = () => {
    if (cfApiKeyInput.trim()) {
      localStorage.setItem(CONSTANTS.CF_API_KEY_STORAGE, cfApiKeyInput.trim());
      setHasCfApiKey(true);
      alert('Clave API de CurseForge guardada correctamente.');
      triggerFreshSearch();
    } else {
      localStorage.removeItem(CONSTANTS.CF_API_KEY_STORAGE);
      setHasCfApiKey(true);
      alert('Clave API de CurseForge de respaldo reactivada.');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatus('Resolviendo directorios...');
    setSyncProgress(0);

    try {
      const homeDir: string | null = await invoke('get_home_dir').catch(() => null);
      const resolvedGameDir = resolveProfileGameDir(activeProfile, homeDir || undefined);

      await syncOfficialMods(resolvedGameDir, (status, progress) => {
        setSyncStatus(status);
        setSyncProgress(progress);
      });
      setSyncStatus('✅ Sincronización completada.');
      setSyncProgress(1);
      setTimeout(() => {
        setSyncStatus(null);
        setSyncProgress(0);
      }, 4000);
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : String(err));
      setSyncStatus(null);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInstallMod = async (mod: SearchModResult) => {
    setInstallingId(mod.id);
    setInstallStatus((prev) => ({ ...prev, [mod.id]: 'Instalando...' }));

    try {
      const homeDir: string | null = await invoke('get_home_dir').catch(() => null);
      const resolvedGameDir = resolveProfileGameDir(activeProfile, homeDir || undefined);

      const fileName =
        selectedSource === CONSTANTS.SOURCE_CURSEFORGE
          ? await installModFromCurseForge(resolvedGameDir, mod.id, selectedVersion)
          : await installModFromModrinth(resolvedGameDir, mod.id, selectedVersion);

      await registerInstalledMod(resolvedGameDir, fileName, {
        title: mod.title,
        iconUrl: mod.icon_url,
        source: selectedSource,
        projectId: mod.id,
      });
      setInstallStatus((prev) => ({ ...prev, [mod.id]: `✅ ${fileName}` }));
    } catch (err: unknown) {
      console.error(err);
      setInstallStatus((prev) => ({ ...prev, [mod.id]: '❌ Falló' }));
    } finally {
      setInstallingId(null);
    }
  };

  const handleToggleMod = async (mod: InstalledMod) => {
    if (mod.official || busyModFile) return;
    setBusyModFile(mod.filename);
    try {
      const dir = await resolveGameDir();
      if (!dir) throw new Error('No se pudo resolver el directorio de juego.');
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
      if (!dir) throw new Error('No se pudo resolver el directorio de juego.');
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
      if (!dir) throw new Error('No se pudo resolver el directorio de juego.');
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

  return (
    <div
      style={{
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <CrystalPageHeader eyebrow="Biblioteca" title="Gestión de Mods" />

      <div
        role="tablist"
        aria-label="Secciones del administrador de mods"
        style={{
          display: 'flex',
          gap: 8,
          padding: 4,
          borderRadius: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginTop: 16,
          marginBottom: 20,
        }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'installed'}
          aria-label="Ver mods instalados"
          type="button"
          onClick={() => setActiveTab('installed')}
          className={`tab-btn ${activeTab === 'installed' ? 'active' : ''}`}
        >
          📂 Mods Instalados
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'sync'}
          aria-label="Sincronizar mods oficiales"
          type="button"
          onClick={() => setActiveTab('sync')}
          className={`tab-btn ${activeTab === 'sync' ? 'active' : ''}`}
        >
          📦 Sincronizar Oficiales
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'search'}
          aria-label="Buscador de mods en línea"
          type="button"
          onClick={() => {
            setActiveTab('search');
            if (searchResults.length === 0) {
              triggerFreshSearch();
            }
          }}
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
        >
          🔍 Buscador de Mods
        </button>
      </div>

      {activeTab === 'installed' && (
        <InstalledModsTab
          installedMods={installedMods}
          modsRegistry={modsRegistry}
          isLoading={isLoadingInstalled}
          filter={installedFilter}
          busyModFile={busyModFile}
          activeProfile={activeProfile}
          onFilterChange={setInstalledFilter}
          onRefresh={loadInstalled}
          onOpenFolder={handleOpenModsFolder}
          onToggleMod={handleToggleMod}
          onDeleteMod={handleDeleteMod}
        />
      )}

      {activeTab === 'sync' && (
        <SyncOfficialModsTab
          isSyncing={isSyncing}
          syncStatus={syncStatus}
          syncProgress={syncProgress}
          syncError={syncError}
          modsList={modsList}
          isLoadingMods={isLoadingMods}
          activeProfileName={activeProfile.name}
          onSync={handleSync}
        />
      )}

      {activeTab === 'search' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <form
              onSubmit={handleSearchSubmit}
              style={{ display: 'flex', gap: 12, alignItems: 'center' }}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 12,
                  border: '1.5px solid var(--border-low)',
                  backgroundColor: CONSTANTS.DARK_BG_COLOR,
                  padding: '4px 14px',
                  height: 44,
                  boxSizing: 'border-box',
                  transition: CONSTANTS.INPUT_TRANSITION,
                }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.08)';
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-low)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span
                  style={{ color: 'rgba(255,255,255,0.25)', fontSize: 16, marginRight: 10 }}
                  aria-hidden="true"
                >
                  🔍
                </span>
                <input
                  aria-label={`Buscar mods en ${selectedSource === CONSTANTS.SOURCE_CURSEFORGE ? 'CurseForge' : 'Modrinth'}`}
                  type="text"
                  placeholder={`Buscar mods en ${selectedSource === CONSTANTS.SOURCE_CURSEFORGE ? 'CurseForge' : 'Modrinth'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: 13,
                    outline: 'none',
                    padding: 0,
                    width: '100%',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: CONSTANTS.DARK_BG_COLOR,
                  border: '1.5px solid var(--border-low)',
                  borderRadius: 12,
                  padding: '0 14px',
                  height: 44,
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}
                >
                  Ordenar por:
                </span>
                <select
                  aria-label="Ordenar mods por criterio"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  style={{
                    width: 'auto',
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer',
                    padding: '0 24px 0 0',
                    height: '100%',
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0 center',
                  }}
                >
                  <option value="relevance" style={{ backgroundColor: '#0b0d14' }}>
                    Popularidad
                  </option>
                  <option value="downloads" style={{ backgroundColor: '#0b0d14' }}>
                    Descargas
                  </option>
                  <option value="newest" style={{ backgroundColor: '#0b0d14' }}>
                    Más nuevos
                  </option>
                  <option value="updated" style={{ backgroundColor: '#0b0d14' }}>
                    Actualizados
                  </option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: CONSTANTS.DARK_BG_COLOR,
                  border: '1.5px solid var(--border-low)',
                  borderRadius: 12,
                  padding: '0 14px',
                  height: 44,
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}
                >
                  Cantidad:
                </span>
                <select
                  aria-label="Cantidad de mods por página"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{
                    width: 'auto',
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer',
                    padding: '0 24px 0 0',
                    height: '100%',
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0 center',
                  }}
                >
                  <option value={10} style={{ backgroundColor: '#0b0d14' }}>
                    10
                  </option>
                  <option value={15} style={{ backgroundColor: '#0b0d14' }}>
                    15
                  </option>
                  <option value={25} style={{ backgroundColor: '#0b0d14' }}>
                    25
                  </option>
                  <option value={50} style={{ backgroundColor: '#0b0d14' }}>
                    50
                  </option>
                </select>
              </div>

              <button
                aria-label="Buscar mods"
                aria-busy={isSearching}
                type="submit"
                className="btn btn-primary pressable"
                style={{ height: 44, padding: '0 24px' }}
              >
                {isSearching && searchResults.length === 0 ? 'Buscando...' : 'Buscar'}
              </button>
            </form>

            {selectedSource === CONSTANTS.SOURCE_CURSEFORGE && !hasCfApiKey && (
              <CrystalCard
                style={{
                  padding: '16px 20px',
                  border: '1px solid var(--danger)',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  textAlign: 'left',
                }}
                enableHoverEffect={false}
              >
                <h4 style={{ margin: 0, color: '#FF8A8A', fontSize: 14, fontWeight: 'bold' }}>
                  ⚠️ Requiere CurseForge API Key
                </h4>
                <p
                  style={{
                    margin: '4px 0 12px 0',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.4,
                  }}
                >
                  Para buscar y descargar mods desde CurseForge, ingresa tu clave API personal de
                  CurseForge a continuación. La clave se guardará de forma segura en tu navegador.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    aria-label="Clave API de CurseForge"
                    type="password"
                    placeholder="Clave API (x-api-key)..."
                    value={cfApiKeyInput}
                    onChange={(e) => setCfApiKeyInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      color: '#FFFFFF',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  <button
                    aria-label="Guardar clave API de CurseForge"
                    type="button"
                    onClick={saveCfApiKey}
                    className="btn btn-primary pressable"
                    style={{ borderRadius: 8, padding: '0 20px', fontSize: 12, height: 38 }}
                  >
                    Guardar
                  </button>
                </div>
              </CrystalCard>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: '1.5px solid rgba(255,255,255,0.03)',
                marginTop: 8,
              }}
            >
              {searchResults.length === 0 && !isSearching ? (
                <div
                  style={{ padding: '80px 0', color: CONSTANTS.MUTED_WHITE_COLOR, fontSize: 13 }}
                >
                  {selectedSource === CONSTANTS.SOURCE_CURSEFORGE && !hasCfApiKey
                    ? 'Ingrese su clave API de CurseForge arriba para habilitar la búsqueda.'
                    : 'No se encontraron resultados. Intenta ajustar los filtros de búsqueda o ingresa otras palabras clave.'}
                </div>
              ) : (
                <>
                  {searchResults.map((result, idx) => (
                    <SearchModCard
                      key={result.id}
                      result={result}
                      index={idx}
                      status={installStatus[result.id]}
                      isInstalling={installingId === result.id}
                      selectedLoader={selectedLoader}
                      onInstall={handleInstallMod}
                    />
                  ))}

                  {totalResults > 0 && (
                    <SearchPagination
                      currentPage={currentPage}
                      totalResults={totalResults}
                      pageSize={pageSize}
                      isSearching={isSearching}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          <SearchFilterSidebar
            selectedSource={selectedSource}
            selectedVersion={selectedVersion}
            selectedLoader={selectedLoader}
            selectedCategory={selectedCategory}
            versionsList={versionsList}
            activeProfile={activeProfile}
            onSourceChange={setSelectedSource}
            onVersionChange={setSelectedVersion}
            onLoaderChange={setSelectedLoader}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      )}
    </div>
  );
};
