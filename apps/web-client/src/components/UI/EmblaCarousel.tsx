import React, { useCallback, Suspense, lazy } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SkinViewer = lazy(() => import('../Widgets/SkinViewer'))

interface Slide {
    image: string;
    name: string;
    rank: React.ReactNode;
    description: string;
}

interface EmblaCarouselProps {
    slides: Slide[];
    options?: Record<string, unknown>;
}

const EmblaCarousel = (props: EmblaCarouselProps) => {
    const { slides, options } = props
    const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay({ delay: 6000 })])

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    return (
        <div className="relative group/carousel px-4 md:px-12">
            <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                <div className="flex -ml-4 md:-ml-8">
                    {slides.map((donor: Slide, index: number) => (
                        <div className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 md:pl-8 py-8" key={index}>
                            <div className="relative group bg-[#0a0a0a] border border-white/10 rounded-4xl overflow-hidden transition-all duration-300 hover:border-[--accent] hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)] flex flex-col h-full">
                                
                                {/* Image Section - Full Bleed */}
                                <div className="relative w-full aspect-3/4 bg-white/5 overflow-hidden">
                                     {/* Background Pattern */}
                                    <img 
                                        src="/images/ui/card-bg.webp" 
                                        alt="Background" 
                                        className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-40" 
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] to-transparent" />
                                    
                                    {/* Skin Viewer */}
                                    <div className="relative z-10 w-full h-full flex items-end justify-center pb-4">
                                        <Suspense fallback={
                                            <div className="text-white/30 text-xs font-bold animate-pulse mb-10">
                                                Cargando...
                                            </div>
                                        }>
                                            <div className="filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105 hover:drop-shadow-[0_5px_20px_rgba(var(--accent-rgb),0.4)]">
                                                <SkinViewer skinUrl={donor.image} width={220} height={360} />
                                            </div>
                                        </Suspense>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 flex flex-col items-center p-8 gap-4 bg-[#0a0a0a]">
                                    <div className="text-center">
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-[--accent] transition-colors">
                                            {donor.name}
                                        </h3>
                                        <div className="flex justify-center flex-wrap gap-2 opacity-80">
                                            {donor.rank}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-12 h-1 bg-white/10 rounded-full group-hover:bg-[--accent] group-hover:w-24 transition-all duration-500"></div>

                                    <p className="text-gray-400 text-sm font-medium leading-relaxed italic text-center line-clamp-3">
                                        "{donor.description}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all hover:bg-(--accent) hover:text-black hover:scale-110 hover:border-(--accent) z-30 shadow-2xl -ml-2 md:-ml-6" 
                onClick={scrollPrev} 
                aria-label="Previous slide"
            >
                <ChevronLeft className="text-xl md:text-2xl" />
            </button>
            <button 
                className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all hover:bg-(--accent) hover:text-black hover:scale-110 hover:border-(--accent) z-30 shadow-2xl -mr-2 md:-mr-6" 
                onClick={scrollNext} 
                aria-label="Next slide"
            >
                <ChevronRight className="text-xl md:text-2xl" />
            </button>
        </div>
    )
}

export default EmblaCarousel
