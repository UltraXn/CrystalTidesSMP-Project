import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom"
import LazyWrapper from "@/components/Utils/LazyWrapper"
import { useAuth } from "@/context/AuthContext"

import Navbar from "@/components/Layout/Navbar"
import SocialSidebar from "@/components/Layout/SocialSidebar"
import ScrollToHash from "@/components/Utils/ScrollToHash"
import TypingBubbles from "@/components/Effects/TypingBubbles"
import SectionDivider from "@/components/Layout/SectionDivider"
import AmbientBubbles from "@/components/Effects/AmbientBubbles"

import Home from "@/pages/Home"
import Blog from "@/pages/Blog"
import Rules from "@/pages/Rules"
import Donors from "@/pages/Donors"
import Contests from "@/pages/Contests"
import Suggestions from "@/pages/Suggestions"
import Account from "@/pages/Account"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import Map from "@/pages/Map"
import NewsPage from "@/pages/NewsPage"
import NotFound from "@/pages/NotFound"
import Maintenance from "@/pages/Maintenance"
import Verify from "@/pages/Verify"

import Stories from "@/pages/Stories"
import Forum from "@/pages/Forum"
import ForumCategory from "@/pages/ForumCategory"
import ForumThread from "@/pages/ForumThread"
import CreateThread from "@/pages/CreateThread"
import Support from "@/pages/Support"
import TicketDetail from "@/pages/TicketDetail"

import Footer from "@/components/Layout/Footer"
import AdminPanel from "@/pages/AdminPanel"

import { useEffect, useState } from "react"

function StatusHandler({ maintenanceActive }) {
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

  const [announcement, setAnnouncement] = useState(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL
    
    // Function to apply settings
    const applySettings = (data) => {
        // Theme
        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        if(data.theme && data.theme !== 'default') {
            document.body.classList.add(`theme-${data.theme}`)
        }
        // Announcement
        setAnnouncement(data.announcement || null)
        // Maintenance
        setMaintenanceMode(data.maintenance_mode === 'true')
    }

    // Initial Load
    fetch(`${API_URL}/settings`)
        .then(res => res.json())
        .then(applySettings)
        .catch(console.error)

    // Listeners for updates from Admin Panel
    const handleTheme = (e) => {
        const newTheme = e.detail;
        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        if(newTheme && newTheme !== 'default') {
            document.body.classList.add(`theme-${newTheme}`)
        }
    }

    const handleAnnouncement = (e) => {
        setAnnouncement(e.detail || null);
    }

    // We can also listen for maintenance changes if we add dispatch in Admin Panel
    // But currently we only fetch on load. 
    // Ideally Admin Panel should dispatch 'maintenanceChanged' too.
    const handleMaintenanceEvent = (e) => {
        setMaintenanceMode(e.detail === 'true');
    }
    
    window.addEventListener('themeChanged', handleTheme);
    window.addEventListener('announcementChanged', handleAnnouncement);
    window.addEventListener('maintenanceChanged', handleMaintenanceEvent);

    return () => {
        window.removeEventListener('themeChanged', handleTheme);
        window.removeEventListener('announcementChanged', handleAnnouncement);
        window.removeEventListener('maintenanceChanged', handleMaintenanceEvent);
    }
  }, [])

  return (
    <BrowserRouter>
      <StatusHandler maintenanceActive={maintenanceMode} setMaintenanceActive={setMaintenanceMode} />
      <ScrollToHash />
      <HeaderWrapper announcement={announcement} />

      <Routes>
        <Route path="/" element={
          <main>
            <div id="home">
              <Home />
            </div>
            <SectionDivider />
            <div id="rules">
              <Rules />
            </div>
            <SectionDivider />
            <div id="donors">
              <LazyWrapper minHeight="60vh" rootMargin="600px 0px">
                <Donors />
              </LazyWrapper>
            </div>
            <SectionDivider />
            <div id="contests">
              <LazyWrapper minHeight="50vh">
                <Contests />
              </LazyWrapper>
            </div>
            <SectionDivider />
            <div id="news">
              <LazyWrapper minHeight="50vh">
                <Blog />
              </LazyWrapper>
            </div>
            <SectionDivider />
            <div id="stories">
              <LazyWrapper minHeight="80vh">
                <Stories />
              </LazyWrapper>
            </div>
            <SectionDivider />
            <div id="suggestions">
              <LazyWrapper minHeight="50vh">
                <Suggestions />
              </LazyWrapper>
            </div>
          </main>
        } />

        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/news" element={<NewsPage />} />
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

      <FooterWrapper />
      <EffectsWrapper />
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

function HeaderWrapper({ announcement }) {
  const location = useLocation()
  // Hide header on maintenance page
  if (location.pathname === '/maintenance') return null
  
  return (
    <>
      {announcement && (
        <div style={{
            background: 'var(--accent)',
            color: '#1a1a1a',
            padding: '0.4rem 1rem',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '0.9rem',
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
            <span>📢</span> {announcement}
        </div>
      )}
      <Navbar />
      <SocialSidebar />
    </>
  )
}

function FooterWrapper() {
  const location = useLocation()
  // No mostrar footer en rutas de admin, mantenimiento o cuenta
  if (location.pathname.startsWith('/admin') || location.pathname === '/maintenance' || location.pathname === '/account' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify') return null
  return <Footer />
}
