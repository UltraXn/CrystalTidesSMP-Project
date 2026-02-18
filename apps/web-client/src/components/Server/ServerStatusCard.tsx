import { useState } from "react"
import { m } from "framer-motion"
import { CheckCircle, Copy } from "lucide-react"
import Confetti from "canvas-confetti"
import { useTranslation } from 'react-i18next'
import { ServerStatusData } from "../../services/serverService"

interface ServerStatusCardProps {
    status: ServerStatusData | null;
    serverIp?: string;
}

export default function ServerStatusCard({ status, serverIp = "mc.crystaltidesSMP.net" }: ServerStatusCardProps) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    const isOnline = status?.online ?? false
    const playerCount = status?.players?.online || 0
    const maxPlayers = status?.players?.max || 0
    const percentage = maxPlayers > 0 ? (playerCount / maxPlayers) * 100 : 0
    
    // Clean MOTD
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
        <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden shadow-2xl"
        >
            {/* Glow Effect based on status */}
            <div 
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[5px] opacity-80 transition-colors duration-500 ${isOnline ? 'bg-(--success) shadow-[0_0_50px_20px_rgba(74,222,128,0.2)]' : 'bg-(--error) shadow-[0_0_50px_20px_rgba(239,68,68,0.2)]'}`} 
                aria-hidden="true"
            />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 z-10 relative w-full">
                {/* Icon */}
                <div className="relative shrink-0">
                    <div className={`w-32 h-32 rounded-3xl bg-black overflow-hidden border-2 flex items-center justify-center transition-colors duration-500 ${isOnline ? 'border-(--success)' : 'border-(--error)'}`}>
                        <img src="/images/server_icon.png" alt="Icono del servidor" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 mb-6 w-full">
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black flex flex-wrap justify-center md:justify-start items-center gap-4 text-white uppercase tracking-tighter">
                                {serverIp}
                                <button 
                                    onClick={handleCopy}
                                    className={`px-4 py-1.5 rounded-xl border-none font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${copied ? 'bg-(--success) text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                    aria-label={`Copiar IP del servidor: ${serverIp}`}
                                >
                                    {copied ? <CheckCircle size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                                    <span>{copied ? t('common.copied') : t('common.copy')}</span>
                                </button>
                            </h2>
                            <p className="text-gray-400 mt-2 font-medium leading-relaxed">{cleanMotd}</p>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg border transition-all duration-500 ${isOnline ? 'text-(--success) bg-(--success)/10 border-(--success)/20' : 'text-(--error) bg-(--error)/10 border-(--error)/20'}`}>
                                {isOnline ? t('status.online') : t('status.offline')}
                            </span>
                        </div>
                    </div>

                    {/* Player Bar */}
                    <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden relative mb-3 border border-white/5">
                            <m.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-linear-to-r from-teal-500 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                            />
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-500 px-1">
                        <span>{t('status.version')}: <span className="text-white">{status?.version || "1.21.1"}</span></span>
                        <span>{t('status.players')}: <span className="text-white">{playerCount}</span> / {maxPlayers}</span>
                    </div>
                </div>
            </div>
        </m.div>
    )
}
