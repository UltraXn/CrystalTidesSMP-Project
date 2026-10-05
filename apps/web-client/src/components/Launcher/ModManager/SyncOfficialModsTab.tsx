import React from 'react';
import { CrystalCard } from '../CrystalCard';
import type { ServerModItem } from '../mockLauncherState';

const CONSTANTS = {
  BORDER_LOW: '1px solid var(--border-low)',
  SPACE_BETWEEN: 'space-between',
} as const;

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Audio: { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC' },
  Optimización: { bg: 'rgba(45, 212, 191, 0.15)', text: 'var(--accent)' },
  Interfaz: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA' },
  Biblioteca: { bg: 'rgba(234, 179, 8, 0.15)', text: '#FACC15' },
};

const getCategoryColor = (cat?: string): string => {
  if (!cat || !CATEGORY_COLORS[cat]) return 'rgba(255, 255, 255, 0.08)';
  return CATEGORY_COLORS[cat].bg;
};

const getCategoryTextColor = (cat?: string): string => {
  if (!cat || !CATEGORY_COLORS[cat]) return 'rgba(255, 255, 255, 0.6)';
  return CATEGORY_COLORS[cat].text;
};

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

export const SyncOfficialModsTab: React.FC<Readonly<SyncOfficialModsTabProps>> = ({
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
                  <strong style={{ color: '#FFFFFF' }}>{activeProfileName}</strong>.
                </p>
              </div>
            </div>

            {syncError && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--danger)',
                  fontSize: 13,
                  textAlign: 'left',
                }}
              >
                ⚠️ {syncError}
              </div>
            )}

            {syncStatus && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: CONSTANTS.SPACE_BETWEEN,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <span>{syncStatus}</span>
                  <span style={{ fontWeight: 'bold' }}>{syncProgress}%</span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${syncProgress}%`,
                      backgroundColor: 'var(--accent)',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            )}

            <button
              aria-label="Sincronizar mods oficiales ahora"
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
                      justifyContent: CONSTANTS.SPACE_BETWEEN,
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
