import { useState, useEffect } from "react"
import Section from "../components/Layout/Section"
import { FaHammer, FaDiceD20, FaMapMarkedAlt, FaRunning, FaCheckCircle, FaHourglassStart, FaFlagCheckered, FaSignInAlt } from "react-icons/fa"
import anime from "animejs"
import { useTranslation } from 'react-i18next'
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
// @ts-ignore
import confetti from "canvas-confetti"

interface ContestEvent {
    id: string | number;
    title: string;
    description: string;
    type: 'hammer' | 'dice' | 'map' | 'running';
    status: 'active' | 'soon' | 'finished';
}

interface ContestCardProps {
    event: ContestEvent;
    onRegister: (eventId: string | number) => void;
    registering: boolean;
    isRegistered: boolean;
}

const iconMap: Record<string, React.ReactElement> = {
    'hammer': <FaHammer />,
    'dice': <FaDiceD20 />,
    'map': <FaMapMarkedAlt />,
    'running': <FaRunning />
}

const ContestCard = ({ event, onRegister, registering, isRegistered }: ContestCardProps) => {
    const { t } = useTranslation()
    const { id, title, description, type, status } = event
    
    // Fallback status text
    const statusText = status === 'active' ? t('contests.status.active') :
                       status === 'soon' ? t('contests.status.soon') :
                       t('contests.status.finished');



    return (
        <div className="contest-card">
            <div className="contest-bg-icon">{iconMap[type] || <FaHammer />}</div>
            
            <div className="contest-card-header">
                <div className={`contest-status-badge ${status}`}>
                    {status === 'active' && <FaCheckCircle size={12} />}
                    {status === 'soon' && <FaHourglassStart size={12} />}
                    {status === 'finished' && <FaFlagCheckered size={12} />}
                    <span>{statusText}</span>
                </div>
            </div>

            <div className="contest-card-body">
                <div className="contest-main-icon">
                    {iconMap[type] || <FaHammer />}
                </div>
                <h3 className="contest-title">{title}</h3>
                <p className="contest-desc">{description}</p>
            </div>
            
            <div className="contest-card-footer">
                {status === 'active' || status === 'soon' ? (
                     <button 
                        className={`contest-action-btn ${registering || isRegistered ? 'disabled' : ''} ${isRegistered ? 'registered' : ''}`} 
                        onClick={() => !isRegistered && onRegister(id)}
                        disabled={registering || isRegistered}
                    >
                        {registering ? 'Procesando...' : isRegistered ? (
                            <>
                                <FaCheckCircle /> ¡Ya estás dentro!
                            </>
                        ) : (
                            <>
                                <FaSignInAlt /> Inscribirme Ahora
                            </>
                        )}
                    </button>
                ) : (
                    <button className="contest-action-btn disabled" disabled>
                        Evento Finalizado
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
    const [events, setEvents] = useState<ContestEvent[]>([])
    const [myRegistrations, setMyRegistrations] = useState<(string | number)[]>([])
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState<string | number | null>(null) // ID of event being registered for

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        if (!API_URL) return

        const fetchData = async () => {
             try {
                // 1. Fetch Events
                const eventsRes = await fetch(`${API_URL}/events`)
                const eventsData = await eventsRes.json()
                if (Array.isArray(eventsData)) {
                    setEvents(eventsData)
                }

                // 2. Fetch User Registrations (if logged in)
                if (user) {
                     const regRes = await fetch(`${API_URL}/events/my-registrations?userId=${user.id}`)
                     const regData = await regRes.json()
                     if (Array.isArray(regData)) {
                         setMyRegistrations(regData)
                     }
                }

             } catch (error) {
                 console.error("Error fetching data:", error)
             } finally {
                 setLoading(false)
                 setTimeout(() => {
                    anime({
                        targets: '.contest-card',
                        opacity: [0, 1],
                        translateY: [20, 0],
                        delay: anime.stagger(150, { start: 100 }),
                        easing: 'spring(1, 80, 10, 0)',
                        duration: 800
                    })
                }, 100)
             }
        }

        fetchData()
    }, [user, API_URL]) // Re-run if user logs in/out

    const handleRegister = async (eventId: string | number) => {
        if (!user) {
            if(window.confirm("Debes iniciar sesión para inscribirte. ¿Ir al login?")) {
                navigate('/login')
            }
            return
        }

        setRegistering(eventId)
        try {
            const res = await fetch(`${API_URL}/events/${eventId}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            })
            
            const data = await res.json()

            if (!res.ok) {
                if (data.error && data.error.includes("Ya estás inscrito")) {
                    alert("¡Ya estás inscrito en este evento!")
                } else {
                    throw new Error(data.error || "Error al inscribirse")
                }
            } else {
                // Success!
                triggerConfetti()
                setMyRegistrations(prev => [...prev, eventId])
                // alert("¡Inscripción exitosa! Te esperamos.") // Optional: remove alert if button change is enough
            }
        } catch (error: any) {
            console.error("Registration error:", error)
            alert(error.message || String(error))
        } finally {
            setRegistering(null)
        }
    }

    const triggerConfetti = () => {
        var duration = 3 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        var randomInRange = function(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function() {
          var timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          var particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    return (
        <Section title={t('contests.title')}>
            <Section>
                <div className="crystal-card">
                    <p>{t('contests.intro')}</p>
                </div>
            </Section>

            <div className="contests-grid">
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>Cargando eventos...</div>
                ) : events.length > 0 ? (
                    events.map(event => (
                        <ContestCard 
                            key={event.id} 
                            event={event} 
                            onRegister={handleRegister} 
                            registering={registering === event.id}
                            isRegistered={myRegistrations.includes(event.id)}
                        />
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666', border: '1px dashed #333', padding: '2rem', borderRadius: '8px' }}>
                        No hay eventos activos por el momento.
                    </div>
                )}
            </div>
        </Section>
    )
}
