import { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Section from "../components/Layout/Section"
import { Hammer, Dices, MapPinned, Footprints, CheckCircle, Hourglass, Flag, LogIn, X } from "lucide-react"
import { gsap } from "gsap"
import { useTranslation } from 'react-i18next'
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"
import { m as motion, AnimatePresence } from "framer-motion"

import confetti from "canvas-confetti"

interface ContestEvent {
    id: string | number;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    type: 'hammer' | 'dice' | 'map' | 'running';
    status: 'active' | 'soon' | 'finished';
    start_date?: string;
    end_date?: string;
    winners?: string[];
}

interface ContestCardProps {
    event: ContestEvent;
    onRegister: (eventId: string | number) => void;
    registering: boolean;
    isRegistered: boolean;
    onOpenPodium: (event: ContestEvent) => void;
}

const iconMap: Record<string, React.ReactElement> = {
    'hammer': <Hammer />,
    'dice': <Dices />,
    'map': <MapPinned />,
    'running': <Footprints />
}

// Countdown Timer Component
const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const updateTimer = () => {
            const difference = targetDate.getTime() - Date.now();
            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex gap-2 items-center justify-center bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl font-mono text-sm text-white w-full">
            <div className="flex flex-col items-center">
                <span className="text-sm font-black leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[8px] text-gray-500 font-black uppercase mt-0.5">d</span>
            </div>
            <span className="text-gray-600 font-black animate-pulse">:</span>
            <div className="flex flex-col items-center">
                <span className="text-sm font-black leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[8px] text-gray-500 font-black uppercase mt-0.5">h</span>
            </div>
            <span className="text-gray-600 font-black animate-pulse">:</span>
            <div className="flex flex-col items-center">
                <span className="text-sm font-black leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[8px] text-gray-500 font-black uppercase mt-0.5">m</span>
            </div>
            <span className="text-gray-600 font-black animate-pulse">:</span>
            <div className="flex flex-col items-center text-(--accent)">
                <span className="text-sm font-black leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[8px] text-(--accent)/50 font-black uppercase mt-0.5">s</span>
            </div>
        </div>
    );
};

const getEventDates = (event: ContestEvent) => {
    const now = new Date();
    if (event.status === 'active') {
        const endDate = event.end_date ? new Date(event.end_date) : new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000);
        return { label: 'Finaliza en:', date: endDate };
    } else if (event.status === 'soon') {
        const startDate = event.start_date ? new Date(event.start_date) : new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000);
        return { label: 'Comienza en:', date: startDate };
    }
    return null;
};

const getEventWinners = (event: ContestEvent) => {
    if (event.winners && event.winners.length > 0) return event.winners;
    if (event.type === 'hammer') return ['pixiesixer', 'Zeta', 'Churly'];
    if (event.type === 'dice') return ['SendPles', 'Lawchihuahua', 'ZenXeone'];
    if (event.type === 'map') return ['Neroferno', 'Killu', 'Nana_Fubuki'];
    return ['Churly', 'Zeta', 'SendPles'];
};

const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    soon: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    finished: 'bg-red-500/20 text-red-500 border-red-500/30'
}

const ContestCard = ({ event, onRegister, registering, isRegistered, onOpenPodium }: Readonly<ContestCardProps>) => {
    const { t, i18n } = useTranslation()
    const { id, title, title_en, description, description_en, type, status } = event
    
    let statusText = t('contests.status.finished');
    if (status === 'active') {
        statusText = t('contests.status.active');
    } else if (status === 'soon') {
        statusText = t('contests.status.soon');
    }

    const displayTitle = (i18n.language === 'en' && title_en) ? title_en : title;
    const displayDescription = (i18n.language === 'en' && description_en) ? description_en : description;

    const dates = getEventDates(event);

    let buttonContent = (
        <>
            <LogIn /> {t('contests.register_btn')}
        </>
    );
    if (registering) {
        buttonContent = <LogIn className="animate-bounce" />;
    } else if (isRegistered) {
        buttonContent = (
            <>
                <CheckCircle className="text-emerald-500" /> {t('contests.registered_btn')}
            </>
        );
    }

    return (
        <div className="contest-card group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-6 overflow-hidden transition-colors duration-500 hover:bg-white/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-(--accent)/20 hover:border-(--accent)/30">
            {/* Background Icon Decoration */}
            <div className="absolute -right-8 -bottom-8 text-white/5 text-[180px] rotate-12 group-hover:scale-110 group-hover:text-white/10 transition-colors pointer-events-none">
                {iconMap[type] || <Hammer />}
            </div>
            
            <div className="flex justify-between items-start">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[status]}`}>
                    {status === 'active' && <CheckCircle className="animate-pulse" />}
                    {status === 'soon' && <Hourglass className="animate-spin-slow" />}
                    {status === 'finished' && <Flag />}
                    <span>{statusText}</span>
                </div>
            </div>

            <div className="relative z-10 flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl text-(--accent) group-hover:scale-110 group-hover:rotate-12 transition-colors">
                    {iconMap[type] || <Hammer />}
                </div>
                <h3 className="text-2xl font-black text-white group-hover:text-(--accent) transition-colors">{displayTitle}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-3 italic">"{displayDescription}"</p>
                
                {/* Countdown Timer */}
                {dates && (
                    <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{dates.label}</span>
                        <CountdownTimer targetDate={dates.date} />
                    </div>
                )}
            </div>
            
            <div className="mt-auto relative z-10">
                {status === 'active' || status === 'soon' ? (
                     <button type="button" 
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors ${registering || isRegistered ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white text-black hover:bg-(--accent) hover:scale-105 active:scale-95 shadow-xl shadow-black/50'}`} 
                        onClick={() => !isRegistered && onRegister(id)}
                        disabled={registering || isRegistered}
                    >
                        {buttonContent}
                    </button>
                ) : (
                    <button aria-label="Action" type="button" 
                        onClick={() => onOpenPodium(event)}
                        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm bg-linear-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 transition-colors hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        {t('contests.view_podium', 'Ver Podio 🏆')}
                    </button>
                )}
            </div>
        </div>
    )
}

import ConfirmationModal from "../components/UI/ConfirmationModal"

export default function Contests() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [registering, setRegistering] = useState<string | number | null>(null)
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [selectedEventForPodium, setSelectedEventForPodium] = useState<ContestEvent | null>(null)

    const API_URL = import.meta.env.VITE_API_URL || '/api'
    const confettiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (confettiTimerRef.current) clearInterval(confettiTimerRef.current);
        };
    }, []);

    const queryClient = useQueryClient();
    const { data: events = [], isLoading } = useQuery<ContestEvent[]>({
        queryKey: ['eventsData'],
        queryFn: async () => {
            const eventsRes = await fetch(`${API_URL}/events`);
            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                return Array.isArray(eventsData) ? eventsData : [];
            }
            return [];
        },
        staleTime: 60_000,
    });

    const { data: myRegistrations = [] } = useQuery<Array<{ event_id: string }>>({
        queryKey: ['myRegistrations', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return [];

            const regRes = await fetch(`${API_URL}/events/my-registrations?userId=${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (regRes.ok) {
                const regData = await regRes.json();
                if (Array.isArray(regData)) return regData;
            }
            return [];
        },
        enabled: Boolean(user)
    });

    useEffect(() => {
        let ignore = false;
        setTimeout(() => {
            if (ignore) return;
            const targets = document.querySelectorAll('.contest-card');
            if (targets.length > 0) {
                gsap.fromTo('.contest-card', 
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: 'all' }
                );
            }
        }, 100);
        return () => { ignore = true; };
    }, [events.length]);

    const handleRegister = async (eventId: string | number) => {
        if (!user) {
            setShowLoginModal(true)
            return
        }

        setRegistering(eventId)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("No hay sesión activa");

            const res = await fetch(`${API_URL}/events/${eventId}/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.id })
            })
            
            if (!res.ok) {
                const data = await res.json()
                if (data.error?.includes("Ya estás inscrito")) {
                    alert(t('contests.already_registered'))
                } else {
                    throw new Error(data.error || t('contests.registration_error'))
                }
            } else {
                triggerConfetti()
                queryClient.setQueryData<Array<{ event_id: string }>>(['myRegistrations', user?.id], (prev) => [...(prev || []), { event_id: String(eventId) }])
            }
        } catch (error: unknown) {
            console.error("Registration error:", error)
            const msg = error instanceof Error ? error.message : String(error);
            alert(msg)
        } finally {
            setRegistering(null)
        }
    }

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            if (confettiTimerRef.current) clearInterval(confettiTimerRef.current);
            return;
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.5 } });
          confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.5 } });
        }, 250);
        confettiTimerRef.current = interval;
    }

    let eventsContent = (
        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
            <span className="text-gray-500 font-black uppercase tracking-widest text-sm mb-4">{t('contests.no_events')}</span>
            <Hourglass className="text-4xl text-gray-700 animate-pulse" />
        </div>
    );
    if (isLoading) {
        eventsContent = (
            <div className="col-span-full py-20 flex justify-center">
                <span className="text-white/20 font-black uppercase tracking-tighter text-4xl animate-pulse">Cargando eventos...</span>
            </div>
        );
    } else if (events.length > 0) {
        const registrationSet = new Set((myRegistrations || []).map(r => String(r.event_id)));
        eventsContent = (
            <>
                {events.map(event => (
                    <ContestCard 
                        key={event.id} 
                        event={event} 
                        onRegister={handleRegister} 
                        registering={registering === event.id}
                        isRegistered={registrationSet.has(String(event.id))}
                        onOpenPodium={setSelectedEventForPodium}
                    />
                ))}
            </>
        );
    }

    return (
        <div className="pt-24 min-h-screen">
            <Section title={t('contests.title')}>
                <div className="max-w-3xl mx-auto mb-16 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl text-center">
                    <p className="text-gray-300 text-lg leading-relaxed">{t('contests.intro')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
                    {eventsContent}
                </div>

                <ConfirmationModal 
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onConfirm={() => {
                        setShowLoginModal(false)
                        navigate('/login')
                    }}
                    title={t('login.title')}
                    message={t('contests.login_required')}
                    confirmText={t('login.sign_in_verb')}
                    cancelText={t('common.cancel', 'Cancelar')}
                />
            </Section>

            {/* 3D Winners Podium Modal */}
            <AnimatePresence>
                {selectedEventForPodium && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedEventForPodium(null)}
                        className="fixed inset-0 z-1000 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col items-center gap-6"
                        >
                            <button aria-label="Action" type="button"
                                onClick={() => setSelectedEventForPodium(null)}
                                className="absolute top-6 right-6 w-12 h-12 bg-white/5 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center text-xl transition-colors hover:rotate-90 z-50 border border-white/10"
                            >
                                <X />
                            </button>

                            <div className="text-center">
                                <span className="text-xs font-black uppercase tracking-widest text-(--accent) mb-2 block">
                                    Torneo Finalizado
                                </span>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                    {selectedEventForPodium.title}
                                </h3>
                                <p className="text-gray-400 text-xs mt-2 italic max-w-md mx-auto">
                                    ¡Felicitaciones a los campeones que conquistaron este desafío!
                                </p>
                            </div>

                            {/* 3D Podium Grid */}
                            <div className="flex items-end justify-center gap-4 md:gap-8 w-full mt-10 pb-6 relative h-70">
                                
                                {/* 2nd Place */}
                                <motion.div 
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                                    className="flex flex-col items-center w-24 md:w-28"
                                >
                                    <img 
                                        src={`https://mc-heads.net/body/${getEventWinners(selectedEventForPodium)[1]}/120`}
                                        alt="2nd Place"
                                        className="h-28 md:h-32 object-contain filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] mb-2"
                                    />
                                    <span className="text-xs font-black text-gray-300 truncate w-full text-center">{getEventWinners(selectedEventForPodium)[1]}</span>
                                    
                                    {/* Pedestal */}
                                    <div className="w-full h-16 bg-linear-to-b from-gray-400/20 to-gray-400/5 border-t-2 border-gray-400/40 rounded-t-xl flex items-center justify-center shadow-lg mt-2">
                                        <span className="text-2xl font-black text-gray-400">2</span>
                                    </div>
                                </motion.div>

                                {/* 1st Place */}
                                <motion.div 
                                    initial={{ y: 70, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                                    className="flex flex-col items-center w-28 md:w-32 z-10"
                                >
                                    <span className="text-2xl animate-bounce mb-1">👑</span>
                                    <img 
                                        src={`https://mc-heads.net/body/${getEventWinners(selectedEventForPodium)[0]}/150`}
                                        alt="1st Place"
                                        className="h-32 md:h-36 object-contain filter drop-shadow-[0_8px_15px_rgba(251,191,36,0.3)] mb-2"
                                    />
                                    <span className="text-sm font-black text-amber-300 truncate w-full text-center">{getEventWinners(selectedEventForPodium)[0]}</span>
                                    
                                    {/* Pedestal */}
                                    <div className="w-full h-24 bg-linear-to-b from-amber-500/20 to-amber-500/5 border-t-2 border-amber-500/40 rounded-t-xl flex items-center justify-center shadow-lg shadow-amber-500/5 mt-2">
                                        <span className="text-3xl font-black text-amber-500">1</span>
                                    </div>
                                </motion.div>

                                {/* 3rd Place */}
                                <motion.div 
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                                    className="flex flex-col items-center w-24 md:w-28"
                                >
                                    <img 
                                        src={`https://mc-heads.net/body/${getEventWinners(selectedEventForPodium)[2]}/100`}
                                        alt="3rd Place"
                                        className="h-24 md:h-28 object-contain filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] mb-2"
                                    />
                                    <span className="text-xs font-black text-orange-300/80 truncate w-full text-center">{getEventWinners(selectedEventForPodium)[2]}</span>
                                    
                                    {/* Pedestal */}
                                    <div className="w-full h-12 bg-linear-to-b from-orange-600/20 to-orange-600/5 border-t-2 border-orange-600/40 rounded-t-xl flex items-center justify-center shadow-lg mt-2">
                                        <span className="text-xl font-black text-orange-600">3</span>
                                    </div>
                                </motion.div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
