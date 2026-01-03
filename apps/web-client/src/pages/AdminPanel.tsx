import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { 
    FaShieldAlt, FaChartPie, FaUsers, FaTicketAlt, FaLightbulb, 
    FaPoll, FaCalendarAlt, FaNewspaper, FaGamepad, FaIdCard, FaTimes, 
    FaBriefcase, FaListUl, FaCog, FaArrowLeft, FaBook, FaDonate, FaGift, FaMapMarkerAlt
} from "react-icons/fa"
import { useTranslation } from 'react-i18next'
import Loader from "../components/UI/Loader"
import { get2FAStatus } from '../services/twoFactorService'
import { getAdminToken } from '../services/adminAuth'
import Admin2FAModal from '../components/Admin/Admin2FAModal'
import { supabase } from '../services/supabaseClient'
import { useScrollDirection } from "../hooks/useScrollDirection"
import '../styles/admin-layout.css'
import '../styles/admin.css'
import '../styles/admin_kanban.css'
import '../styles/admin_calendar.css'
import '../styles/admin_staff.css'
import '../styles/admin_polls.css'
import '../styles/admin_events.css'
import '../styles/admin_news.css'
import '../styles/admin_gamification.css'
import '../styles/admin_donors.css'
import '../styles/admin_donations.css'

// Sub-componentes del Admin Panel
import DashboardOverview from "../components/Admin/DashboardOverview"
import UsersManager from "../components/Admin/UsersManager"
import TicketsManager from "../components/Admin/TicketsManager"
import AuditLog from "../components/Admin/AuditLog"
import AdminNews from "../components/Admin/AdminNews"
import SuggestionsManager from "../components/Admin/SuggestionsManager"
import PollsManager from "../components/Admin/PollsManager"
import EventsManager from "../components/Admin/EventsManager"
import StaffWorkspace from "../components/Admin/StaffHub/StaffWorkspace"
import SiteConfig from "../components/Admin/SiteConfig"

import DonationsManager from "../components/Admin/DonationsManager"
import GamificationManager from "../components/Admin/GamificationManager"
import StaffCardsManager from "../components/Admin/StaffCardsManager"
import AdminDocs from "../components/Admin/AdminDocs"
import WikiManager from "../components/Admin/WikiManager"
import LocationsManager from "../components/Admin/Config/LocationsManager"
import AdminMobileNavbar from "../components/Admin/AdminMobileNavbar"


export default function AdminPanel() {
    const { t, i18n } = useTranslation()
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
    const scrollDirection = useScrollDirection();
    
    // 2FA Logic
    const [show2FAModal, setShow2FAModal] = useState(false)

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024
            setIsMobile(mobile)
            if (!mobile) setSidebarOpen(true)
            else if (mobile && window.innerWidth < 1024) setSidebarOpen(false) // Auto-close on resize to mobile
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Lock body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobile, sidebarOpen])

    // Check 2FA Status
    useEffect(() => {
        if (loading) return
        if (!user) {
            return
        }

        const check2FA = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session?.access_token) {
                    return
                }

                const res = await get2FAStatus(session.access_token)
                if (res.success && res.data.enabled) {
                    const adminToken = getAdminToken()
                    if (!adminToken) {
                        setShow2FAModal(true)
                    }
                }
            } catch (err) {
                console.error("Error checking 2FA:", err)
            }
        }

        check2FA()
    }, [user, loading])

    // Verificación Real de Permisos
    const allowedRoles = ['admin', 'neroferno', 'killu', 'helper', 'developer', 'staff']
    const isAdmin = allowedRoles.includes(user?.user_metadata?.role?.toLowerCase())
    
    // Roles con acceso privilegiado (Configuración y Equipo)
    const superAdminRoles = ['neroferno', 'killu', 'developer'];
    const hasSecureAccess = superAdminRoles.some(role => user?.user_metadata?.role?.toLowerCase().includes(role));

    useEffect(() => {
        if (!loading && !user) navigate('/login')
    }, [user, loading, navigate])

    if (loading) return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display:'flex', 
            flexDirection: 'column',
            alignItems:'center', 
            justifyContent: 'center',
            background: '#080808',
            color: '#fff'
        }}>
            <Loader text={t('admin.loading_panel')} style={{ height: 'auto', minHeight: 'auto', transform: 'scale(1.2)' }} />
        </div>
    );
    
    if (!isAdmin) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                color: '#ef4444',
                flexDirection: 'column',
                gap: '1rem',
                zIndex: 9999
            }}>
                <FaShieldAlt size={64} />
                <h1 style={{fontSize: '2rem'}}>{t('admin.access_denied.title')}</h1>
                <p style={{color: '#aaa'}}>{t('admin.access_denied.msg')}</p>
                <button onClick={() => navigate('/')} className="btn-primary" style={{marginTop: '1rem'}}>
                    {t('admin.access_denied.back_home')}
                </button>
            </div>
        )
    }

    return (
        <div className="admin-layout-container">
            
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    className="admin-mobile-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Left - Responsive */}
            <aside className={`admin-layout-sidebar ${isMobile && sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div>
                        <h3 className="admin-brand-title">
                            Crystal Panel
                        </h3>
                        <div className="admin-version-tag">
                            v1.2.0 Beta
                        </div>
                    </div>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} className="admin-sidebar-close">
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="xp-sidebar-nav">
                    {/* Botón Volver al Inicio */}
                    <button
                        className="xp-sidebar-btn back-btn"
                        onClick={() => navigate('/')}
                    >
                        <span className="icon"><FaArrowLeft /></span>
                        {t('admin.back_home', 'Volver al Inicio')}
                    </button>

                    <div className="xp-sidebar-header">{t('admin.sidebar.general')}</div>
                    <SidebarItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); if(isMobile) setSidebarOpen(false); }} icon={<FaChartPie />} label={t('admin.tabs.general')} />
                    {hasSecureAccess && (
                        <SidebarItem active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); if(isMobile) setSidebarOpen(false); }} icon={<FaCog />} label={t('admin.tabs.settings')} />
                    )}
                    <SidebarItem active={activeTab === 'logs'} onClick={() => { setActiveTab('logs'); if(isMobile) setSidebarOpen(false); }} icon={<FaListUl />} label={t('admin.tabs.logs')} />

                    <SidebarItem active={activeTab === 'docs'} onClick={() => { setActiveTab('docs'); if(isMobile) setSidebarOpen(false); }} icon={<FaBook />} label={t('admin.tabs.docs')} />

                    <div className="xp-sidebar-header">{t('admin.sidebar.community')}</div>
                    <SidebarItem active={activeTab === 'users'} onClick={() => { setActiveTab('users'); if(isMobile) setSidebarOpen(false); }} icon={<FaUsers />} label={t('admin.tabs.users')} />
                    <SidebarItem active={activeTab === 'donations'} onClick={() => { setActiveTab('donations'); if(isMobile) setSidebarOpen(false); }} icon={<FaDonate />} label={t('admin.tabs.donations')} /> 
                    <SidebarItem active={activeTab === 'news'} onClick={() => { setActiveTab('news'); if(isMobile) setSidebarOpen(false); }} icon={<FaNewspaper />} label={t('admin.tabs.news')} />
                    <SidebarItem active={activeTab === 'events'} onClick={() => { setActiveTab('events'); if(isMobile) setSidebarOpen(false); }} icon={<FaCalendarAlt />} label={t('admin.tabs.events')} />
                    <SidebarItem active={activeTab === 'gamification'} onClick={() => { setActiveTab('gamification'); if(isMobile) setSidebarOpen(false); }} icon={<FaGamepad />} label={t('admin.tabs.gamification')} />
                    <SidebarItem active={activeTab === 'suggestions'} onClick={() => { setActiveTab('suggestions'); if(isMobile) setSidebarOpen(false); }} icon={<FaLightbulb />} label={t('admin.tabs.suggestions')} />
                    <SidebarItem active={activeTab === 'polls'} onClick={() => { setActiveTab('polls'); if(isMobile) setSidebarOpen(false); }} icon={<FaPoll />} label={t('admin.tabs.polls')} />
                    <SidebarItem active={activeTab === 'wiki'} onClick={() => { setActiveTab('wiki'); if(isMobile) setSidebarOpen(false); }} icon={<FaBook />} label={t('admin.tabs.wiki', 'Wiki / Gamepedia')} />
                    <SidebarItem active={activeTab === 'locations'} onClick={() => { setActiveTab('locations'); if(isMobile) setSidebarOpen(false); }} icon={<FaMapMarkerAlt />} label={t('admin.tabs.locations', 'Lugares y Lore')} />
                    <SidebarItem active={activeTab === 'gacha_dev'} onClick={() => { navigate('/gacha'); if(isMobile) setSidebarOpen(false); }} icon={<FaGift style={{ color: '#ff8000' }} />} label="Gacha (Dev/Internal)" />

                    <div className="xp-sidebar-header">{t('admin.sidebar.staff_management')}</div>
                    <SidebarItem active={activeTab === 'staff_hub'} onClick={() => { setActiveTab('staff_hub'); if(isMobile) setSidebarOpen(false); }} icon={<FaBriefcase />} label={t('admin.tabs.staff_hub')} />
                    {hasSecureAccess && (
                        <SidebarItem active={activeTab === 'team'} onClick={() => { setActiveTab('team'); if(isMobile) setSidebarOpen(false); }} icon={<FaIdCard />} label={t('admin.tabs.team')} />
                    )}
                    <SidebarItem active={activeTab === 'tickets'} onClick={() => { setActiveTab('tickets'); if(isMobile) setSidebarOpen(false); }} icon={<FaTicketAlt />} label={t('admin.tabs.tickets')} />


                </div>
            </aside>

            {/* Main Surface - Offset by Sidebar width */}
            <div className="admin-layout-main">

                
                <header className={`admin-layout-header ${isMobile && scrollDirection === 'down' ? 'hide' : ''}`}>
                    <div className="admin-header-left">
                        <h2 className="admin-page-title">
                            {t(`admin.headers.${activeTab}`, activeTab.replace('_', ' '))}
                        </h2>
                    </div>
                    

                    <div className="admin-header-right">
                        
                        {/* Language Toggle */}
                        <div className="admin-lang-toggle">
                            <button 
                                onClick={() => i18n.changeLanguage('es')} 
                                className={`lang-btn ${i18n.language === 'es' ? 'active' : ''}`}
                            >
                                ES
                            </button>
                            <button 
                                onClick={() => i18n.changeLanguage('en')} 
                                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                            >
                                EN
                            </button>
                        </div>

                         <div className="admin-user-info-box">
                            <div className="username-text">
                                <div className="username-display">{user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}</div>
                                <button 
                                    onClick={() => setShow2FAModal(true)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: 'rgba(255,255,255,0.4)', 
                                        fontSize: '0.7rem', 
                                        cursor: 'pointer',
                                        padding: 0,
                                        marginTop: '2px'
                                    }}
                                    className="hover:text-white"
                                >
                                    {t('admin.verify_2fa', 'Verificar 2FA')}
                                </button>
                            </div>
                            <UserRoleDisplay role={user?.user_metadata?.role || 'user'} />
                        </div>
                    </div>
                </header>

                <main className="admin-layout-content">
                    {activeTab === 'overview' && <DashboardOverview />}
                    {activeTab === 'tickets' && <TicketsManager />}
                    {activeTab === 'users' && <UsersManager />}
                    {activeTab === 'suggestions' && <SuggestionsManager />}
                    {activeTab === 'polls' && <PollsManager />}
                    {activeTab === 'events' && <EventsManager />}
                    {activeTab === 'news' && <AdminNews user={user} />}
                    {activeTab === 'donations' && <DonationsManager />}
                    {activeTab === 'gamification' && <GamificationManager />}
                    {activeTab === 'team' && hasSecureAccess && <StaffCardsManager />}
                    {activeTab === 'staff_hub' && <StaffWorkspace />}
                    {activeTab === 'wiki' && <WikiManager />}
                    {activeTab === 'locations' && <LocationsManager />}
                    {activeTab === 'logs' && <AuditLog />}
                    {activeTab === 'settings' && hasSecureAccess && <SiteConfig />}
                    {activeTab === 'docs' && <AdminDocs />}

                </main>

            </div>

            {/* Mobile Bottom Navbar */}
            {isMobile && (
                <AdminMobileNavbar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                />
            )}

            <Admin2FAModal 
                isOpen={show2FAModal} 
                onVerified={() => setShow2FAModal(false)} 
                onClose={() => navigate('/')} 
            />
        </div>
    )
}

interface SidebarItemProps {
    active: boolean;
    onClick: () => void;
    label: string;
    icon: React.ReactNode;
}

function SidebarItem({ active, onClick, label, icon }: SidebarItemProps) {
    return (
        <button
            className={`xp-sidebar-btn ${active ? 'active' : ''}`}
            onClick={onClick}
        >
            <span className="icon">{icon}</span>
            {label}
        </button>
    )
}

interface UserRoleDisplayProps {
    role: string;
}

function UserRoleDisplay({ role }: UserRoleDisplayProps) {
    const { t } = useTranslation()
    const roles: Record<string, { label: string; color?: string; img: string; icon?: string }> = {
        neroferno: { label: t('account.roles.neroferno'), color: '#8b5cf6', img: '/ranks/rank-neroferno.png' },
        killu: { label: t('account.roles.killu'), color: '#ec4899', img: '/ranks/rank-killu.png' },
        founder: { label: t('account.roles.founder'), color: '#a855f7', img: '/ranks/rank-fundador.png' },
        admin: { label: t('account.roles.admin'), color: '#f59e0b', img: '/ranks/admin.png' },
        staff: { label: t('account.roles.staff', 'Staff'), color: '#ffd700', img: '/ranks/staff.png' },
        developer: { label: t('account.roles.developer'), color: '#0ea5e9', img: '/ranks/developer.png' },
        helper: { label: t('account.roles.helper'), color: '#3b82f6', img: '/ranks/helper.png' },
        donor: { label: t('account.roles.donor'), color: '#22c55e', img: '/ranks/rank-donador.png' },
        user: { label: t('account.roles.user'), img: '/ranks/user.png' }
    }

    const current = roles[role] || roles.user

    if(current.img) {
        return <img src={current.img} alt={current.label} className="user-role-img" />
    }

    return (
        <span className="user-role-badge" style={{ color: current.color }}>
             {current.label}
        </span>
    )
}
