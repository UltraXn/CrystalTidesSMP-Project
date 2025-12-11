import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { FaCopy, FaCheck, FaUsers } from "react-icons/fa"
import HeroBackgroundCarousel from "./HeroBackgroundCarousel"
import HeroParticles from "./HeroParticles"
import anime from "animejs/lib/anime.es.js"

export default function Hero() {
    const [copied, setCopied] = useState(false)
    const ip = "MC.CrystaltidesSMP.net"

    // Refs for animation
    const welcomeRef = useRef(null)
    const descRef = useRef(null)
    const containerRef = useRef(null)
    const countRef = useRef(null)

    // State for player count
    const [playerCount, setPlayerCount] = useState(0)

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
            // Mock data for now as requested
            const players = 42;

            let counter = { val: 0 };
            countAnimation = anime({
                targets: counter,
                val: players,
                round: 1,
                easing: 'easeInOutQuad',
                duration: 2000,
                delay: 1000,
                update: function () {
                    if (countRef.current) {
                        setPlayerCount(counter.val);
                    }
                }
            });
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
                        Bienvenido a
                    </span>
                    {" "}
                    <span className="brand-wrapper">
                        {renderBrandText()}
                    </span>
                </h1>

                <p ref={descRef} style={{ opacity: 0 }}>
                    Sumérgete en un mundo de aventuras, comunidad y creatividad sin límites.
                    ¡Únete a nosotros! Te esperamos ✨
                </p>

                <div
                    className="server-connect-container"
                    ref={containerRef}
                    style={{ opacity: 0 }}
                >
                    <div className="online-count" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#4ade80', fontWeight: 'bold' }}>
                        <FaUsers />
                        <span ref={countRef}>{playerCount}</span> Jugadores Online
                    </div>

                    <h2>Conectate al Servidor</h2>
                    <div className="server-ip-box">
                        <div className="server-ip-info">
                            <span className="server-edition">Java Edition</span>
                            <span className="server-ip">{ip}</span>
                        </div>
                        <button onClick={handleCopy} className="btn-copy-box">
                            {copied ? <FaCheck /> : <FaCopy />}
                            {copied ? "¡Copiado!" : "Copiar IP"}
                        </button>
                    </div>
                    <a href="#donors" className="btn-donate-hero">Donar</a>
                </div>
            </div>
        </section>
    )
}
