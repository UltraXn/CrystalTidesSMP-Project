import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Copy, Check, Coffee } from "lucide-react"
import HeroBackgroundCarousel from "./Carousel"
import HeroParticles from "./Particles"
import { gsap } from "gsap"
import { useTranslation } from 'react-i18next'

interface Slide {
    image: string;
    title?: string;
    text?: string;
    buttonText?: string;
    link?: string;
}

interface HeroProps {
    mockSlides?: Slide[];
    mockPlayerCount?: number;
    mockIsOnline?: boolean;
}

const renderBrandText = () => {
    return "CRYSTALTIDES SMP".split('').map((char, index) => (
        <span
            key={`char-${char}-${index}`}
            className="hero-brand-char inline-block"
            style={{
                minWidth: char === ' ' ? '14px' : 'auto'
            }}
        >
            {char}
        </span>
    ));
};

async function loadHeroSettings(apiUrl: string) {
    const res = await fetch(`${apiUrl}/settings`);
    if (!res.ok) throw new Error("HTTP error " + res.status);
    return res.json();
}

async function loadServerStatus(apiUrl: string) {
    const res = await fetch(`${apiUrl}/status`);
    if (!res.ok) throw new Error("HTTP error " + res.status);
    return res.json();
}

export default function Hero({ mockSlides, mockPlayerCount, mockIsOnline }: HeroProps = {}) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const ip = "mc.crystaltidessmp.net"

    const welcomeRef = useRef<HTMLDivElement>(null)
    const descRef = useRef<HTMLParagraphElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const actionGroupRef = useRef<HTMLDivElement>(null)
    const API_URL = import.meta.env.VITE_API_URL;

    const { data: slides = mockSlides || [] } = useQuery<Slide[]>({
        queryKey: ['heroSlides'],
        queryFn: async () => {
            if (mockSlides) return mockSlides;
            const data = await loadHeroSettings(API_URL);
            if (data.hero_slides) {
                try {
                    const parsed = typeof data.hero_slides === 'string'
                        ? JSON.parse(data.hero_slides)
                        : data.hero_slides;
                    return (parsed || []) as Slide[];
                } catch (e) {
                    console.error("Error parsing hero slides", e);
                }
            }
            return [];
        },
        enabled: !mockSlides,
        staleTime: 60_000,
    });

    const { data: serverStatus } = useQuery({
        queryKey: ['serverStatus', API_URL],
        queryFn: () => loadServerStatus(API_URL),
        enabled: mockIsOnline === undefined || mockPlayerCount === undefined,
        staleTime: 30_000,
    });

    const isOnline = mockIsOnline ?? serverStatus?.online;
    const playerCount = mockPlayerCount ?? serverStatus?.players?.online ?? 0;

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Set initial hidden states to prevent FOUC / stiff jumps
            gsap.set(welcomeRef.current, { y: -15, opacity: 0 });
            gsap.set('.hero-brand-char', { y: 30, opacity: 0 });
            gsap.set([descRef.current, containerRef.current], { y: 25, opacity: 0 });

            const tl = gsap.timeline({
                defaults: { ease: "power3.out", duration: 0.9 }
            });

            // Buttery smooth entrance sequence
            tl.to(welcomeRef.current, 
                { y: 0, opacity: 1, duration: 0.7 }
            )
            .to('.hero-brand-char', 
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.025,
                    duration: 0.7,
                    ease: "back.out(1.5)"
                },
                "-=0.4"
            )
            .to([descRef.current, containerRef.current],
                { y: 0, opacity: 1, stagger: 0.15, duration: 0.7 },
                "-=0.4"
            );
        });

        return () => {
            ctx.revert();
        };
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(ip)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            paddingTop: '80px', // Header offset
            paddingBottom: '40px'
        }}>
            {/* Background Carousel & Particles */}
            <HeroBackgroundCarousel slides={slides} />
            <HeroParticles />

            {/* Gradient Overlays */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at center, transparent 0%, rgba(10, 10, 15, 0.8) 100%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
                background: 'linear-gradient(to top, var(--bg-primary), transparent)',
                pointerEvents: 'none'
            }} />

            {/* Content Container */}
            <div style={{
                position: 'relative', zIndex: 10,
                maxWidth: '1200px', width: '100%',
                padding: '0 2rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center'
            }}>
                
                {/* Top Welcome Badge */}
                <div 
                    ref={welcomeRef}
                    className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-(--accent) mb-2 opacity-90 drop-shadow-md"
                >
                    {t('hero.welcome', 'BIENVENIDO A')}
                </div>

                {/* Main Title */}
                <h1 style={{
                    fontSize: 'clamp(2.6rem, 5.8vw, 5.2rem)',
                    fontWeight: 900,
                    lineHeight: 1.08,
                    letterSpacing: '-0.02em',
                    marginBottom: '1.25rem',
                    textShadow: '0 0 25px rgba(255, 255, 255, 0.4), 0 0 50px rgba(137, 217, 209, 0.25), 0 15px 40px rgba(0, 0, 0, 0.8)',
                    whiteSpace: 'nowrap'
                }}>
                    {renderBrandText()}
                </h1>

                {/* Subtitle / Description */}
                <p 
                    ref={descRef}
                    className="text-sm md:text-base text-gray-300 font-medium italic max-w-xl mb-6 leading-relaxed opacity-90"
                >
                    {t('hero.subtitle', 'Sumérgete en un mundo de aventuras, comunidad y creatividad sin límites. ¡Únete a nosotros! Te esperamos✨')}
                </p>

                {/* Online Status Pill & Launcher Link */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                    <Link 
                        to="/status"
                        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/70 border border-white/15 text-xs font-bold text-gray-200 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.6)] hover:border-[#89d9d1]/60 hover:scale-105 transition-all no-underline cursor-pointer group"
                    >
                        <span 
                            className="w-2.5 h-2.5 rounded-full transition-colors duration-300 group-hover:scale-110"
                            style={{
                                backgroundColor: isOnline ? '#4ade80' : '#ef4444',
                                boxShadow: isOnline ? '0 0 12px #4ade80' : '0 0 12px #ef4444'
                            }} 
                        />
                        <span className="group-hover:text-white transition-colors">
                            {isOnline 
                                ? `${playerCount} ${t('hero.players_online', 'Jugadores Online')}`
                                : t('hero.status.offline', 'OFFLINE')}
                        </span>
                    </Link>

                    <Link 
                        to="/launcher"
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-[#89d9d1]/40 text-xs font-bold text-gray-200 backdrop-blur-md shadow-[0_0_20px_rgba(137,217,209,0.25)] hover:border-[#89d9d1] hover:scale-105 transition-all no-underline cursor-pointer group"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#89d9d1] animate-pulse" />
                        <span className="text-[#89d9d1] font-black uppercase tracking-wider text-[11px]">Launcher Oficial</span>
                        <span className="text-gray-400 font-normal hidden sm:inline">• Rust 0.6s</span>
                        <span className="text-[#89d9d1] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                    </Link>
                </div>

                {/* Action Group */}
                <div 
                    ref={containerRef}
                    className="flex flex-col items-center gap-6 w-full max-w-md"
                >
                    {/* Copy IP Box */}
                    <div className="w-full bg-black/75 border border-[#89d9d1]/40 p-3.5 rounded-2xl backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.7),0_0_15px_rgba(137,217,209,0.15)] flex items-center justify-between gap-4">
                        <div className="flex flex-col items-start pl-3 text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#89d9d1]">
                                {t('hero.edition', 'EDICIÓN .JAVA')}
                            </span>
                            <span className="font-mono text-base md:text-lg font-black text-white tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                                {ip}
                            </span>
                        </div>
                        <button type="button" 
                            onClick={handleCopy}
                            aria-label={copied ? t('hero.copied', '¡COPIADO!') : t('hero.copy_ip', 'COPIAR IP')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#89d9d1]/20 border border-[#89d9d1]/40 hover:border-[#89d9d1] text-white font-bold text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer active:scale-95 shrink-0 shadow-[0_0_15px_rgba(137,217,209,0.2)]"
                        >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            {copied ? t('hero.copied', '¡COPIADO!') : t('hero.copy_ip', 'COPIAR IP')}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div ref={actionGroupRef} className="flex items-center justify-center gap-4 w-full">
                        <a 
                            href="https://ko-fi.com/ultraxn" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 max-w-50 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#89d9d1] hover:bg-[#72cac2] text-black font-black text-xs uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(137,217,209,0.5)] no-underline"
                        >
                            <Coffee size={16} />
                            {t('nav.kofi', 'KO-FI')}
                        </a>
                        <Link 
                            to="/donors" 
                            className="flex-1 max-w-50 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black/60 hover:bg-[#89d9d1]/10 border-2 border-[#89d9d1]/70 hover:border-[#89d9d1] text-[#89d9d1] font-black text-xs uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(137,217,209,0.25)] no-underline"
                        >
                            {t('nav.donators', 'DONADORES')}
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )
}
