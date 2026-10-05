import React from 'react';
import type { MinecraftCape } from '../mockLauncherState';
import { LAUNCHER_HOME_CONSTANTS } from './constants';

export interface CapeManagerProps {
  userCapes: MinecraftCape[];
  selectedIndex: number;
  isEquipping: boolean;
  onPrevCape: () => void;
  onNextCape: () => void;
  onToggleCape: () => void;
}

const getCapeButtonStyles = (
  isEquipping: boolean,
  isNoCape: boolean,
  isCurrentlyActive: boolean,
) => {
  let background = 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)';
  let border = 'none';
  let boxShadow = '0 4px 12px rgba(45, 212, 191, 0.25)';

  if (isNoCape) {
    background = 'rgba(239, 68, 68, 0.15)';
    border = '1px solid rgba(239, 68, 68, 0.3)';
    boxShadow = 'none';
  } else if (isCurrentlyActive) {
    background = 'rgba(255, 255, 255, 0.1)';
    border = '1px solid rgba(255, 255, 255, 0.2)';
    boxShadow = 'none';
  }

  return {
    background,
    border,
    boxShadow,
    color: isEquipping ? 'rgba(255,255,255,0.4)' : '#FFF',
    cursor: isEquipping ? 'not-allowed' : 'pointer',
  };
};

const getCapeButtonLabel = (
  isEquipping: boolean,
  isNoCape: boolean,
  isCurrentlyActive: boolean,
): string => {
  if (isEquipping) return 'Procesando...';
  if (isNoCape) return 'Quitar Capa';
  if (isCurrentlyActive) return 'Equipada';
  return 'Equipar Capa';
};

export const CapeManager: React.FC<Readonly<CapeManagerProps>> = ({
  userCapes,
  selectedIndex,
  isEquipping,
  onPrevCape,
  onNextCape,
  onToggleCape,
}) => {
  const isNoCape = selectedIndex === -1;
  const isCurrentlyActive =
    !isNoCape && userCapes[selectedIndex]?.state === LAUNCHER_HOME_CONSTANTS.ACTIVE_STATE;
  const capeDisplayName = isNoCape ? 'Sin Capa' : userCapes[selectedIndex]?.alias || 'Capa Oficial';
  const buttonStyle = getCapeButtonStyles(isEquipping, isNoCape, isCurrentlyActive);
  const buttonLabel = getCapeButtonLabel(isEquipping, isNoCape, isCurrentlyActive);

  return (
    <div
      style={{
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '90%',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 20,
          padding: '4px 12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <button
          aria-label="Capa anterior"
          type="button"
          onClick={onPrevCape}
          style={{
            background: 'none',
            border: 'none',
            color: LAUNCHER_HOME_CONSTANTS.TEXT_MUTED_60,
            fontSize: 14,
            cursor: 'pointer',
            padding: '2px 6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#2DD4BF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = LAUNCHER_HOME_CONSTANTS.TEXT_MUTED_60;
          }}
        >
          <span aria-hidden="true">◀</span>
        </button>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#FFF',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 120,
          }}
        >
          {capeDisplayName}
        </span>

        <button
          aria-label="Capa siguiente"
          type="button"
          onClick={onNextCape}
          style={{
            background: 'none',
            border: 'none',
            color: LAUNCHER_HOME_CONSTANTS.TEXT_MUTED_60,
            fontSize: 14,
            cursor: 'pointer',
            padding: '2px 6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#2DD4BF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = LAUNCHER_HOME_CONSTANTS.TEXT_MUTED_60;
          }}
        >
          <span aria-hidden="true">▶</span>
        </button>
      </div>

      <button
        aria-label={
          isNoCape
            ? 'Ocultar capa equipada'
            : `Equipar capa ${userCapes[selectedIndex]?.alias || 'Oficial'}`
        }
        aria-busy={isEquipping}
        type="button"
        disabled={isEquipping}
        onClick={onToggleCape}
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          borderRadius: 8,
          padding: '6px 16px',
          transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
          width: '90%',
          ...buttonStyle,
        }}
        onMouseEnter={(e) => {
          if (isEquipping) return;
          if (isNoCape) {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
          } else if (isCurrentlyActive) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          } else {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.35)';
          }
        }}
        onMouseLeave={(e) => {
          if (isNoCape) {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
          } else if (isCurrentlyActive) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          } else {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.25)';
          }
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
};
