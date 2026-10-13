import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { useAuth, getSettings } from '../mockLauncherState';
import { AccountSwitcherModal } from '../AccountSwitcherModal';

export interface SidebarUserFooterProps {
  showSocial: boolean;
  onToggleSocial: () => void;
  onOpenCrashModal: () => void;
  onNavigateSettings: () => void;
}

type CrystalSession = ReturnType<typeof useAuth>['crystalSession'];
type MinecraftSession = ReturnType<typeof useAuth>['currentSession'];

function getDisplayAvatarSrc(
  cSession: CrystalSession,
  mSession: MinecraftSession,
  avatarPref: 'web' | 'minecraft',
) {
  if (avatarPref === 'web' && cSession?.avatarUrl) {
    return cSession.avatarUrl;
  }
  if (mSession?.username) {
    return `https://mc-heads.net/avatar/${mSession.username}/36`;
  }
  return cSession?.avatarUrl ?? null;
}

export const SidebarUserFooter: React.FC<Readonly<SidebarUserFooterProps>> = ({
  showSocial,
  onToggleSocial,
  onOpenCrashModal,
  onNavigateSettings,
}) => {
  const { currentSession, crystalSession, logout } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [avatarPref, setAvatarPref] = useState<'web' | 'minecraft'>(
    () => getSettings().avatarPreference ?? 'web',
  );

  useEffect(() => {
    const handleUpdate = () => {
      setAvatarPref(getSettings().avatarPreference ?? 'web');
    };
    window.addEventListener('crystaltides_settings_updated', handleUpdate);
    return () => window.removeEventListener('crystaltides_settings_updated', handleUpdate);
  }, []);

  return (
    <>
      {/* Quick Actions (Social Panel & Diagnostic simulation) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          marginBottom: 12,
          paddingTop: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Social toggle */}
        <button
          type="button"
          onClick={onToggleSocial}
          title="Amigos en Línea"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: showSocial
              ? '1px solid rgba(45, 212, 191, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: showSocial ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: showSocial ? '#2DD4BF' : 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Users size={16} />
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#2DD4BF',
            }}
          />
        </button>

        {/* Crash modal simulation toggle */}
        <button
          type="button"
          onClick={onOpenCrashModal}
          title="Simular Diagnóstico de Crash"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: '1px solid rgba(239, 68, 68, 0.2)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            color: '#EF4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={15} />
        </button>
      </div>

      {/* User avatar + logout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          aria-label="Cambiar de cuenta"
          title="Cambiar de Cuenta"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            overflow: 'hidden',
            border: showAccountMenu ? '2px solid #2DD4BF' : '1px solid rgba(255, 255, 255, 0.12)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 160ms ease, background-color 160ms ease',
            position: 'relative',
            padding: 0,
          }}
        >
          {getDisplayAvatarSrc(crystalSession, currentSession, avatarPref) ? (
            <img
              src={getDisplayAvatarSrc(crystalSession, currentSession, avatarPref)!}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt="Avatar"
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255, 255, 255, 0.55)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </button>

        {showAccountMenu && (
          <AccountSwitcherModal
            onClose={() => setShowAccountMenu(false)}
            onNavigateSettings={onNavigateSettings}
          />
        )}

        <button
          type="button"
          onClick={logout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: '1px solid rgba(239, 68, 68, 0.2)',
            backgroundColor: 'transparent',
            color: '#EF4444',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 160ms ease, border-color 160ms ease',
            padding: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </>
  );
};
