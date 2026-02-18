import { Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SkinViewer from './SkinViewer'

interface SkinShowcaseProps {
    username: string;
}

export default function SkinShowcase({ username }: SkinShowcaseProps) {
    const { t } = useTranslation()

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl group">
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-3 transition-colors group-hover:text-white/60">
                <Gamepad2 size={18} className="text-(--accent)" /> 
                {t('profile.skin_title')}
            </h3>
            
            <div className="w-16 h-1 bg-linear-to-r from-(--accent)/40 to-transparent rounded-full mb-8 opacity-50" />

            <div className="w-full aspect-3/4 flex items-center justify-center relative">
                {/* Decorative background for skin */}
                <div className="absolute inset-0 bg-radial from-(--accent)/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-500">
                    <SkinViewer username={username} height={380} width={280} />
                </div>
            </div>
        </div>
    )
}
