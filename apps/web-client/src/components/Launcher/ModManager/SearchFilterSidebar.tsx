import React from 'react';
import { getActiveProfile } from '../mockLauncherState';

export type ModSource = 'modrinth' | 'curseforge';

const CONSTANTS = {
  BORDER_LOW_1_5: '1.5px solid var(--border-low)',
  DARK_BG_COLOR: 'rgba(0, 0, 0, 0.25)',
  ACCENT_VAR: 'var(--accent)',
  SOURCE_MODRINTH: 'modrinth' as const,
  SOURCE_CURSEFORGE: 'curseforge' as const,
} as const;

const CATEGORIES = [
  { label: '🚀 Optimización', value: 'optimization' },
  { label: '🧭 Aventura', value: 'adventure' },
  { label: '⚙️ Tecnología', value: 'technology' },
  { label: '🎨 Decoración', value: 'decoration' },
  { label: '🌳 Mundo', value: 'worldgen' },
  { label: '📂 Librería', value: 'library' },
];

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

export const SearchFilterSidebar: React.FC<Readonly<SearchFilterSidebarProps>> = ({
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
            border: CONSTANTS.BORDER_LOW_1_5,
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
                    ? CONSTANTS.ACCENT_VAR
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
            color: CONSTANTS.ACCENT_VAR,
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
          "{activeProfile?.name ?? 'Default'}" ({activeProfile?.mcVersion ?? '-'})
        </strong>
      </div>
    </div>
  );
};
