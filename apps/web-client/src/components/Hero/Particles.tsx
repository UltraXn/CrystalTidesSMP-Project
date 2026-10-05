import { secureRandom } from '../../utils/random';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timer: ReturnType<typeof setTimeout>;

    // Delay particle creation to ensure 0 main-thread blocking during initial paint
    const startParticles = () => {
      const numParticles = 20;
      const colors = ['#89D9D1', '#168C80', '#0C5952', '#ffffff'];

      for (let i = 0; i < numParticles; i++) {
        const el = document.createElement('div');
        el.classList.add('particle');

        const size = secureRandom() * 6 + 2;
        const color = colors[Math.floor(secureRandom() * colors.length)];

        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.backgroundColor = color;
        el.style.position = 'absolute';
        el.style.borderRadius = '50%';
        el.style.opacity = String(secureRandom() * 0.5 + 0.1);
        el.style.left = `${secureRandom() * 100}%`;
        el.style.top = `${secureRandom() * 100}%`;

        container.appendChild(el);

        gsap.to(el, {
          x: 'random(-80, 80)',
          y: 'random(-80, 80)',
          scale: 'random(0.5, 1.2)',
          opacity: 'random(0.1, 0.5)',
          duration: 'random(4, 9)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: secureRandom() * 2,
        });
      }
    };

    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
        startParticles,
      );
    } else {
      timer = setTimeout(startParticles, 1200);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (container) {
        while (container.firstChild) {
          gsap.killTweensOf(container.firstChild);
          container.removeChild(container.firstChild);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-particles"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 1, // Between background (-1) and content (2)
        pointerEvents: 'none', // Click through
      }}
    />
  );
}
