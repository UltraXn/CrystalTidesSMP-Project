import { motion as Motion } from 'framer-motion'
import { Skull, Crosshair, Box, Layers, Trophy, Clock, Calendar, Ghost } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Loader from '../UI/Loader'

interface PlayerStatsData {
    rank?: string;
    rank_image?: string;
    money: string | number;
    playtime: string;
    member_since: string;
    kills: string | number;
    mob_kills: string | number;
    deaths: string | number;
    blocks_mined: string | number;
    blocks_placed: string | number;
}

interface PlayerStatsProps {
    statsData: PlayerStatsData | null;
    loading: boolean;
    error: unknown;
}

export default function PlayerStats({ statsData, loading, error }: PlayerStatsProps) {
    const { t } = useTranslation()

    if (error) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
                <p className="text-red-400 font-black uppercase tracking-widest text-xs">⚠️ {t('account.stats.error')}</p>
            </div>
        )
    }

    if (loading || !statsData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader text={t('account.stats.loading')} />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                <StatItem 
                    icon={<Trophy />} 
                    label={t('account.overview.rank')} 
                    value={(() => {
                        const r = statsData?.rank?.toLowerCase() || '';
                        
                        // 1. Use Backend provided image
                        if (statsData.rank_image) {
                            return <img src={`/ranks/${statsData.rank_image}`} alt={statsData.rank} className="max-h-full w-auto object-contain [image-rendering:pixelated]" />;
                        }
                        
                        // 2. Fallback Logic
                        if (r.includes('miembro') || r.includes('default')) return <img src="/ranks/user.png" alt="Miembro" className="max-h-full w-auto object-contain [image-rendering:pixelated]" />;
                        if (r.includes('donador')) return <img src="/ranks/rank-donador.png" alt="Donador" className="max-h-full w-auto object-contain [image-rendering:pixelated]" />;
                        if (r.includes('fundador')) return <img src="/ranks/rank-fundador.png" alt="Fundador" className="max-h-full w-auto object-contain [image-rendering:pixelated]" />;
                        if (r.includes('killuwu')) return <img src="/ranks/rank-killu.png" alt="Killuwu" className="max-h-full w-auto object-contain [image-rendering:pixelated]" />;
                        if (r.includes('neroferno')) return <img src="/ranks/rank-neroferno.png" alt="Neroferno" className="max-h-full w-auto object-contain [image-rendering:pixelated]" />;
                        if (r.includes('developer')) return <img src="/ranks/developer.png" alt="Developer" className="max-h-full w-auto object-contain [image-rendering:pixelated]" />;
                        
                        return <span className="text-sm font-black uppercase tracking-tighter text-white">{statsData.rank}</span>;
                    })()}
                    color="#f1c40f" 
                />

                {/* Money Card */}
                 <StatItem 
                    icon={<img src="/images/killucoin.png" alt="Coin" className="w-8 h-8 object-contain [image-rendering:pixelated]" />} 
                    label={t('account.overview.coins')} 
                    value={statsData.money} 
                    color="#f1c40f"
                />

                {/* Playtime Card */}
                <StatItem 
                    icon={<Clock />} 
                    label={t('account.overview.playtime')} 
                    value={statsData.playtime} 
                    color="#3498db" 
                />

                {/* Join Date Card */}
                <StatItem 
                    icon={<Calendar />} 
                    label={t('account.stats.member_since')} 
                    value={statsData.member_since} 
                    color="#9b59b6" 
                />

                {/* Combat & Work Stats */}
                <StatItem 
                    icon={<Crosshair />} 
                    label={t('account.stats.kills')} 
                    value={statsData.kills} 
                    color="#e74c3c" 
                />
                 <StatItem 
                    icon={<Ghost />} 
                    label={t('account.stats.mob_kills')} 
                    value={statsData.mob_kills} 
                    color="#e67e22" 
                />
                <StatItem 
                    icon={<Skull />} 
                    label={t('account.stats.deaths')} 
                    value={statsData.deaths} 
                    color="#7f8c8d" 
                />
                <StatItem 
                    icon={<Box />} 
                    label={t('account.stats.mined')} 
                    value={statsData.blocks_mined} 
                    color="#8e44ad" 
                />
                <StatItem 
                    icon={<Layers />} 
                    label={t('account.stats.placed')} 
                    value={statsData.blocks_placed} 
                    color="#2ecc71" 
                />
            </div>
        </div>
    )
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string | number | React.ReactNode;
    color: string;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
    return (
        <Motion.div 
            className="group relative flex flex-col items-center bg-white/5 border border-white/5 rounded-4xl p-8 backdrop-blur-3xl transition-all hover:bg-white/10 hover:border-white/10 hover:-translate-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${color}15`, color: color }}
            >
                <div className="text-2xl drop-shadow-2xl">
                    {icon}
                </div>
            </div>
            
            <div className="text-center space-y-1">
                <div className="flex items-center justify-center h-8">
                    {typeof value === 'object' ? (
                        <div className="max-h-full flex items-center justify-center">{value}</div>
                    ) : (
                        <span className="text-2xl font-black text-white uppercase tracking-tighter tabular-nums">
                            {value}
                        </span>
                    )}
                </div>
                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    {label}
                </span>
            </div>

            {/* Accent Border Bottom */}
            <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
            />
        </Motion.div>
    )
}
