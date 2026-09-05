import type React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PremiumConfirm from '@/components/UI/PremiumConfirm';

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

describe('PremiumConfirm', () => {
    let onConfirm: Mock;
    let onCancel: Mock;

    beforeEach(() => {
        onConfirm = vi.fn();
        onCancel = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should not render anything when isOpen is false', () => {
        render(<PremiumConfirm isOpen={false} message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render the dialog when isOpen is true', () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render the correct title when provided', () => {
        render(<PremiumConfirm isOpen={true} title="Test Title" message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Title');
    });

    it('should render the default title when no title is provided', () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Confirmar Acción');
    });

    it('should render the correct message', () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render the correct confirm label when provided', async () => {
        render(<PremiumConfirm isOpen={true} confirmLabel="Custom Confirm" message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        const confirmButton = screen.getByRole('button', { name: /custom confirm/i });
        expect(confirmButton).toBeInTheDocument();
        await userEvent.click(confirmButton);
        expect(onConfirm).toHaveBeenCalled();
    });

    it('should render the default confirm label when no label is provided', async () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        const confirmButton = screen.getByRole('button', { name: /confirmar/i });
        expect(confirmButton).toBeInTheDocument();
        await userEvent.click(confirmButton);
        expect(onConfirm).toHaveBeenCalled();
    });

    it('should render the correct cancel label when provided', async () => {
        render(<PremiumConfirm isOpen={true} cancelLabel="Custom Cancel" message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        const cancelButton = screen.getByRole('button', { name: /custom cancel/i });
        expect(cancelButton).toBeInTheDocument();
        await userEvent.click(cancelButton);
        expect(onCancel).toHaveBeenCalled();
    });

    it('should render the default cancel label when no label is provided', async () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        const cancelButton = screen.getByRole('button', { name: /cancelar/i });
        expect(cancelButton).toBeInTheDocument();
        await userEvent.click(cancelButton);
        expect(onCancel).toHaveBeenCalled();
    });

    it('should render the correct variant styles for danger', () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} variant="danger" />);
        const confirmButton = screen.getByRole('button', { name: /confirmar/i });
        expect(confirmButton).toHaveStyle('background: #ef4444');
        expect(confirmButton).toHaveStyle('color: #fff');
    });

    it('should render the correct variant styles for warning', () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} variant="warning" />);
        const confirmButton = screen.getByRole('button', { name: /confirmar/i });
        expect(confirmButton).toHaveStyle('background: #facc15');
        expect(confirmButton).toHaveStyle('color: #000');
    });

    it('should render the correct variant styles for info', () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} variant="info" />);
        const confirmButton = screen.getByRole('button', { name: /confirmar/i });
        expect(confirmButton).toHaveStyle('background: #3b82f6');
        expect(confirmButton).toHaveStyle('color: #fff');
    });

    it('should call onConfirm when confirm button is clicked', async () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        const confirmButton = screen.getByRole('button', { name: /confirmar/i });
        await userEvent.click(confirmButton);
        expect(onConfirm).toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', async () => {
        render(<PremiumConfirm isOpen={true} message="Test message" onConfirm={onConfirm} onCancel={onCancel} />);
        const cancelButton = screen.getByRole('button', { name: /cancelar/i });
        await userEvent.click(cancelButton);
        expect(onCancel).toHaveBeenCalled();
    });
});
