import React from 'react';

const SPACE_BETWEEN = 'space-between';

interface AvatarPreferenceToggleProps {
  avatarPref: 'web' | 'minecraft';
  onToggle: (pref: 'web' | 'minecraft') => void;
}

export const AvatarPreferenceToggle: React.FC<Readonly<AvatarPreferenceToggleProps>> = ({
  avatarPref,
  onToggle,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: SPACE_BETWEEN,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        padding: '6px 10px',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
        🖼️ Icono del Avatar:
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          type="button"
          onClick={() => onToggle('web')}
          title="Usar Foto de Perfil de la Web"
          style={{
            backgroundColor: avatarPref === 'web' ? 'rgba(45, 212, 191, 0.25)' : 'transparent',
            border: `1px solid ${avatarPref === 'web' ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}`,
            color: avatarPref === 'web' ? '#2DD4BF' : 'rgba(255,255,255,0.5)',
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 6,
            padding: '3px 8px',
            cursor: 'pointer',
            transition:
              'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
          }}
        >
          🌊 Web
        </button>
        <button
          type="button"
          onClick={() => onToggle('minecraft')}
          title="Usar Cabeza de Minecraft"
          style={{
            backgroundColor:
              avatarPref === 'minecraft' ? 'rgba(45, 212, 191, 0.25)' : 'transparent',
            border: `1px solid ${avatarPref === 'minecraft' ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}`,
            color: avatarPref === 'minecraft' ? '#2DD4BF' : 'rgba(255,255,255,0.5)',
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 6,
            padding: '3px 8px',
            cursor: 'pointer',
            transition:
              'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
          }}
        >
          ⛏️ Minecraft
        </button>
      </div>
    </div>
  );
};
