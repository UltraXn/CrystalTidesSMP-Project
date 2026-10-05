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

interface ProfileRamSectionProps {
  useCustomRam: boolean;
  setUseCustomRam: (val: boolean) => void;
  minRam: number;
  setMinRam: (val: number) => void;
  maxRam: number;
  setMaxRam: (val: number) => void;
  useOptimization: boolean;
  setUseOptimization: (val: boolean) => void;
}

export function ProfileRamSection({
  useCustomRam,
  setUseCustomRam,
  minRam,
  setMinRam,
  maxRam,
  setMaxRam,
  useOptimization,
  setUseOptimization,
}: Readonly<ProfileRamSectionProps>) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: 16,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="checkbox"
          id="custom-ram"
          checked={useCustomRam}
          onChange={(e) => setUseCustomRam(e.target.checked)}
          style={{ accentColor: 'var(--primary)' }}
        />
        <label
          htmlFor="custom-ram"
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
        >
          Personalizar Memoria RAM
        </label>
      </div>

      {useCustomRam && (
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ ...formSectionStyle, flex: 1 }}>
            <label htmlFor="profile-ram-min" style={labelStyle}>
              Mínima (MB)
            </label>
            <input
              id="profile-ram-min"
              type="number"
              value={minRam}
              onChange={(e) => {
                const raw = e.target.value;
                const val = raw ? Number.parseInt(raw, 10) : 0;
                setMinRam(Number.isNaN(val) ? 0 : Math.max(0, val));
              }}
            />
          </div>
          <div style={{ ...formSectionStyle, flex: 1 }}>
            <label htmlFor="profile-ram-max" style={labelStyle}>
              Máxima (MB)
            </label>
            <input
              id="profile-ram-max"
              type="number"
              value={maxRam}
              onChange={(e) => {
                const raw = e.target.value;
                const val = raw ? Number.parseInt(raw, 10) : 0;
                setMaxRam(Number.isNaN(val) ? 0 : Math.max(0, val));
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="checkbox"
          id="use-optimization"
          checked={useOptimization}
          onChange={(e) => setUseOptimization(e.target.checked)}
          style={{ accentColor: 'var(--primary)' }}
        />
        <label
          htmlFor="use-optimization"
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
        >
          Activar optimizaciones G1GC (Recomendado)
        </label>
      </div>
    </div>
  );
}
