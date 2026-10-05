import { RoleBadge } from '../RoleBadge';
import type { CrystalWebSession } from '../mockLauncherState';

interface CrystalLinkedSessionProps {
  session: CrystalWebSession;
  onLogout: () => void;
}

export function CrystalLinkedSession({ session, onLogout }: Readonly<CrystalLinkedSessionProps>) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(45, 212, 191, 0.03)',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: 'rgba(45, 212, 191, 0.08)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {session.avatarUrl ? (
            <img
              src={session.avatarUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt="Avatar"
            />
          ) : (
            <img
              src="/logo.png"
              style={{ width: 24, height: 24, objectFit: 'contain' }}
              alt="Logo"
            />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
          <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 14.5 }}>
            {session.username}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{session.email}</span>
          <RoleBadge role={session.role} size="md" style={{ marginTop: 4 }} />
        </div>
      </div>
      <button
        aria-label="Desvincular cuenta web de CrystalTides"
        type="button"
        onClick={onLogout}
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: 'var(--danger)',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: 8,
          transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)';
          e.currentTarget.style.borderColor = 'var(--danger)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
        }}
      >
        Desvincular Cuenta
      </button>
    </div>
  );
}
