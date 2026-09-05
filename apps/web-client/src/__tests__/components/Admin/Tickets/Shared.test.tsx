import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import {
    CustomAlert,
    CustomConfirm,
    PriorityBadge,
    StatusBadge,
} from '@/components/Admin/Tickets/Shared';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

describe('Admin/Tickets/Shared Components', () => {
    describe('CustomAlert', () => {
        it('renders error alert with message and calls onClose on button click', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            renderWithProviders(
                <CustomAlert message="Something went wrong" type="error" onClose={onClose} />
            );

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Error');
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();

            const acceptBtn = screen.getByRole('button', { name: 'Aceptar' });
            await user.click(acceptBtn);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('renders success and warning alert titles', () => {
            const { rerender } = renderWithProviders(
                <CustomAlert message="Operation succeeded" type="success" onClose={vi.fn()} />
            );
            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Éxito');

            rerender(
                <CustomAlert message="Be careful" type="warning" onClose={vi.fn()} />
            );
            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Advertencia');
        });
    });

    describe('CustomConfirm', () => {
        it('renders confirm modal with message and handles confirm/cancel', async () => {
            const user = userEvent.setup();
            const onConfirm = vi.fn();
            const onCancel = vi.fn();

            renderWithProviders(
                <CustomConfirm
                    message="Are you sure you want to delete this?"
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                />
            );

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Confirmar Acción');
            expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument();

            const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
            await user.click(cancelBtn);
            expect(onCancel).toHaveBeenCalledTimes(1);

            const deleteBtn = screen.getByRole('button', { name: 'Eliminar' });
            await user.click(deleteBtn);
            expect(onConfirm).toHaveBeenCalledTimes(1);
        });
    });

    describe('PriorityBadge', () => {
        it('renders corresponding priority labels', () => {
            const { rerender } = renderWithProviders(<PriorityBadge priority="low" />);
            expect(screen.getByText('Baja')).toBeInTheDocument();

            rerender(<PriorityBadge priority="medium" />);
            expect(screen.getByText('Media')).toBeInTheDocument();

            rerender(<PriorityBadge priority="high" />);
            expect(screen.getByText('Alta')).toBeInTheDocument();

            rerender(<PriorityBadge priority="urgent" />);
            expect(screen.getByText('Urgente')).toBeInTheDocument();
        });
    });

    describe('StatusBadge', () => {
        it('renders corresponding status labels', () => {
            const { rerender } = renderWithProviders(<StatusBadge status="open" />);
            expect(screen.getByText('Abierto')).toBeInTheDocument();

            rerender(<StatusBadge status="pending" />);
            expect(screen.getByText('Pendiente')).toBeInTheDocument();

            rerender(<StatusBadge status="resolved" />);
            expect(screen.getByText('Resuelto')).toBeInTheDocument();

            rerender(<StatusBadge status="closed" />);
            expect(screen.getByText('Cerrado')).toBeInTheDocument();
        });
    });
});
