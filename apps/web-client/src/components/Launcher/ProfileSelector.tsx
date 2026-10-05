import React from 'react';
import type { Profile } from './mockLauncherState';
import { useProfileSelector } from './ProfileSelector/useProfileSelector';
import { ActiveProfileChip } from './ProfileSelector/ActiveProfileChip';
import { ProfileItemRow } from './ProfileSelector/ProfileItemRow';

interface ProfileSelectorProps {
  onEditProfile: (profile: Profile) => void;
  onCreateProfile: () => void;
  onProfileChanged?: () => void;
}

export const ProfileSelector: React.FC<Readonly<ProfileSelectorProps>> = ({
  onEditProfile,
  onCreateProfile,
  onProfileChanged,
}) => {
  const {
    profiles,
    activeProfile,
    isOpen,
    setIsOpen,
    dropdownRef,
    handleSelect,
    handleClone,
    handleDelete,
  } = useProfileSelector(onProfileChanged);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Current Active Profile Bar — chip v2 */}
      <ActiveProfileChip
        activeProfile={activeProfile}
        isOpen={isOpen}
        onToggleOpen={() => setIsOpen(!isOpen)}
      />

      {/* Dropdown List */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '110%',
            left: 0,
            width: 280,
            maxHeight: 350,
            overflowY: 'auto',
            backgroundColor: 'rgba(14, 16, 21, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid var(--border-medium)',
            borderRadius: 16,
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
            zIndex: 1000,
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 'bold',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 4,
            }}
          >
            Selecciona un Perfil
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              flex: 1,
              overflowY: 'auto',
            }}
          >
            {profiles.map((p) => (
              <ProfileItemRow
                key={p.id}
                profile={p}
                isActive={activeProfile?.id === p.id}
                onSelect={handleSelect}
                onEdit={(profile) => {
                  setIsOpen(false);
                  onEditProfile(profile);
                }}
                onClone={handleClone}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <button
            aria-label="Crear nuevo perfil"
            type="button"
            onClick={() => {
              setIsOpen(false);
              onCreateProfile();
            }}
            style={{
              marginTop: 6,
              padding: '10px 0',
              width: '100%',
              backgroundColor: 'rgba(22, 140, 128, 0.1)',
              border: '1px dashed var(--primary)',
              color: 'var(--accent)',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 'bold',
              transition:
                'color 150ms ease, background-color 150ms ease, border-color 150ms ease, opacity 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(22, 140, 128, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(22, 140, 128, 0.1)';
            }}
          >
            ➕ Nuevo Perfil
          </button>
        </div>
      )}
    </div>
  );
};
