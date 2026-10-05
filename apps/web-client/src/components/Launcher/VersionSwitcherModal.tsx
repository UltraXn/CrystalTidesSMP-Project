import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { VersionCardData } from './VersionSwitcher/versionSwitcherData';
import { DEFAULT_VERSIONS } from './VersionSwitcher/versionSwitcherData';
import { VersionFilterBar } from './VersionSwitcher/VersionFilterBar';
import { VersionCard } from './VersionSwitcher/VersionCard';

export type { VersionCardData };

export const VersionSwitcherModal: React.FC<{
  onSelectVersion: (version: string, loader: string) => void;
  onClose: () => void;
}> = ({ onSelectVersion, onClose }) => {
  const [versions, setVersions] = useState<VersionCardData[]>(DEFAULT_VERSIONS);
  const [search, setSearch] = useState('');
  const [selectedLoader, setSelectedLoader] = useState<string>('ALL');

  const filtered = versions.filter((v) => {
    const matchesSearch =
      v.major.includes(search) ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.selectedSub.includes(search);
    const matchesLoader = selectedLoader === 'ALL' || v.loader.toUpperCase() === selectedLoader;
    return matchesSearch && matchesLoader;
  });

  const handleSubChange = (index: number, newSub: string) => {
    setVersions((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, selectedSub: newSub } : item)),
    );
  };

  return (
    <dialog
      open
      aria-labelledby="version-switcher-heading"
      style={{
        padding: '24px 32px',
        height: '100%',
        width: '100%',
        maxWidth: 'none',
        border: 'none',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxSizing: 'border-box',
        overflowY: 'auto',
        backgroundColor: '#07040a',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#2dd4bf',
              marginBottom: 4,
            }}
          >
            Selector de Versiones
          </div>
          <h1
            id="version-switcher-heading"
            style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#FFF' }}
          >
            Elige tu versión de juego
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'rgba(255, 255, 255, 0.55)' }}>
            Navega entre lanzamientos de Minecraft y gestiona perfiles con un solo clic.
          </p>
        </div>

        <button
          type="button"
          aria-label="Volver al inicio"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFF',
            padding: '8px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <X size={15} aria-hidden="true" /> Volver al Inicio
        </button>
      </div>

      {/* Filter Bar */}
      <VersionFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedLoader={selectedLoader}
        onSelectLoader={setSelectedLoader}
      />

      {/* Version Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((item, index) => (
          <VersionCard
            key={item.major}
            item={item}
            index={index}
            onSubChange={handleSubChange}
            onSelectVersion={onSelectVersion}
            onClose={onClose}
          />
        ))}
      </div>
    </dialog>
  );
};
