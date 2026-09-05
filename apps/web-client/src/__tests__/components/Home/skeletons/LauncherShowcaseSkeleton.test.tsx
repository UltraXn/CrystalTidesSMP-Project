import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/utils/test-utils';
import LauncherShowcaseSkeleton from '@/components/Home/skeletons/LauncherShowcaseSkeleton';

describe('LauncherShowcaseSkeleton', () => {
    it('renders skeleton pulse container and bone placeholders', () => {
        const { container } = renderWithProviders(<LauncherShowcaseSkeleton />);

        const pulseWrapper = container.querySelector('.animate-pulse');
        expect(pulseWrapper).toBeInTheDocument();

        const bones = container.querySelectorAll('.bg-white\\/8');
        expect(bones.length).toBeGreaterThanOrEqual(10);
    });
});
