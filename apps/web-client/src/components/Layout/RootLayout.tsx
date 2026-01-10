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

    const isMaintenancePage = location.pathname === '/maintenance'
    const isAdminPage = location.pathname.startsWith('/admin')
    const isAuthPage = ['/login', '/register', '/verify'].includes(location.pathname)
    const isAccountPage = location.pathname.startsWith('/account')
    const isStatusPage = location.pathname === '/status'

    const showHeader = !isMaintenancePage && !isAdminPage
    const showFooter = !isAdminPage && !isMaintenancePage && !isAccountPage && !isAuthPage
    const showBubbles = !isAccountPage && !isAdminPage
    const showSocialSidebar = !isAdminPage && !isAccountPage && !isStatusPage

    return (
        <>
            <StatusHandler maintenanceActive={maintenanceMode} />
            <ScrollToHash />
            
            {showHeader && (
                <>
                    <BroadcastAlert />
                    <Navbar />
                    <Suspense fallback={null}><MobileBottomNav /></Suspense>
                    {showSocialSidebar && <SocialSidebar />}
                </>
            )}

            <main className="flex-1 flex flex-col w-full">
                <Outlet />
            </main>

            {showFooter && <Footer />}

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
