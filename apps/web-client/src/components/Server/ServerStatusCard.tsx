import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Copy } from "lucide-react"
import Confetti from "canvas-confetti"
import { useTranslation } from 'react-i18next'

export interface ServerStatusData {
    online: boolean;
    motd: string;
    version: string;
    players: {
        online: number;
        max: number;
        sample: { name: string, id: string }[]
    };
    icon: string;
    latency?: number;
    error?: string;
}

interface ServerStatusCardProps {
    status: ServerStatusData | null;
    serverIp?: string;
}

export default function ServerStatusCard({ status, serverIp = "mc.crystaltidesSMP.net" }: ServerStatusCardProps) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    const isOnline = status?.online ?? false
    // Use the explicitly passed status online count, or 0.
    // NOTE: If status is null (loading/error), default to 0.
    const playerCount = status?.players?.online || 0
    const maxPlayers = status?.players?.max || 0
    const percentage = maxPlayers > 0 ? (playerCount / maxPlayers) * 100 : 0
    
    // Clean MOTD (remove color codes if raw logic isn't perfect, though backend sends .clean)
    const cleanMotd = status?.motd || "Servidor Minecraft"

    const handleCopy = () => {
        navigator.clipboard.writeText(serverIp)
        setCopied(true)
        Confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#4ade80', '#ffffff']
        });
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={{
                background: 'rgba(20, 20, 25, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Glow Effect based on status */}
            <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '60%', height: '5px',
                background: isOnline ? 'var(--success)' : 'var(--error)',
                boxShadow: isOnline ? '0 0 50px 20px rgba(74, 222, 128, 0.2)' : '0 0 50px 20px rgba(239, 68, 68, 0.2)',
                opacity: 0.8
            }} />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10 relative w-full">
                {/* Icon */}
                <div className="relative">
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '24px',
                        background: '#000', overflow: 'hidden',
                        border: isOnline ? '2px solid var(--success)' : '2px solid var(--error)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                            <img src="/images/server_icon.png" alt="Server Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-4 w-full">
                        <div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3">
                                {serverIp}
                                <button 
                                    onClick={handleCopy}
                                    style={{ 
                                        background: copied ? 'var(--success)' : 'rgba(255,255,255,0.1)', 
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {copied ? <CheckCircle /> : <Copy />}
                                    <span style={{ fontWeight: 'bold' }}>{copied ? t('common.copied') : t('common.copy')}</span>
                                </button>
                            </h2>
                            <p className="text-gray-400 mt-1">{cleanMotd}</p>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <span style={{
                                fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px',
                                color: isOnline ? 'var(--success)' : 'var(--error)',
                                background: isOnline ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                padding: '0.4rem 1rem', borderRadius: '8px', border: isOnline ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                {isOnline ? t('status.online') : t('status.offline')}
                            </span>
                        </div>
                    </div>

                    {/* Player Bar */}
                    <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden relative mb-2">
                            <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-linear-to-r from-teal-500 to-emerald-400"
                        />
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>{t('status.version')}: {status?.version || "1.21.1"}</span>
                        <span>{t('status.players')}: <strong className="text-white">{playerCount}</strong> / {maxPlayers}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
