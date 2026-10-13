import React from 'react';
import type { Profile } from '../mockLauncherState';

export interface ProfileItemRowProps {
  profile: Profile;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (p: Profile) => void;
  onClone: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const ProfileItemRow: React.FC<Readonly<ProfileItemRowProps>> = ({
  profile: p,
  isActive,
  onSelect,
  onEdit,
  onClone,
  onDelete,
}) => {
  return (
    <div
      className="profile-item-row"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        borderRadius: 10,
        backgroundColor: isActive ? 'rgba(22, 140, 128, 0.12)' : 'transparent',
        border: 'none',
        transition: 'background-color 150ms ease',
      }}
    >
      <button
        type="button"
        aria-label={`Seleccionar perfil ${p.name}`}
        onClick={() => onSelect(p.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flex: 1,
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            fontSize: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {p.iconPath &&
          (p.iconPath.startsWith('/') ||
            p.iconPath.startsWith('http') ||
            p.iconPath.includes('.')) ? (
            <img
              src={p.iconPath}
              alt="Icon"
              style={{ width: 18, height: 18, objectFit: 'contain' }}
            />
          ) : (
            p.iconPath || '🌊'
          )}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              color: isActive ? 'var(--accent)' : '#FFFFFF',
            }}
          >
            {p.name}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.4)' }}>
            {p.mcVersion} ({p.loaderType || 'vanilla'})
          </span>
        </div>
      </button>

      {/* Actions buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          type="button"
          aria-label={`Editar perfil ${p.name}`}
          onClick={() => onEdit(p)}
          title="Editar perfil"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            padding: 4,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          ✏️
        </button>
        <button
          type="button"
          aria-label={`Clonar perfil ${p.name}`}
          onClick={(e) => onClone(e, p.id)}
          title="Clonar perfil"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            padding: 4,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          👥
        </button>
        {p.id !== 'default-profile-id' && (
          <button
            type="button"
            aria-label={`Eliminar perfil ${p.name}`}
            onClick={(e) => onDelete(e, p.id)}
            title="Eliminar perfil"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              padding: 4,
              color: 'var(--danger)',
            }}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};
