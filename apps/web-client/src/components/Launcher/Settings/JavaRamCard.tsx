import React from 'react';
import { CrystalCard } from '../CrystalCard';

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  textAlign: 'left',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(255, 255, 255, 0.6)',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
};

interface JavaRamCardProps {
  tempMaxRam: number;
  setTempMaxRam: (val: number) => void;
  useOptimization: boolean;
  setUseOptimization: (val: boolean) => void;
  javaPath: string;
  setJavaPath: (val: string) => void;
}

export function JavaRamCard({
  tempMaxRam,
  setTempMaxRam,
  useOptimization,
  setUseOptimization,
  javaPath,
  setJavaPath,
}: Readonly<JavaRamCardProps>) {
  return (
    <>
      <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
        <div style={sectionStyle}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' }}>
            🧠 Memoria RAM
          </h4>
          <div>
            <label htmlFor="settings-max-ram" style={labelStyle}>
              Máxima ({tempMaxRam} GB)
            </label>
            <input
              id="settings-max-ram"
              type="range"
              min={2}
              max={16}
              step={1}
              value={tempMaxRam}
              onChange={(e) => setTempMaxRam(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', marginTop: 8 }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <span>2 GB</span>
              <span>16 GB</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              id="opt-jvm"
              checked={useOptimization}
              onChange={(e) => setUseOptimization(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <label
              htmlFor="opt-jvm"
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
            >
              Activar optimizaciones de G1GC (Recomendado)
            </label>
          </div>
        </div>
      </CrystalCard>

      <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
        <div style={sectionStyle}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' }}>
            ☕ Ruta de Java (opcional)
          </h4>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Deja vacío para usar el Java automático gestionado por el launcher.
          </p>
          <input
            id="settings-java-path"
            aria-label="Ruta personalizada del ejecutable de Java"
            type="text"
            placeholder="C:\Program Files\Java\jdk-21\bin\java.exe"
            value={javaPath}
            onChange={(e) => setJavaPath(e.target.value)}
          />
        </div>
      </CrystalCard>
    </>
  );
}
