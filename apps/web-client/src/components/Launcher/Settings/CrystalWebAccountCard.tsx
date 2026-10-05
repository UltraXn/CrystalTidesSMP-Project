import React from 'react';
import { CrystalCard } from '../CrystalCard';
import type { LauncherSettings } from '../mockLauncherState';
import { useCrystalLink } from './useCrystalLink';
import { CrystalLinkedSession } from './CrystalLinkedSession';
import { CrystalLoginForm } from './CrystalLoginForm';
import { AvatarPreferenceSelector } from './AvatarPreferenceSelector';

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  textAlign: 'left',
};

interface CrystalWebAccountCardProps {
  settings: LauncherSettings;
  setSettings: React.Dispatch<React.SetStateAction<LauncherSettings>>;
}

export function CrystalWebAccountCard({
  settings,
  setSettings,
}: Readonly<CrystalWebAccountCardProps>) {
  const {
    crystalSession,
    logoutCrystal,
    crystalEmail,
    setCrystalEmail,
    crystalPassword,
    setCrystalPassword,
    isLinking,
    linkError,
    handleLinkCrystal,
  } = useCrystalLink();

  return (
    <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
      <div style={sectionStyle}>
        <h4
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 'bold',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <img
            src="/logo.png"
            style={{ width: 18, height: 18, objectFit: 'contain', imageRendering: 'pixelated' }}
            alt="Logo"
          />
          <span>Cuenta de CrystalTides</span>
        </h4>

        {crystalSession ? (
          <CrystalLinkedSession session={crystalSession} onLogout={logoutCrystal} />
        ) : (
          <CrystalLoginForm
            email={crystalEmail}
            setEmail={setCrystalEmail}
            password={crystalPassword}
            setPassword={setCrystalPassword}
            isLinking={isLinking}
            linkError={linkError}
            onSubmit={handleLinkCrystal}
          />
        )}

        <AvatarPreferenceSelector settings={settings} setSettings={setSettings} />
      </div>
    </CrystalCard>
  );
}
