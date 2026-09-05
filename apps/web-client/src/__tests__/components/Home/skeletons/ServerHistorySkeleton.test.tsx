import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import ServerHistorySkeleton from '@/components/Home/skeletons/ServerHistorySkeleton';

describe('ServerHistorySkeleton', () => {
    it('renders skeleton pulse container and bone placeholders', () => {
        const { container } = renderWithProviders(<ServerHistorySkeleton />);

        const pulseWrapper = container.querySelector('.animate-pulse');
        expect(pulseWrapper).toBeInTheDocument();

        const bones = container.querySelectorAll('.bg-white\\/8');
        expect(bones.length).toBeGreaterThanOrEqual(15);
    });
});
