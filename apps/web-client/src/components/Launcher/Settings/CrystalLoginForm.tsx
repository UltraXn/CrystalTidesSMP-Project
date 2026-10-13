import React from 'react';

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(255, 255, 255, 0.6)',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
};

interface CrystalLoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isLinking: boolean;
  linkError: string | null;
  onSubmit: (e?: React.SyntheticEvent) => void;
}

export function CrystalLoginForm({
  email,
  setEmail,
  password,
  setPassword,
  isLinking,
  linkError,
  onSubmit,
}: Readonly<CrystalLoginFormProps>) {
  return (
    <div>
      <p
        style={{
          margin: '0 0 14px 0',
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.45,
        }}
      >
        Vincula tu cuenta de nuestra web oficial para sincronizar tu rango del servidor, participar
        en eventos del launcher y desbloquear características premium.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 450 }}>
        {linkError && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#FF9999',
              fontSize: 12.5,
              fontWeight: 600,
              textAlign: 'left',
              lineHeight: 1.4,
            }}
          >
            ⚠️ {linkError}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor="settings-crystal-email" style={labelStyle}>
              Correo de la Web
            </label>
            <input
              id="settings-crystal-email"
              type="text"
              placeholder="tu_correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmit();
              }}
              disabled={isLinking}
              style={{ padding: '8px 12px', fontSize: 13 }}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor="settings-crystal-password" style={labelStyle}>
              Contraseña
            </label>
            <input
              id="settings-crystal-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmit();
              }}
              disabled={isLinking}
              style={{ padding: '8px 12px', fontSize: 13 }}
            />
          </div>
        </div>
        <button
          aria-label="Conectar cuenta web"
          type="button"
          disabled={isLinking}
          onClick={() => onSubmit()}
          style={{
            marginTop: 4,
            alignSelf: 'flex-start',
            fontSize: 11,
            fontWeight: 700,
            color: '#FFF',
            background: 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 20px',
            cursor: isLinking ? 'not-allowed' : 'pointer',
            transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
            boxShadow: '0 4px 12px rgba(45, 212, 191, 0.2)',
          }}
          onMouseEnter={(e) => {
            if (isLinking) return;
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.2)';
          }}
        >
          {isLinking ? 'Conectando...' : '🌊 Conectar Cuenta Web'}
        </button>
      </div>
    </div>
  );
}
