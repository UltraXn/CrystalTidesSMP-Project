import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { FaCopy, FaCheck, FaUsers } from "react-icons/fa"
import HeroBackgroundCarousel from "./Carousel"
import HeroParticles from "./Particles"
import anime from "animejs"
import { useTranslation } from 'react-i18next'

export default function Hero() {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const ip = "MC.CrystaltidesSMP.net"

    // Refs for animation
    const welcomeRef = useRef(null)
    const descRef = useRef(null)
    const containerRef = useRef(null)
    const countRef = useRef(null)

    // State for player count
    const [playerCount, setPlayerCount] = useState(0)
    const [isOnline, setIsOnline] = useState(null) // null = loading
    const API_URL = import.meta.env.VITE_API_URL

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
        let countAnimation;

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

        // Cleanup
        return () => {
            tl.pause();
            if (countAnimation) countAnimation.pause();
            anime.remove([welcomeRef.current, descRef.current, containerRef.current]);
            anime.remove('.hero-brand-char');
        };

    }, [])

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
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    };

    return (
        <section className="hero">
            <HeroBackgroundCarousel />
            <HeroParticles />
            <div className="hero-content">
                <h1>
                    <span
                        ref={welcomeRef}
                        style={{ display: 'inline-block', opacity: 0, color: 'var(--text)' }}
                    >
                        {t('hero.welcome')}
                    </span>
                    {" "}
                    <span className="brand-wrapper">
                        {renderBrandText()}
                    </span>
                </h1>

                <p ref={descRef} style={{ opacity: 0 }}>
                    {t('hero.description')}
                </p>

                <div
                    className="server-connect-container"
                    ref={containerRef}
                    style={{ opacity: 0 }}
                >
                    <div className="online-count" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: isOnline === false ? '#ef4444' : '#4ade80', fontWeight: 'bold' }}>
                        {isOnline === false ? (
                            <>
                                <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></span>
                                OFFLINE
                            </>
                        ) : (
                            <>
                                <FaUsers />
                                <span ref={countRef}>{playerCount}</span> {t('hero.players_online')}
                            </>
                        )}
                    </div>

                    <h2>{t('hero.connect')}</h2>
                    <div className="server-ip-box">
                        <div className="server-ip-info">
                            <span className="server-edition">{t('hero.java_edition')}</span>
                            <span className="server-ip">{ip}</span>
                        </div>
                        <button onClick={handleCopy} className="btn-copy-box">
                            {copied ? <FaCheck /> : <FaCopy />}
                            {copied ? t('hero.copied') : t('hero.copy_ip')}
                        </button>
                    </div>
                    <a href="#donors" className="btn-donate-hero">{t('footer.donate')}</a>
                </div>
            </div>
        </section>
    )
}
