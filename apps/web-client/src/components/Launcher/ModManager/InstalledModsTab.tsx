import React, { useMemo } from 'react';
import {
  prettyModName,
  getActiveProfile,
  type InstalledMod,
  type ModRegistryEntry,
} from '../mockLauncherState';
import { InstalledModCard } from './InstalledModCard';
import { InstalledModsSidebar } from './InstalledModsSidebar';

const CONSTANTS = {
  BORDER_LOW_1_5: '1.5px solid var(--border-low)',
  DARK_BG_COLOR: 'rgba(0, 0, 0, 0.25)',
  BOX_BORDER_BOX: 'border-box' as const,
  INPUT_TRANSITION:
    'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
  MUTED_WHITE_COLOR: 'rgba(255, 255, 255, 0.4)',
} as const;

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

export const InstalledModsTab: React.FC<Readonly<InstalledModsTabProps>> = ({
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
      const title = reg.title ?? prettyModName(m.filename);
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
              border: CONSTANTS.BORDER_LOW_1_5,
              backgroundColor: CONSTANTS.DARK_BG_COLOR,
              padding: '4px 14px',
              height: 44,
              boxSizing: CONSTANTS.BOX_BORDER_BOX,
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
