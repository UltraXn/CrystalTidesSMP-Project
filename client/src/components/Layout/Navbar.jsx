import Menu from "./Menu"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { FaUserCircle, FaTrophy, FaEdit, FaShieldAlt, FaSignOutAlt, FaCog, FaServer, FaLink } from "react-icons/fa"
import { useRef, useState, useEffect } from "react"
import anime from 'animejs'

import { useTranslation } from 'react-i18next'

export default function Navbar() {
    const { t, i18n } = useTranslation()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const logoRef = useRef(null)
    const animationRef = useRef(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true)
            } else {
                setScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const dropdownRef = useRef(null)
    const userDropdownRef = useRef(null)
    const userItemsRef = useRef([])

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng)
    }

    const closeUserDropdown = () => setDropdownOpen(false)

    // Helper to add refs
    const addToUserRefs = (el) => {
        if (el && !userItemsRef.current.includes(el)) {
            userItemsRef.current.push(el);
        }
    };

    // ANIMATION LOGIC FOR USER DROPDOWN (Copied from Menu.jsx)
    useEffect(() => {
        // Reset refs on render to avoid duplication
        userItemsRef.current = [];

        if (dropdownOpen) {
            // OPEN ANIMATION
            if (userDropdownRef.current) {
                anime.remove(userDropdownRef.current);
                anime.set(userDropdownRef.current, { visibility: 'visible', opacity: 1 });

                anime({
                    targets: userDropdownRef.current,
                    scale: [0.9, 1],
                    opacity: [0, 1],
                    translateY: [10, 0],
                    easing: 'spring(1, 80, 10, 0)',
                    duration: 600
                });
            }

            if (userItemsRef.current.length > 0) {
                anime.remove(userItemsRef.current);
                anime({
                    targets: userItemsRef.current,
                    translateX: [20, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(50, { start: 100 }), // Faster stagger for smaller menu
                    easing: 'easeOutExpo'
                });
            }
        } else {
            // CLOSE ANIMATION
            if (userDropdownRef.current) {
                anime.remove(userDropdownRef.current);
                anime.remove(userItemsRef.current);

                anime({
                    targets: userDropdownRef.current,
                    opacity: 0,
                    translateY: 10,
                    duration: 200,
                    easing: 'easeInQuad',
                    complete: () => {
                        if (!dropdownOpen && userDropdownRef.current) {
                            anime.set(userDropdownRef.current, { visibility: 'hidden' });
                        }
                    }
                });
            }
        }
    }, [dropdownOpen]);

    const handleLogoHover = () => {
        if (animationRef.current) animationRef.current.pause()

        animationRef.current = anime({
            targets: logoRef.current,
            translateY: [
                { value: -10, duration: 200, easing: 'easeOutQuad' },
                { value: 0, duration: 200, easing: 'easeInQuad' },
                { value: -5, duration: 200, easing: 'easeOutQuad' },
                { value: 0, duration: 200, easing: 'easeInQuad' }
            ],
            duration: 800
        });
    }

    const handleLogout = async () => {
        await logout()
        setDropdownOpen(false)
        navigate('/')
    }

    const location = useLocation()
    // Exact match for home, since other pages like /forum need to be treated as "internal"
    const isHome = location.pathname === '/'

    // Check if admin (Allowed roles: admin, neroferno, killu, helper)
    const allowedRoles = ['admin', 'neroferno', 'killu', 'helper']
    const isAdmin = allowedRoles.includes(user?.user_metadata?.role)

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''} ${isHome ? 'is-home' : ''}`}>
            <div className="navbar-left-section" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div className="navbar-brand">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img
                            ref={logoRef}
                            src="/images/ui/logo.webp"
                            alt="Crystal Tides SMP Logo"
                            className="navbar-logo"
                            onMouseEnter={handleLogoHover}
                            width="40"
                            height="40"
                        />
                        <span className="navbar-title">Crystal Tides SMP</span>
                    </Link>
                </div>
                <div className="nav-links">
                    <div className="desktop-nav-items">
                        <Link to="/#rules">{t('navbar.rules')}</Link>
                        <Link to="/#donors" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{t('navbar.donors')}</Link>
                        <Link to="/#news">{t('navbar.news')}</Link>
                        <Link to="/#suggestions">{t('footer.suggestions')}</Link>
                        <Link to="/forum">{t('navbar.forum')}</Link>
                        <Link to="/map">{t('footer.online_map')}</Link>
                    </div>
                    <div className="mobile-menu-trigger">
                        <Menu />
                    </div>
                </div>
            </div>



            <div className="nav-right-section">
                {/* Selector de Idioma */}
                <div className="language-selector">
                    <button
                        onClick={() => changeLanguage('es')}
                        title="Español"
                        className={`lang-btn ${i18n.resolvedLanguage === 'es' ? 'active' : ''}`}
                    >
                        <img src="/images/flags/es.svg" alt="Español" width="20" height="15" />
                        ES
                    </button>
                    <div className="lang-divider"></div>
                    <button
                        onClick={() => changeLanguage('en')}
                        title="English"
                        className={`lang-btn ${i18n.resolvedLanguage === 'en' ? 'active' : ''}`}
                    >
                        <img src="/images/flags/us.svg" alt="English" width="20" height="15" />
                        EN
                    </button>
                </div>

                <div className="nav-auth">
                    {user ? (
                        <div className="user-dropdown-container" ref={dropdownRef}>
                            <button
                                className="nav-btn primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem' }}
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="user-mini-avatar" />
                                ) : (
                                    <FaUserCircle size={20} />
                                )}
                                <span>{user.user_metadata?.username || user.email.split('@')[0]}</span>
                            </button>

                            {/* Dropdown Menu - ALWAYS RENDERED but visibility controlled by anime.js */}
                            <div
                                className="menu-dropdown"
                                ref={userDropdownRef}
                                style={{
                                    visibility: 'hidden', // Controlled by anime.js
                                    opacity: 0,
                                    display: 'block' // Ensure it's reachable for animation
                                }}
                            >
                                <div className="dropdown-header" ref={addToUserRefs}>
                                        <div style={{ display:'flex', justifyContent:'center', marginBottom: '0.5rem' }}>
                                            <UserRoleDisplay role={user.user_metadata?.role || 'user'} />
                                        </div>
                                    </div>
                                <Link to="/account?tab=overview" className="menu-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                    <FaServer /> {t('account.nav.overview', 'Resumen')}
                                </Link>
                                <Link to="/account?tab=posts" className="menu-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                    <FaEdit /> {t('account.nav.posts', 'Mis Publicaciones')}
                                </Link>
                                <Link to="/account?tab=achievements" className="menu-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                    <FaTrophy /> {t('navbar.achievements', 'Logros')}
                                </Link>
                                <Link to="/account?tab=connections" className="menu-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                    <FaLink /> {t('account.nav.connections', 'Conexiones')}
                                </Link>
                                <Link to="/account?tab=settings" className="menu-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                    <FaCog /> {t('account.settings.title', 'Configuración')}
                                </Link>

                                {isAdmin && (
                                    <>
                                        <div className="dropdown-divider"></div>
                                        <Link to="/admin" className="menu-item admin-link" onClick={closeUserDropdown} ref={addToUserRefs}>
                                            <FaShieldAlt /> {t('account.admin_panel')}
                                        </Link>
                                    </>
                                )}

                                <div className="dropdown-divider"></div>
                                <button className="menu-item logout-link" onClick={handleLogout} ref={addToUserRefs}>
                                    <FaSignOutAlt /> {t('account.nav.logout')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn">{t('navbar.login')}</Link>
                            <Link to="/register" className="nav-btn primary">{t('navbar.register')}</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

function UserRoleDisplay({ role }) {
    const { t } = useTranslation()
    const roles = {
        neroferno: { label: t('account.roles.neroferno'), img: '/ranks/rank-neroferno.png' },
        killu: { label: t('account.roles.killu'), img: '/ranks/rank-killu.png' },
        founder: { label: t('account.roles.founder'), img: '/ranks/rank-fundador.png' },
        admin: { label: t('account.roles.admin'), img: '/ranks/admin.png' },
        helper: { label: t('account.roles.helper'), img: '/ranks/helper.png' },
        donor: { label: t('account.roles.donor'), img: '/ranks/rank-donador.png' },
        user: { label: t('account.roles.user'), img: '/ranks/user.png' }
    }
    const current = roles[role] || roles.user

    if(current.img) {
        return <img src={current.img} alt={role} />
    }

    return (
        <span style={{
            background: current.color || '#333',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }}>
            {current.icon} {current.label}
        </span>
    )
}