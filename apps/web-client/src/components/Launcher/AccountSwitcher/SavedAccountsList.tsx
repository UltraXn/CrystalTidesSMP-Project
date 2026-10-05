import React from 'react';
import type { SavedAccount } from '../mockLauncherState';

const SPACE_BETWEEN = 'space-between';

interface SavedAccountsListProps {
  savedAccounts: SavedAccount[];
  currentSessionId?: string;
  onSelectAccount: (id: string) => void;
  onRemoveAccount: (id: string) => void;
  onClose: () => void;
}

export const SavedAccountsList: React.FC<Readonly<SavedAccountsListProps>> = ({
  savedAccounts,
  currentSessionId,
  onSelectAccount,
  onRemoveAccount,
  onClose,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 2,
        }}
      >
        🎮 Perfiles de Minecraft
      </span>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          maxHeight: 150,
          overflowY: 'auto',
        }}
      >
        {savedAccounts.length > 0 ? (
          savedAccounts.map((acc: SavedAccount) => {
            const isActive = currentSessionId === acc.id;
            return (
              <div
                key={acc.id}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: SPACE_BETWEEN,
                  padding: '8px 10px',
                  borderRadius: 10,
                  backgroundColor: isActive
                    ? 'rgba(45, 212, 191, 0.12)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isActive ? 'rgba(45, 212, 191, 0.35)' : 'rgba(255, 255, 255, 0.06)'}`,
                  transition:
                    'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
                }}
              >
                <button
                  type="button"
                  disabled={isActive}
                  onClick={() => {
                    onSelectAccount(acc.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    cursor: isActive ? 'default' : 'pointer',
                  }}
                >
                  <img
                    src={`https://mc-heads.net/avatar/${acc.username}/28`}
                    alt="Head"
                    style={{ width: 26, height: 26, borderRadius: 6 }}
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#FFF' : 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {acc.username}
                    </span>
                    <span
                      style={{
                        fontSize: 9.5,
                        color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {acc.type === 'microsoft' ? 'Premium' : 'No-Premium'}
                    </span>
                  </div>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isActive && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        backgroundColor: '#2DD4BF',
                        color: '#0D1117',
                        padding: '2px 6px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                      }}
                    >
                      Activo
                    </span>
                  )}
                  {!isActive && (
                    <button
                      type="button"
                      aria-label={`Quitar cuenta de ${acc.username}`}
                      onClick={() => {
                        onRemoveAccount(acc.id);
                      }}
                      title="Quitar cuenta"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(239, 68, 68, 0.6)',
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: 2,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              fontSize: 11.5,
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              padding: '8px 0',
            }}
          >
            Sin cuentas guardadas
          </div>
        )}
      </div>
    </div>
  );
};
