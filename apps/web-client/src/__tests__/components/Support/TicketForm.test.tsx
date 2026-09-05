import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketForm from '@/components/Support/TicketForm';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('framer-motion', () => {
    const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...props}>{children}</div>
    );
    return {
        m: {
            div: Component,
        },
        motion: {
            div: Component,
        },
        AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
    };
});

describe('TicketForm', () => {
    it('renders form inputs and handles cancel button', async () => {
        const handleClose = vi.fn();
        const handleSubmit = vi.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        renderWithProviders(<TicketForm onClose={handleClose} onSubmit={handleSubmit} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/support\.category|category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/support\.priority|priority/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/support\.subject|subject/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/support\.message|message/i)).toBeInTheDocument();

        const cancelBtn = screen.getByRole('button', { name: /common\.cancel|cancel/i });
        await user.click(cancelBtn);
        expect(handleClose).toHaveBeenCalledOnce();
    });

    it('submits valid form data and executes onSubmit callback', async () => {
        const handleClose = vi.fn();
        const handleSubmit = vi.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        renderWithProviders(<TicketForm onClose={handleClose} onSubmit={handleSubmit} />);

        const titleInput = screen.getByLabelText(/support\.subject|subject/i);
        const descriptionInput = screen.getByLabelText(/support\.message|message/i);
        const submitBtn = screen.getByRole('button', { name: /common\.submit|submit/i });

        await user.type(titleInput, 'Reporte de bug en spawn');
        await user.type(descriptionInput, 'No se puede abrir el cofre inicial al entrar en la zona protegida.');

        await user.click(submitBtn);

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Reporte de bug en spawn',
                    description: 'No se puede abrir el cofre inicial al entrar en la zona protegida.',
                    category: 'general',
                    priority: 'medium',
                })
            );
        });
    });

    it('displays error alert when onSubmit rejects', async () => {
        const handleClose = vi.fn();
        const handleSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
        const user = userEvent.setup();

        renderWithProviders(<TicketForm onClose={handleClose} onSubmit={handleSubmit} />);

        const titleInput = screen.getByLabelText(/support\.subject|subject/i);
        const descriptionInput = screen.getByLabelText(/support\.message|message/i);
        const submitBtn = screen.getByRole('button', { name: /common\.submit|submit/i });

        await user.type(titleInput, 'Error de compra en tienda');
        await user.type(descriptionInput, 'Mi rango VIP no se activó después de realizar el pago en PayPal.');

        await user.click(submitBtn);

        const alert = await screen.findByRole('alert');
        expect(alert).toBeInTheDocument();
    });
});
