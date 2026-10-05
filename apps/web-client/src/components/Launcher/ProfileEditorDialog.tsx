import React from 'react';
import { Profile } from './mockLauncherState';
import { CrystalCard } from './CrystalCard';
import { CrystalButton } from './CrystalButton';
import { useProfileEditor } from './ProfileEditor/useProfileEditor';
import { ProfileBasicSection } from './ProfileEditor/ProfileBasicSection';
import { ProfileVersionSection } from './ProfileEditor/ProfileVersionSection';
import { ProfileRamSection } from './ProfileEditor/ProfileRamSection';
import { ProfileJavaSection } from './ProfileEditor/ProfileJavaSection';

interface ProfileEditorDialogProps {
  profile?: Profile | null;
  onClose: () => void;
  onSave: () => void;
}

export const ProfileEditorDialog: React.FC<Readonly<ProfileEditorDialogProps>> = ({
  profile,
  onClose,
  onSave,
}) => {
  const {
    isEdit,
    name,
    setName,
    iconPath,
    setIconPath,
    mcVersion,
    setMcVersion,
    loaderType,
    setLoaderType,
    loaderVersion,
    setLoaderVersion,
    isolateSaves,
    setIsolateSaves,
    gameDir,
    setGameDir,
    vanillaVersions,
    loaderVersions,
    isLoadingVersions,
    useCustomRam,
    setUseCustomRam,
    minRam,
    setMinRam,
    maxRam,
    setMaxRam,
    useOptimization,
    setUseOptimization,
    javaArgs,
    setJavaArgs,
    javaPath,
    setJavaPath,
    handleSave,
  } = useProfileEditor(profile, onClose, onSave);

  return (
    <dialog
      open
      aria-labelledby="profile-editor-title"
      className="modal-overlay"
      style={{
        border: 'none',
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: 'none',
        maxHeight: 'none',
        background: 'transparent',
      }}
    >
      <CrystalCard
        className="modal-content"
        style={{
          width: 520,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
        enableHoverEffect={false}
      >
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid var(--border-low)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            id="profile-editor-title"
            style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}
          >
            {isEdit ? 'Editar Perfil' : 'Crear Perfil'}
          </h2>
          <button
            aria-label="Cerrar editor de perfil"
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: 18,
              cursor: 'pointer',
              transition:
                'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)';
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: 32,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            flex: 1,
          }}
        >
          <ProfileBasicSection
            name={name}
            setName={setName}
            iconPath={iconPath}
            setIconPath={setIconPath}
            isolateSaves={isolateSaves}
            setIsolateSaves={setIsolateSaves}
            gameDir={gameDir}
            setGameDir={setGameDir}
          />

          <ProfileVersionSection
            mcVersion={mcVersion}
            setMcVersion={setMcVersion}
            vanillaVersions={vanillaVersions}
            loaderType={loaderType}
            setLoaderType={setLoaderType}
            loaderVersion={loaderVersion}
            setLoaderVersion={setLoaderVersion}
            loaderVersions={loaderVersions}
            isLoadingVersions={isLoadingVersions}
          />

          <ProfileRamSection
            useCustomRam={useCustomRam}
            setUseCustomRam={setUseCustomRam}
            minRam={minRam}
            setMinRam={setMinRam}
            maxRam={maxRam}
            setMaxRam={setMaxRam}
            useOptimization={useOptimization}
            setUseOptimization={setUseOptimization}
          />

          <ProfileJavaSection
            javaArgs={javaArgs}
            setJavaArgs={setJavaArgs}
            javaPath={javaPath}
            setJavaPath={setJavaPath}
          />
        </div>

        <div
          style={{
            padding: '20px 32px',
            borderTop: '1px solid var(--border-low)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <CrystalButton text="Cancelar" variant="ghost" onPressed={onClose} />
          <CrystalButton text="Guardar" variant="primary" onPressed={handleSave} />
        </div>
      </CrystalCard>
    </dialog>
  );
};
