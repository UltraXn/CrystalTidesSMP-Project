import React, { useCallback, Suspense, lazy, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import createAutoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SkinViewer = lazy(() => import('../Widgets/SkinViewer'));

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
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
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
        transition:
          tilt.x === 0 && tilt.y === 0
            ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
            : 'transform 0.05s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      <div
        style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}
        className="flex h-full flex-col"
      >
        {children}
      </div>
    </div>
  );
};

const EmblaCarousel = (props: Readonly<EmblaCarouselProps>) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true, ...options }, [
    createAutoplay({ delay: 6000 }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="group/carousel relative px-4 md:px-12">
      <div className="cursor-grab overflow-hidden active:cursor-grabbing" ref={emblaRef}>
        <div className="-mx-3 flex md:-mx-5">
          {slides.map((donor: Slide) => (
            <div
              className="min-w-0 flex-[0_0_100%] px-3 py-6 sm:flex-[0_0_50%] md:px-5 lg:flex-[0_0_33.333%] xl:flex-[0_0_20%]"
              key={donor.name}
            >
              <TiltCard className="hover:border-[--accent]/60 group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.1)]">
                {/* Image Section - Full Bleed */}
                <div
                  className="aspect-3/4 relative w-full overflow-hidden bg-white/5"
                  style={{ transform: 'translateZ(10px)' }}
                >
                  {/* Background Pattern */}
                  <img
                    src="/images/ui/card-bg.webp"
                    alt="Background"
                    className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale transition-[transform,opacity,filter] duration-700 group-hover:scale-105 group-hover:opacity-40 group-hover:grayscale-0"
                  />
                  <div className="bg-linear-to-t absolute inset-0 from-[#0a0a0a] to-transparent" />

                  {/* Skin Viewer */}
                  <div className="relative z-10 flex h-full w-full items-end justify-center pb-4">
                    <Suspense
                      fallback={
                        <div className="mb-10 animate-pulse text-xs font-bold text-white/30">
                          Cargando...
                        </div>
                      }
                    >
                      <div className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] filter transition-[transform,filter] duration-300 hover:drop-shadow-[0_5px_20px_rgba(var(--accent-rgb),0.4)] group-hover:scale-105">
                        <SkinViewer skinUrl={donor.image} width={220} height={360} />
                      </div>
                    </Suspense>
                  </div>
                </div>

                {/* Content Section */}
                <div
                  className="flex flex-1 flex-col items-center gap-3 bg-[#0a0a0a]/90 p-4 text-center sm:p-5 md:p-6"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <div className="w-full text-center">
                    <h3 className="wrap-break-word mb-2 text-center text-sm font-black uppercase leading-tight tracking-tight text-white transition-colors group-hover:text-[--accent] sm:text-base xl:text-lg">
                      {donor.name}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-1.5 opacity-90">
                      {donor.rank}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-1 h-1 w-8 rounded-full bg-white/10 transition-[background-color,width] duration-500 group-hover:w-16 group-hover:bg-[--accent]"></div>

                  <p className="line-clamp-3 text-center text-xs font-medium italic leading-relaxed text-gray-400 sm:text-sm">
                    "{donor.description}"
                  </p>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="hover:bg-(--accent) hover:border-(--accent) absolute left-0 top-1/2 z-30 -ml-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white shadow-2xl backdrop-blur-xl transition-colors hover:scale-110 hover:text-black md:-ml-6 md:h-16 md:w-16"
        onClick={scrollPrev}
        aria-label="Diapositiva anterior"
      >
        <ChevronLeft className="text-xl md:text-2xl" />
      </button>
      <button
        type="button"
        className="hover:bg-(--accent) hover:border-(--accent) absolute right-0 top-1/2 z-30 -mr-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white shadow-2xl backdrop-blur-xl transition-colors hover:scale-110 hover:text-black md:-mr-6 md:h-16 md:w-16"
        onClick={scrollNext}
        aria-label="Diapositiva siguiente"
      >
        <ChevronRight className="text-xl md:text-2xl" />
      </button>
    </div>
  );
};

export default EmblaCarousel;
