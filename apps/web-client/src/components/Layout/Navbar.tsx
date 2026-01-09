import Menu from "./Menu"
import NotificationCenter from "../../components/UI/NotificationCenter"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { isAdmin as checkAdmin } from "../../utils/roleUtils"
import { FaTrophy, FaEdit, FaShieldAlt, FaSignOutAlt, FaCog, FaServer, FaLink } from "react-icons/fa"
import { useRef, useState, useEffect } from "react"
import { gsap } from 'gsap'

import { useTranslation } from 'react-i18next'

export default function Navbar() {
    const { t, i18n } = useTranslation()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const logoRef = useRef<HTMLImageElement>(null)
    const animationRef = useRef<gsap.core.Tween | null>(null)
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
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const dropdownRef = useRef<HTMLDivElement>(null)
    const userDropdownRef = useRef<HTMLDivElement>(null)
    const userItemsRef = useRef<(HTMLAnchorElement | HTMLButtonElement | HTMLDivElement)[]>([])

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
    }

    const closeUserDropdown = () => setDropdownOpen(false)

    // Helper to add refs
    const addToUserRefs = (el: HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | null) => {
        if (el && !userItemsRef.current.includes(el)) {
            userItemsRef.current.push(el);
        }
    };

    // ANIMATION LOGIC FOR USER DROPDOWN (Migrated to GSAP)
    useEffect(() => {
        if (dropdownOpen) {
            // OPEN ANIMATION
            if (userDropdownRef.current) {
                gsap.killTweensOf(userDropdownRef.current);
                gsap.set(userDropdownRef.current, { visibility: 'visible', opacity: 1 });

                gsap.fromTo(userDropdownRef.current,
                    { scale: 0.9, opacity: 0, y: 10 },
                    {
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        ease: 'elastic.out(1, 0.75)',
                        duration: 0.8
                    }
                );
            }

            if (userItemsRef.current.length > 0) {
                gsap.killTweensOf(userItemsRef.current);
                gsap.fromTo(userItemsRef.current,
                    { x: 20, opacity: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        stagger: 0.05,
                        delay: 0.1,
                        ease: 'power3.out',
                        duration: 0.5
                    }
                );
            }
        } else {
            // CLOSE ANIMATION
            if (userDropdownRef.current) {
                gsap.killTweensOf(userDropdownRef.current);
                gsap.to(userDropdownRef.current, {
                    opacity: 0,
                    y: 10,
                    scale: 0.95,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        if (userDropdownRef.current) {
                            gsap.set(userDropdownRef.current, { visibility: 'hidden' });
                        }
                    }
                });
            }
        }
    }, [dropdownOpen]);

    const handleLogoHover = () => {
        if (animationRef.current) animationRef.current.kill()

        animationRef.current = gsap.to(logoRef.current, {
            y: -10,
            duration: 0.2,
            ease: 'power2.out',
            yoyo: true,
            repeat: 3
        });
    }

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setDropdownOpen(false)
            navigate('/')
        }
    }

    const location = useLocation()
    const isHome = location.pathname === '/'

    const isAdmin = checkAdmin(user)

    // Hide navbar on policy pages if requested
    if (location.pathname.startsWith('/policies')) return null;

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''} ${isHome ? 'is-home' : ''}`}>
            <div className="navbar-left-section" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div className="navbar-brand">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img
                            ref={logoRef}
                            src="/images/ui/logo.webp"
                            alt="CrystalTides SMP Logo"
                            className="navbar-logo"
                            onMouseEnter={handleLogoHover}
                            width="40"
                            height="40"
                        />
                        <span className="navbar-title">CrystalTides SMP</span>
                    </Link>
                </div>
                <div className="nav-links">
                    {!location.pathname.startsWith('/admin') && (
                        <div className="desktop-nav-items">
                            <Link to="/#rules">{t('navbar.rules')}</Link>
                            <Link to="/#donors" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{t('navbar.donors')}</Link>
                            <Link to="/#news">{t('navbar.news')}</Link>
                            <Link to="/#suggestions">{t('navbar.suggestions')}</Link>
                            <Link to="/forum">{t('navbar.forum')}</Link>
                            <Link to="/wiki">{t('navbar.wiki', 'Guía')}</Link>
                            <Link to="/support">{t('navbar.support', 'Soporte')}</Link>
                            <Link to="/map">{t('footer.online_map')}</Link>
                        </div>
                    )}
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
                        <>
                            <NotificationCenter />
                            <div className="user-dropdown-container" ref={dropdownRef}>
                            <button
                                className="nav-btn user-menu-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                {(() => {
                                    const meta = user.user_metadata || {};
                                    const prefersSocial = meta.avatar_preference === 'social' && meta.avatar_url;
                                    
                                    if (prefersSocial) {
                                        return (
                                            <img 
                                                src={meta.avatar_url} 
                                                alt="Avatar" 
                                                className="user-mini-avatar" 
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = `https://mc-heads.net/avatar/${meta.minecraft_nick || meta.username || 'steve'}/64`;
                                                }}
                                            />
                                        );
                                    }

                                    // Default to Minecraft
                                    const mcNick = meta.minecraft_nick || meta.username || 'steve';
                                    return (
                                        <img 
                                            src={`https://mc-heads.net/avatar/${mcNick}/64`} 
                                            alt="Avatar" 
                                            className="user-mini-avatar" 
                                        />
                                    );
                                })()}
                                <span>{(() => {
                                    const meta = user.user_metadata || {};
                                    const identities = user.identities || [];
                                    
                                    // 1. Web Nick (Full Name > Display Name > Username)
                                    // We prioritize full_name as it is the primary display name in settings.
                                    if (meta.full_name) return meta.full_name;
                                    if (meta.display_name) return meta.display_name;
                                    if (meta.username) return meta.username;
                                    
                                    // 2. Discord
                                    const discord = identities.find((id) => id.provider === 'discord');
                                    if (discord?.identity_data) {
                                        const data = discord.identity_data as { 
                                            full_name?: string; 
                                            custom_claims?: { global_name?: string };
                                            name?: string;
                                            user_name?: string;
                                        };
                                        return data.full_name || 
                                               data.custom_claims?.global_name || 
                                               data.name || 
                                               data.user_name;
                                    }

                                    // 3. Twitch
                                    const twitch = identities.find((id) => id.provider === 'twitch');
                                    if (twitch?.identity_data) {
                                        const data = twitch.identity_data as {
                                            display_name?: string;
                                            full_name?: string;
                                            name?: string;
                                        };
                                        return data.display_name || 
                                               data.full_name || 
                                               data.name;
                                    }

                                    // 4. Minecraft
                                    if (meta.minecraft_nick) return meta.minecraft_nick;

                                    return user.email?.split('@')[0] || 'User';
                                })()}</span>
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
                        </>
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