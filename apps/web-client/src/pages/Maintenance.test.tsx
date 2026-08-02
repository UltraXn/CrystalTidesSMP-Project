import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Maintenance from './Maintenance';
import { renderWithProviders } from '../utils/test-utils';

vi.mock('framer-motion', () => {
    const Component = ({ children, ...props }: any) => <div {...props}>{children}</div>;
    return {
        m: {
            div: Component,
            h1: Component,
            p: Component,
            button: Component,
            span: Component,
            a: Component,
        },
        motion: {
            div: Component,
            h1: Component,
            p: Component,
            button: Component,
            span: Component,
            a: Component,
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

describe('Maintenance Page', () => {
    it('should render the maintenance message and logo', () => {
        renderWithProviders(<Maintenance />);
        
        expect(screen.getByText(/En Mantenimiento/i)).toBeInTheDocument();
        expect(screen.getByText(/Estamos realizando mejoras importantes/i)).toBeInTheDocument();
        expect(screen.getByAltText(/CrystalTides Logo/i)).toBeInTheDocument();
    });

    it('should contain a link to Discord', () => {
        renderWithProviders(<Maintenance />);
        
        const discordLink = screen.getByTestId('discord-link');
        expect(discordLink).toBeInTheDocument();
        expect(discordLink).toHaveAttribute('href', expect.stringContaining('discord.com'));
    });

    it('should contain an admin login link', () => {
        renderWithProviders(<Maintenance />);
        
        const loginLink = screen.getByTestId('admin-login-link');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
    });
});
