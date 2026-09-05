import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SectionDivider from '@/components/Layout/SectionDivider';

describe('SectionDivider', () => {
    it('renders the decorative divider lines and pulse diamond', () => {
        const { container } = render(<SectionDivider />);
        
        const outerWrapper = container.firstChild as HTMLElement;
        expect(outerWrapper).toBeInTheDocument();
        expect(outerWrapper).toHaveClass('select-none', 'pointer-events-none');

        const pulseElement = container.querySelector('.animate-pulse');
        expect(pulseElement).toBeInTheDocument();
        expect(pulseElement).toHaveClass('rotate-45');
    });
});
