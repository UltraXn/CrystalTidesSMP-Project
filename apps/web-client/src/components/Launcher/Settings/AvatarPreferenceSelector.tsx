import React from 'react';
import { saveSettings, type LauncherSettings } from '../mockLauncherState';

interface AvatarPreferenceSelectorProps {
  settings: LauncherSettings;
  setSettings: React.Dispatch<React.SetStateAction<LauncherSettings>>;
}

export function AvatarPreferenceSelector({
  settings,
  setSettings,
}: Readonly<AvatarPreferenceSelectorProps>) {
  const currentPref = settings.avatarPreference || 'web';

  const handleSelect = (pref: 'web' | 'minecraft') => {
    const updated = saveSettings({ avatarPreference: pref });
    setSettings(updated);
    window.dispatchEvent(new Event('crystaltides_settings_updated'));
  };

  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#FFF' }}>
          🖼️ Preferencia de Icono de Perfil
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
          Elige si prefieres mostrar tu foto de la web o la cabeza de Minecraft en el launcher
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          aria-label="Usar foto de perfil web"
          aria-pressed={currentPref === 'web'}
          type="button"
          onClick={() => handleSelect('web')}
          style={{
            backgroundColor:
              currentPref === 'web' ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${currentPref === 'web' ? '#2DD4BF' : 'rgba(255, 255, 255, 0.12)'}`,
            color: currentPref === 'web' ? '#2DD4BF' : 'rgba(255, 255, 255, 0.6)',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            transition:
              'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
          }}
        >
          🌊 Foto Web
        </button>
        <button
          aria-label="Usar cabeza de Minecraft"
          aria-pressed={currentPref === 'minecraft'}
          type="button"
          onClick={() => handleSelect('minecraft')}
          style={{
            backgroundColor:
              currentPref === 'minecraft' ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${currentPref === 'minecraft' ? '#2DD4BF' : 'rgba(255, 255, 255, 0.12)'}`,
            color: currentPref === 'minecraft' ? '#2DD4BF' : 'rgba(255, 255, 255, 0.6)',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            transition:
              'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
          }}
        >
          ⛏️ Cabeza Minecraft
        </button>
      </div>
    </div>
  );
}
