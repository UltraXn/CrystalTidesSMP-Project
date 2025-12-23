import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom"
import LazyWrapper from "./components/Utils/LazyWrapper"
import { useAuth } from "./context/AuthContext"

import Navbar from "./components/Layout/Navbar"
import SocialSidebar from "./components/Layout/SocialSidebar"
import ScrollToHash from "./components/Utils/ScrollToHash"
import TypingBubbles from "./components/Effects/TypingBubbles"
import AmbientBubbles from "./components/Effects/AmbientBubbles"
import BroadcastAlert from "./components/UI/BroadcastAlert"
import CommandPalette from "./components/UI/CommandPalette"
import Tutorial from "./components/UI/Tutorial"

import Home from "./pages/Home"
import Account from "./pages/Account"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import Map from "./pages/Map"
import NotFound from "./pages/NotFound"
import Maintenance from "./pages/Maintenance"
import Verify from "./pages/Verify"
import Staff from "./pages/Staff"
import PublicProfile from "./pages/PublicProfile"
import Gacha from "./pages/Gacha"

import Forum from "./pages/Forum"
import ForumCategory from "./pages/ForumCategory"
import ForumThread from "./pages/ForumThread"
import CreateThread from "./pages/CreateThread"
import Support from "./pages/Support"
import TicketDetail from "./pages/TicketDetail"

import Footer from "./components/Layout/Footer"
import AdminPanel from "./pages/AdminPanel"

import { useEffect, useState } from "react"

function StatusHandler({ maintenanceActive }: { maintenanceActive: boolean }) {
    const { user, loading } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    // Determine if user is authorized to bypass maintenance
    // For now, any logged in user bypasses, assuming only staff/admins login during maintenance
    // You can refine this to user?.user_metadata?.role === 'admin'
    const isAuthorized = !!user; 

    useEffect(() => {
        if (loading) return;

        if (maintenanceActive) {
             const path = location.pathname;
             // Allow access to login, maintenance page, and admin panel (and api of course)
             const isExempt = path === '/login' || path === '/maintenance' || path.startsWith('/admin');
             
             if (!isAuthorized && !isExempt) {
                 navigate('/maintenance');
             }
        } else {
            // If maintenance is OFF, but user is on /maintenance page, kick them to home
            if (location.pathname === '/maintenance') {
                navigate('/');
            }
        }
    }, [maintenanceActive, isAuthorized, location, navigate, loading]);

    return null;
}

export default function App() {

  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL
    
    // Function to apply settings
    const applySettings = (data: { theme?: string, maintenance_mode?: string }) => {
        // Theme
        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        if(data.theme && data.theme !== 'default') {
            document.body.classList.add(`theme-${data.theme}`)
        }
        // Maintenance
        setMaintenanceMode(data.maintenance_mode === 'true')
    }

    // Initial Load
    fetch(`${API_URL}/settings`)
        .then(res => res.json())
        .then(applySettings)
        .catch(console.error)

    // Listeners for updates from Admin Panel
    const handleTheme = (e: Event) => {
        const newTheme = (e as CustomEvent).detail;
        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        if(newTheme && newTheme !== 'default') {
            document.body.classList.add(`theme-${newTheme}`)
        }
    }

    const handleMaintenanceEvent = (e: Event) => {
        setMaintenanceMode((e as CustomEvent).detail === 'true');
    }
    
    window.addEventListener('themeChanged', handleTheme);
    window.addEventListener('maintenanceChanged', handleMaintenanceEvent);

    return () => {
        window.removeEventListener('themeChanged', handleTheme);
        window.removeEventListener('maintenanceChanged', handleMaintenanceEvent);
    }
  }, [])

  return (
    <BrowserRouter>
      <StatusHandler maintenanceActive={maintenanceMode} />
      <ScrollToHash />
      <HeaderWrapper />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/staff" element={<LazyWrapper><Staff /></LazyWrapper>} />
            <Route path="/u/:username" element={<LazyWrapper><PublicProfile /></LazyWrapper>} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/gacha" element={<LazyWrapper><Gacha /></LazyWrapper>} />
            <Route path="/admin" element={<AdminPanel />} />

            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/create" element={<CreateThread />} />
            <Route path="/forum/:id" element={<ForumCategory />} />
            <Route path="/forum/thread/:type/:id" element={<ForumThread />} />
            <Route path="/map" element={<Map />} />
            
            <Route path="/support" element={<LazyWrapper><Support /></LazyWrapper>} />
            <Route path="/support/:id" element={<LazyWrapper><TicketDetail /></LazyWrapper>} />

            <Route path="/verify" element={<Verify />} />

            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <FooterWrapper />
      <EffectsWrapper />
      <CommandPalette />
      <Tutorial />
    </BrowserRouter>
  )
}

function EffectsWrapper() {
  const location = useLocation()
  // Disable bubbles on Account page to keep it clean
  if (location.pathname === '/account') return null
  return (
    <>
      <TypingBubbles />
      <AmbientBubbles />
    </>
  )
}

function HeaderWrapper() {
  const location = useLocation()
  // Hide header on maintenance page
  if (location.pathname === '/maintenance') return null
  
  return (
    <>
      <BroadcastAlert />
      <Navbar />
      {!location.pathname.startsWith('/admin') && <SocialSidebar />}
    </>
  )
}

function FooterWrapper() {
  const location = useLocation()
  // No mostrar footer en rutas de admin, mantenimiento o cuenta
  if (location.pathname.startsWith('/admin') || location.pathname === '/maintenance' || location.pathname === '/account' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify') return null
  return <Footer />
}
