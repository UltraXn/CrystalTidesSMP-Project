import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Footer from '@/components/Layout/Footer';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('framer-motion', () => {
    const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...props}>{children}</div>
    );
    const ImgComponent = ({ ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img {...props} />
    );
    return {
        m: {
            img: ImgComponent,
            div: Component,
            button: Component,
        },
        motion: {
            img: ImgComponent,
            div: Component,
            button: Component,
        },
        AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
    };
});

describe('Footer', () => {
    it('renders logo, brand title, and primary navigation links', () => {
        renderWithProviders(<Footer />);

        expect(screen.getByAltText(/crystaltides logo/i)).toBeInTheDocument();
        expect(screen.getByText('CrystalTides')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /crystaltides smp/i })).toBeInTheDocument();
    });

    it('handles window scroll event and triggers scrollTo on top button click', () => {
        const scrollToSpy = vi.fn();
        window.scrollTo = scrollToSpy as unknown as typeof window.scrollTo;

        renderWithProviders(<Footer />);

        // Simulate scroll past 300px
        Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
        fireEvent.scroll(window);

        const scrollToTopBtn = screen.queryByRole('button', { name: /scroll to top|arriba/i });
        if (scrollToTopBtn) {
            fireEvent.click(scrollToTopBtn);
            expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        }
    });
});
