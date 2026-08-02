import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { gsap } from "gsap"
import { useTranslation } from "react-i18next"

export default function NotFound() {
    const { t } = useTranslation()
    const titleRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLDivElement>(null)
    const logoRef = useRef<HTMLImageElement>(null)
    const logoAnimRef = useRef<gsap.core.Tween | null>(null)

    useEffect(() => {
        // Floating animation for the title using GSAP
        gsap.to(titleRef.current, {
            y: 10,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // Pop in button with elastic ease
        gsap.fromTo(buttonRef.current,
            { scale: 0, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 1.2,
                ease: "elastic.out(1, 0.75)",
                delay: 0.5
            }
        );
    }, [])

    const handleLogoHover = () => {
        if (logoAnimRef.current) logoAnimRef.current.kill()

        logoAnimRef.current = gsap.to(logoRef.current, {
            y: -10,
            duration: 0.2,
            ease: 'power2.out',
            yoyo: true,
            repeat: 3
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
                    src="/images/ui/logo.webp"
                    alt="CrystalTides Logo"
                    className="not-found-logo"
                    onMouseEnter={handleLogoHover}
                    onFocus={handleLogoHover}
                    style={{ width: '120px', height: 'auto', marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(15, 150, 156, 0.5))', cursor: 'pointer' }}
                />
                <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1, marginBottom: '0.5rem' }}>404</h1>
                <h2 style={{ fontSize: '2rem', color: 'var(--muted)' }}>{t('not_found_page.title')}</h2>
            </div>

            <p style={{ maxWidth: '500px', color: 'var(--muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                {t('not_found_page.description')}
            </p>

            <div ref={buttonRef} style={{ opacity: 0 }}>
                <Link to="/" className="btn-donate-hero">
                    {t('not_found_page.button')}
                </Link>
            </div>
        </div>
    )
}
