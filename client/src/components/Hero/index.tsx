import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { FaCopy, FaCheck } from "react-icons/fa"
import HeroBackgroundCarousel from "./Carousel"
import HeroParticles from "./Particles"
import anime from "animejs"
import { useTranslation } from 'react-i18next'

export default function Hero() {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const ip = "MC.CrystaltidesSMP.net"

    // Refs for animation
    const welcomeRef = useRef<HTMLElement>(null)
    const descRef = useRef<HTMLParagraphElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const countRef = useRef<HTMLSpanElement>(null)

    // State for player count
    const [playerCount, setPlayerCount] = useState(0)
    const [isOnline, setIsOnline] = useState<boolean | null>(null) // null = loading
    const [slides, setSlides] = useState<any[]>([])
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        // Fetch hero slides
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                if(data.hero_slides) {
                    try {
                        const parsed = typeof data.hero_slides === 'string' 
                            ? JSON.parse(data.hero_slides) 
                            : data.hero_slides;
                        setSlides(parsed || []);
                    } catch (e) {
                         console.error("Error parsing hero slides", e);
                    }
                }
            })
            .catch(err => console.error("Error fetching settings for hero", err));
    }, [API_URL]);

    useEffect(() => {
        // Timeline for organized animation
        const tl = anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000
        });

        tl.add({
            targets: welcomeRef.current,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            begin: () => {
                if (welcomeRef.current) welcomeRef.current.style.opacity = '1';
            }
        })
            .add({
                targets: '.hero-brand-char',
                opacity: [0, 1],
                translateY: [50, 0],
                rotateZ: [-5, 0],
                delay: anime.stagger(40),
                duration: 1200
            }, '-=600')
            .add({
                targets: [descRef.current, containerRef.current],
                opacity: [0, 1],
                translateY: [30, 0],
                delay: anime.stagger(200),
                duration: 800
            }, '-=800');

        // Player Count Animation Logic
        let countAnimation: anime.AnimeInstance | null = null;

        const fetchPlayerCount = async () => {
            try {
                const res = await fetch(`${API_URL}/minecraft/status`)
                const data = await res.json()

                if (data.online) {
                    setIsOnline(true)
                    let counter = { val: 0 };
                    countAnimation = anime({
                        targets: counter,
                        val: data.players.online,
                        round: 1,
                        easing: 'easeInOutQuad',
                        duration: 2000,
                        delay: 500,
                        update: function () {
                            if (countRef.current) {
                                setPlayerCount(counter.val);
                            }
                        }
                    });
                } else {
                    setIsOnline(false)
                }
            } catch (err) {
                console.error("Failed to fetch server status", err)
                setIsOnline(false)
            }
        };

        fetchPlayerCount();

        // Capture current refs for cleanup
        const welcomeEl = welcomeRef.current;
        const descEl = descRef.current;
        const containerEl = containerRef.current;

        // Cleanup
        return () => {
            tl.pause();
            if (countAnimation) countAnimation.pause();
            anime.remove([welcomeEl, descEl, containerEl]);
            anime.remove('.hero-brand-char');
        };

    }, [API_URL])

    const handleCopy = () => {
        navigator.clipboard.writeText(ip)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Helper to render split text
    const renderBrandText = () => {
        return "Crystal Tides SMP".split('').map((char, index) => (
            <span
                key={index}
                className="hero-brand-char"
                style={{
                    display: 'inline-block',
                    opacity: 0,
                    minWidth: char === ' ' ? '12px' : 'auto'
                }}
            >
                {char}
            </span>
        ));
    };

    return (
        <section className="hero">
            <HeroBackgroundCarousel slides={slides} />
            <HeroParticles />
            <div className="hero-content">
                {slides.length === 0 && (
                    <>
                        <h1>
                            <span
                                ref={welcomeRef}
                                style={{ display: 'inline-block', color: 'var(--text)' }}
                            >
                                {t('hero.welcome')}
                            </span>
                            {" "}
                            <span className="brand-wrapper" style={{ display: 'inline-block', maxWidth: '100%', wordBreak: 'break-word' }}>
                                {renderBrandText()}
                            </span>
                        </h1>

                        <p ref={descRef}>
                            {t('hero.description')}
                        </p>
                    </>
                )}

                <div
                    className="server-connect-container"
                    ref={containerRef}
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        marginTop: slides.length > 0 ? 'auto' : 'initial',
                        marginBottom: slides.length > 0 ? '4rem' : 'initial'
                    }}
                >
                    <div className="server-status-pill">
                        {isOnline === false ? (
                            <>
                                <span className="status-dot" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></span>
                                OFFLINE
                            </>
                        ) : (
                            <>
                                <span className="status-dot"></span>
                                <span ref={countRef}>{playerCount}</span> {t('hero.players_online')}
                            </>
                        )}
                    </div>

                    <div className="ip-container">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.8rem', color: '#89D9D1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', fontWeight: '600' }}>
                                {t('hero.java_edition')}
                            </span>
                            <span className="ip-text">{ip}</span>
                        </div>
                        <button onClick={handleCopy} className="copy-btn">
                            {copied ? <FaCheck /> : <FaCopy />}
                            {copied ? t('hero.copied') : t('hero.copy_ip')}
                        </button>
                    </div>

                    <Link to="/#donors" className="btn-donate-hero">{t('footer.donate')}</Link>
                </div>
            </div>
        </section>
    )
}
