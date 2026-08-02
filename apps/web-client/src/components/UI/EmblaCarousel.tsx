import React, { useCallback, Suspense, lazy, useState, useRef } from 'react'
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
    loading?: boolean;
}

// 3D Tilt Card Component for Premium Feel
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left - width / 2;
        const mouseY = e.clientY - rect.top - height / 2;
        
        // Max rotation angle in degrees
        const maxRotation = 8;
        const rX = -(mouseY / (height / 2)) * maxRotation;
        const rY = (mouseX / (width / 2)) * maxRotation;
        
        setTilt({ x: rX, y: rY });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    return (
        <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 0.05s ease-out',
                transformStyle: 'preserve-3d'
            }}
            className={className}
        >
            <div style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }} className="h-full flex flex-col">
                {children}
            </div>
        </div>
    );
};

const EmblaCarousel = (props: EmblaCarouselProps) => {
    const { slides, options } = props
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true, ...options }, [Autoplay({ delay: 6000 })])

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    return (
        <div className="relative group/carousel px-4 md:px-12">
            <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                <div className="flex -mx-3 md:-mx-5">
                    {slides.map((donor: Slide) => (
                        <div className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_20%] min-w-0 px-3 md:px-5 py-6" key={donor.name}>
                            <TiltCard className="relative group bg-[#0a0a0a]/80 border border-white/10 rounded-3xl overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-[--accent]/60 hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.1)] flex flex-col h-full backdrop-blur-md">
                                
                                {/* Image Section - Full Bleed */}
                                <div className="relative w-full aspect-3/4 bg-white/5 overflow-hidden" style={{ transform: 'translateZ(10px)' }}>
                                     {/* Background Pattern */}
                                    <img 
                                        src="/images/ui/card-bg.webp" 
                                        alt="Background" 
                                        className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale transition-[transform,opacity,filter] duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-40" 
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] to-transparent" />
                                    
                                    {/* Skin Viewer */}
                                    <div className="relative z-10 w-full h-full flex items-end justify-center pb-4">
                                        <Suspense fallback={
                                            <div className="text-white/30 text-xs font-bold animate-pulse mb-10">
                                                Cargando...
                                            </div>
                                        }>
                                            <div className="filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-[transform,filter] duration-300 group-hover:scale-105 hover:drop-shadow-[0_5px_20px_rgba(var(--accent-rgb),0.4)]">
                                                <SkinViewer skinUrl={donor.image} width={220} height={360} />
                                            </div>
                                        </Suspense>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 flex flex-col items-center p-4 sm:p-5 md:p-6 gap-3 bg-[#0a0a0a]/90 text-center" style={{ transform: 'translateZ(20px)' }}>
                                    <div className="w-full text-center">
                                        <h3 className="text-sm sm:text-base xl:text-lg font-black text-white uppercase tracking-tight mb-2 leading-tight group-hover:text-[--accent] transition-colors wrap-break-word text-center">
                                            {donor.name}
                                        </h3>
                                        <div className="flex justify-center flex-wrap gap-1.5 opacity-90">
                                            {donor.rank}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-8 h-1 bg-white/10 rounded-full group-hover:bg-[--accent] group-hover:w-16 transition-[background-color,width] duration-500 my-1"></div>

                                    <p className="text-gray-400 text-xs sm:text-sm font-medium leading-relaxed italic text-center line-clamp-3">
                                        "{donor.description}"
                                    </p>
                                </div>
                            </TiltCard>
                        </div>
                    ))}
                </div>
            </div>

            <button type="button" 
                className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-(--accent) hover:text-black hover:scale-110 hover:border-(--accent) z-30 shadow-2xl -ml-2 md:-ml-6" 
                onClick={scrollPrev} 
                aria-label="Diapositiva anterior"
            >
                <ChevronLeft className="text-xl md:text-2xl" />
            </button>
            <button type="button" 
                className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-(--accent) hover:text-black hover:scale-110 hover:border-(--accent) z-30 shadow-2xl -mr-2 md:-mr-6" 
                onClick={scrollNext} 
                aria-label="Diapositiva siguiente"
            >
                <ChevronRight className="text-xl md:text-2xl" />
            </button>
        </div>
    )
}

export default EmblaCarousel
