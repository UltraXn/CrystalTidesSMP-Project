import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import StoriesSkeleton from '@/components/Home/skeletons/StoriesSkeleton';

describe('StoriesSkeleton', () => {
    it('renders skeleton pulse container and bone placeholders', () => {
        const { container } = renderWithProviders(<StoriesSkeleton />);

        const pulseWrapper = container.querySelector('.animate-pulse');
        expect(pulseWrapper).toBeInTheDocument();

        const bones = container.querySelectorAll('.bg-white\\/8');
        expect(bones.length).toBeGreaterThanOrEqual(10);
    });
});
