import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import DonorsConfirmModal from '@/components/Admin/Donors/DonorsConfirmModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

describe('DonorsConfirmModal', () => {
    it('renders null when isOpen is false', () => {
        // Arrange & Act
        const { container } = renderWithProviders(
            <DonorsConfirmModal
                isOpen={false}
                type="delete"
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />
        );

        // Assert
        expect(container.firstChild).toBeNull();
    });

    it('renders null when type is null', () => {
        // Arrange & Act
        const { container } = renderWithProviders(
            <DonorsConfirmModal
                isOpen={true}
                type={null}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />
        );

        // Assert
        expect(container.firstChild).toBeNull();
    });

    it('renders delete confirmation modal with delete texts', () => {
        // Arrange & Act
        renderWithProviders(
            <DonorsConfirmModal
                isOpen={true}
                type="delete"
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('admin.donors.delete_confirm.title')).toBeInTheDocument();
        expect(screen.getByText('admin.donors.delete_confirm.msg')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.donors.delete_confirm.btn' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('renders import confirmation modal with import texts', () => {
        // Arrange & Act
        renderWithProviders(
            <DonorsConfirmModal
                isOpen={true}
                type="import"
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('admin.donors.import_confirm.title')).toBeInTheDocument();
        expect(screen.getByText('admin.donors.import_confirm.msg')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.donors.import_confirm.btn' })).toBeInTheDocument();
    });

    it('calls onClose when cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderWithProviders(
            <DonorsConfirmModal
                isOpen={true}
                type="delete"
                onClose={onClose}
                onConfirm={vi.fn()}
            />
        );

        // Act
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        // Assert
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when confirm button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        renderWithProviders(
            <DonorsConfirmModal
                isOpen={true}
                type="delete"
                onClose={vi.fn()}
                onConfirm={onConfirm}
            />
        );

        // Act
        await user.click(screen.getByRole('button', { name: 'admin.donors.delete_confirm.btn' }));

        // Assert
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
