import type React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationModal from '@/components/UI/ConfirmationModal';

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

describe('ConfirmationModal', () => {
    let onClose: Mock;
    let onConfirm: Mock;

    beforeEach(() => {
        onClose = vi.fn();
        onConfirm = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(<ConfirmationModal isOpen={false} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" />);
        expect(screen.queryByTestId('confirmation-modal-overlay')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
        render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" />);
        expect(screen.getByTestId('confirmation-modal-overlay')).toBeInTheDocument();
    });

    it('should render correct title and message', () => {
        render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" />);
        expect(screen.getByTestId('confirmation-modal-title')).toHaveTextContent('Test Title');
        expect(screen.getByTestId('confirmation-modal-message')).toHaveTextContent('Test Message');
    });

    it('should render correct button texts', () => {
        render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" confirmText="Yes" cancelText="No" />);
        expect(screen.getByTestId('confirmation-modal-cancel')).toHaveTextContent('No');
        expect(screen.getByTestId('confirmation-modal-confirm')).toHaveTextContent('Yes');
    });

    it('should call onClose when cancel button is clicked', async () => {
        const user = userEvent.setup();
        render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" />);
        await user.click(screen.getByTestId('confirmation-modal-cancel'));
        expect(onClose).toHaveBeenCalled();
    });

    it('should call onConfirm when confirm button is clicked', async () => {
        const user = userEvent.setup();
        render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" />);
        await user.click(screen.getByTestId('confirmation-modal-confirm'));
        expect(onConfirm).toHaveBeenCalled();
    });

    it('should disable buttons when isLoading is true', () => {
        render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" isLoading={true} />);
        expect(screen.getByTestId('confirmation-modal-cancel')).toBeDisabled();
        expect(screen.getByTestId('confirmation-modal-confirm')).toBeDisabled();
    });

    it('should render danger styles when isDanger is true', () => {
        render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" isDanger={true} />);
        expect(screen.getByTestId('confirmation-modal-confirm')).toHaveStyle({ background: '#e74c3c' });
    });

    it('should render default styles when isDanger is false', () => {
        render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" isDanger={false} />);
        expect(screen.getByTestId('confirmation-modal-confirm')).toHaveStyle({ background: 'var(--accent)' });
    });

    it('should render loading spinner and processing text when isLoading is true', () => {
        const { container } = render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" isLoading={true} />);
        expect(container.querySelector('.spinner-border')).toBeInTheDocument();
        expect(screen.getByText('Procesando...')).toBeInTheDocument();
    });

    it('should render AlertTriangle and confirm text when isLoading is false', () => {
        const { container } = render(<ConfirmationModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Test Title" message="Test Message" isLoading={false} confirmText="Confirmar" />);
        expect(container.querySelector('.spinner-border')).not.toBeInTheDocument();
        expect(screen.getByText('Confirmar')).toBeInTheDocument();
    });
});
