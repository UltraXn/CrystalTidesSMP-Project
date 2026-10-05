import { useState, useEffect, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import createAutoplay from 'embla-carousel-autoplay'; // Embla: alias de función de fábrica en minúscula para evitar confusión con componentes React (react/capitalized-calls)
import createFade from 'embla-carousel-fade'; // Embla: alias de función de fábrica en minúscula para evitar confusión con componentes React (react/capitalized-calls)

const IMAGES = [
  '/images/backgrounds/hero-bg-1.webp',
  '/images/backgrounds/hero-bg-2.webp',
  '/images/backgrounds/hero-bg-3.webp',
  '/images/backgrounds/hero-bg-4.webp',
  '/images/backgrounds/hero-bg-5.webp',
];

const DEFAULT_SLIDES: Slide[] = []; // React: array estático fuera del render para preservar igualdad referencial (react/no-object-type-as-default-prop)

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

const HeroBackgroundCarousel = ({ slides = DEFAULT_SLIDES }: HeroBackgroundCarouselProps) => {
  // React: uso de referencia estable por defecto
  const [loadSecondary, setLoadSecondary] = useState(false);
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const plugins = useMemo(() => {
    const list = [createFade()]; // Embla: invocación de fábrica segura
    if (!prefersReducedMotion) {
      list.unshift(createAutoplay({ delay: 6000, stopOnInteraction: false })); // Embla: invocación de fábrica segura
    }
    return list;
  }, [prefersReducedMotion]);

  const [emblaRef] = useEmblaCarousel(
    { loop: !prefersReducedMotion, watchDrag: false, duration: 40 },
    plugins,
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoadSecondary(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const hasDynamicSlides = slides && slides.length > 0;
  const items: Slide[] = hasDynamicSlides ? slides : IMAGES.map((src) => ({ image: src }));

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      ref={emblaRef}
      aria-hidden={!hasDynamicSlides}
    >
      <div className="flex h-full touch-pan-y">
        {items.map((slide, index) => (
          <div
            className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden"
            key={slide.image}
          >
            {(index === 0 || loadSecondary) && (
              <img
                src={slide.image}
                alt=""
                aria-hidden="true"
                className="animate-slow-zoom absolute inset-0 size-full object-cover motion-reduce:animate-none"
                fetchPriority={index === 0 ? 'high' : 'low'}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            )}
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="bg-linear-to-t absolute inset-0 from-black via-transparent to-black/60"></div>
            <div className="bg-linear-to-r absolute inset-0 from-black/20 via-transparent to-black/20"></div>

            {/* Dynamic Content Overlay */}
            {hasDynamicSlides && (slide.title || slide.text) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-fade-in-up max-w-4xl">
                  {slide.title && (
                    <h2 className="mb-4 text-4xl font-black uppercase tracking-tighter text-white drop-shadow-2xl md:text-7xl">
                      {slide.title}
                    </h2>
                  )}
                  {slide.text && (
                    <p className="mb-8 text-lg font-medium text-gray-200 drop-shadow-lg md:text-2xl">
                      {slide.text}
                    </p>
                  )}
                  {slide.buttonText && (
                    <a
                      href={slide.link || '#'}
                      className="bg-(--accent) inline-block rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-black shadow-2xl transition-colors hover:scale-110 active:scale-95"
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
  );
};

export default HeroBackgroundCarousel;
