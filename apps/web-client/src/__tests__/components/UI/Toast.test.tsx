import type React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from '@/components/UI/Toast';

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

describe('Toast Component', () => {
    let onCloseMock: Mock;

    beforeEach(() => {
        onCloseMock = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render the Toast with success type', () => {
        render(<Toast message="Success message" type="success" isVisible={true} onClose={onCloseMock} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /check circle/i })).toBeInTheDocument();
        expect(screen.getByText(/success message/i)).toBeInTheDocument();
    });

    it('should render the Toast with error type', () => {
        render(<Toast message="Error message" type="error" isVisible={true} onClose={onCloseMock} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /alert circle/i })).toBeInTheDocument();
        expect(screen.getByText(/error message/i)).toBeInTheDocument();
    });

    it('should render the Toast with info type', () => {
        render(<Toast message="Info message" type="info" isVisible={true} onClose={onCloseMock} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /info/i })).toBeInTheDocument();
        expect(screen.getByText(/info message/i)).toBeInTheDocument();
    });

    it('should not render the Toast when isVisible is false', () => {
        render(<Toast message="Hidden message" isVisible={false} onClose={onCloseMock} />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should call onClose when the close button is clicked', async () => {
        render(<Toast message="Closeable message" isVisible={true} onClose={onCloseMock} />);
        const closeButton = screen.getByRole('button', { name: /cerrar notificación/i });
        await userEvent.click(closeButton);
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('should close the Toast after the specified duration', async () => {
        render(<Toast message="Auto close message" isVisible={true} onClose={onCloseMock} duration={100} />);
        await waitFor(() => expect(onCloseMock).toHaveBeenCalled(), { timeout: 2000 });
    });

    it('should not close the Toast if isVisible is false', async () => {
        render(<Toast message="Sticky message" isVisible={false} onClose={onCloseMock} duration={1000} />);
        await waitFor(() => expect(onCloseMock).not.toHaveBeenCalled());
    });
});
