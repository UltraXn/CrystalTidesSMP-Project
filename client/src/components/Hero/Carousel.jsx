import React from 'react'
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

const HeroBackgroundCarousel = () => {
    const [emblaRef] = useEmblaCarousel(
        { loop: true, watchDrag: false },
        [
            Autoplay({ delay: 2000, stopOnInteraction: false }),
            Fade()
        ]
    )

    return (
        <div className="hero-bg-carousel" ref={emblaRef}>
            <div className="hero-bg-container">
                {IMAGES.map((src, index) => (
                    <div className="hero-bg-slide" key={index}>
                        <img
                            src={src}
                            alt={`Background ${index + 1}`}
                            className="hero-bg-image"
                            fetchPriority={index === 0 ? "high" : "auto"}
                            loading={index === 0 ? "eager" : "lazy"}
                        />
                        <div className="hero-bg-overlay"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HeroBackgroundCarousel
