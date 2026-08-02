import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { HelpCircle, X, Compass, Copy } from "lucide-react"
import Section from "../components/Layout/Section"
import { useTranslation } from 'react-i18next'
import { m as motion, AnimatePresence } from "framer-motion"
import { getLocations, WorldLocation } from "../services/locationService"
import Loader from "../components/UI/Loader"

// Parse coordinates to create a valid /tp command
const getTpCommand = (coordsStr: string) => {
    const matches = coordsStr.match(/-?\d+/g)
    if (matches && matches.length >= 2) {
        const x = matches[0]
        const y = matches.length >= 3 ? matches[1] : '70'
        const z = matches.length >= 3 ? matches[2] : matches[1]
        return `/tp ${x} ${y} ${z}`
    }
    return `/tp ${coordsStr}`
}

// Split text for dropcap
const splitStoryText = (text: string) => {
    if (!text) return { first: '', rest: '' }
    const trimmed = text.trim()
    return {
        first: trimmed.charAt(0),
        rest: trimmed.slice(1)
    }
}

export default function Stories() {
    const { t } = useTranslation()
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null)
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    const { data: locations = [], isLoading: loading } = useQuery<WorldLocation[]>({
        queryKey: ['worldLocations'],
        queryFn: getLocations,
    })

    const selectedPlace = locations.find(p => p.id === selectedPlaceId)

    const handleCopyCoords = (e: React.MouseEvent, coords: string) => {
        e.stopPropagation() // Prevent opening the modal
        const tpCmd = getTpCommand(coords)
        navigator.clipboard.writeText(tpCmd)
        showToast(`Comando copiado: ${tpCmd}`)
    }

    const showToast = (message: string) => {
        setToastMessage(message)
        setTimeout(() => setToastMessage(null), 2500)
    }

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
                            <article
                                key={place.id}
                                className="group text-left w-full relative bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden transition-colors duration-500 hover:bg-white/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-(--accent)/10 hover:border-(--accent)/30"
                            >
                                {/* Invisible overlay button to open detail — sits below inner controls via z-index */}
                                <button
                                    type="button"
                                    aria-label={`Ver historia: ${place.title}`}
                                    onClick={() => setSelectedPlaceId(place.id)}
                                    className="absolute inset-0 z-10 cursor-pointer"
                                />
                                <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                                    {place.is_coming_soon ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60"></div>
                                            <HelpCircle className="text-6xl text-white/10 animate-pulse relative z-10" />
                                            <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 relative z-10">Clasificado</span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Coordinate Badge - z-20 so it sits above the overlay button */}
                                            <button type="button"
                                                onClick={(e) => handleCopyCoords(e, place.coords || '')}
                                                className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/80 hover:bg-(--accent) hover:text-black backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-(--accent) transition-colors group/coords"
                                                title="Haz clic para copiar comando /tp"
                                            >
                                                <Compass className="w-3.5 h-3.5 transition-transform duration-500 group-hover/coords:rotate-180" /> 
                                                <span>{place.coords}</span>
                                                <Copy className="w-3 h-3 ml-1 opacity-40 group-hover/coords:opacity-100" />
                                            </button>
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
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-2 italic">"{place.description}"</p>
                                </div>
                            </article>
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

            {/* MODAL / LIGHTBOX - Ancient Codex Design */}
            <AnimatePresence>
                {selectedPlace && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPlaceId(null)}
                        className="fixed inset-0 z-1000 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()} 
                            className="relative w-full max-w-5xl max-h-[90vh] bg-[#120f0a] border border-amber-500/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col md:flex-row shadow-black"
                        >
                            {/* Corner Decorations */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/30 rounded-tl-lg pointer-events-none z-30"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/30 rounded-tr-lg pointer-events-none z-30"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/30 rounded-bl-lg pointer-events-none z-30"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/30 rounded-br-lg pointer-events-none z-30"></div>

                            <button aria-label={t('common.close', 'Cerrar')} type="button"
                                onClick={() => setSelectedPlaceId(null)}
                                className="absolute top-6 right-6 w-12 h-12 bg-black/40 hover:bg-amber-500 hover:text-black text-amber-500/70 rounded-full flex items-center justify-center text-xl transition-colors hover:rotate-90 z-50 border border-amber-500/20"
                            >
                                <X />
                            </button>

                            {/* Image Section */}
                            <div className="w-full md:w-1/2 relative bg-white/5 h-75 md:h-auto overflow-hidden">
                                {selectedPlace.is_coming_soon ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <HelpCircle className="text-9xl text-white/5 animate-pulse" />
                                    </div>
                                ) : (
                                    <img
                                        src={selectedPlace.image_url || ''}
                                        alt={selectedPlace.title}
                                        className="w-full h-full object-cover filter sepia-20 brightness-85 transition-colors duration-700 hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-[#120f0a] via-transparent to-transparent"></div>
                            </div>

                            {/* Content Section */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col gap-8 custom-scrollbar">
                                <div className="flex flex-col gap-4">
                                    <button aria-label="Copiar coordenadas /tp" type="button"
                                        onClick={(e) => handleCopyCoords(e, selectedPlace.coords || '')}
                                        className="self-start flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 text-amber-400 rounded-xl text-xs font-mono tracking-widest transition-colors group/modal-coords"
                                    >
                                        <Compass className="w-4 h-4 transition-transform duration-500 group-hover/modal-coords:rotate-180" />
                                        <span>{selectedPlace.coords}</span>
                                        <Copy className="w-3.5 h-3.5 ml-1 opacity-50 group-hover/modal-coords:opacity-100" />
                                    </button>
                                    
                                    <h2 className="text-4xl md:text-5xl font-black text-amber-100 uppercase tracking-tighter leading-none mb-2 font-serif">
                                        {selectedPlace.title}
                                    </h2>
                                    
                                    {/* Authors */}
                                    <div className="flex flex-wrap gap-3">
                                        {selectedPlace.authors && selectedPlace.authors.map((auth) => (
                                            <div key={auth.name} className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/10 px-4 py-2 rounded-2xl group/author transition-colors hover:bg-amber-500/10">
                                                <img
                                                    src={`https://minotar.net/helm/${auth.name}/100.png`}
                                                    alt={auth.name}
                                                    className="w-8 h-8 rounded-lg shadow-lg filter sepia-15"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/60">{t(`stories.roles.${auth.role}`)}</span>
                                                    <span className="text-xs font-bold text-amber-100/90 transition-colors group-hover/author:text-amber-400">{auth.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full h-px bg-amber-500/10"></div>

                                {/* Lore text with Dropcap */}
                                {(() => {
                                    const { first, rest } = splitStoryText(selectedPlace.long_description || '')
                                    return (
                                        <p className="text-amber-100/70 text-lg leading-relaxed font-serif whitespace-pre-line italic text-justify">
                                            {first && (
                                                <span className="float-left text-5xl md:text-6xl font-black text-amber-400 font-serif mr-3 mt-1.5 border-b-2 border-amber-400/40 pb-1 leading-none">
                                                    {first}
                                                </span>
                                            )}
                                            {rest}
                                        </p>
                                    )
                                })()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-10 right-10 z-1000 bg-[#120f0a] border border-amber-500/30 text-amber-100 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl backdrop-blur-md flex items-center gap-3"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </Section>
    )
}
