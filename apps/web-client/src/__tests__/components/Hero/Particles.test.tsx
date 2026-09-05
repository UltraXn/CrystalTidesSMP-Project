import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import HeroParticles from '@/components/Hero/Particles';
import { gsap } from 'gsap';

vi.mock('gsap', () => ({
    gsap: {
        to: vi.fn(),
        killTweensOf: vi.fn(),
    },
}));

describe('HeroParticles', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders particle container with correct class and pointer-events', () => {
        const { container } = renderWithProviders(<HeroParticles />);
        const particlesContainer = container.querySelector('.hero-particles');
        expect(particlesContainer).toBeInTheDocument();
        expect(particlesContainer).toHaveStyle({ pointerEvents: 'none' });
    });

    it('generates particles and animates them with gsap when timers elapse', () => {
        // Mock requestIdleCallback if present or fallback to setTimeout
        const originalRequestIdleCallback = (window as unknown as Record<string, unknown>).requestIdleCallback;
        delete (window as unknown as Record<string, unknown>).requestIdleCallback;

        const { container } = renderWithProviders(<HeroParticles />);

        // Advance past 1200ms timeout
        vi.advanceTimersByTime(1500);

        const particles = container.querySelectorAll('.particle');
        expect(particles.length).toBe(20);
        expect(gsap.to).toHaveBeenCalledTimes(20);

        // Restore
        if (originalRequestIdleCallback) {
            (window as unknown as Record<string, unknown>).requestIdleCallback = originalRequestIdleCallback;
        }
    });

    it('cleans up and kills gsap tweens on unmount', () => {
        delete (window as unknown as Record<string, unknown>).requestIdleCallback;

        const { container, unmount } = renderWithProviders(<HeroParticles />);
        vi.advanceTimersByTime(1500);

        expect(container.querySelectorAll('.particle').length).toBe(20);

        unmount();

        expect(gsap.killTweensOf).toHaveBeenCalled();
    });
});
