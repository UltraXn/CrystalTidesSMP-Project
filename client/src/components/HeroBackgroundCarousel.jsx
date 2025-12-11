import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'

const IMAGES = [
    '/hero-bg-1.webp',
    '/hero-bg-2.webp',
    '/hero-bg-3.webp',
    '/hero-bg-4.webp',
    '/hero-bg-5.webp'
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
                        />
                        <div className="hero-bg-overlay"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HeroBackgroundCarousel
