import { useTranslation } from "react-i18next"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Poll, PollOption } from "../../services/pollService"

interface ActivePollProps {
    poll: Poll | null | undefined;
    isLoading: boolean;
    voted: boolean;
    onVote: (optionId: string | number) => Promise<void>;
}

export default function ActivePoll({ poll, isLoading, voted, onVote }: ActivePollProps) {
    const { t } = useTranslation()

    if (isLoading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-white/20" size={32} />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('suggestions.loading_poll')}</p>
            </div>
        )
    }

    if (!poll) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 text-center opacity-50">
                <AlertTriangle size={48} className="text-white/10" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-[200px] leading-relaxed">{t('suggestions.no_active_poll')}</p>
            </div>
        )
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl flex flex-col gap-8">
            <div>
                <div className="text-(--accent) text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-(--accent) animate-pulse"></span>
                    {poll.title}
                </div>
                <h4 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
                    {poll.question}
                </h4>
            </div>

            <div className="flex flex-col gap-4">
                {(poll.options || []).map((option: PollOption) => (
                    <button 
                        key={option.id} 
                        disabled={voted}
                        className={`relative group h-14 bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all text-left w-full ${voted ? 'cursor-default' : 'cursor-pointer hover:bg-white/10 hover:border-white/20 active:scale-95'}`} 
                        onClick={() => onVote(option.id)}
                    >
                        {/* Bar Fill */}
                        <div 
                            className={`absolute left-0 inset-y-0 transition-all duration-1000 ease-out ${voted ? 'bg-white/10 opacity-100' : 'bg-(--accent)/20 opacity-0 group-hover:opacity-100'}`} 
                            style={{ width: voted ? `${option.percent}%` : '0%' }}
                        ></div>
                        
                        <div className="relative z-10 h-full flex items-center justify-between px-6 pointer-events-none">
                            <span className={`text-sm font-black uppercase tracking-widest transition-colors ${voted ? 'text-white' : 'text-gray-400'}`}>{option.label}</span>
                            {voted && <span className="text-(--accent) font-mono font-bold">{(poll.totalVotes || 0) > 0 ? `${option.percent}%` : '0%'}</span>}
                        </div>
                    </button>
                ))}
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">
                    <span>Total: {poll.totalVotes || 0} votos</span>
                    <span>Cierra en: {poll.closesIn}</span>
                </div>
                {voted && (
                    <p className="text-emerald-400 text-center text-xs font-black uppercase tracking-widest animate-bounce">
                        {t('suggestions.thanks_vote')}
                    </p>
                )}
            </div>
        </div>
    )
}
