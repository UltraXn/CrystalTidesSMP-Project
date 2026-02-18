import { useState, useEffect, useRef, useMemo } from "react"
import { Link } from "react-router-dom"
import { Copy, Check, Coffee } from "lucide-react"
import HeroBackgroundCarousel from "./Carousel"
import HeroParticles from "./Particles"
import { gsap } from "gsap"
import { motion } from "framer-motion"
import { useTranslation } from 'react-i18next'
import { useQuery } from "@tanstack/react-query"
import { fetchSettings } from "../../services/apiService"
import { getServerStatus } from "../../services/serverService"
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion"

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

export default function Hero({ mockSlides, mockPlayerCount, mockIsOnline }: HeroProps = {}) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const ip = "MC.CrystaltidesSMP.net"

    const welcomeRef = useRef<HTMLElement>(null)
    const descRef = useRef<HTMLParagraphElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const countRef = useRef<HTMLSpanElement>(null)
    const actionGroupRef = useRef<HTMLDivElement>(null)
    const prefersReducedMotion = usePrefersReducedMotion()

    const [playerCount, setPlayerCount] = useState(0)
    
    // Query for Settings (Slides)
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: fetchSettings,
        staleTime: 60000, // Settings don't change often
    });

    // Compute slides during render
    const slides = useMemo(() => {
        if (mockSlides) return mockSlides;
        if (settings?.hero_slides) {
            try {
                const parsed = typeof settings.hero_slides === 'string'
                    ? JSON.parse(settings.hero_slides)
                    : settings.hero_slides;
                return (parsed || []) as Slide[];
            } catch (e) {
                console.error("Error parsing hero slides", e);
            }
        }
        return [];
    }, [settings?.hero_slides, mockSlides]);

    // Query for Minecraft Status
    const { data: serverStatus } = useQuery({
        queryKey: ['serverStatus'],
        queryFn: getServerStatus,
        refetchInterval: 30000, 
        enabled: mockIsOnline === undefined, // Don't fetch if mocking
    });

    // Compute isOnline during render
    const isOnline = mockIsOnline !== undefined ? mockIsOnline : (serverStatus?.online ?? null);
    
    const displayPlayerCount = prefersReducedMotion ? (mockPlayerCount !== undefined ? mockPlayerCount : (serverStatus?.players?.online ?? 0)) : playerCount;

    // GSAP Initialization
    useEffect(() => {
        const ctx = gsap.context(() => {
            if (prefersReducedMotion) {
                // Instantly show everything if reduced motion is preferred
                gsap.set([welcomeRef.current, '.hero-brand-char', descRef.current, containerRef.current], { 
                    opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 
                });
                return;
            }

            const tl = gsap.timeline({
                defaults: { ease: "power4.out", duration: 1.2 }
            });

            gsap.set('.hero-brand-char', { opacity: 0, y: 50, filter: 'blur(10px)', scale: 0.8 });

            tl.fromTo(welcomeRef.current, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, ease: "back.out(1.7)" }
            )
            .to('.hero-brand-char', {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                scale: 1,
                stagger: 0.04,
                duration: 1.2,
                ease: "elastic.out(1, 0.5)"
            }, "-=0.6")
            .fromTo([descRef.current, containerRef.current],
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, stagger: 0.2, duration: 1 },
                "-=1"
            );
        });

        return () => ctx.revert();
    }, [prefersReducedMotion]) // Only run once on mount or when motion preference changes

    // Player Count Animation Effect
    useEffect(() => {
        if (!isOnline || prefersReducedMotion) return;

        const targetCount = mockPlayerCount !== undefined ? mockPlayerCount : (serverStatus?.players?.online ?? 0);
        const counter = { val: playerCount };

        const anim = gsap.to(counter, {
            val: targetCount,
            roundProps: "val",
            duration: 2.5,
            delay: 0.2,
            ease: "power2.out",
            onUpdate: () => setPlayerCount(Math.floor(counter.val))
        });

        return () => { anim.kill(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverStatus?.players?.online, mockPlayerCount, isOnline, prefersReducedMotion]);

    const handleCopy = () => {
        navigator.clipboard.writeText(ip)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const renderBrandText = () => {
        return "CrystalTides SMP".split('').map((char, index) => (
            <span
                key={index}
                className="hero-brand-char inline-block"
                style={{
                    minWidth: char === ' ' ? '12px' : 'auto'
                }}
            >
                {char}
            </span>
        ));
    };

    // We only show the main branding if there are NO dynamic slides with text
    const hasTextSlides = slides.some(s => s.title || s.text);
    const showMainBranding = slides.length === 0 || !hasTextSlides;

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            <HeroBackgroundCarousel slides={slides} />
            <HeroParticles />
            
            <div className="relative z-20 w-full max-w-5xl mx-auto px-6 text-center pt-10 sm:pt-20 pb-32 sm:pb-0">
                {showMainBranding && (
                    <div className="mb-12">
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6">
                            <span
                                ref={welcomeRef}
                                className="block text-(--accent)/90 text-2xl sm:text-3xl md:text-4xl tracking-widest mb-4 font-black drop-shadow-[0_0_15px_rgba(137,217,209,0.3)]"
                            >
                                {t('hero.welcome')}
                            </span>
                            <span className="inline-flex flex-wrap justify-center text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                                {renderBrandText()}
                            </span>
                        </h1>

                        <p ref={descRef} className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-bold italic drop-shadow-md">
                            {t('hero.description')}
                        </p>
                    </div>
                )}

                <motion.div
                    className="flex flex-col items-center gap-10"
                    ref={containerRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                >
                    <Link to="/status" className="no-underline">
                        <motion.button 
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="group flex items-center gap-3 bg-[#0a0a0a]/80 backdrop-blur-xl border border-(--accent)/30 shadow-[0_0_15px_rgba(137,217,209,0.1)] px-6 py-2.5 rounded-full transition-all hover:bg-black/90 hover:border-(--accent) hover:shadow-[0_0_25px_rgba(137,217,209,0.4)]"
                        >
                            <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px] ${isOnline === false ? 'bg-red-500 shadow-red-500' : 'bg-(--accent) shadow-(--accent) animate-pulse'}`}></span>
                            <span className="text-sm font-bold text-white tracking-wide group-hover:text-(--accent) transition-colors">
                                {isOnline === false ? (
                                    t('status.offline')
                                ) : (
                                    <><span ref={countRef} className="font-black text-(--accent)">{displayPlayerCount}</span> {t('hero.players_online')}</>
                                )}
                            </span>
                        </motion.button>
                    </Link>

                    <motion.button 
                        onClick={handleCopy}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full max-w-2xl bg-black/50 backdrop-blur-2xl border border-(--accent)/20 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-2xl group/ip transition-all hover:bg-black/70 hover:border-(--accent)/50 hover:shadow-[0_0_30px_rgba(137,217,209,0.1)] cursor-pointer"
                    >
                        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left pl-0 sm:pl-4">
                            <span className="text-[10px] font-black text-(--accent) uppercase tracking-[0.2em] mb-1 opacity-80">
                                {t('hero.java_edition')}
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover/ip:text-(--accent) transition-colors font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">{ip}</span>
                        </div>
                        
                        <div className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 ${copied ? 'bg-(--accent) text-[#181C1B] shadow-[0_0_20px_rgba(137,217,209,0.6)]' : 'bg-white/5 text-white border border-white/10 shadow-lg group-hover/ip:bg-(--accent) group-hover/ip:text-[#181C1B] group-hover/ip:shadow-[0_0_20px_rgba(137,217,209,0.4)]'}`}>
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            <span className="text-xs">{copied ? t('hero.copied') : t('hero.copy_ip')}</span>
                        </div>
                    </motion.button>

                    <div className="flex flex-wrap justify-center gap-5 mt-4" ref={actionGroupRef}>
                        <motion.a 
                            href="https://ko-fi.com/G2G03Y8FL" 
                            target="_blank" 
                            rel="noreferrer" 
                            whileHover={{ scale: 1.08, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-4 bg-(--accent) px-10 py-5 rounded-2xl no-underline transition-all hover:bg-white group/kofi shadow-[0_0_20px_rgba(137,217,209,0.3)]"
                        >
                            <Coffee size={22} className="text-[#181C1B] group-hover/kofi:rotate-12 transition-transform" />
                            <span className="text-[#181C1B] font-black uppercase tracking-widest text-sm">{t('hero.kofi_btn', 'Ko-Fi')}</span>
                        </motion.a>
                        <Link to="/#donors" className="no-underline">
                            <motion.button 
                                whileHover={{ scale: 1.08, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-4 bg-transparent border-2 border-(--accent) px-10 py-5 rounded-2xl transition-all hover:bg-(--accent) shadow-2xl group/donors"
                            >
                                <span className="text-(--accent) font-black uppercase tracking-widest text-sm leading-none group-hover/donors:text-[#181C1B] transition-colors">{t('navbar.donors')}</span>
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
