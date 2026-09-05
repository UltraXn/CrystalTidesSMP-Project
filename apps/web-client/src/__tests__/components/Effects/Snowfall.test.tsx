import { describe, it, expect } from 'vitest';
import Snowfall from '@/components/Effects/Snowfall';
import { renderWithProviders } from '@/utils/test-utils';

describe('Snowfall', () => {

    it('renders snow container portal with snowflake elements', () => {
        renderWithProviders(<Snowfall />);

        const container = document.body.querySelector('.snow-container');
        expect(container).toBeInTheDocument();
        expect(container).toHaveAttribute('aria-hidden', 'true');

        const flakes = document.body.querySelectorAll('.snowflake');
        expect(flakes.length).toBe(50);
    });
});
