import { MapPin, X, HelpCircle } from "lucide-react"
import { m } from "framer-motion"
import { WorldLocation } from "../../services/locationService"
import { useTranslation } from "react-i18next"

interface StoryDetailsModalProps {
    place: WorldLocation;
    onClose: () => void;
}

export default function StoryDetailsModal({ place, onClose }: StoryDetailsModalProps) {
    const { t } = useTranslation()

    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-1000 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <m.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-black"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-12 h-12 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center text-xl transition-all hover:bg-white hover:text-black hover:rotate-90 z-50 border border-white/10"
                    aria-label="Cerrar modal"
                >
                    <X aria-hidden="true" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 relative bg-white/5 h-[300px] md:h-auto">
                    {place.is_coming_soon ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <HelpCircle className="text-9xl text-white/5 animate-pulse" aria-hidden="true" />
                        </div>
                    ) : (
                        <img
                            src={place.image_url || ''}
                            alt={place.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-[#0a0a0a] via-transparent to-transparent" aria-hidden="true"></div>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-(--accent) font-mono text-sm tracking-widest">
                            <MapPin size={16} aria-hidden="true" /> {place.coords}
                        </div>
                        <h2 id="modal-title" className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                            {place.title}
                        </h2>
                        
                        {/* Authors */}
                        <div className="flex flex-wrap gap-3">
                            {place.authors && place.authors.map((auth, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl group/author transition-all hover:bg-white/10">
                                    <img
                                        src={`https://minotar.net/helm/${auth.name}/100.png`}
                                        alt={`Avatar de ${auth.name}`}
                                        className="w-8 h-8 rounded-lg shadow-lg"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{t(`stories.roles.${auth.role}`)}</span>
                                        <span className="text-xs font-bold text-white transition-colors group-hover/author:text-(--accent)">{auth.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" aria-hidden="true"></div>

                    <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-medium whitespace-pre-line italic">
                        {place.long_description}
                    </p>
                </div>
            </m.div>
        </m.div>
    )
}
