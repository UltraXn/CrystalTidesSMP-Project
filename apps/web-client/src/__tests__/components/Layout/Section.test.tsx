import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Section from '@/components/Layout/Section';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('../../hooks/useIntersectionObserver', () => ({
    useIntersectionObserver: () => [{ current: null }, true],
}));

describe('Section', () => {
    it('renders children content properly', () => {
        renderWithProviders(
            <Section id="test-section">
                <p>Child content inside section</p>
            </Section>
        );

        expect(screen.getByText('Child content inside section')).toBeInTheDocument();
        const sectionEl = screen.getByText('Child content inside section').closest('#test-section');
        expect(sectionEl).toHaveAttribute('id', 'test-section');
    });

    it('renders h2 title by default and applies custom heading level', () => {
        const { rerender } = renderWithProviders(
            <Section title="Default Title">
                <p>Body</p>
            </Section>
        );

        const h2El = screen.getByRole('heading', { level: 2, name: /default title/i });
        expect(h2El).toBeInTheDocument();

        rerender(
            <Section title="H1 Title" headingLevel="h1">
                <p>Body</p>
            </Section>
        );

        const h1El = screen.getByRole('heading', { level: 1, name: /h1 title/i });
        expect(h1El).toBeInTheDocument();
    });

    it('renders separator decoration when separator prop is true', () => {
        const { container } = renderWithProviders(
            <Section title="With Separator" separator={true}>
                <p>Section Content</p>
            </Section>
        );

        const pulseDiamond = container.querySelector('.animate-pulse');
        expect(pulseDiamond).toBeInTheDocument();
    });
});
