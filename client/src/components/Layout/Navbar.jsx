import Menu from "./Menu"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { FaUserCircle, FaTrophy, FaEdit, FaShieldAlt, FaSignOutAlt, FaCog } from "react-icons/fa"
import { useRef, useState, useEffect } from "react"
import anime from "animejs/lib/anime.es.js"

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const logoRef = useRef(null)
    const animationRef = useRef(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

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
                        src="/logo.webp"
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

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="profile-dropdown-menu">
                                    <div className="dropdown-header">
                                        <span className="dropdown-role">{user.user_metadata?.role || 'Aventurero'}</span>
                                    </div>
                                    <Link to="/account" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <FaCog /> Mi Cuenta
                                    </Link>
                                    <Link to="/account?tab=achievements" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <FaTrophy /> Logros
                                    </Link>
                                    <Link to="/account?tab=posts" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <FaEdit /> Mis Publicaciones
                                    </Link>

                                    {isAdmin && (
                                        <>
                                            <div className="dropdown-divider"></div>
                                            <Link to="/admin" className="dropdown-item admin-link" onClick={() => setDropdownOpen(false)}>
                                                <FaShieldAlt /> Panel Admin
                                            </Link>
                                        </>
                                    )}

                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout-link" onClick={handleLogout}>
                                        <FaSignOutAlt /> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn">Log In</Link>
                            <Link to="/register" className="nav-btn primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
