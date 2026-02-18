import { m, AnimatePresence } from "framer-motion"
import Loader from "../components/UI/Loader"
import { useTranslation } from 'react-i18next'
import ServerStatusCard from "../components/Server/ServerStatusCard"
import { useQuery } from "@tanstack/react-query"
import { getServerStatus } from "../services/serverService"
import OnlinePlayersList from "../components/Server/OnlinePlayersList"
import TechnicalInfo from "../components/Server/TechnicalInfo"

export default function Status() {
    const { t } = useTranslation()
    const SERVER_IP = "mc.crystaltidesSMP.net"

    const { data: status, isLoading: loading } = useQuery({
        queryKey: ['serverStatus'],
        queryFn: getServerStatus,
        refetchInterval: 15000,
        staleTime: 10000,
    })

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    const isOnline = status?.online ?? false
    const playerCount = status?.players?.online || 0

    return (
        <div className="max-w-[1000px] mx-auto px-4 pt-32 pb-16">
            
            {/* Header */}
            <m.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-6xl font-black mb-4 bg-linear-to-r from-white via-white to-white/40 bg-clip-text text-transparent uppercase tracking-tighter">
                    {t('status.title')}
                </h1>
                <p className="text-gray-400 font-medium text-lg">{t('status.subtitle')}</p>
            </m.div>

            {/* Main Status Log */}
            <ServerStatusCard status={status!} serverIp={SERVER_IP} />

            {/* Content Grid */}
            <AnimatePresence>
                {isOnline && (
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                         <OnlinePlayersList 
                            players={status?.players.sample || []} 
                            totalOnline={playerCount} 
                         />

                         <TechnicalInfo latency={status?.latency} />
                    </m.div>
                )}
            </AnimatePresence>
            
            {!isOnline && !loading && (
                 <m.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-center p-12 bg-rose-500/5 border border-rose-500/10 rounded-3xl mt-8 backdrop-blur-sm"
                >
                     <h3 className="text-2xl font-black text-rose-400 mb-2 uppercase tracking-tight">{t('status.offline_title')}</h3>
                    <p className="text-gray-400 font-medium">{t('status.offline_desc')}</p>
                 </m.div>
            )}
        </div>
    )
}
