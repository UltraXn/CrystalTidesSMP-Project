import Menu from "./Menu"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { FaUserCircle } from "react-icons/fa"
import { useRef } from "react"
import anime from "animejs/lib/anime.es.js"

export default function Navbar() {
    const { user } = useAuth()
    const logoRef = useRef(null)
    const animationRef = useRef(null)

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

    return (
        <header className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img
                        ref={logoRef}
                        src="/logo.png"
                        alt="Crystal Tides SMP Logo"
                        className="navbar-logo"
                        onMouseEnter={handleLogoHover}
                    />
                </Link>
            </div>

            <div className="nav-links">
                <Menu />
                <div className="nav-auth">
                    {user ? (
                        <Link to="/account" className="nav-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaUserCircle size={18} />
                            <span>Mi Perfil</span>
                        </Link>
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

