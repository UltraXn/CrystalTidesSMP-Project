import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaUsers, FaMicrochip } from "react-icons/fa"
import Loader from "../components/UI/Loader"
import { useTranslation } from 'react-i18next'
import ServerStatusCard, { ServerStatusData } from "../components/Server/ServerStatusCard"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Status() {
    const [status, setStatus] = useState<ServerStatusData | null>(null)
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation()

    const SERVER_IP = "mc.crystaltidesSMP.net" // Display IP

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/server/status/live`)
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                setStatus(data);
            }
        } catch (error) {
            console.error("Error fetching status:", error)
            setStatus(null) // Acts as offline/error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(() => fetchStatus(), 15000) // Refresh every 15s
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader />
            </div>
        )
    }

    const isOnline = status?.online ?? false
    const playerCount = status?.players?.online || 0

    return (
        <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 1rem 2rem' }}>
            
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >

                <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t('status.title')}</h1>
                <p className="text-gray-400">{t('status.subtitle')}</p>
            </motion.div>

            {/* Main Status Log */}
            <ServerStatusCard status={status} serverIp={SERVER_IP} />

            {/* Players Grid */}
            <AnimatePresence>
                {isOnline && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                         <div style={{
                            background: 'rgba(20, 20, 25, 0.4)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                         }}>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FaUsers className="text-accent" /> {t('status.online_players')}
                            </h3>
                            
                            {status?.players.sample && status.players.sample.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {status.players.sample.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                                            <img 
                                                src={`https://minotar.net/helm/${p.name}/24.png`} 
                                                alt={p.name}
                                                className="rounded-sm"
                                            />
                                            <span className="font-medium text-sm">{p.name}</span>
                                        </div>
                                    ))}
                                    {status.players.sample.length < playerCount && (
                                        <div className="px-3 py-2 text-gray-500 text-sm italic">
                                            + {playerCount - status.players.sample.length} {t('status.more')}...
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">
                                    {playerCount === 0 ? t('status.no_players') : t('status.list_unavailable')}
                                </p>
                            )}
                         </div>

                         <div style={{
                            background: 'rgba(20, 20, 25, 0.4)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                             display: 'flex', flexDirection: 'column', gap: '1rem'
                         }}>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FaMicrochip className="text-blue-400" /> {t('status.tech_info')}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between p-3 rounded-lg bg-black/20">
                                    <span className="text-gray-400">{t('status.latency')}</span>
                                    <span className={`font-mono ${
                                        status?.latency != null 
                                            ? status.latency <= 100 ? 'text-green-400' 
                                            : status.latency < 200 ? 'text-yellow-400' 
                                            : 'text-red-400'
                                            : 'text-gray-400'
                                    }`}>
                                        {status?.latency != null ? Math.round(status.latency) + 'ms' : '--'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 w-full">
                                    <span className="text-gray-400">{t('status.mode')}</span>
                                    <span className="font-medium text-white">Survival / SMP</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 w-full">
                                    <span className="text-gray-400">{t('status.platform')}</span>
                                    <span className="font-medium text-white">Java Edition</span>
                                </div>
                            </div>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {!isOnline && !loading && (
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-xl mt-4"
                >
                     <h3 className="text-xl font-bold text-red-400 mb-2">{t('status.offline_title')}</h3>
                    <p className="text-gray-400">{t('status.offline_desc')}</p>
                 </motion.div>
            )}
        </div>
    )
}
