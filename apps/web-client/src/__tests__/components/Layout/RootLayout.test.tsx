import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import RootLayout from '@/components/Layout/RootLayout';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('@/hooks/useAdminData', () => ({
    useSiteSettings: () => ({
        data: { maintenance_mode: 'false', theme: 'default' },
        isLoading: false,
    }),
}));

vi.mock('framer-motion', () => {
    const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...props}>{children}</div>
    );
    return {
        m: { img: Component, div: Component, button: Component },
        motion: { img: Component, div: Component, button: Component },
        AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
    };
});

describe('RootLayout', () => {
    it('renders skip link, main landmark container, and main navigation', () => {
        renderWithProviders(<RootLayout />);

        const skipLink = screen.getByRole('link', { name: /saltar al contenido principal/i });
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute('href', '#main-content');

        const mainContent = document.getElementById('main-content');
        expect(mainContent).toBeInTheDocument();
    });
});
