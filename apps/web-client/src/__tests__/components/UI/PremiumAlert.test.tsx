import type React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PremiumAlert from '@/components/UI/PremiumAlert';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...p }: { children?: React.ReactNode } & Record<string, unknown>) => <div {...(p as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>,
        button: ({ children, ...p }: { children?: React.ReactNode } & Record<string, unknown>) => <button {...(p as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
    },
    m: {
        div: ({ children, ...p }: { children?: React.ReactNode } & Record<string, unknown>) => <div {...(p as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>,
        button: ({ children, ...p }: { children?: React.ReactNode } & Record<string, unknown>) => <button {...(p as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (_key: string, defaultValue: string) => defaultValue
    })
}));

describe('PremiumAlert', () => {
    let onCloseMock: Mock;

    beforeEach(() => {
        onCloseMock = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(<PremiumAlert isOpen={false} message="Test message" onClose={onCloseMock} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
        render(<PremiumAlert isOpen={true} message="Test message" onClose={onCloseMock} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render with the correct variant and icon', () => {
        render(<PremiumAlert isOpen={true} message="Test message" onClose={onCloseMock} variant="error" />);
        expect(screen.getByRole('img', { name: /alert circle/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Error');
    });

    it('should render with the default title when title prop is not provided', () => {
        render(<PremiumAlert isOpen={true} message="Test message" onClose={onCloseMock} variant="info" />);
        expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Información');
    });

    it('should render with the provided title when title prop is provided', () => {
        render(<PremiumAlert isOpen={true} title="Custom Title" message="Test message" onClose={onCloseMock} variant="success" />);
        expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Custom Title');
    });

    it('should call onClose when the close button is clicked', async () => {
        render(<PremiumAlert isOpen={true} message="Test message" onClose={onCloseMock} />);
        const closeButton = screen.getByRole('button', { name: /action/i });
        await userEvent.click(closeButton);
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('should call onClose when the accept button is clicked', async () => {
        render(<PremiumAlert isOpen={true} message="Test message" onClose={onCloseMock} />);
        const acceptButton = screen.getByRole('button', { name: /aceptar/i });
        await userEvent.click(acceptButton);
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('should render with the correct styles for the accept button based on variant', () => {
        render(<PremiumAlert isOpen={true} message="Test message" onClose={onCloseMock} variant="warning" />);
        const acceptButton = screen.getByRole('button', { name: /aceptar/i });
        expect(acceptButton).toHaveStyle('color: #000');
    });

    it('should render with the correct styles for the accept button based on variant', () => {
        render(<PremiumAlert isOpen={true} message="Test message" onClose={onCloseMock} variant="info" />);
        const acceptButton = screen.getByRole('button', { name: /aceptar/i });
        expect(acceptButton).toHaveStyle('color: #fff');
    });
});
