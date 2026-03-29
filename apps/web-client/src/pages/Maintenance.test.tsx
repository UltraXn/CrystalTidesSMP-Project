import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Maintenance from './Maintenance';
import { renderWithProviders } from '../utils/test-utils';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Maintenance Page', () => {
    it('should render the maintenance message and logo', () => {
        renderWithProviders(<Maintenance />);
        
        expect(screen.getByText(/En Mantenimiento/i)).toBeInTheDocument();
        expect(screen.getByText(/Estamos realizando mejoras importantes/i)).toBeInTheDocument();
        expect(screen.getByAltText(/CrystalTides Logo/i)).toBeInTheDocument();
    });

    it('should contain a link to Discord', () => {
        renderWithProviders(<Maintenance />);
        
        const discordLink = screen.getByRole('link', { name: /Únete a Discord/i });
        expect(discordLink).toBeInTheDocument();
        expect(discordLink).toHaveAttribute('href', 'https://discord.com/invite/TDmwYNnvyT');
    });

    it('should contain an admin login link', () => {
        renderWithProviders(<Maintenance />);
        
        const loginLink = screen.getByRole('link', { name: /Iniciar Sesión/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
    });
});
