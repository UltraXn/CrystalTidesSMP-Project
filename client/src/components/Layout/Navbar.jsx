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

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-brand">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                    <img
                        ref={logoRef}
                        src="/images/ui/logo.webp"
                        alt="Crystal Tides SMP Logo"
                        className="navbar-logo"
                        onMouseEnter={handleLogoHover}
                        width="40"
                        height="40"
                    />
                    <h2 className="navbar-title">Crystal Tides</h2>
                </Link>
            </div>

            <div className="nav-links">
                <Menu />
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
                                <Link to="/account" className="menu-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                    <FaCog /> {t('navbar.account')}
                                </Link>
                                <Link to="/account?tab=achievements" className="menu-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                    <FaTrophy /> {t('navbar.achievements')}
                                </Link>
                                <Link to="/account?tab=posts" className="menu-item" onClick={closeUserDropdown} ref={addToUserRefs}>
                                    <FaEdit /> {t('account.nav.posts')}
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