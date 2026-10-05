import React from 'react';
import { RoleBadge } from '../RoleBadge';
import type { ServerStatus } from '../mockLauncherState';
import { LAUNCHER_HOME_CONSTANTS, getDayPart, getAccountBadgeLabel } from './constants';
import { ServerStatusPill } from './ServerStatusPill';

export interface HeroGreetingBarProps {
  username?: string;
  role?: string;
  sessionType?: string;
  serverStatus: ServerStatus | null;
  isLoadingStatus: boolean;
  ipCopied: boolean;
  onCopyIp: () => void;
}

export const HeroGreetingBar: React.FC<Readonly<HeroGreetingBarProps>> = ({
  username = 'Invitado',
  role,
  sessionType,
  serverStatus,
  isLoadingStatus,
  ipCopied,
  onCopyIp,
}) => {
  return (
    <section
      className="reveal-up"
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: LAUNCHER_HOME_CONSTANTS.ACCENT_COLOR,
            marginBottom: 4,
          }}
        >
          {getDayPart()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: '#FFF',
            }}
          >
            {username}
          </h1>
          {role && <RoleBadge role={role} size="md" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: LAUNCHER_HOME_CONSTANTS.ACCENT_COLOR,
              background: LAUNCHER_HOME_CONSTANTS.ACCENT_TINT_12,
              border: '1px solid rgba(45, 212, 191, 0.25)',
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            {getAccountBadgeLabel(sessionType)}
          </span>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Todo listo para sumergirte
          </span>
        </div>
      </div>

      <ServerStatusPill
        status={serverStatus}
        isLoading={isLoadingStatus}
        ipCopied={ipCopied}
        onCopyIp={onCopyIp}
      />
    </section>
  );
};
