import { useEffect, Suspense, lazy } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

import Navbar from "../Layout/Navbar"
import SocialSidebar from "../Layout/SocialSidebar"
import ScrollToHash from "../Utils/ScrollToHash"
import TypingBubbles from "../Effects/TypingBubbles"
import AmbientBubbles from "../Effects/AmbientBubbles"
import BroadcastAlert from "../UI/BroadcastAlert"
import Footer from "../Layout/Footer"
import CommandPalette from "../UI/CommandPalette"
import Tutorial from "../UI/Tutorial"
import { useSiteSettings } from "../../hooks/useAdminData"
import Snowfall from "../Effects/Snowfall"
import HalloweenPop from "../Effects/HalloweenPop"

const MobileBottomNav = lazy(() => import("../Layout/MobileBottomNav"))

function StatusHandler({ maintenanceActive }: { maintenanceActive: boolean }) {
    const { user, loading } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const isAuthorized = !!user; 

    useEffect(() => {
        if (loading) return;

        if (maintenanceActive) {
             const path = location.pathname;
             const isExempt = path === '/login' || path === '/maintenance' || path.startsWith('/admin');
             
             if (!isAuthorized && !isExempt) {
                 navigate('/maintenance');
             }
        } else {
            if (location.pathname === '/maintenance') {
                navigate('/');
            }
        }
    }, [maintenanceActive, isAuthorized, location, navigate, loading]);

    return null;
}

export default function RootLayout() {
    const location = useLocation()
    const { data: settings } = useSiteSettings();
    const maintenanceMode = settings?.maintenance_mode === 'true';

    useEffect(() => {
        if (!settings) return;

        // Apply Theme
        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        if (settings.theme && settings.theme !== 'default') {
            document.body.classList.add(`theme-${settings.theme}`);
        }
    }, [settings]);

    const isGachaPage = location.pathname === '/gacha'
    const isMaintenancePage = location.pathname === '/maintenance'
    const isAdminPage = location.pathname.startsWith('/admin')
    const isAccountPage = location.pathname.startsWith('/account')
    const isStatusPage = location.pathname === '/status'

    const showHeader = !isMaintenancePage && !isAdminPage
    const showFooter = !isAdminPage && !isMaintenancePage && !isAccountPage
    const holidayTheme = settings?.theme === 'christmas' || settings?.theme === 'halloween'
    const showBubbles = !isAccountPage && !isAdminPage && !holidayTheme
    // Sidebar overlaps the machine column on gacha — keep it off there
    const showSocialSidebar = !isAdminPage && !isAccountPage && !isStatusPage && !isGachaPage

    return (
        <>
            <StatusHandler maintenanceActive={maintenanceMode} />
            <ScrollToHash />
            
            {/* Accessible skip link for keyboard navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-250 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-black focus:text-xs focus:uppercase focus:tracking-widest focus:rounded-xl focus:shadow-2xl focus:ring-2 focus:ring-(--accent)"
            >
                Saltar al contenido principal
            </a>

            {showHeader && (
                <>
                    <BroadcastAlert />
                    <Navbar />
                    <Suspense fallback={null}><MobileBottomNav /></Suspense>
                    {showSocialSidebar && <SocialSidebar />}
                </>
            )}

            <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col w-full outline-none">
                <Outlet />
            </main>

            {showFooter && <Footer />}

            {settings?.theme === 'christmas' && !isAdminPage && <Snowfall />}
            {settings?.theme === 'halloween' && !isAdminPage && <HalloweenPop />}

            {showBubbles && (
                <>
                    <TypingBubbles />
                    <AmbientBubbles />
                </>
            )}

            <Suspense fallback={null}>
                <CommandPalette />
                <Tutorial />
            </Suspense>
        </>
    )
}
