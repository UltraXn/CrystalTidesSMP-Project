import React from 'react';

const EMOJIS = ['🌊', '🎮', '🧱', '🧩', '🚀', '⚔️', '🛡️', '✨', '🔮', '⚙️'];

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

interface ProfileBasicSectionProps {
  name: string;
  setName: (val: string) => void;
  iconPath: string;
  setIconPath: (val: string) => void;
  isolateSaves: boolean;
  setIsolateSaves: (val: boolean) => void;
  gameDir: string;
  setGameDir: (val: string) => void;
}

export function ProfileBasicSection({
  name,
  setName,
  iconPath,
  setIconPath,
  isolateSaves,
  setIsolateSaves,
  gameDir,
  setGameDir,
}: Readonly<ProfileBasicSectionProps>) {
  return (
    <>
      <div style={formSectionStyle}>
        <label htmlFor="profile-name" style={labelStyle}>
          Nombre del Perfil
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Aventura 1.20"
        />
      </div>

      <div style={formSectionStyle}>
        <div style={labelStyle}>Icono</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          {EMOJIS.map((emoji) => (
            <button
              aria-label={`Seleccionar icono ${emoji}`}
              aria-pressed={iconPath === emoji}
              type="button"
              key={emoji}
              onClick={() => setIconPath(emoji)}
              style={{
                fontSize: 20,
                padding: 8,
                borderRadius: 8,
                border:
                  iconPath === emoji ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                backgroundColor:
                  iconPath === emoji ? 'rgba(22, 140, 128, 0.15)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition:
                  'color 150ms ease, background-color 150ms ease, border-color 150ms ease, opacity 150ms ease',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            id="isolate-saves"
            checked={isolateSaves}
            onChange={(e) => setIsolateSaves(e.target.checked)}
            style={{ accentColor: 'var(--primary)' }}
          />
          <label
            htmlFor="isolate-saves"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
          >
            Aislar partidas y configuraciones de este perfil
          </label>
        </div>

        <div style={formSectionStyle}>
          <label htmlFor="profile-game-dir" style={labelStyle}>
            Directorio de Juego Personalizado (Opcional)
          </label>
          <input
            id="profile-game-dir"
            type="text"
            value={gameDir}
            onChange={(e) => setGameDir(e.target.value)}
            placeholder="C:/Ruta/Personalizada/.crystaltides"
          />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Deja en blanco para usar la ubicación oficial del launcher (~/.crystaltides).
          </span>
        </div>
      </div>
    </>
  );
}
