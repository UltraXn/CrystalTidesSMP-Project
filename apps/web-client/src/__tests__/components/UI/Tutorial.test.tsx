import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import Tutorial from '@/components/UI/Tutorial';

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

const mockChangeLanguage = vi.fn();
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'es',
            changeLanguage: mockChangeLanguage
        }
    })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        user: null,
        loading: false
    })
}));

describe('Tutorial Component', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render when forceOpen is true', () => {
        render(<Tutorial forceOpen />);
        expect(screen.getByText('tutorial.step1_title')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cerrar tutorial/i })).toBeInTheDocument();
    });

    it('should close when the close button is clicked', async () => {
        render(<Tutorial forceOpen />);
        const closeButton = screen.getByRole('button', { name: /cerrar tutorial/i });
        await user.click(closeButton);
        expect(screen.queryByText('tutorial.step1_title')).not.toBeInTheDocument();
        expect(sessionStorage.getItem('tutorial_dismissed')).toBe('true');
    });

    it('should advance to next step when primary action is clicked', async () => {
        render(<Tutorial forceOpen />);
        expect(screen.getByText('tutorial.step1_title')).toBeInTheDocument();
        
        const nextButton = screen.getByRole('button', { name: /action/i });
        await user.click(nextButton);
        
        expect(screen.getByText('tutorial.step2_title')).toBeInTheDocument();
    });

    it('should change language when language toggle is clicked', async () => {
        render(<Tutorial forceOpen />);
        const enButton = screen.getByRole('button', { name: /change language to english/i });
        await user.click(enButton);
        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
});
