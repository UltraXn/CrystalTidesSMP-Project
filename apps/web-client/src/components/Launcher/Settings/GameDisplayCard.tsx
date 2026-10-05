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

interface GameDisplayCardProps {
  width: number;
  setWidth: (val: number) => void;
  height: number;
  setHeight: (val: number) => void;
  fullscreen: boolean;
  setFullscreen: (val: boolean) => void;
  mcVersion: string;
  setMcVersion: (val: string) => void;
  loaderType: string;
  setLoaderType: (val: string) => void;
}

export function GameDisplayCard({
  width,
  setWidth,
  height,
  setHeight,
  fullscreen,
  setFullscreen,
  mcVersion,
  setMcVersion,
  loaderType,
  setLoaderType,
}: Readonly<GameDisplayCardProps>) {
  return (
    <>
      <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
        <div style={sectionStyle}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' }}>
            🖥️ Resolución
          </h4>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="settings-width" style={labelStyle}>
                Ancho
              </label>
              <input
                id="settings-width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : 854)}
                disabled={fullscreen}
                style={{ marginTop: 4 }}
              />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>×</span>
            <div style={{ flex: 1 }}>
              <label htmlFor="settings-height" style={labelStyle}>
                Alto
              </label>
              <input
                id="settings-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : 480)}
                disabled={fullscreen}
                style={{ marginTop: 4 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              id="opt-fullscreen"
              checked={fullscreen}
              onChange={(e) => setFullscreen(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <label
              htmlFor="opt-fullscreen"
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
            >
              Pantalla completa
            </label>
          </div>
        </div>
      </CrystalCard>

      <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
        <div style={sectionStyle}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' }}>
            🎮 Versión del Juego
          </h4>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="settings-mc-version" style={labelStyle}>
                Minecraft
              </label>
              <select
                id="settings-mc-version"
                value={mcVersion}
                onChange={(e) => setMcVersion(e.target.value)}
                style={{ marginTop: 4 }}
              >
                <option value="1.21.1">1.21.1 (Recomendado)</option>
                <option value="1.20.1">1.20.1</option>
                <option value="1.19.4">1.19.4</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="settings-loader-type" style={labelStyle}>
                Mod Loader
              </label>
              <select
                id="settings-loader-type"
                value={loaderType}
                onChange={(e) => setLoaderType(e.target.value)}
                style={{ marginTop: 4 }}
              >
                <option value="neoforge">NeoForge</option>
                <option value="fabric">Fabric</option>
                <option value="">Ninguno (Vanilla)</option>
              </select>
            </div>
          </div>
        </div>
      </CrystalCard>
    </>
  );
}
