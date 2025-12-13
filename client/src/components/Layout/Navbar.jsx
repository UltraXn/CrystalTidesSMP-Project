import Menu from "./Menu"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { FaUserCircle, FaTrophy, FaEdit, FaShieldAlt, FaSignOutAlt, FaCog } from "react-icons/fa"
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
    const dropdownRef = useRef(null)

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng)
    }

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

    const userDropdownRef = useRef(null)
    const userItemsRef = useRef([])

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

    // Check if admin (Simulated for now)
    const isAdmin = true // user?.user_metadata?.role === 'admin'

    return (
        <header className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img
                        ref={logoRef}
                        src="/images/ui/logo.webp"
                        alt="Crystal Tides SMP Logo"
                        className="navbar-logo"
                        onMouseEnter={handleLogoHover}
                        width="40"
                        height="40"
                    />
                </Link>
            </div>

            <div className="nav-links">
                <Menu />

                <div className="nav-right-section">
                    {/* Selector de Idioma */}
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
                            US
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
                                    className="profile-dropdown-menu"
                                    ref={userDropdownRef}
                                    style={{
                                        visibility: 'hidden', // Controlled by anime.js
                                        opacity: 0,
                                        display: 'block' // Ensure it's reachable for animation
                                    }}
                                >
                                    <div className="dropdown-header" ref={addToUserRefs}>
                                        <span className="dropdown-role">{user.user_metadata?.role || 'Aventurero'}</span>
                                    </div>
                                    <Link to="/account" className="dropdown-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                        <FaCog /> {t('navbar.account')}
                                    </Link>
                                    <Link to="/account?tab=achievements" className="dropdown-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                        <FaTrophy /> {t('navbar.achievements')}
                                    </Link>
                                    <Link to="/account?tab=posts" className="dropdown-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                        <FaEdit /> {t('navbar.forum')}
                                    </Link>

                                    {isAdmin && (
                                        <>
                                            <div className="dropdown-divider"></div>
                                            <Link to="/admin" className="dropdown-item admin-link" onClick={closeUserDropdown} ref={addToUserRefs}>
                                                <FaShieldAlt /> Panel Admin
                                            </Link>
                                        </>
                                    )}

                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout-link" onClick={handleLogout} ref={addToUserRefs}>
                                        <FaSignOutAlt /> Cerrar Sesión
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
            </div>
        </header>
    )
}