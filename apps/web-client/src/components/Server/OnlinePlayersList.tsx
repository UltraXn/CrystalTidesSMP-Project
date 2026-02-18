import { useTranslation } from "react-i18next"
import { Users } from "lucide-react"

interface OnlinePlayersListProps {
    players: { name: string, id: string }[];
    totalOnline: number;
}

export default function OnlinePlayersList({ players, totalOnline }: OnlinePlayersListProps) {
    const { t } = useTranslation()

    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 h-full">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Users className="text-(--accent)" aria-hidden="true" /> 
                {t('status.online_players')}
            </h3>
            
            {players && players.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {players.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5 group transition-all hover:bg-white/5">
                            <img 
                                src={`https://minotar.net/helm/${p.name}/24.png`} 
                                alt={`Avatar de ${p.name}`}
                                className="w-6 h-6 rounded-md shadow-lg"
                                loading="lazy"
                            />
                            <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{p.name}</span>
                        </div>
                    ))}
                    {players.length < totalOnline && (
                        <div className="px-4 py-2 text-gray-500 text-sm font-medium italic bg-white/2 rounded-xl border border-dashed border-white/5">
                            + {totalOnline - players.length} {t('status.more')}...
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-gray-500 italic font-medium">
                    {totalOnline === 0 ? t('status.no_players') : t('status.list_unavailable')}
                </p>
            )}
        </div>
    )
}
