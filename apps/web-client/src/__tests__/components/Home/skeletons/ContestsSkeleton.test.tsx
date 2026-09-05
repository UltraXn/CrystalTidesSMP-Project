import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import ContestsSkeleton from '@/components/Home/skeletons/ContestsSkeleton';

describe('ContestsSkeleton', () => {
    it('renders skeleton pulse container and contest card placeholders', () => {
        const { container } = renderWithProviders(<ContestsSkeleton />);

        const pulseWrapper = container.querySelector('.animate-pulse');
        expect(pulseWrapper).toBeInTheDocument();

        const contestCards = container.querySelectorAll('.grid > div');
        expect(contestCards.length).toBe(3);
    });
});
