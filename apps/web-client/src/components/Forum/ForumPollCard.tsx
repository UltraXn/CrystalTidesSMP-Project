import { BarChart3, Flame } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Poll } from "../../services/pollService"

interface ForumPollCardProps {
    poll: Poll | null;
}

export default function ForumPollCard({ poll }: ForumPollCardProps) {
    const { t, i18n } = useTranslation()

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col h-full hover:border-(--accent)/30 transition-colors group">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-[10px]">
                    <BarChart3 size={16} className="text-(--accent)" aria-hidden="true" />
                    <span>{t('forum_page.official_poll_section')}</span>
                </div>
                {poll && (
                    <div className="flex items-center gap-2 text-rose-500 font-black uppercase text-[10px] animate-pulse">
                        <Flame size={12} aria-hidden="true" /> 
                        {t('forum_page.hot')}
                    </div>
                )}
            </div>

            {poll ? (
                <div className="flex flex-col flex-1">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-8 leading-tight tracking-tight">
                        {i18n.language === 'en' && poll.question_en ? poll.question_en : poll.question}
                    </h3>
                    <div className="space-y-4 flex-1">
                        {(poll.options || []).slice(0, 3).map((opt) => (
                            <div key={opt.id} className="relative group/opt">
                                <div className="h-14 bg-white/2 rounded-2xl overflow-hidden relative border border-white/5 transition-all group-hover/opt:border-white/10">
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-(--accent) opacity-20 transition-all duration-1000 ease-out group-hover:opacity-30" 
                                        style={{ width: `${opt.percent}%` }}
                                        aria-hidden="true"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-between px-6">
                                        <span className="text-gray-200 font-bold text-sm z-10">
                                            {i18n.language === 'en' && opt.label_en ? opt.label_en : opt.label}
                                        </span>
                                        <span className="text-(--accent) font-black text-sm z-10">{opt.percent}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-12 opacity-30">
                    <BarChart3 size={48} className="text-gray-500" aria-hidden="true" />
                    <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">{t('forum_page.no_active_poll')}</p>
                </div>
            )}
        </div>
    )
}
