import React from 'react';
import { Search } from 'lucide-react';

interface VersionFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedLoader: string;
  onSelectLoader: (loader: string) => void;
}

const LOADERS = ['ALL', 'FABRIC', 'FORGE', 'VANILLA'] as const;

export const VersionFilterBar: React.FC<Readonly<VersionFilterBarProps>> = ({
  search,
  onSearchChange,
  selectedLoader,
  onSelectLoader,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 200,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          padding: '6px 12px',
        }}
      >
        <Search size={14} aria-hidden="true" color="rgba(255, 255, 255, 0.4)" />
        <input
          type="text"
          aria-label="Buscar versión por número o nombre"
          placeholder="Buscar por versión o nombre..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#FFF',
            fontSize: 12,
          }}
        />
      </div>

      {/* Loader Pills */}
      <div role="group" aria-label="Filtrar por mod loader" style={{ display: 'flex', gap: 6 }}>
        {LOADERS.map((loader) => (
          <button
            key={loader}
            type="button"
            aria-pressed={selectedLoader === loader}
            onClick={() => onSelectLoader(loader)}
            style={{
              background:
                selectedLoader === loader
                  ? 'linear-gradient(135deg, #2dd4bf, #0d9488)'
                  : 'rgba(255, 255, 255, 0.04)',
              border:
                selectedLoader === loader
                  ? '1px solid #2dd4bf'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              color: selectedLoader === loader ? '#022c22' : 'rgba(255, 255, 255, 0.6)',
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
            }}
          >
            {loader === 'ALL' ? 'Todos' : loader}
          </button>
        ))}
      </div>
    </div>
  );
};
