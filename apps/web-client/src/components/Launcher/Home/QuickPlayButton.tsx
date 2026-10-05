import React from 'react';

export interface QuickPlayButtonProps {
  isLaunching: boolean;
  isInGame: boolean;
  launchProgress: number;
  launchStatus: string | null;
  onPlay: () => void;
}

const getPlayButtonText = (isLaunching: boolean, isInGame: boolean): string => {
  if (isInGame) return 'En juego';
  if (isLaunching) return 'Iniciando';
  return 'Jugar';
};

const getPlayButtonAriaLabel = (isLaunching: boolean, isInGame: boolean): string => {
  if (isLaunching) return 'Iniciando Minecraft...';
  if (isInGame) return 'En partida de Minecraft';
  return 'Iniciar juego';
};

export const QuickPlayButton: React.FC<Readonly<QuickPlayButtonProps>> = ({
  isLaunching,
  isInGame,
  launchProgress,
  launchStatus,
  onPlay,
}) => {
  const buttonLabel = getPlayButtonText(isLaunching, isInGame);
  const buttonAria = getPlayButtonAriaLabel(isLaunching, isInGame);
  const background = isInGame
    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
    : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)';
  const progressPercent = isLaunching ? launchProgress * 100 : 0;
  const showProgressBorder = isLaunching && launchProgress < 1;

  return (
    <button
      aria-label={buttonAria}
      aria-busy={isLaunching}
      type="button"
      onClick={onPlay}
      disabled={isLaunching}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        background,
        color: '#FFFFFF',
        cursor: isLaunching ? 'wait' : 'pointer',
        fontFamily: 'var(--font-family)',
        fontSize: 16,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        height: 56,
        transition:
          'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), filter 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: 0,
      }}
      onMouseEnter={(e) => {
        if (!isLaunching) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.filter = 'brightness(1.06)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.filter = 'none';
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${progressPercent}%`,
          background: 'linear-gradient(90deg, rgba(6, 40, 36, 0.35), rgba(6, 40, 36, 0.55))',
          borderRight: showProgressBorder ? '2px solid rgba(255, 255, 255, 0.65)' : 'none',
          transition: 'width 0.35s ease',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          height: '100%',
        }}
      >
        {!isLaunching && (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4.5v15l13-7.5-13-7.5z" />
          </svg>
        )}
        <span>{buttonLabel}</span>
        {isLaunching && !isInGame && (
          <span style={{ fontSize: 13, letterSpacing: '0.05em' }}>
            {Math.round(launchProgress * 100)}%
          </span>
        )}
      </div>
      {isLaunching && launchStatus && (
        <div
          style={{
            position: 'absolute',
            left: 20,
            bottom: 7,
            zIndex: 1,
            fontSize: 9.5,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(5, 42, 38, 0.75)',
          }}
        >
          {launchStatus}
        </div>
      )}
    </button>
  );
};
