import React from 'react';

const formSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  textAlign: 'left',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-muted)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

interface LoaderVersionControlProps {
  isLoadingVersions: boolean;
  loaderVersions: string[];
  loaderVersion: string;
  setLoaderVersion: (val: string) => void;
}

function LoaderVersionControl({
  isLoadingVersions,
  loaderVersions,
  loaderVersion,
  setLoaderVersion,
}: Readonly<LoaderVersionControlProps>) {
  if (isLoadingVersions) {
    return (
      <select id="profile-loader-version" disabled style={{ opacity: 0.7 }}>
        <option>Cargando versiones...</option>
      </select>
    );
  }

  if (loaderVersions.length === 0) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          id="profile-loader-version"
          type="text"
          value={loaderVersion}
          onChange={(e) => setLoaderVersion(e.target.value)}
          placeholder="Ej: 47.1.3"
          aria-label="Versión del Loader"
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', alignSelf: 'center' }}>
          ⚠️ Manual
        </span>
      </div>
    );
  }

  return (
    <select
      id="profile-loader-version"
      value={loaderVersion}
      onChange={(e) => setLoaderVersion(e.target.value)}
    >
      {loaderVersions.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
}

export type LoaderType = 'vanilla' | 'neoforge' | 'fabric' | 'forge' | '';

interface ProfileVersionSectionProps {
  mcVersion: string;
  setMcVersion: (val: string) => void;
  vanillaVersions: string[];
  loaderType: LoaderType;
  setLoaderType: (val: LoaderType) => void;
  loaderVersion: string;
  setLoaderVersion: (val: string) => void;
  loaderVersions: string[];
  isLoadingVersions: boolean;
}

export function ProfileVersionSection({
  mcVersion,
  setMcVersion,
  vanillaVersions,
  loaderType,
  setLoaderType,
  loaderVersion,
  setLoaderVersion,
  loaderVersions,
  isLoadingVersions,
}: Readonly<ProfileVersionSectionProps>) {
  return (
    <>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ ...formSectionStyle, flex: 1 }}>
          <label htmlFor="profile-mc-version" style={labelStyle}>
            Versión de Minecraft
          </label>
          <select
            id="profile-mc-version"
            value={mcVersion}
            onChange={(e) => setMcVersion(e.target.value)}
          >
            {vanillaVersions.length === 0 ? (
              <>
                <option value="1.21.1">1.21.1 (Recomendado)</option>
                <option value="1.20.1">1.20.1</option>
                <option value="1.19.4">1.19.4</option>
              </>
            ) : (
              vanillaVersions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))
            )}
          </select>
        </div>
        <div style={{ ...formSectionStyle, flex: 1 }}>
          <label htmlFor="profile-loader-type" style={labelStyle}>
            Cargador (Mod Loader)
          </label>
          <select
            id="profile-loader-type"
            value={loaderType}
            onChange={(e) => {
              const type = e.target.value as 'vanilla' | 'neoforge' | 'fabric' | 'forge' | '';
              setLoaderType(type);
            }}
          >
            <option value="neoforge">NeoForge</option>
            <option value="fabric">Fabric</option>
            <option value="forge">Forge</option>
            <option value="vanilla">Vanilla (Sin Mods)</option>
          </select>
        </div>
      </div>

      {loaderType !== 'vanilla' && loaderType !== '' && (
        <div style={formSectionStyle}>
          <label htmlFor="profile-loader-version" style={labelStyle}>
            Versión del Cargador
          </label>
          <LoaderVersionControl
            isLoadingVersions={isLoadingVersions}
            loaderVersions={loaderVersions}
            loaderVersion={loaderVersion}
            setLoaderVersion={setLoaderVersion}
          />
        </div>
      )}
    </>
  );
}
