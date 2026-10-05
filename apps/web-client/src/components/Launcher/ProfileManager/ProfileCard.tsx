import React from 'react';
import { CrystalCard } from '../CrystalCard';
import type { Profile } from '../mockLauncherState';
import { formatDate } from '../../../utils/date';

export interface ProfileCardProps {
  profile: Profile;
  isActive: boolean;
  onEdit: (profile: Profile) => void;
  onClone: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onSetActive: (id: string) => void;
}

export const ProfileCard: React.FC<Readonly<ProfileCardProps>> = ({
  profile: p,
  isActive,
  onEdit,
  onClone,
  onDelete,
  onSetActive,
}) => {
  return (
    <CrystalCard
      style={{
        padding: 20,
        border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-low)',
        backgroundColor: isActive ? 'rgba(45, 212, 191, 0.04)' : 'rgba(255,255,255,0.01)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 180,
      }}
      enableHoverEffect
    >
      <div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 26,
              padding: 10,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              boxSizing: 'border-box',
            }}
          >
            {p.iconPath &&
            (p.iconPath.startsWith('/') ||
              p.iconPath.startsWith('http') ||
              p.iconPath.includes('.')) ? (
              <img
                src={p.iconPath}
                alt="Profile icon"
                style={{ width: 28, height: 28, objectFit: 'contain' }}
              />
            ) : (
              p.iconPath || '🌊'
            )}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.name}
              </h4>
              {isActive && (
                <span
                  style={{
                    fontSize: 9,
                    padding: '2px 8px',
                    borderRadius: 4,
                    backgroundColor: 'var(--accent)',
                    color: '#000',
                    fontWeight: 'bold',
                    letterSpacing: 0.5,
                  }}
                >
                  ACTIVO
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
              MC {p.mcVersion} • {p.loaderType ? p.loaderType.toUpperCase() : 'VANILLA'}{' '}
              {p.loaderVersion}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div>
            💾 Aislamiento de carpetas:{' '}
            <strong>{p.isolateSaves ? 'Activado' : 'Desactivado'}</strong>
          </div>
          {p.lastUsed && (
            <div>
              📅 Último uso: <strong>{formatDate(p.lastUsed)}</strong>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Action group left */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => onEdit(p)}
            title="Editar perfil"
            aria-label={`Editar perfil ${p.name}`}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              transition:
                'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            ✏️ Editar
          </button>
          <button
            type="button"
            onClick={() => onClone(p.id)}
            title="Clonar perfil"
            aria-label={`Clonar perfil ${p.name}`}
            style={{
              padding: '6px 10px',
              fontSize: 12,
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              transition:
                'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            👥 Clonar
          </button>
          {p.id !== 'default-profile-id' && (
            <button
              type="button"
              onClick={() => onDelete(p.id, p.name)}
              title="Eliminar perfil"
              aria-label={`Eliminar perfil ${p.name}`}
              style={{
                padding: '6px 10px',
                fontSize: 12,
                borderRadius: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.03)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: '#FF8A8A',
                cursor: 'pointer',
                transition:
                  'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
              }}
            >
              🗑️
            </button>
          )}
        </div>

        {/* Set active toggle button */}
        {!isActive && (
          <button
            aria-label={`Activar perfil ${p.name}`}
            type="button"
            onClick={() => onSetActive(p.id)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
            }}
          >
            Activar
          </button>
        )}
      </div>
    </CrystalCard>
  );
};
