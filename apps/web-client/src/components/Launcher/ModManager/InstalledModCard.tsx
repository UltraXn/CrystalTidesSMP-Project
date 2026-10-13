import React from 'react';
import {
  prettyModName,
  formatModSize,
  MOCK_SEARCH_MODS,
  type InstalledMod,
  type ModRegistryEntry,
  type SearchModResult,
} from '../mockLauncherState';

interface InstalledModCardProps {
  mod: InstalledMod;
  registry?: ModRegistryEntry;
  isBusy: boolean;
  onToggle: (mod: InstalledMod) => void;
  onDelete: (mod: InstalledMod) => void;
}

const CONSTANTS = {
  ACCENT_VAR: 'var(--accent)',
  SOURCE_CURSEFORGE: 'curseforge' as const,
  INPUT_TRANSITION:
    'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
} as const;

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

function resolveFallbackIcon(filename: string, title: string): string | null {
  const f = filename.toLowerCase();
  const t = title.toLowerCase();
  for (const item of KNOWN_MOD_ICONS) {
    if (f.includes(item.pattern) || t.includes(item.pattern)) {
      return item.url;
    }
  }
  return null;
}

function getModInitials(title: string): string {
  return (
    title
      .replace(/^[0-9.]+\s*/, '')
      .replace(/\.jar(\.disabled)?$/i, '')
      .split(/[\s\-_+.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'MD'
  );
}

function resolveModIcon(
  mod: InstalledMod,
  title: string,
  registry?: ModRegistryEntry,
): string | null {
  if (registry?.iconUrl) return registry.iconUrl;

  const f = mod.filename.toLowerCase();
  const t = title.toLowerCase();
  const catalogMatch = MOCK_SEARCH_MODS.find((m: SearchModResult) => {
    const id = m.id.toLowerCase();
    const mTitle = m.title.toLowerCase();
    return f.includes(id) || t.includes(id) || mTitle.includes(t) || t.includes(mTitle);
  });

  return (
    catalogMatch?.icon_url ?? catalogMatch?.iconUrl ?? resolveFallbackIcon(mod.filename, title)
  );
}

function ModSourceBadge({ official, source }: Readonly<{ official: boolean; source?: string }>) {
  if (official) {
    return (
      <span
        style={{
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 4,
          backgroundColor: 'rgba(45, 212, 191, 0.1)',
          color: CONSTANTS.ACCENT_VAR,
          fontWeight: 'bold',
        }}
      >
        Oficial
      </span>
    );
  }

  if (source) {
    const isCf = source === CONSTANTS.SOURCE_CURSEFORGE;
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
        {source}
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
}

export const InstalledModCard: React.FC<Readonly<InstalledModCardProps>> = ({
  mod,
  registry,
  isBusy,
  onToggle,
  onDelete,
}) => {
  const title = registry?.title ?? prettyModName(mod.filename);
  const initials = getModInitials(title);
  const resolvedIconUrl = resolveModIcon(mod, title, registry);

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
          <ModSourceBadge official={mod.official} source={registry?.source} />
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
            style={{
              fontSize: 11,
              color: mod.enabled ? CONSTANTS.ACCENT_VAR : 'rgba(255,255,255,0.3)',
            }}
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
              border: `1px solid ${mod.enabled ? CONSTANTS.ACCENT_VAR : 'rgba(255, 255, 255, 0.2)'}`,
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
          aria-label={`Eliminar mod ${title}`}
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
          onMouseEnter={(e) => {
            if (!mod.official && !isBusy) e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            if (!mod.official && !isBusy) e.currentTarget.style.opacity = '0.6';
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
