import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import PollDeleteModal from '@/components/Admin/Polls/PollDeleteModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

describe('PollDeleteModal', () => {
    it('renders modal titles and confirmation message', () => {
        // Arrange & Act
        renderWithProviders(
            <PollDeleteModal
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('¿Eliminar Encuesta?')).toBeInTheDocument();
        expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.polls.form_extras.cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onCancel = vi.fn();

        renderWithProviders(
            <PollDeleteModal
                onConfirm={vi.fn()}
                onCancel={onCancel}
            />
        );

        // Act
        const cancelBtn = screen.getByRole('button', { name: 'admin.polls.form_extras.cancel' });
        await user.click(cancelBtn);

        // Assert
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when delete confirmation button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onConfirm = vi.fn();

        renderWithProviders(
            <PollDeleteModal
                onConfirm={onConfirm}
                onCancel={vi.fn()}
            />
        );

        // Act
        const confirmBtn = screen.getByRole('button', { name: 'Eliminar' });
        await user.click(confirmBtn);

        // Assert
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
