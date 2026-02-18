import { useState } from "react"
import { HelpCircle } from "lucide-react"
import Section from "../components/Layout/Section"
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from "framer-motion"
import { getLocations } from "../services/locationService"
import Loader from "../components/UI/Loader"
import { useQuery } from "@tanstack/react-query"
import StoryCard from "../components/Stories/StoryCard"
import StoryDetailsModal from "../components/Stories/StoryDetailsModal"

export default function Stories() {
    const { t } = useTranslation()
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null)

    const { data: locations = [], isLoading: loading } = useQuery({
        queryKey: ['locations'],
        queryFn: getLocations,
        staleTime: 1000 * 60 * 10, // 10 minutes
    })

    const selectedPlace = locations.find(p => p.id === selectedPlaceId)

    return (
        <Section title={t('stories.title')}>
            <Section>
                <div className="max-w-3xl mx-auto p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl text-center mb-16">
                    <p className="text-gray-300 text-lg leading-relaxed">{t('stories.intro')}</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                        {locations.map(place => (
                            <StoryCard 
                                key={place.id}
                                place={place}
                                onClick={() => setSelectedPlaceId(place.id)}
                            />
                        ))}
                    </div>
                )}
                
                {!loading && locations.length === 0 && (
                    <div className="text-center py-20 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
                        <HelpCircle size={40} className="text-white/10" aria-hidden="true" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aún no hay historias registradas en el servidor.</p>
                    </div>
                )}
            </Section>

            {/* MODAL / LIGHTBOX */}
            <AnimatePresence>
                {selectedPlace && (
                    <StoryDetailsModal 
                        place={selectedPlace}
                        onClose={() => setSelectedPlaceId(null)}
                    />
                )}
            </AnimatePresence>
        </Section>
    )
}
