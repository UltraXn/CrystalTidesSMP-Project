import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface SectionProps {
  title?: React.ReactNode;
  headingLevel?: 'h1' | 'h2';
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  separator?: boolean;
}

const Separator = () => (
  <div className="pointer-events-none flex w-full select-none items-center justify-center gap-8 py-16 opacity-50">
    <div className="bg-linear-to-r to-(--accent) h-px w-32 from-transparent sm:w-64"></div>
    <div className="bg-(--accent) h-3 w-3 rotate-45 animate-pulse shadow-[0_0_15px_var(--accent)]"></div>
    <div className="bg-linear-to-l to-(--accent) h-px w-32 from-transparent sm:w-64"></div>
  </div>
);

const OBSERVER_OPTIONS = { triggerOnce: true, threshold: 0.1 };
const DEFAULT_STYLE: React.CSSProperties = {};
function getDirectionOffsets(direction: 'up' | 'down' | 'left' | 'right'): {
  startX: number;
  startY: number;
} {
  switch (direction) {
    case 'up':
      return { startX: 0, startY: 30 };
    case 'down':
      return { startX: 0, startY: -30 };
    case 'left':
      return { startX: -30, startY: 0 };
    case 'right':
      return { startX: 30, startY: 0 };
    default:
      return { startX: 0, startY: 0 };
  }
}

export default function Section({
  title,
  headingLevel = 'h2',
  children,
  delay = 0,
  direction = 'up',
  className = '',
  id,
  style = DEFAULT_STYLE,
  separator = false,
}: Readonly<SectionProps>) {
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>(OBSERVER_OPTIONS);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    if (isVisible) {
      hasAnimated.current = true;
      const { startX, startY } = getDirectionOffsets(direction);

      gsap.fromTo(
        ref.current,
        { opacity: 0, y: startY, x: startX },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: delay / 1000,
        },
      );
    } else {
      // Ensure default visibility if observer hasn't triggered yet
      gsap.set(ref.current, { opacity: 1 });
    }
  }, [isVisible, delay, direction, ref]);

  if (title) {
    const HeadingTag = headingLevel;
    return (
      <section
        ref={ref}
        id={id}
        className={`max-w-360 mx-auto w-full px-4 py-16 text-center ${className}`.trim()}
        style={style}
      >
        <HeadingTag className="text-(--accent) mb-8 text-3xl font-black uppercase tracking-widest drop-shadow-lg md:text-4xl">
          {title}
        </HeadingTag>
        <div className="relative mb-8">{children}</div>
        {separator && <Separator />}
      </section>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      id={id}
      className={`max-w-360 mx-auto w-full ${className}`.trim()}
      style={style}
    >
      {children}
      {separator && <Separator />}
    </div>
  );
}
