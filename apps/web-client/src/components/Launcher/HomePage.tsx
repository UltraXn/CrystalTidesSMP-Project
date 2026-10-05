import React, { useState, useCallback } from 'react';
import { ProfileEditorDialog } from './ProfileEditorDialog';
import { useAuth, type Profile } from './mockLauncherState';
import {
  HeroGreetingBar,
  NewsBanner,
  PlayerSkinCard,
  QuickActionsDock,
  useHomeNews,
  useHomeCapes,
  useGameLaunch,
  useServerStatus,
} from './Home';

export interface HomePageProps {
  onNavigate?: (
    tab: 'home' | 'settings' | 'mods' | 'versions' | 'news' | 'wiki' | 'gacha' | 'servers',
  ) => void;
}

export const HomePage: React.FC<Readonly<HomePageProps>> = ({ onNavigate }) => {
  const { currentSession, crystalSession } = useAuth();

  // Server status and IP copy
  const { serverStatus, isLoadingStatus, ipCopied, handleCopyIp } = useServerStatus();

  // News carousel
  const {
    news,
    activeNewsIndex,
    setActiveNewsIndex,
    setIsHoveringCarousel,
    handlePrevNews,
    handleNextNews,
  } = useHomeNews(5);

  // Profile selection and editor
  const [profilesVersion, setProfilesVersion] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);

  const handleProfileChanged = useCallback(() => {
    setProfilesVersion((v) => v + 1);
  }, []);

  const handleEditProfile = useCallback((profile: Profile) => {
    setProfileToEdit(profile);
    setIsEditingProfile(true);
  }, []);

  const handleCreateProfile = useCallback(() => {
    setIsCreatingProfile(true);
  }, []);

  const handleCloseProfileDialog = useCallback(() => {
    setIsEditingProfile(false);
    setIsCreatingProfile(false);
    setProfileToEdit(null);
  }, []);

  // Capes
  const {
    activeCapeUrl,
    userCapes,
    selectedCapeIndex,
    isEquippingCape,
    handlePrevCape,
    handleNextCape,
    handleToggleCape,
  } = useHomeCapes(currentSession);

  // Game launching
  const { isLaunching, isInGame, launchStatus, launchProgress, launchError, handlePlay } =
    useGameLaunch(currentSession);

  return (
    <div
      style={{
        padding: '26px 28px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Hero Greeting & Server Status */}
      <HeroGreetingBar
        username={crystalSession?.username || currentSession?.username || 'Invitado'}
        role={crystalSession?.role}
        sessionType={currentSession?.type}
        serverStatus={serverStatus}
        isLoadingStatus={isLoadingStatus}
        ipCopied={ipCopied}
        onCopyIp={handleCopyIp}
      />

      {/* Main Content: News & Player Card */}
      <section style={{ flex: 1, display: 'flex', gap: 18, minHeight: 0 }}>
        <NewsBanner
          news={news}
          activeIndex={activeNewsIndex}
          onSelectIndex={setActiveNewsIndex}
          onPrev={handlePrevNews}
          onNext={handleNextNews}
          onNavigateNews={() => onNavigate?.('news')}
          onHoverChange={setIsHoveringCarousel}
        />

        <PlayerSkinCard
          username={currentSession?.username || 'Invitado'}
          uuid={currentSession?.uuid}
          role={crystalSession?.role}
          sessionType={currentSession?.type}
          activeCapeUrl={activeCapeUrl}
          userCapes={userCapes}
          selectedCapeIndex={selectedCapeIndex}
          isEquippingCape={isEquippingCape}
          onPrevCape={handlePrevCape}
          onNextCape={handleNextCape}
          onToggleCape={handleToggleCape}
        />
      </section>

      {/* Launch Error */}
      {launchError && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 10,
            padding: '10px 14px',
            color: '#FFBABA',
            fontSize: 13,
            textAlign: 'left',
          }}
        >
          ⚠️ {launchError}
        </div>
      )}

      {/* Quick Actions Dock: Profile Selector & Play Button */}
      <QuickActionsDock
        profilesVersion={profilesVersion}
        onEditProfile={handleEditProfile}
        onCreateProfile={handleCreateProfile}
        onProfileChanged={handleProfileChanged}
        isLaunching={isLaunching}
        isInGame={isInGame}
        launchProgress={launchProgress}
        launchStatus={launchStatus}
        onPlay={handlePlay}
      />

      {/* Profile Editor / Creator Dialog */}
      {(isEditingProfile || isCreatingProfile) && (
        <ProfileEditorDialog
          profile={isEditingProfile ? profileToEdit : null}
          onClose={handleCloseProfileDialog}
          onSave={handleProfileChanged}
        />
      )}
    </div>
  );
};
