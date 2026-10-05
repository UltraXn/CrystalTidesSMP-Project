import React from 'react';
import { Play, Settings2 } from 'lucide-react';
import type { VersionCardData } from './versionSwitcherData';

interface VersionCardProps {
  item: VersionCardData;
  index: number;
  onSubChange: (index: number, newSub: string) => void;
  onSelectVersion: (version: string, loader: string) => void;
  onClose: () => void;
}

export const VersionCard: React.FC<Readonly<VersionCardProps>> = ({
  item,
  index,
  onSubChange,
  onSelectVersion,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: item.bgGradient,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 180,
        overflow: 'hidden',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.5)',
        transition: 'transform 200ms ease, border-color 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }}
    >
      {/* Top Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <select
          aria-label="Seleccionar subversión"
          value={item.selectedSub}
          onChange={(e) => onSubChange(index, e.target.value)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFF',
            fontSize: 11,
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: 8,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {item.subVersions.map((sub) => (
            <option key={sub} value={sub} style={{ background: '#0f172a' }}>
              {sub}
            </option>
          ))}
        </select>

        {item.tag && (
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: 999,
              backgroundColor:
                item.tag === 'RECOMENDADO' ? 'rgba(45, 212, 191, 0.2)' : 'rgba(168, 85, 247, 0.3)',
              color: item.tag === 'RECOMENDADO' ? '#2dd4bf' : '#c084fc',
              border: `1px solid ${item.tag === 'RECOMENDADO' ? 'rgba(45, 212, 191, 0.4)' : 'rgba(168, 85, 247, 0.5)'}`,
            }}
          >
            {item.tag}
          </span>
        )}
      </div>

      {/* Center Big Version Number */}
      <div style={{ margin: '14px 0', zIndex: 2 }}>
        <div
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          {item.major}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: 4,
            fontWeight: 600,
          }}
        >
          {item.name} • <span style={{ color: '#2dd4bf' }}>{item.loader}</span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 2 }}>
        <button
          type="button"
          aria-label={`Jugar versión ${item.selectedSub} con ${item.loader}`}
          onClick={() => {
            onSelectVersion(item.selectedSub, item.loader);
            onClose();
          }}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
            border: 'none',
            borderRadius: 10,
            color: '#022c22',
            fontSize: 12,
            fontWeight: 800,
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 4px 14px rgba(45, 212, 191, 0.3)',
            transition: 'transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease',
          }}
        >
          <Play size={13} fill="#022c22" aria-hidden="true" /> JUGAR {item.selectedSub}
        </button>

        <button
          type="button"
          aria-label={`Configuración de versión ${item.major}`}
          title="Configuración de versión"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 10,
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <Settings2 size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
