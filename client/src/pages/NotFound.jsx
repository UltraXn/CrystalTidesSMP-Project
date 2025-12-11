import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import anime from "animejs/lib/anime.es.js"

export default function NotFound() {
    const titleRef = useRef(null)
    const buttonRef = useRef(null)
    const logoRef = useRef(null)
    const logoAnimRef = useRef(null)

    useEffect(() => {
        // Glitch/Float animation for the title
        anime({
            targets: titleRef.current,
            translateY: [-10, 10],
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine',
            duration: 2000
        })

        // Pop in button
        anime({
            targets: buttonRef.current,
            scale: [0, 1],
            opacity: [0, 1],
            easing: 'spring(1, 80, 10, 0)',
            delay: 500
        })
    }, [])

    const handleLogoHover = () => {
        if (logoAnimRef.current) logoAnimRef.current.pause()

        logoAnimRef.current = anime({
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
        <div style={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
            paddingTop: '6rem'
        }}>
            <div ref={titleRef} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                    ref={logoRef}
                    src="/logo.png"
                    alt="Crystal Tides Logo"
                    className="not-found-logo"
                    onMouseEnter={handleLogoHover}
                    style={{ width: '120px', height: 'auto', marginBottom: '1rem', dropShadow: '0 0 10px rgba(15, 150, 156, 0.5)', cursor: 'pointer' }}
                />
                <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1, marginBottom: '0.5rem' }}>404</h1>
                <h2 style={{ fontSize: '2rem', color: 'var(--muted)' }}>¡Te caíste al vacío!</h2>
            </div>

            <p style={{ maxWidth: '500px', color: 'var(--muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Parece que este chunk no se generó correctamente o teletransportaste a unas coordenadas que no existen.
            </p>

            <div ref={buttonRef} style={{ opacity: 0 }}>
                <Link to="/" className="btn-donate-hero">
                    Respawnear en el Inicio
                </Link>
            </div>
        </div>
    )
}
