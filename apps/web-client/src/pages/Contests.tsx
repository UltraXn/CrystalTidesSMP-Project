import { useState, useEffect } from "react"
import Section from "../components/Layout/Section"
import { Hammer, Dices, MapPinned, Footprints, CheckCircle, Hourglass, Flag, LogIn } from "lucide-react"
import { gsap } from "gsap"
import { useTranslation } from 'react-i18next'
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getEvents, getMyRegistrations, registerToEvent, ContestEvent } from "../services/eventService"

import confetti from "canvas-confetti"
import ConfirmationModal from "../components/UI/ConfirmationModal"

interface ContestCardProps {
    event: ContestEvent;
    onRegister: (eventId: string | number) => void;
    registering: boolean;
    isRegistered: boolean;
}

const iconMap: Record<string, React.ReactElement> = {
    'hammer': <Hammer />,
    'dice': <Dices />,
    'map': <MapPinned />,
    'running': <Footprints />
}

const ContestCard = ({ event, onRegister, registering, isRegistered }: ContestCardProps) => {
    const { t, i18n } = useTranslation()
    const { id, title, title_en, description, description_en, type, status } = event
    
    const statusText = status === 'active' ? t('contests.status.active') :
                       status === 'soon' ? t('contests.status.soon') :
                       t('contests.status.finished');

    const displayTitle = (i18n.language === 'en' && title_en) ? title_en : title;
    const displayDescription = (i18n.language === 'en' && description_en) ? description_en : description;

    const statusColors = {
        active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        soon: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        finished: 'bg-red-500/20 text-red-500 border-red-500/30'
    }

    return (
        <div className="contest-card group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-6 overflow-hidden transition-all duration-500 hover:bg-white/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-(--accent)/20 hover:border-(--accent)/30">
            {/* Background Icon Decoration */}
            <div className="absolute -right-8 -bottom-8 text-white/5 text-[180px] rotate-12 group-hover:scale-110 group-hover:text-white/10 transition-all pointer-events-none">
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
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl text-(--accent) group-hover:scale-110 group-hover:rotate-12 transition-all">
                    {iconMap[type] || <Hammer />}
                </div>
                <h3 className="text-2xl font-black text-white group-hover:text-(--accent) transition-colors">{displayTitle}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-4 italic">{displayDescription}</p>
            </div>
            
            <div className="mt-auto relative z-10">
                {status === 'active' || status === 'soon' ? (
                     <button 
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${registering || isRegistered ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white text-black hover:bg-(--accent) hover:scale-105 active:scale-95 shadow-xl shadow-black/50'}`} 
                        onClick={() => !isRegistered && onRegister(id)}
                        disabled={registering || isRegistered}
                    >
                        {registering ? <LogIn className="animate-bounce" /> : isRegistered ? (
                            <>
                                <CheckCircle className="text-emerald-500" /> {t('contests.registered_btn')}
                            </>
                        ) : (
                            <>
                                <LogIn /> {t('contests.register_btn')}
                            </>
                        )}
                    </button>
                ) : (
                    <button className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm bg-black/40 text-white/20 border border-white/5 cursor-not-allowed" disabled>
                        {t('contests.status.finished')}
                    </button>
                )}
            </div>
        </div>
    )
}

export default function Contests() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [showLoginModal, setShowLoginModal] = useState(false)

    // Queries
    const { data: events = [], isLoading: eventsLoading } = useQuery({
        queryKey: ['events'],
        queryFn: getEvents
    })

    const { data: myRegistrations = [], isLoading: regsLoading } = useQuery({
        queryKey: ['events', 'registrations', user?.id],
        queryFn: () => getMyRegistrations(user!.id),
        enabled: !!user
    })

    // Mutations
    const registerMutation = useMutation({
        mutationFn: ({ eventId, userId }: { eventId: string | number, userId: string }) => 
            registerToEvent(eventId, userId),
        onSuccess: () => {
            triggerConfetti()
            queryClient.invalidateQueries({ queryKey: ['events', 'registrations', user?.id] })
        },
        onError: (error: any) => {
            console.error("Registration error:", error)
            alert(error.message || t('contests.registration_error'))
        }
    })

    const isLoading = eventsLoading || (!!user && regsLoading)

    useEffect(() => {
        if (!isLoading && events.length > 0) {
            const targets = document.querySelectorAll('.contest-card');
            if (targets.length > 0) {
                gsap.fromTo('.contest-card', 
                    { opacity: 0, y: 30, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        stagger: 0.1,
                        duration: 1.2,
                        ease: "elastic.out(1, 0.75)",
                        delay: 0.2
                    }
                );
            }
        }
    }, [isLoading, events.length])

    const handleRegister = (eventId: string | number) => {
        if (!user) {
            setShowLoginModal(true)
            return
        }
        registerMutation.mutate({ eventId, userId: user.id })
    }

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = function(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    return (
        <div className="pt-24 min-h-screen">
            <Section title={t('contests.title')}>
                <div className="max-w-3xl mx-auto mb-16 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl text-center">
                    <p className="text-gray-300 text-lg leading-relaxed">{t('contests.intro')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
                    {isLoading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <span className="text-white/20 font-black uppercase tracking-tighter text-4xl animate-pulse">Cargando eventos...</span>
                        </div>
                    ) : events.length > 0 ? (
                        events.map(event => (
                            <ContestCard 
                                key={event.id} 
                                event={event} 
                                onRegister={handleRegister} 
                                registering={registerMutation.isPending && registerMutation.variables?.eventId === event.id}
                                isRegistered={myRegistrations.includes(event.id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
                            <span className="text-gray-500 font-black uppercase tracking-widest text-sm mb-4">{t('contests.no_events')}</span>
                            <Hourglass className="text-4xl text-gray-700 animate-pulse" />
                        </div>
                    )}
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
                    cancelText="Cancelar"
                />
            </Section>
        </div>
    )
}


