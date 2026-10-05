import React, { useState } from 'react';
import { WindowTitleBar } from './WindowTitleBar';
import { useAuth } from './mockLauncherState';
import { AmbientBubbles } from './AmbientBubbles';
import { HomePage } from './HomePage';
import { NewsPage } from './NewsPage';
import { ModManagerPage } from './ModManagerPage';
import { ProfileManagerPage } from './ProfileManagerPage';
import { SettingsPage } from './SettingsPage';
import { LogsPage } from './LogsPage';
import { RewardsPage } from './RewardsPage';
import { SocialPanel } from './SocialPanel';
import { VersionSwitcherModal } from './VersionSwitcherModal';
import { CrashModal } from './CrashModal';
import { LauncherSidebar } from './MainLayout/LauncherSidebar';
import { StatsPageView } from './MainLayout/StatsPageView';

export const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState('home');
  const { crystalSession } = useAuth();
  const [showSocial, setShowSocial] = useState(false);
  const [showVersionSwitcher, setShowVersionSwitcher] = useState(false);
  const [showCrashModal, setShowCrashModal] = useState(false);

  const handleNavigatePage = (page: string) => {
    setShowVersionSwitcher(false);
    setActivePage(page);
  };

  const renderPage = () => {
    if (showVersionSwitcher) {
      return (
        <VersionSwitcherModal
          onSelectVersion={(_v, _loader) => {
            setShowVersionSwitcher(false);
          }}
          onClose={() => setShowVersionSwitcher(false)}
        />
      );
    }

    switch (activePage) {
      case 'profiles':
        return <ProfileManagerPage />;
      case 'news':
        return <NewsPage />;
      case 'mods':
        return <ModManagerPage />;
      case 'settings':
        return <SettingsPage />;
      case 'logs':
        return <LogsPage />;
      case 'rewards':
        return <RewardsPage />;
      case 'stats':
        return <StatsPageView username={crystalSession?.username} />;
      default:
        return (
          <HomePage
            onNavigate={(page) => {
              setShowVersionSwitcher(false);
              setActivePage(page);
            }}
          />
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at 50% 0%, #0d121c 0%, #060305 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <WindowTitleBar />

      <div
        style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          height: 'calc(100% - 32px)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Ambient Particles */}
        <AmbientBubbles />

        {/* Sidebar */}
        <LauncherSidebar
          activePage={activePage}
          showVersionSwitcher={showVersionSwitcher}
          showSocial={showSocial}
          onNavigatePage={handleNavigatePage}
          onToggleVersionSwitcher={() => setShowVersionSwitcher(!showVersionSwitcher)}
          onToggleSocial={() => setShowSocial(!showSocial)}
          onOpenCrashModal={() => setShowCrashModal(true)}
        />

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 2,
            background: 'transparent',
          }}
        >
          {renderPage()}
        </main>

        {/* Social Panel */}
        <SocialPanel isOpen={showSocial} onClose={() => setShowSocial(false)} />

        {/* Crash Diagnostic Modal */}
        <CrashModal
          isOpen={showCrashModal}
          onClose={() => setShowCrashModal(false)}
          onRelaunch={() => setShowCrashModal(false)}
        />
      </div>
    </div>
  );
};
