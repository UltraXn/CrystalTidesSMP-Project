import React from 'react';
import { CrystalCard } from '../CrystalCard';

interface CurseForgeKeyCardProps {
  cfApiKeyInput: string;
  setCfApiKeyInput: (val: string) => void;
  onSaveCfApiKey: () => void;
}

export const CurseForgeKeyCard: React.FC<Readonly<CurseForgeKeyCardProps>> = ({
  cfApiKeyInput,
  setCfApiKeyInput,
  onSaveCfApiKey,
}) => {
  return (
    <CrystalCard
      style={{
        padding: '16px 20px',
        border: '1px solid var(--danger)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        textAlign: 'left',
      }}
      enableHoverEffect={false}
    >
      <h4 style={{ margin: 0, color: '#FF8A8A', fontSize: 14, fontWeight: 'bold' }}>
        ⚠️ Requiere CurseForge API Key
      </h4>
      <p
        style={{
          margin: '4px 0 12px 0',
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.4,
        }}
      >
        Para buscar y descargar mods desde CurseForge, ingresa tu clave API personal de CurseForge a
        continuación. La clave se guardará de forma segura en tu navegador.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          aria-label="Clave API de CurseForge"
          type="password"
          placeholder="Clave API (x-api-key)..."
          value={cfApiKeyInput}
          onChange={(e) => setCfApiKeyInput(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: '#FFFFFF',
            fontSize: 12,
            outline: 'none',
          }}
        />
        <button
          aria-label="Guardar clave API de CurseForge"
          type="button"
          onClick={onSaveCfApiKey}
          className="btn btn-primary pressable"
          style={{ borderRadius: 8, padding: '0 20px', fontSize: 12, height: 38 }}
        >
          Guardar
        </button>
      </div>
    </CrystalCard>
  );
};
