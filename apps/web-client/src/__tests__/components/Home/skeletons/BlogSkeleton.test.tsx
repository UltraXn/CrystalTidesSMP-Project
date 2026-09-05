import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import BlogSkeleton from '@/components/Home/skeletons/BlogSkeleton';

describe('BlogSkeleton', () => {
    it('renders skeleton pulse container and article cards placeholders', () => {
        const { container } = renderWithProviders(<BlogSkeleton />);

        const pulseWrapper = container.querySelector('.animate-pulse');
        expect(pulseWrapper).toBeInTheDocument();

        const cards = container.querySelectorAll('.grid > div');
        expect(cards.length).toBe(3);
    });
});
