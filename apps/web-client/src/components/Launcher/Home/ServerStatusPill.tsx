import React from 'react';
import type { ServerStatus } from '../mockLauncherState';
import { LAUNCHER_HOME_CONSTANTS } from './constants';

export interface ServerStatusPillProps {
  status: ServerStatus | null;
  isLoading: boolean;
  ipCopied: boolean;
  onCopyIp: () => void;
}

const getStatusDotColor = (isLoading: boolean, serverStatus: ServerStatus | null): string => {
  if (isLoading) return '#FFA726';
  if (!serverStatus) return 'rgba(255, 255, 255, 0.3)';
  return serverStatus.online ? '#10B981' : '#EF4444';
};

const renderStatusMeta = (
  isLoading: boolean,
  serverStatus: ServerStatus | null,
): React.ReactNode => {
  if (isLoading) {
    return <span style={{ color: 'rgba(255,255,255,0.5)' }}>Consultando estado...</span>;
  }
  if (!serverStatus) {
    return <span style={{ color: 'rgba(255,255,255,0.5)' }}>No disponible</span>;
  }
  if (!serverStatus.online) {
    return <span style={{ color: '#FCA5A5' }}>Desconectado</span>;
  }
  const hasPlayerCount = serverStatus.playersOnline !== null && serverStatus.playersMax !== null;
  const players = hasPlayerCount
    ? ` · ${serverStatus.playersOnline}/${serverStatus.playersMax} jugadores`
    : '';
  return (
    <>
      <span style={{ color: '#34D399', fontWeight: 600 }}>En línea</span>
      <span style={{ color: LAUNCHER_HOME_CONSTANTS.TEXT_MUTED_55 }}>{players}</span>
    </>
  );
};

export const ServerStatusPill: React.FC<Readonly<ServerStatusPillProps>> = ({
  status,
  isLoading,
  ipCopied,
  onCopyIp,
}) => {
  const dotColor = getStatusDotColor(isLoading, status);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${LAUNCHER_HOME_CONSTANTS.BORDER_LOW}`,
        borderRadius: 14,
        padding: '10px 12px 10px 16px',
      }}
    >
      <div
        className="pulse-dot"
        style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>
          {LAUNCHER_HOME_CONSTANTS.SERVER_IP}
        </div>
        <div style={{ fontSize: 11, marginTop: 1 }}>{renderStatusMeta(isLoading, status)}</div>
      </div>
      <button
        aria-label={ipCopied ? 'IP copiada al portapapeles' : 'Copiar IP del servidor'}
        type="button"
        onClick={onCopyIp}
        title="Copiar IP"
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: LAUNCHER_HOME_CONSTANTS.BG_WHITE_05,
          border: `1px solid ${LAUNCHER_HOME_CONSTANTS.BORDER_LOW}`,
          color: LAUNCHER_HOME_CONSTANTS.TEXT_MUTED_55,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition:
            'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = LAUNCHER_HOME_CONSTANTS.ACCENT_COLOR;
          e.currentTarget.style.borderColor = LAUNCHER_HOME_CONSTANTS.ACCENT_BORDER_30;
          e.currentTarget.style.background = LAUNCHER_HOME_CONSTANTS.ACCENT_TINT_12;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = LAUNCHER_HOME_CONSTANTS.TEXT_MUTED_55;
          e.currentTarget.style.borderColor = LAUNCHER_HOME_CONSTANTS.BORDER_LOW;
          e.currentTarget.style.background = LAUNCHER_HOME_CONSTANTS.BG_WHITE_05;
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span
          className={`copied-tip ${ipCopied ? 'visible' : ''}`}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            background: '#0E1118',
            border: `1px solid ${LAUNCHER_HOME_CONSTANTS.ACCENT_BORDER_30}`,
            color: LAUNCHER_HOME_CONSTANTS.ACCENT_COLOR,
            fontSize: 10.5,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
          }}
        >
          ¡IP copiada!
        </span>
      </button>
    </div>
  );
};
