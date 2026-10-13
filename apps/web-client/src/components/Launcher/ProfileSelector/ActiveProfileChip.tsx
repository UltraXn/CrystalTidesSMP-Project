import React from 'react';
import type { Profile } from '../mockLauncherState';
import { getSettings } from '../mockLauncherState';

function formatRamDisplay(ramMbOrGb?: number): string {
  if (typeof ramMbOrGb !== 'number' || ramMbOrGb <= 0) return '';
  const ramGb = ramMbOrGb > 100 ? ramMbOrGb / 1024 : ramMbOrGb;
  return `${ramGb} GB`;
}

export interface ActiveProfileChipProps {
  activeProfile: Profile | null;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const ActiveProfileChip: React.FC<Readonly<ActiveProfileChipProps>> = ({
  activeProfile,
  isOpen,
  onToggleOpen,
}) => {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onToggleOpen}
      style={{
        textAlign: 'left',
        color: 'inherit',
        font: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '0 16px 0 13px',
        height: 62,
        boxSizing: 'border-box',
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-low)',
        cursor: 'pointer',
        userSelect: 'none',
        minWidth: 235,
        transition: 'border-color 150ms ease, background-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-low)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          minWidth: 34,
          borderRadius: 10,
          background: 'rgba(45, 212, 191, 0.12)',
          border: '1px solid rgba(45, 212, 191, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 17,
        }}
      >
        {activeProfile?.iconPath &&
        (activeProfile.iconPath.startsWith('/') ||
          activeProfile.iconPath.startsWith('http') ||
          activeProfile.iconPath.includes('.')) ? (
          <img
            src={activeProfile.iconPath}
            alt="Profile icon"
            style={{ width: 20, height: 20, objectFit: 'contain' }}
          />
        ) : (
          (activeProfile?.iconPath ?? '🌊')
        )}
      </span>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 140,
          }}
        >
          {activeProfile?.name ?? 'Cargando...'}
        </span>
        <span style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.5)', marginTop: 1 }}>
          {activeProfile?.mcVersion} · {activeProfile?.loaderType ?? 'Vanilla'} ·{' '}
          {formatRamDisplay(activeProfile?.maxRam ?? getSettings().maxRam)}
        </span>
      </div>
      <svg
        style={{
          marginLeft: 'auto',
          flexShrink: 0,
          opacity: 0.5,
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 150ms ease',
        }}
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
};
