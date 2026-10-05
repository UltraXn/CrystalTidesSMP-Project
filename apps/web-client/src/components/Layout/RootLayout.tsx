import { useState, useEffect, Suspense, lazy } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, m } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

import Navbar from '../Layout/Navbar';
import SocialSidebar from '../Layout/SocialSidebar';
import ScrollToHash from '../Utils/ScrollToHash';
import TypingBubbles from '../Effects/TypingBubbles';
import AmbientBubbles from '../Effects/AmbientBubbles';
import BroadcastAlert from '../UI/BroadcastAlert';
import Footer from '../Layout/Footer';
import CommandPalette from '../UI/CommandPalette';
import Tutorial from '../UI/Tutorial';
import Loader from '../UI/Loader';
import { useSiteSettings } from '../../hooks/useAdminData';
import Snowfall from '../Effects/Snowfall';
import HalloweenPop from '../Effects/HalloweenPop';

const MobileBottomNav = lazy(() => import('../Layout/MobileBottomNav'));

function useInitialLoader(durationMs = 1300) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return isInitialLoading;
}

function useLayoutTheme(theme?: string) {
  useEffect(() => {
    if (!theme) return;

    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
    if (theme !== 'default') {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);
}

function useLayoutVisibility(pathname: string, theme?: string) {
  const isGachaPage = pathname === '/gacha';
  const isMaintenancePage = pathname === '/maintenance';
  const isAdminPage = pathname.startsWith('/admin');
  const isAccountPage = pathname.startsWith('/account');
  const isStatusPage = pathname === '/status';

  const showHeader = !isMaintenancePage && !isAdminPage;
  const showFooter = !isAdminPage && !isMaintenancePage && !isAccountPage;
  const holidayTheme = theme === 'christmas' || theme === 'halloween';
  const showBubbles = !isAccountPage && !isAdminPage && !holidayTheme;
  const showSocialSidebar = !isAdminPage && !isAccountPage && !isStatusPage && !isGachaPage;

  return {
    showHeader,
    showFooter,
    showBubbles,
    showSocialSidebar,
    isAdminPage,
  };
}

function InitialAppLoader({ isVisible }: Readonly<{ isVisible: boolean }>) {
  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          key="initial-app-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <Loader fullScreen />
        </m.div>
      )}
    </AnimatePresence>
  );
}

function LayoutEffects({
  showBubbles,
  theme,
  isAdminPage,
}: Readonly<{
  showBubbles: boolean;
  theme?: string;
  isAdminPage: boolean;
}>) {
  return (
    <>
      {theme === 'christmas' && !isAdminPage && <Snowfall />}
      {theme === 'halloween' && !isAdminPage && <HalloweenPop />}
      {showBubbles && (
        <>
          <TypingBubbles />
          <AmbientBubbles />
        </>
      )}
    </>
  );
}

function StatusHandler({ maintenanceActive }: Readonly<{ maintenanceActive: boolean }>) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthorized = !!user;

  useEffect(() => {
    if (loading) return;

    if (maintenanceActive) {
      const path = location.pathname;
      const isExempt = path === '/login' || path === '/maintenance' || path.startsWith('/admin');

      if (!isAuthorized && !isExempt) {
        navigate('/maintenance');
      }
    } else if (location.pathname === '/maintenance') {
      navigate('/');
    }
  }, [maintenanceActive, isAuthorized, location, navigate, loading]);

  return null;
}

export default function RootLayout() {
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  const isInitialLoading = useInitialLoader(1300);
  useLayoutTheme(settings?.theme);

  const { showHeader, showFooter, showBubbles, showSocialSidebar, isAdminPage } =
    useLayoutVisibility(location.pathname, settings?.theme);

  const maintenanceMode = settings?.maintenance_mode === 'true';

  return (
    <>
      <InitialAppLoader isVisible={isInitialLoading} />
      <StatusHandler maintenanceActive={maintenanceMode} />
      <ScrollToHash />

      {/* Accessible skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="focus:z-250 focus:ring-(--accent) sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-xs focus:font-black focus:uppercase focus:tracking-widest focus:text-black focus:shadow-2xl focus:ring-2"
      >
        Saltar al contenido principal
      </a>

      {showHeader && (
        <>
          <BroadcastAlert />
          <Navbar />
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
          {showSocialSidebar && <SocialSidebar />}
        </>
      )}

      <main id="main-content" tabIndex={-1} className="flex w-full flex-1 flex-col outline-none">
        <Outlet />
      </main>

      {showFooter && <Footer />}

      <LayoutEffects showBubbles={showBubbles} theme={settings?.theme} isAdminPage={isAdminPage} />

      <Suspense fallback={null}>
        <CommandPalette />
        <Tutorial />
      </Suspense>
    </>
  );
}
