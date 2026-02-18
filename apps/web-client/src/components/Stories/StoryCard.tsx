import { MapPin, HelpCircle } from "lucide-react"
import { WorldLocation } from "../../services/locationService"

interface StoryCardProps {
    place: WorldLocation;
    onClick: () => void;
}

export default function StoryCard({ place, onClick }: StoryCardProps) {
    return (
        <div
            className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:bg-white/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-(--accent)/10 hover:border-(--accent)/30"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
            aria-label={`Ver detalles de ${place.title}`}
        >
            <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                {place.is_coming_soon ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60"></div>
                        <HelpCircle className="text-6xl text-white/10 animate-pulse relative z-10" aria-hidden="true" />
                        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 relative z-10">Clasificado</span>
                    </div>
                ) : (
                    <>
                        <span className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-(--accent)">
                            <MapPin size={12} aria-hidden="true" /> {place.coords}
                        </span>
                        <img 
                            src={place.image_url || ''} 
                            alt={place.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" aria-hidden="true"></div>
                    </>
                )}
            </div>
            <div className="p-8 flex flex-col gap-3">
                <h3 className={`text-2xl font-black transition-colors ${place.is_coming_soon ? 'text-gray-700' : 'text-white group-hover:text-(--accent)'}`}>{place.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-2 italic">{place.description}</p>
            </div>
        </div>
    )
}
