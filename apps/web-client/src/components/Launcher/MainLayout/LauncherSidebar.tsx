import React, { useState } from 'react';
import { SidebarNavList } from './SidebarNavList';
import { SidebarUserFooter } from './SidebarUserFooter';

export interface LauncherSidebarProps {
  activePage: string;
  showVersionSwitcher: boolean;
  showSocial: boolean;
  onNavigatePage: (page: string) => void;
  onToggleVersionSwitcher: () => void;
  onToggleSocial: () => void;
  onOpenCrashModal: () => void;
}

export const LauncherSidebar: React.FC<Readonly<LauncherSidebarProps>> = ({
  activePage,
  showVersionSwitcher,
  showSocial,
  onNavigatePage,
  onToggleVersionSwitcher,
  onToggleSocial,
  onOpenCrashModal,
}) => {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <nav
      style={{
        width: 74,
        minWidth: 74,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(7, 4, 10, 0.95)',
        backdropFilter: 'blur(16px)',
        boxSizing: 'border-box',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <button
        type="button"
        className="octopus-logo-box"
        style={{
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          marginBottom: 16,
          cursor: 'pointer',
          userSelect: 'none',
          overflow: 'hidden',
          padding: 0,
        }}
        title="CrystalTides Launcher"
        aria-label="CrystalTides Launcher"
        onClick={() => onNavigatePage('home')}
      >
        {logoFailed ? (
          <span style={{ fontSize: 22, userSelect: 'none' }}>💎</span>
        ) : (
          <img
            src="/logo.png"
            className="octopus-logo-img"
            style={{ width: '80%', height: '80%', objectFit: 'contain' }}
            alt="CrystalTides Logo"
            onError={(e) => {
              if (!e.currentTarget.dataset.fallback) {
                e.currentTarget.dataset.fallback = 'true';
                e.currentTarget.src = '/server_icon.png';
              } else {
                setLogoFailed(true);
              }
            }}
          />
        )}
      </button>

      {/* Navigation item list */}
      <SidebarNavList
        activePage={activePage}
        showVersionSwitcher={showVersionSwitcher}
        onNavigatePage={onNavigatePage}
        onToggleVersionSwitcher={onToggleVersionSwitcher}
      />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Social, Diagnostics, Avatar and Logout */}
      <SidebarUserFooter
        showSocial={showSocial}
        onToggleSocial={onToggleSocial}
        onOpenCrashModal={onOpenCrashModal}
        onNavigateSettings={() => onNavigatePage('settings')}
      />
    </nav>
  );
};
