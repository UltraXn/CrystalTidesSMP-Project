import React from 'react';
import { ProfileSelector } from '../ProfileSelector';
import type { Profile } from '../mockLauncherState';
import { QuickPlayButton } from './QuickPlayButton';

export interface QuickActionsDockProps {
  profilesVersion: number;
  onEditProfile: (profile: Profile) => void;
  onCreateProfile: () => void;
  onProfileChanged: () => void;
  isLaunching: boolean;
  isInGame: boolean;
  launchProgress: number;
  launchStatus: string | null;
  onPlay: () => void;
}

export const QuickActionsDock: React.FC<Readonly<QuickActionsDockProps>> = ({
  profilesVersion,
  onEditProfile,
  onCreateProfile,
  onProfileChanged,
  isLaunching,
  isInGame,
  launchProgress,
  launchStatus,
  onPlay,
}) => {
  return (
    <section
      className="reveal-up"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 12,
        animationDelay: '0.18s',
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'rgba(11, 14, 21, 0.95)',
        backdropFilter: 'blur(16px)',
        padding: '10px 12px',
        borderRadius: 14,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      <ProfileSelector
        key={profilesVersion}
        onEditProfile={onEditProfile}
        onCreateProfile={onCreateProfile}
        onProfileChanged={onProfileChanged}
      />

      <QuickPlayButton
        isLaunching={isLaunching}
        isInGame={isInGame}
        launchProgress={launchProgress}
        launchStatus={launchStatus}
        onPlay={onPlay}
      />
    </section>
  );
};
