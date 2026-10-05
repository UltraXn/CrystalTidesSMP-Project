import React from 'react';
import type { SearchModResult } from '../mockLauncherState';

const CONSTANTS = {
  BORDER_LOW: '1px solid var(--border-low)',
  ACCENT_VAR: 'var(--accent)',
  MUTED_WHITE_COLOR: 'rgba(255, 255, 255, 0.4)',
} as const;

const formatDownloads = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
};

const formatRelativeDate = (iso?: string): string => {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('es-ES', { timeZone: 'UTC' });
  } catch {
    return '';
  }
};

interface SearchModCardProps {
  result: SearchModResult;
  index: number;
  status?: string;
  isInstalling: boolean;
  selectedLoader: string;
  onInstall: (mod: SearchModResult) => void;
}

export const SearchModCard: React.FC<Readonly<SearchModCardProps>> = ({
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
    if (msg.includes('✅')) return CONSTANTS.ACCENT_VAR;
    return '#FFA726';
  };

  const getActionLabel = () => {
    if (isInstalling) return 'Bajando...';
    return status ? 'Reinstalar' : 'Instalar';
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
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('span');
                fallback.style.fontSize = '22px';
                fallback.textContent = '🧩';
                parent.replaceChildren(fallback);
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
          <span style={{ fontSize: 12, color: CONSTANTS.ACCENT_VAR }}>✓</span>
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
            {getActionLabel()}
          </button>
        </div>
      </div>
    </div>
  );
};
