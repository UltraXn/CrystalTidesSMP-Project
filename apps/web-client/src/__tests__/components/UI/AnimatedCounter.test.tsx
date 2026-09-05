import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import AnimatedCounter from '@/components/UI/AnimatedCounter';

describe('AnimatedCounter', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should display the initial value immediately', () => {
        render(<AnimatedCounter value={100} />);
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should animate to the final value over the specified duration', () => {
        const { rerender } = render(<AnimatedCounter value={100} duration={1000} />);
        expect(screen.getByText('100')).toBeInTheDocument();

        rerender(<AnimatedCounter value={200} duration={1000} />);
        act(() => {
            vi.advanceTimersByTime(1100);
        });
        expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('should handle decimal values correctly', () => {
        render(<AnimatedCounter value={123.456} decimals={2} />);
        expect(screen.getByText('123.46')).toBeInTheDocument();
    });

    it('should handle zero value correctly', () => {
        render(<AnimatedCounter value={0} />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative values correctly', () => {
        render(<AnimatedCounter value={-50} />);
        expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('should handle prefix and suffix correctly', () => {
        render(<AnimatedCounter value={100} prefix="$" suffix=" USD" />);
        expect(screen.getByText('$100 USD')).toBeInTheDocument();
    });

    it('should stop animation when value changes mid-animation', () => {
        const { rerender } = render(<AnimatedCounter value={100} duration={1000} />);
        expect(screen.getByText('100')).toBeInTheDocument();

        rerender(<AnimatedCounter value={200} duration={1000} />);
        act(() => {
            vi.advanceTimersByTime(500);
        });

        rerender(<AnimatedCounter value={300} duration={1000} />);
        act(() => {
            vi.advanceTimersByTime(1100);
        });
        expect(screen.getByText('300')).toBeInTheDocument();
    });

    it('should handle very short duration', () => {
        const { rerender } = render(<AnimatedCounter value={100} duration={1} />);
        expect(screen.getByText('100')).toBeInTheDocument();

        rerender(<AnimatedCounter value={200} duration={1} />);
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('should handle very long duration', () => {
        const { rerender } = render(<AnimatedCounter value={100} duration={10000} />);
        expect(screen.getByText('100')).toBeInTheDocument();

        rerender(<AnimatedCounter value={200} duration={10000} />);
        act(() => {
            vi.advanceTimersByTime(11000);
        });
        expect(screen.getByText('200')).toBeInTheDocument();
    });
});
