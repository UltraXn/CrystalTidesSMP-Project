import React, { useState, useEffect } from 'react';
import { CrystalPageHeader } from './CrystalPageHeader';
import {
  getProfiles,
  getActiveProfile,
  setSelectedProfileId,
  deleteProfile,
  cloneProfile,
  type Profile,
} from './mockLauncherState';
import { ProfileEditorDialog } from './ProfileEditorDialog';
import { ProfileCard } from './ProfileManager/ProfileCard';

export const ProfileManagerPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  // Dialog state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    const list = getProfiles();
    setProfiles(list);
    setActiveProfile(getActiveProfile());
  };

  const handleSetActive = (id: string) => {
    setSelectedProfileId(id);
    loadProfiles();
  };

  const handleCreateNew = () => {
    setEditingProfile(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setIsEditorOpen(true);
  };

  const handleClone = (id: string) => {
    try {
      cloneProfile(id);
      loadProfiles();
    } catch (err: unknown) {
      alert((err as Error).message || 'Error al clonar el perfil');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (id === 'default-profile-id') {
      alert('No se puede eliminar el perfil por defecto.');
      return;
    }
    const confirm = window.confirm(
      `¿Estás seguro de que deseas eliminar el perfil "${name}"? Esta acción no se puede deshacer.`,
    );
    if (confirm) {
      try {
        deleteProfile(id);
        loadProfiles();
      } catch (err: unknown) {
        alert((err as Error).message || 'Error al eliminar el perfil');
      }
    }
  };

  return (
    <div
      style={{
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CrystalPageHeader eyebrow="Configuración" title="Gestión de Perfiles" />
        <button
          aria-label="Crear nuevo perfil de Minecraft"
          type="button"
          onClick={handleCreateNew}
          className="btn btn-primary"
          style={{
            height: 40,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>➕</span> Crear Perfil
        </button>
      </div>

      <div style={{ marginTop: 24, textAlign: 'left' }}>
        <p
          style={{
            margin: '0 0 24px 0',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          Crea perfiles independientes para jugar diferentes versiones de Minecraft o experimentar
          con distintos conjuntos de mods. El perfil seleccionado como <strong>Activo</strong> será
          el que se ejecute al pulsar JUGAR en la pantalla principal.
        </p>

        {/* Profiles Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              isActive={activeProfile?.id === p.id}
              onEdit={handleEdit}
              onClone={handleClone}
              onDelete={handleDelete}
              onSetActive={handleSetActive}
            />
          ))}
        </div>
      </div>

      {isEditorOpen && (
        <ProfileEditorDialog
          profile={editingProfile}
          onClose={() => setIsEditorOpen(false)}
          onSave={() => {
            setIsEditorOpen(false);
            loadProfiles();
          }}
        />
      )}
    </div>
  );
};
