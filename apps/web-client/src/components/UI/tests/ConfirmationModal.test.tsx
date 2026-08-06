import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationModal from '../ConfirmationModal.js';

describe('ConfirmationModal Component Unit & Mutation Tests', () => {
    it('returns null when isOpen is false', () => {
        const { container } = render(
            <ConfirmationModal
                isOpen={false}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Título Modal"
                message="Mensaje Modal"
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders title, message and default button texts when isOpen is true', () => {
        render(
            <ConfirmationModal
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Título Confirmar"
                message="¿Estás seguro de continuar?"
            />
        );
        expect(screen.getByTestId('confirmation-modal-title')).toHaveTextContent('Título Confirmar');
        expect(screen.getByTestId('confirmation-modal-message')).toHaveTextContent('¿Estás seguro de continuar?');
        expect(screen.getByTestId('confirmation-modal-cancel')).toHaveTextContent('Cancelar');
        expect(screen.getByTestId('confirmation-modal-confirm')).toHaveTextContent('Confirmar');
    });

    it('renders custom button texts and danger styling', () => {
        render(
            <ConfirmationModal
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Eliminar Cuenta"
                message="Esta acción no se puede deshacer"
                confirmText="Eliminar"
                cancelText="Volver"
                isDanger={true}
            />
        );
        expect(screen.getByTestId('confirmation-modal-cancel')).toHaveTextContent('Volver');
        expect(screen.getByTestId('confirmation-modal-confirm')).toHaveTextContent('Eliminar');
        expect(screen.getByTestId('confirmation-modal-confirm')).toHaveStyle({ background: '#e74c3c' });
    });

    it('triggers onClose when clicking overlay or cancel button', () => {
        const handleClose = vi.fn();
        render(
            <ConfirmationModal
                isOpen={true}
                onClose={handleClose}
                onConfirm={vi.fn()}
                title="Título Modal"
                message="Mensaje Modal"
            />
        );

        fireEvent.click(screen.getByTestId('confirmation-modal-cancel'));
        expect(handleClose).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('confirmation-modal-overlay'));
        expect(handleClose).toHaveBeenCalledTimes(2);

        // stopPropagation test
        fireEvent.click(screen.getByTestId('confirmation-modal-container'));
        expect(handleClose).toHaveBeenCalledTimes(2);
    });

    it('triggers onConfirm when clicking confirm button', () => {
        const handleConfirm = vi.fn();
        render(
            <ConfirmationModal
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={handleConfirm}
                title="Título Modal"
                message="Mensaje Modal"
            />
        );

        fireEvent.click(screen.getByTestId('confirmation-modal-confirm'));
        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('handles isLoading state correctly', () => {
        const handleClose = vi.fn();
        const handleConfirm = vi.fn();

        render(
            <ConfirmationModal
                isOpen={true}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title="Procesando"
                message="Espere por favor"
                isLoading={true}
                isDanger={true}
            />
        );

        expect(screen.getByTestId('confirmation-modal-confirm')).toHaveTextContent('Procesando...');
        expect(screen.getByTestId('confirmation-modal-cancel')).toBeDisabled();
        expect(screen.getByTestId('confirmation-modal-confirm')).toBeDisabled();

        fireEvent.click(screen.getByTestId('confirmation-modal-overlay'));
        expect(handleClose).not.toHaveBeenCalled();

        // Mouse hover when isLoading shouldn't throw or alter styles
        const cancelBtn = screen.getByTestId('confirmation-modal-cancel');
        fireEvent.mouseOver(cancelBtn);
        fireEvent.mouseOut(cancelBtn);
        fireEvent.focus(cancelBtn);
        fireEvent.blur(cancelBtn);
    });

    it('triggers hover and focus events on cancel button when not loading', () => {
        render(
            <ConfirmationModal
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Título Modal"
                message="Mensaje Modal"
                isLoading={false}
            />
        );

        const cancelBtn = screen.getByTestId('confirmation-modal-cancel');
        fireEvent.mouseOver(cancelBtn);
        expect(cancelBtn.style.borderColor).toBe('rgb(102, 102, 102)');

        fireEvent.mouseOut(cancelBtn);
        expect(cancelBtn.style.borderColor).toBe('rgb(68, 68, 68)');

        fireEvent.focus(cancelBtn);
        expect(cancelBtn.style.borderColor).toBe('rgb(102, 102, 102)');

        fireEvent.blur(cancelBtn);
        expect(cancelBtn.style.borderColor).toBe('rgb(68, 68, 68)');
    });
});
