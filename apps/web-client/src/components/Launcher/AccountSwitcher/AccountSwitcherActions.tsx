import React from 'react';

interface AccountSwitcherActionsProps {
  onClose: () => void;
  onLogout: () => void;
  onNavigateSettings: () => void;
}

export const AccountSwitcherActions: React.FC<Readonly<AccountSwitcherActionsProps>> = ({
  onClose,
  onLogout,
  onNavigateSettings,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        paddingTop: 4,
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <button
        aria-label="Cambiar perfil de Minecraft"
        type="button"
        onClick={() => {
          onClose();
          onLogout();
        }}
        style={{
          flex: 1,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#EF4444',
          fontSize: 11,
          fontWeight: 700,
          padding: '7px 10px',
          borderRadius: 8,
          cursor: 'pointer',
          transition:
            'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
        }}
      >
        🔄 Cambiar Perfil MC
      </button>
      <button
        aria-label="Abrir ajustes del launcher"
        type="button"
        onClick={() => {
          onClose();
          onNavigateSettings();
        }}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#FFF',
          fontSize: 11,
          fontWeight: 600,
          padding: '7px 12px',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        ⚙️ Ajustes
      </button>
    </div>
  );
};
