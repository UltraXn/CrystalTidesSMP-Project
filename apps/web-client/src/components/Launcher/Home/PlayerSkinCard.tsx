import React from 'react';
import { CrystalCard } from '../CrystalCard';
import { RoleBadge } from '../RoleBadge';
import { SkinViewer } from '../SkinViewer';
import type { MinecraftCape } from '../mockLauncherState';
import { LAUNCHER_HOME_CONSTANTS } from './constants';
import { CapeManager } from './CapeManager';

export interface PlayerSkinCardProps {
  username?: string;
  uuid?: string;
  role?: string;
  sessionType?: string;
  activeCapeUrl?: string;
  userCapes: MinecraftCape[];
  selectedCapeIndex: number;
  isEquippingCape: boolean;
  onPrevCape: () => void;
  onNextCape: () => void;
  onToggleCape: () => void;
}

export const PlayerSkinCard: React.FC<Readonly<PlayerSkinCardProps>> = ({
  username = 'Invitado',
  uuid,
  role,
  sessionType,
  activeCapeUrl,
  userCapes,
  selectedCapeIndex,
  isEquippingCape,
  onPrevCape,
  onNextCape,
  onToggleCape,
}) => {
  return (
    <div
      className="reveal-up custom-scrollbar"
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
        overflowY: 'auto',
        animationDelay: '0.12s',
      }}
    >
      <CrystalCard
        enableHoverEffect={false}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '18px 16px 15px',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -70,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.14) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            zIndex: 1,
            color: '#FFF',
          }}
        >
          {username}
        </div>
        {role && <RoleBadge role={role} size="md" style={{ marginTop: 6, zIndex: 1 }} />}
        <div
          style={{
            flex: 1,
            width: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 130,
              height: 26,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(45, 212, 191, 0.3) 0%, transparent 70%)',
              filter: 'blur(6px)',
            }}
          />
          <div className="float-anim" style={{ width: '100%', height: '100%', zIndex: 1 }}>
            <SkinViewer
              username={username === 'Invitado' ? 'Steve' : username}
              uuid={uuid}
              capeUrl={activeCapeUrl}
            />
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            zIndex: 1,
            marginBottom: sessionType === LAUNCHER_HOME_CONSTANTS.SESSION_MICROSOFT ? 2 : 0,
          }}
        >
          Skin 3D interactiva
        </div>

        {sessionType === LAUNCHER_HOME_CONSTANTS.SESSION_MICROSOFT && userCapes.length > 0 && (
          <CapeManager
            userCapes={userCapes}
            selectedIndex={selectedCapeIndex}
            isEquipping={isEquippingCape}
            onPrevCape={onPrevCape}
            onNextCape={onNextCape}
            onToggleCape={onToggleCape}
          />
        )}
      </CrystalCard>
    </div>
  );
};
