import { useState, useEffect, useRef } from "react"
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

export default function Hero({ mockSlides, mockPlayerCount, mockIsOnline }: HeroProps = {}) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const ip = "MC.CrystaltidesSMP.net"

    const welcomeRef = useRef<HTMLElement>(null)
    const descRef = useRef<HTMLParagraphElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const countRef = useRef<HTMLSpanElement>(null)
    const actionGroupRef = useRef<HTMLDivElement>(null)

    const [playerCount, setPlayerCount] = useState(0)
    const [isOnline, setIsOnline] = useState<boolean | null>(null)
    
    const [slides, setSlides] = useState<Slide[]>([])
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        if (mockSlides) {
            setSlides(mockSlides);
            return;
        }

        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                if(data.hero_slides) {
                    try {
                        const parsed = typeof data.hero_slides === 'string' 
                            ? JSON.parse(data.hero_slides) 
                            : data.hero_slides;
                        setSlides((parsed || []) as Slide[]);
                    } catch (e) {
                         console.error("Error parsing hero slides", e);
                    }
                }
            })
            .catch(err => console.error("Error fetching settings for hero", err));
    }, [API_URL, mockSlides]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "power4.out", duration: 1.2 }
            });

            gsap.set('.hero-brand-char', { opacity: 0, y: 50, filter: 'blur(10px)', scale: 0.8 });

            tl.fromTo(welcomeRef.current, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1 }
            )
            .to('.hero-brand-char', {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                scale: 1,
                stagger: 0.03,
                duration: 1.5,
                ease: "elastic.out(1, 0.75)"
            }, "-=0.7")
            .fromTo([descRef.current, containerRef.current],
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, stagger: 0.2, duration: 1 },
                "-=1"
            );
        });

        const fetchPlayerCount = async () => {
            if (mockIsOnline !== undefined && mockPlayerCount !== undefined) {
                 setIsOnline(mockIsOnline);
                 const counter = { val: 0 };
                 gsap.to(counter, {
                    val: mockPlayerCount,
                    roundProps: "val",
                    duration: 2.5,
                    delay: 0.5,
                    ease: "power2.out",
                    onUpdate: () => setPlayerCount(Math.floor(counter.val))
                });
                return;
            }

            try {
                const res = await fetch(`${API_URL}/minecraft/status`)
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json()

                if (data && data.online) {
                    setIsOnline(true)
                    const counter = { val: 0 };
                    gsap.to(counter, {
                        val: data.players.online,
                        roundProps: "val",
                        duration: 2.5,
                        delay: 0.5,
                        ease: "power2.out",
                        onUpdate: () => setPlayerCount(Math.floor(counter.val))
                    });
                } else {
                    setIsOnline(false)
                }
            } catch (err) {
                console.warn("Hero: Failed to fetch server status", err instanceof Error ? err.message : err)
                setIsOnline(false)
            }
        };

        fetchPlayerCount();
        return () => ctx.revert();
    }, [API_URL, mockIsOnline, mockPlayerCount])

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

                <div
                    className="flex flex-col items-center gap-10"
                    ref={containerRef}
                >
                    <Link to="/status" className="group flex items-center gap-3 bg-[#0a0a0a]/80 backdrop-blur-xl border border-(--accent)/30 shadow-[0_0_15px_rgba(137,217,209,0.1)] px-6 py-2.5 rounded-full no-underline transition-all hover:bg-black/90 hover:border-(--accent) hover:shadow-[0_0_25px_rgba(137,217,209,0.4)] hover:scale-105 active:scale-95">
                        <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px] ${isOnline === false ? 'bg-red-500 shadow-red-500' : 'bg-(--accent) shadow-(--accent) animate-pulse'}`}></span>
                        <span className="text-sm font-bold text-white tracking-wide group-hover:text-(--accent) transition-colors">
                            {isOnline === false ? (
                                t('status.offline')
                            ) : (
                                <><span ref={countRef} className="font-black text-(--accent)">{playerCount}</span> {t('hero.players_online')}</>
                            )}
                        </span>
                    </Link>

                    <button 
                        onClick={handleCopy}
                        className="w-full max-w-2xl bg-black/50 backdrop-blur-2xl border border-(--accent)/20 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-2xl group/ip transition-all hover:bg-black/70 hover:border-(--accent)/50 hover:shadow-[0_0_30px_rgba(137,217,209,0.1)] active:scale-[0.99] cursor-pointer"
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
                    </button>

                    <div className="flex flex-wrap justify-center gap-5 mt-4" ref={actionGroupRef}>
                        <a href="https://ko-fi.com/G2G03Y8FL" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-(--accent) px-10 py-5 rounded-2xl no-underline transition-all hover:bg-white hover:scale-110 active:scale-95 group/kofi shadow-[0_0_20px_rgba(137,217,209,0.3)]">
                            <Coffee size={22} className="text-[#181C1B] group-hover/kofi:rotate-12 transition-transform" />
                            <span className="text-[#181C1B] font-black uppercase tracking-widest text-sm">{t('hero.kofi_btn', 'Ko-Fi')}</span>
                        </a>
                        <Link to="/#donors" className="flex items-center gap-4 bg-transparent border-2 border-(--accent) px-10 py-5 rounded-2xl no-underline transition-all hover:bg-(--accent) hover:scale-110 active:scale-95 shadow-2xl group/donors">
                            <span className="text-(--accent) font-black uppercase tracking-widest text-sm leading-none group-hover/donors:text-[#181C1B] transition-colors">{t('navbar.donors')}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
