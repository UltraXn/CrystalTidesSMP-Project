import { useState, useEffect, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'

const IMAGES = [
    '/images/backgrounds/hero-bg-1.webp',
    '/images/backgrounds/hero-bg-2.webp',
    '/images/backgrounds/hero-bg-3.webp',
    '/images/backgrounds/hero-bg-4.webp',
    '/images/backgrounds/hero-bg-5.webp'
]

interface Slide {
    image: string;
    title?: string;
    text?: string;
    buttonText?: string;
    link?: string;
}

interface HeroBackgroundCarouselProps {
    slides?: Slide[];
}

const HeroBackgroundCarousel = ({ slides = [] }: HeroBackgroundCarouselProps) => {
    const [loadSecondary, setLoadSecondary] = useState(false)
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const plugins = useMemo(() => {
        const list = [Fade()];
        if (!prefersReducedMotion) {
            list.unshift(Autoplay({ delay: 6000, stopOnInteraction: false }));
        }
        return list;
    }, [prefersReducedMotion]);

    const [emblaRef] = useEmblaCarousel(
        { loop: !prefersReducedMotion, watchDrag: false, duration: 40 },
        plugins
    )

    useEffect(() => {
        const timer = setTimeout(() => setLoadSecondary(true), 2500)
        return () => clearTimeout(timer)
    }, [])

    const hasDynamicSlides = slides && slides.length > 0;
    const items: Slide[] = hasDynamicSlides ? slides : IMAGES.map(src => ({ image: src }));

    return (
        <div className="absolute inset-0 z-0 overflow-hidden" ref={emblaRef} aria-hidden={!hasDynamicSlides}>
            <div className="flex touch-pan-y h-full">
                {items.map((slide, index) => (
                    <div className="relative flex-[0_0_100%] min-w-0 h-full overflow-hidden" key={slide.image}>
                        {(index === 0 || loadSecondary) && (
                            <img
                                src={slide.image}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover animate-slow-zoom motion-reduce:animate-none"
                                fetchPriority={index === 0 ? "high" : "low"}
                                loading={index === 0 ? "eager" : "lazy"}
                                decoding="async"
                            />
                        )}
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/60"></div>
                        <div className="absolute inset-0 bg-linear-to-r from-black/20 via-transparent to-black/20"></div>
                        
                        {/* Dynamic Content Overlay */}
                        {hasDynamicSlides && (slide.title || slide.text) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                                <div className="max-w-4xl animate-fade-in-up">
                                    {slide.title && (
                                        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 drop-shadow-2xl">
                                            {slide.title}
                                        </h2>
                                    )}
                                    {slide.text && (
                                        <p className="text-lg md:text-2xl text-gray-200 font-medium mb-8 drop-shadow-lg">
                                            {slide.text}
                                        </p>
                                    )}
                                    {slide.buttonText && (
                                        <a 
                                            href={slide.link || '#'} 
                                            className="px-8 py-4 bg-(--accent) text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-colors inline-block"
                                        >
                                            {slide.buttonText}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HeroBackgroundCarousel
