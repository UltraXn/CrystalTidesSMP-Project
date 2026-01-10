import { useState, useEffect } from "react"
import { MapPin, HelpCircle, X } from "lucide-react"
import Section from "../components/Layout/Section"
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from "framer-motion"
import { getLocations, WorldLocation } from "../services/locationService"
import Loader from "../components/UI/Loader"

export default function Stories() {
    const { t } = useTranslation()
    const [locations, setLocations] = useState<WorldLocation[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null)

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await getLocations()
                setLocations(data)
            } catch (error) {
                console.error("Error loading locations:", error)
                setLocations([]) // Evitar estados de carga infinitos en caso de error
            } finally {
                setLoading(false)
            }
        }
        fetchLocations()
    }, [])

    const selectedPlace = locations.find(p => p.id === selectedPlaceId)

    return (
        <Section title={t('stories.title')}>
            <Section>
                <div className="max-w-3xl mx-auto p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl text-center mb-16">
                    <p className="text-gray-300 text-lg leading-relaxed">{t('stories.intro')}</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                        {locations.map(place => (
                            <div
                                key={place.id}
                                className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:bg-white/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-(--accent)/10 hover:border-(--accent)/30"
                                onClick={() => setSelectedPlaceId(place.id)}
                            >
                                <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                                    {place.is_coming_soon ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60"></div>
                                            <HelpCircle className="text-6xl text-white/10 animate-pulse relative z-10" />
                                            <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 relative z-10">Clasificado</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-(--accent)">
                                                <MapPin /> {place.coords}
                                            </span>
                                            <img 
                                                src={place.image_url || ''} 
                                                alt={place.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                        </>
                                    )}
                                </div>
                                <div className="p-8 flex flex-col gap-3">
                                    <h3 className={`text-2xl font-black transition-colors ${place.is_coming_soon ? 'text-gray-700' : 'text-white group-hover:text-(--accent)'}`}>{place.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-2 italic">{place.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && locations.length === 0 && (
                    <div className="text-center py-20 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
                        <HelpCircle size={40} className="text-white/10" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aún no hay historias registradas en el servidor.</p>
                    </div>
                )}
            </Section>

            {/* MODAL / LIGHTBOX */}
            <AnimatePresence>
                {selectedPlace && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPlaceId(null)}
                        className="fixed inset-0 z-1000 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()} 
                            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-black"
                        >
                            <button
                                onClick={() => setSelectedPlaceId(null)}
                                className="absolute top-6 right-6 w-12 h-12 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center text-xl transition-all hover:bg-white hover:text-black hover:rotate-90 z-50 border border-white/10"
                            >
                                <X />
                            </button>

                            {/* Image Section */}
                            <div className="w-full md:w-1/2 relative bg-white/5 h-[300px] md:h-auto">
                                {selectedPlace.is_coming_soon ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <HelpCircle className="text-9xl text-white/5 animate-pulse" />
                                    </div>
                                ) : (
                                    <img
                                        src={selectedPlace.image_url || ''}
                                        alt={selectedPlace.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-[#0a0a0a] via-transparent to-transparent"></div>
                            </div>

                            {/* Content Section */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col gap-8">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-(--accent) font-mono text-sm tracking-widest">
                                        <MapPin /> {selectedPlace.coords}
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                        {selectedPlace.title}
                                    </h2>
                                    
                                    {/* Authors */}
                                    <div className="flex flex-wrap gap-3">
                                        {selectedPlace.authors && selectedPlace.authors.map((auth, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl group/author transition-all hover:bg-white/10">
                                                <img
                                                    src={`https://minotar.net/helm/${auth.name}/100.png`}
                                                    alt={auth.name}
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

                                <div className="w-full h-px bg-white/5"></div>

                                <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-medium whitespace-pre-line italic">
                                    {selectedPlace.long_description}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Section>
    )
}
