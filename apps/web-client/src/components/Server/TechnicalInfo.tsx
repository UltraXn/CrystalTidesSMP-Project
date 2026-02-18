import { useTranslation } from "react-i18next"
import { Cpu } from "lucide-react"

interface TechnicalInfoProps {
    latency?: number;
}

export default function TechnicalInfo({ latency }: TechnicalInfoProps) {
    const { t } = useTranslation()

    const getLatencyColor = (ms?: number) => {
        if (ms == null) return 'text-gray-400'
        if (ms <= 100) return 'text-emerald-400'
        if (ms < 200) return 'text-amber-400'
        return 'text-rose-400'
    }

    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 h-full flex flex-col gap-6">
            <h3 className="text-xl font-bold mb-1 flex items-center gap-3">
                <Cpu className="text-blue-400" aria-hidden="true" /> 
                {t('status.tech_info')}
            </h3>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('status.latency')}</span>
                    <span className={`font-mono font-black ${getLatencyColor(latency)}`}>
                        {latency != null ? Math.round(latency) + 'ms' : '--'}
                    </span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('status.mode')}</span>
                    <span className="font-bold text-white text-sm uppercase tracking-wide">{t('status.mode_val')}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('status.platform')}</span>
                    <span className="font-bold text-white text-sm uppercase tracking-wide">{t('status.platform_val')}</span>
                </div>
            </div>
        </div>
    )
}
