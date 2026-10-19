import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface Lazy3DContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  placeholderClassName?: string;
  placeholderLabel?: string;
  fallback?: React.ReactNode;
}

export function Lazy3DContainer({
  children,
  className = '',
  style,
  placeholderClassName = '',
  placeholderLabel,
  fallback,
}: Readonly<Lazy3DContainerProps>) {
  const { t } = useTranslation();
  const resolvedLabel =
    placeholderLabel ?? t('wiki.viewer3d.loading', 'Cargando visualizador 3D...');

  // Safe fallback for environments where IntersectionObserver is not supported (SSR, old engines, vitest/jsdom)
  const [isVisible, setIsVisible] = useState<boolean>(
    () => typeof IntersectionObserver === 'undefined',
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      {
        rootMargin: '200px 0px',
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={style}>
      {isVisible
        ? children
        : (fallback ?? (
            <output
              aria-label={resolvedLabel}
              className={`flex size-full items-center justify-center bg-black/20 ${placeholderClassName}`}
            >
              <span className="sr-only">{resolvedLabel}</span>
            </output>
          ))}
    </div>
  );
}

export default Lazy3DContainer;
