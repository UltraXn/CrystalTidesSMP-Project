import React, { useMemo } from 'react';
import { getActiveProfile, type InstalledMod } from '../mockLauncherState';

const CONSTANTS = {
  BORDER_LOW: '1px solid var(--border-low)',
  ACCENT_VAR: 'var(--accent)',
  SPACE_BETWEEN: 'space-between',
  MUTED_WHITE_COLOR: 'rgba(255, 255, 255, 0.4)',
} as const;

interface InstalledModsSidebarProps {
  activeProfile: ReturnType<typeof getActiveProfile>;
  installedMods: InstalledMod[];
}

export const InstalledModsSidebar: React.FC<Readonly<InstalledModsSidebarProps>> = ({
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
          <div style={{ display: 'flex', justifyContent: CONSTANTS.SPACE_BETWEEN }}>
            <span>Versión MC:</span>
            <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
              {activeProfile ? activeProfile.mcVersion : '-'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: CONSTANTS.SPACE_BETWEEN }}>
            <span>Cargador:</span>
            <span style={{ color: '#FFFFFF', fontWeight: 'bold', textTransform: 'capitalize' }}>
              {activeProfile ? activeProfile.loaderType : '-'}
            </span>
          </div>
          <div
            style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '4px 0' }}
          />
          <div style={{ display: 'flex', justifyContent: CONSTANTS.SPACE_BETWEEN }}>
            <span>Mods Instalados:</span>
            <span style={{ color: CONSTANTS.ACCENT_VAR, fontWeight: 'bold' }}>
              {installedMods.length}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: CONSTANTS.SPACE_BETWEEN }}>
            <span>Activos:</span>
            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{activeCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: CONSTANTS.SPACE_BETWEEN }}>
            <span>Inactivos:</span>
            <span style={{ color: CONSTANTS.MUTED_WHITE_COLOR, fontWeight: 'bold' }}>
              {inactiveCount}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: CONSTANTS.SPACE_BETWEEN }}>
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
            color: CONSTANTS.ACCENT_VAR,
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
