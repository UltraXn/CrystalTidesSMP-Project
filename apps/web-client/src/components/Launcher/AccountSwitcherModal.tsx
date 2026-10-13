import React, { useState } from 'react';
import { useAuth, getSettings, saveSettings } from './mockLauncherState';
import { AvatarPreferenceToggle } from './AccountSwitcher/AvatarPreferenceToggle';
import { CrystalSessionSection } from './AccountSwitcher/CrystalSessionSection';
import { SavedAccountsList } from './AccountSwitcher/SavedAccountsList';
import { AccountSwitcherActions } from './AccountSwitcher/AccountSwitcherActions';

const SPACE_BETWEEN = 'space-between';

interface AccountSwitcherModalProps {
  onClose: () => void;
  onNavigateSettings: () => void;
}

export const AccountSwitcherModal: React.FC<Readonly<AccountSwitcherModalProps>> = ({
  onClose,
  onNavigateSettings,
}) => {
  const { currentSession, crystalSession, savedAccounts, selectAccount, removeAccount, logout } =
    useAuth();

  const [avatarPref, setAvatarPref] = useState<'web' | 'minecraft'>(
    () => getSettings().avatarPreference ?? 'web',
  );

  const handleToggleAvatarPref = (pref: 'web' | 'minecraft') => {
    setAvatarPref(pref);
    saveSettings({ avatarPreference: pref });
    window.dispatchEvent(new Event('crystaltides_settings_updated'));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          backgroundColor: 'transparent',
        }}
      />

      {/* Popover Menu */}
      <section
        aria-labelledby="account-switcher-title"
        className="reveal-up"
        style={{
          position: 'fixed',
          left: 92,
          bottom: 24,
          width: 330,
          backgroundColor: 'rgba(13, 17, 23, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(45, 212, 191, 0.25)',
          borderRadius: 16,
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(45, 212, 191, 0.15)',
          zIndex: 1000,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: SPACE_BETWEEN }}>
          <span
            id="account-switcher-title"
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#FFF',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            👤 Selector de Sesiones
          </span>
          <button
            aria-label="Cerrar selector de sesiones"
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              fontSize: 16,
              padding: '2px 6px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Avatar Source Preference Toggle */}
        <AvatarPreferenceToggle avatarPref={avatarPref} onToggle={handleToggleAvatarPref} />

        {/* Section 1: CrystalTides Web Account */}
        <CrystalSessionSection
          crystalSession={crystalSession}
          avatarPref={avatarPref}
          currentSessionUsername={currentSession?.username}
          onNavigateSettings={onNavigateSettings}
          onClose={onClose}
        />

        {/* Section 2: Minecraft Accounts List */}
        <SavedAccountsList
          savedAccounts={savedAccounts}
          currentSessionId={currentSession?.id}
          onSelectAccount={selectAccount}
          onRemoveAccount={removeAccount}
          onClose={onClose}
        />

        {/* Section 3: Actions */}
        <AccountSwitcherActions
          onClose={onClose}
          onLogout={logout}
          onNavigateSettings={onNavigateSettings}
        />
      </section>
    </>
  );
};
