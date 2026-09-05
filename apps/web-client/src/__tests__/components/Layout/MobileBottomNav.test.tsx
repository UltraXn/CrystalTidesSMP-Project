import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileBottomNav from '@/components/Layout/MobileBottomNav';
import { renderWithProviders } from '@/utils/test-utils';


describe('MobileBottomNav', () => {
    it('renders default navigation items for guest users', () => {
        renderWithProviders(<MobileBottomNav />);

        expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /tienda/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /ver estado del servidor/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /abrir menú de navegación/i })).toBeInTheDocument();
    });

    it('opens the menu overlay when menu button is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<MobileBottomNav />);

        const menuBtn = screen.getByRole('button', { name: /abrir menú de navegación/i });
        await user.click(menuBtn);

        // When opened, the overlay renders close button or title
        expect(screen.getByRole('button', { name: /cerrar menú/i })).toBeInTheDocument();
    });
});
