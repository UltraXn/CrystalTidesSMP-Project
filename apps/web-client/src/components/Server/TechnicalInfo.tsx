import { useTranslation } from "react-i18next"
import { Cpu } from "lucide-react"
import { motion } from "framer-motion"

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants: import('framer-motion').Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
            }
        }
    }

    return (
        <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="bg-white/5 border border-white/5 rounded-2xl p-6 h-full flex flex-col gap-6"
        >
            <motion.h3 variants={itemVariants} className="text-xl font-bold mb-1 flex items-center gap-3">
                <Cpu className="text-blue-400" aria-hidden="true" /> 
                {t('status.tech_info')}
            </motion.h3>
            
            <div className="space-y-4">
                <motion.div variants={itemVariants} className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('status.latency')}</span>
                    <span className={`font-mono font-black ${getLatencyColor(latency)}`}>
                        {latency != null ? Math.round(latency) + 'ms' : '--'}
                    </span>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('status.mode')}</span>
                    <span className="font-bold text-white text-sm uppercase tracking-wide">{t('status.mode_val')}</span>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('status.platform')}</span>
                    <span className="font-bold text-white text-sm uppercase tracking-wide">{t('status.platform_val')}</span>
                </motion.div>
            </div>
        </motion.div>
    )
}
