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

interface ServerConnectionCardProps {
  autoConnect: boolean;
  setAutoConnect: (val: boolean) => void;
  serverHost: string;
  setServerHost: (val: string) => void;
  serverPort: number;
  setServerPort: (val: number) => void;
}

export function ServerConnectionCard({
  autoConnect,
  setAutoConnect,
  serverHost,
  setServerHost,
  serverPort,
  setServerPort,
}: Readonly<ServerConnectionCardProps>) {
  return (
    <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
      <div style={sectionStyle}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' }}>
          🌐 Servidor
        </h4>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            id="opt-autoconnect"
            checked={autoConnect}
            onChange={(e) => setAutoConnect(e.target.checked)}
            style={{ accentColor: 'var(--primary)' }}
          />
          <label
            htmlFor="opt-autoconnect"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
          >
            Conectar automáticamente al servidor al iniciar Minecraft
          </label>
        </div>
        {autoConnect && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 3 }}>
              <label htmlFor="settings-server-host" style={labelStyle}>
                Host
              </label>
              <input
                id="settings-server-host"
                type="text"
                value={serverHost}
                onChange={(e) => setServerHost(e.target.value)}
                style={{ marginTop: 4 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="settings-server-port" style={labelStyle}>
                Puerto
              </label>
              <input
                id="settings-server-port"
                type="number"
                value={serverPort}
                onChange={(e) => setServerPort(e.target.value ? Number(e.target.value) : 25565)}
                style={{ marginTop: 4 }}
              />
            </div>
          </div>
        )}
      </div>
    </CrystalCard>
  );
}
