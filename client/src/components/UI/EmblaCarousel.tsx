import React, { useCallback, Suspense, lazy } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const SkinViewer = lazy(() => import('../Widgets/SkinViewer'))

interface Slide {
    image: string;
    name: string;
    rank: React.ReactNode;
    description: string;
}

interface EmblaCarouselProps {
    slides: Slide[];
    options?: any;
}

const EmblaCarousel = (props: EmblaCarouselProps) => {
    const { slides, options } = props
    const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay({ delay: 4000 })])

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    return (
        <div className="embla">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">
                    {slides.map((donor: Slide, index: number) => (
                        <div className="embla__slide" key={index}>
                            <div className="donor-card">
                                <div className="donor-card-image-container">
                                    <div className="donor-card-overlay"></div>
                                    <Suspense fallback={
                                        <div style={{
                                            width: 150,
                                            height: 250,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'rgba(255,255,255,0.5)',
                                            fontSize: '0.8rem'
                                        }}>
                                            Cargando...
                                        </div>
                                    }>
                                        <SkinViewer skinUrl={donor.image} width={150} height={250} />
                                    </Suspense>
                                </div>
                                <div className="donor-card-content">
                                    <h3>{donor.name}</h3>
                                    <span className="donor-rank">{donor.rank}</span>
                                    <p>{donor.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="embla__button embla__button--prev" onClick={scrollPrev}>
                <FaChevronLeft />
            </button>
            <button className="embla__button embla__button--next" onClick={scrollNext}>
                <FaChevronRight />
            </button>
        </div>
    )
}

export default EmblaCarousel
