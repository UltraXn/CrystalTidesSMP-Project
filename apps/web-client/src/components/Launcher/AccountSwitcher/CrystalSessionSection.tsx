import React from 'react';
import type { CrystalWebSession } from '../mockLauncherState';
import { RoleBadge } from '../RoleBadge';

const SPACE_BETWEEN = 'space-between';

interface CrystalSessionSectionProps {
  crystalSession: CrystalWebSession | null;
  avatarPref: 'web' | 'minecraft';
  currentSessionUsername?: string;
  onNavigateSettings: () => void;
  onClose: () => void;
}

export const CrystalSessionSection: React.FC<Readonly<CrystalSessionSectionProps>> = ({
  crystalSession,
  avatarPref,
  currentSessionUsername,
  onNavigateSettings,
  onClose,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(45, 212, 191, 0.04)',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: SPACE_BETWEEN }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          🌊 Cuenta Web Vinc.
        </span>
        {crystalSession && <RoleBadge role={crystalSession.role} size="sm" />}
      </div>

      {crystalSession ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={
              avatarPref === 'minecraft' && currentSessionUsername
                ? `https://mc-heads.net/avatar/${currentSessionUsername}/34`
                : crystalSession.avatarUrl || '/logo.png'
            }
            style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }}
            alt="Avatar"
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#FFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {crystalSession.username}
            </span>
            <span
              style={{
                fontSize: 10.5,
                color: 'rgba(255,255,255,0.45)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {crystalSession.email}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: SPACE_BETWEEN }}>
          <span style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.5)' }}>
            Sin cuenta web vinculada
          </span>
          <button
            aria-label="Vincular cuenta web de CrystalTides"
            type="button"
            onClick={() => {
              onClose();
              onNavigateSettings();
            }}
            style={{
              background: 'rgba(45, 212, 191, 0.15)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              color: '#2DD4BF',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            Vincular
          </button>
        </div>
      )}
    </div>
  );
};
