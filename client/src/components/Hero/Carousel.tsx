
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
    const [emblaRef] = useEmblaCarousel(
        { loop: true, watchDrag: false },
        [
            Autoplay({ delay: 5000, stopOnInteraction: false }),
            Fade()
        ]
    )

    // Fallback to default images if no dynamic slides
    const hasDynamicSlides = slides && slides.length > 0;
    const items: Slide[] = hasDynamicSlides ? slides : IMAGES.map(src => ({ image: src }));

    return (
        <div className="hero-bg-carousel" ref={emblaRef}>
            <div className="hero-bg-container">
                {items.map((slide, index) => (
                    <div className="hero-bg-slide" key={index}>
                        <img
                            src={slide.image}
                            alt={`Slide ${index + 1}`}
                            className="hero-bg-image"
                            fetchPriority={index === 0 ? "high" : "auto"}
                            loading={index === 0 ? "eager" : "lazy"}
                        />
                        <div className="hero-bg-overlay" style={{ background: hasDynamicSlides ? 'rgba(0,0,0,0.6)' : undefined }}></div>
                        
                        {/* Render Dynamic Text Overlay if available */}
                        {hasDynamicSlides && (slide.title || slide.text) && (
                            <div className="hero-slide-content">
                                {slide.title && <h2>{slide.title}</h2>}
                                {slide.text && <p>{slide.text}</p>}
                                {slide.buttonText && (
                                    <a href={slide.link || '#'} className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                                        {slide.buttonText}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HeroBackgroundCarousel
