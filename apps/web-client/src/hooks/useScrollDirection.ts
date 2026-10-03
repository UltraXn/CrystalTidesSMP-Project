import { useState, useEffect } from 'react';

export type ScrollDirection = 'up' | 'down' | null;

const SCROLL_THRESHOLD_PX = 10;

function getCurrentScrollY(): number {
  return typeof window !== 'undefined' ? window.scrollY : 0;
}

export function useScrollDirection(): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);

  useEffect(() => {
    let lastScrollY = getCurrentScrollY();

    const updateScrollDirection = (): void => {
      const scrollY = getCurrentScrollY();
      const deltaY = scrollY - lastScrollY;

      if (Math.abs(deltaY) > SCROLL_THRESHOLD_PX) {
        const newDirection: ScrollDirection = deltaY > 0 ? 'down' : 'up';
        setScrollDirection((prevDirection) => (prevDirection === newDirection ? prevDirection : newDirection));
      }

      lastScrollY = Math.max(scrollY, 0);
    };

    window.addEventListener('scroll', updateScrollDirection, { passive: true });

    return (): void => {
      window.removeEventListener('scroll', updateScrollDirection);
    };
  }, []);

  return scrollDirection;
}