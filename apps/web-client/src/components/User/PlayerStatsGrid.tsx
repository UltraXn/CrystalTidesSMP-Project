import { Trophy } from "lucide-react"
import Loader from "../UI/Loader"
import { useTranslation } from "react-i18next"
import PlaystyleRadar from "../Account/PlaystyleRadarFinal"

interface PlayerStats {
    playtime: string;
    kills: number;
    mob_kills: number;
    deaths: number;
    money: string;
    blocks_mined: string;
    blocks_placed: string;
    rank?: string;
}

interface PlayerStatsGridProps {
    stats: PlayerStats | null;
    loading: boolean;
    isPublic: boolean;
    isAdmin: boolean;
}

export default function PlayerStatsGrid({ stats, loading, isPublic, isAdmin }: PlayerStatsGridProps) {
    const { t } = useTranslation()

    // Helper to parse playtime "12h 30m"
    const parsePlaytime = (ptStr: string): number => {
        if (!ptStr) return 0;
        const h = parseInt(ptStr.match(/(\d+)h/)?.[1] || "0");
        const m = parseInt(ptStr.match(/(\d+)m/)?.[1] || "0");
        return h + m / 60;
    }

    const parseMoney = (moneyStr: string): number => {
        if (!moneyStr) return 0;
        return parseFloat(moneyStr.replace(/[^0-9.-]+/g, ""));
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl transition-all hover:border-white/20 hover:shadow-2xl">
            <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white/40 mb-6">
                <Trophy size={16} /> {t('profile.playstyle_title', 'Gráfico de Estilo')}
            </h3>
            
            {(isPublic || isAdmin) ? (
                <div className="flex flex-col items-center">
                    {loading ? (
                        <div className="py-12"><Loader text={t('profile.loading_stats')} /></div>
                    ) : stats ? (
                        <>
                            <div className="w-full relative z-10">
                                <PlaystyleRadar 
                                    stats={{
                                        blocksPlaced: Number(stats.blocks_placed || 0),
                                        blocksMined: Number(stats.blocks_mined || 0),
                                        kills: Number(stats.kills || 0),
                                        mobKills: Number(stats.mob_kills || 0),
                                        playtimeHours: parsePlaytime(stats.playtime),
                                        money: parseMoney(stats.money),
                                        rank: stats.rank || "default"
                                    }}
                                />
                            </div>
                            

                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500 font-bold text-xs italic">
                            {t('profile.error_stats', 'No se pudieron cargar los datos de estilo.')}
                        </div>
                    )}
                </div>
            ) : (
                 <div className="text-center py-12 px-6 bg-black/20 rounded-2xl border border-dashed border-white/5">
                    <div className="text-2xl mb-2 opacity-30">🔒</div>
                    <p className="text-gray-500 font-bold text-xs">
                        {t('profile.private_stats', 'Este usuario mantiene su estilo de juego en privado.')}
                    </p>
                </div>
            )}
        </div>
    )
}
