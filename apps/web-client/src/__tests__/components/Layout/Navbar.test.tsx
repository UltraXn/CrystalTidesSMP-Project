import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Navbar from '@/components/Layout/Navbar';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('framer-motion', () => {
    const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...props}>{children}</div>
    );
    return {
        m: {
            img: Component,
            div: Component,
            button: Component,
        },
        motion: {
            img: Component,
            div: Component,
            button: Component,
        },
        AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
    };
});

describe('Navbar', () => {
    it('renders logo, brand name, and desktop navigation routes', () => {
        renderWithProviders(<Navbar />);

        expect(screen.getByRole('link', { name: /crystaltides smp inicio/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /launcher/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /reglas/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /donadores/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /noticias/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /soporte/i })).toBeInTheDocument();
    });

    it('renders login link when unauthenticated', () => {
        renderWithProviders(<Navbar />);

        const loginBtn = screen.getByRole('link', { name: /ingresar|navbar\.login|login/i });
        expect(loginBtn).toBeInTheDocument();
        expect(loginBtn).toHaveAttribute('href', '/login');
    });
});
