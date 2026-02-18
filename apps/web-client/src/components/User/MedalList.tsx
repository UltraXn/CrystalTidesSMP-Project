import { Medal } from 'lucide-react'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MEDAL_ICONS } from '../../utils/MedalIcons'
import { MedalDefinition } from '../../services/userService'

interface MedalListProps {
    medals?: (string | number)[];
    medalDefinitions: MedalDefinition[];
}

export default function MedalList({ medals, medalDefinitions }: MedalListProps) {
    const { t, i18n } = useTranslation()

    if (!medals || medals.length === 0) return null

    return (
        <LazyMotion features={domAnimation}>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl group">
                <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-3 transition-colors group-hover:text-white/60">
                    <Medal size={18} className="text-(--accent)" /> 
                    {t('profile.medals')}
                </h3>

                <div className="flex flex-wrap gap-3">
                    {medals.map((medalId: string | number) => {
                        const def = medalDefinitions.find((m: MedalDefinition) => m.id === medalId)
                        if (!def) return null
                        const Icon = MEDAL_ICONS[def.icon as keyof typeof MEDAL_ICONS] || Medal
                        
                        const medalName = i18n.language.startsWith('en') && def.name_en 
                            ? def.name_en 
                            : t(`account.medals.items.${medalId}.title`, def.name)

                        return (
                            <m.div 
                                key={medalId}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-3 px-4 py-2 bg-white/5 border rounded-xl transition-all duration-300 group/medal"
                                style={{ borderColor: `${def.color}33` }}
                                title={def.description}
                            >
                                <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/20 group-hover/medal:bg-black/40 transition-colors"
                                >
                                    {def.image_url ? (
                                        <img 
                                            src={def.image_url} 
                                            alt={def.name} 
                                            className="w-5 h-5 object-contain" 
                                        />
                                    ) : (
                                        <Icon style={{ color: def.color }} size={18} />
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-white/80 group-hover/medal:text-white">
                                    {medalName}
                                </span>
                            </m.div>
                        )
                    })}
                </div>
            </div>
        </LazyMotion>
    )
}
