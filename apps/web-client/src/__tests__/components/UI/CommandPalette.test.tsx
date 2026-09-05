import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import CommandPalette from '@/components/UI/CommandPalette';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...p }: ComponentPropsWithoutRef<'div'>) => <div {...p}>{children}</div>,
        button: ({ children, ...p }: ComponentPropsWithoutRef<'button'>) => <button {...p}>{children}</button>,
    },
    m: {
        div: ({ children, ...p }: ComponentPropsWithoutRef<'div'>) => <div {...p}>{children}</div>,
        button: ({ children, ...p }: ComponentPropsWithoutRef<'button'>) => <button {...p}>{children}</button>,
    },
    AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultValue: string) => defaultValue || key,
    }),
}));

vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            user_metadata: {
                role: 'admin',
            },
        },
    }),
}));

describe('CommandPalette', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render the CommandPalette when forceOpen is true', () => {
        render(<CommandPalette forceOpen={true} />);
        expect(screen.getByPlaceholderText('Busca un comando o página...')).toBeInTheDocument();
    });

    it('should not render the CommandPalette when forceOpen is false', () => {
        render(<CommandPalette forceOpen={false} />);
        expect(screen.queryByPlaceholderText('Busca un comando o página...')).not.toBeInTheDocument();
    });

    it('should toggle on Ctrl+K and close on Escape', () => {
        render(<CommandPalette />);
        expect(screen.queryByPlaceholderText('Busca un comando o página...')).not.toBeInTheDocument();

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        expect(screen.getByPlaceholderText('Busca un comando o página...')).toBeInTheDocument();

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.queryByPlaceholderText('Busca un comando o página...')).not.toBeInTheDocument();
    });

    it('should filter items based on search query', async () => {
        render(<CommandPalette forceOpen={true} />);
        const input = screen.getByPlaceholderText('Busca un comando o página...');
        
        await user.type(input, 'Foro');
        expect(screen.getByText('Foro')).toBeInTheDocument();
        expect(screen.queryByText('Inicio')).not.toBeInTheDocument();
    });

    it('should navigate when an action item is clicked', async () => {
        render(<CommandPalette forceOpen={true} />);
        const homeItem = screen.getByText('Inicio');
        await user.click(homeItem);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
