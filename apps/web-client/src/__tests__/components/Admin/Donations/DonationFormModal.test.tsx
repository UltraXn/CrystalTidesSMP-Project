import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import DonationFormModal from '@/components/Admin/Donations/DonationFormModal';
import { Donation } from '@/components/Admin/Donations/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

describe('DonationFormModal', () => {
    const sampleDonation: Donation = {
        id: 101,
        amount: 25.5,
        currency: 'USD',
        from_name: 'PlayerOne',
        message: 'Great server!',
        is_public: true,
        buyer_email: 'player@example.com',
        created_at: '2026-03-01T12:00:00.000Z',
    };

    it('renders null when isOpen is false', () => {
        // Arrange & Act
        const { container } = renderWithProviders(
            <DonationFormModal
                isOpen={false}
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                initialData={null}
            />
        );

        // Assert
        expect(container.firstChild).toBeNull();
    });

    it('renders creation modal with default empty values when initialData is null', () => {
        // Arrange & Act
        renderWithProviders(
            <DonationFormModal
                isOpen={true}
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                initialData={null}
            />
        );

        // Assert
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('admin.donations.new_btn')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /donor_name/i })).toHaveValue('');
        expect(screen.getByRole('spinbutton')).toHaveValue(0);
    });

    it('populates fields when initialData is provided', () => {
        // Arrange & Act
        renderWithProviders(
            <DonationFormModal
                isOpen={true}
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                initialData={sampleDonation}
            />
        );

        // Assert
        expect(screen.getByText('admin.donations.edit_title')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /donor_name/i })).toHaveValue('PlayerOne');
        expect(screen.getByRole('textbox', { name: /email_label/i })).toHaveValue('player@example.com');
        expect(screen.getByRole('spinbutton')).toHaveValue(25.5);
        expect(screen.getByRole('combobox')).toHaveValue('USD');
        expect(screen.getByRole('textbox', { name: /message/i })).toHaveValue('Great server!');
        expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    });

    it('toggles is_public checkbox on click and on keydown (Enter/Space)', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <DonationFormModal
                isOpen={true}
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                initialData={sampleDonation}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute('aria-checked', 'true');

        // Act: click to toggle off
        await user.click(checkbox);
        expect(checkbox).toHaveAttribute('aria-checked', 'false');

        // Act: press space to toggle on
        checkbox.focus();
        await user.keyboard(' ');
        expect(checkbox).toHaveAttribute('aria-checked', 'true');

        // Act: press enter to toggle off
        await user.keyboard('{Enter}');
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('calls onClose when close button or cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderWithProviders(
            <DonationFormModal
                isOpen={true}
                onClose={onClose}
                onSave={vi.fn().mockResolvedValue(undefined)}
                initialData={null}
            />
        );

        // Act: click header close
        const closeBtn = screen.getByRole('button', { name: /cerrar ventana/i });
        await user.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);

        // Act: click cancel button
        const cancelBtn = screen.getByRole('button', { name: 'admin.donations.form.cancel' });
        await user.click(cancelBtn);
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('submits form with updated values and closes on success', async () => {
        // Arrange
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(undefined);
        const onClose = vi.fn();

        renderWithProviders(
            <DonationFormModal
                isOpen={true}
                onClose={onClose}
                onSave={onSave}
                initialData={null}
            />
        );

        // Act: fill out fields
        const nameInput = screen.getByRole('textbox', { name: /donor_name/i });
        const emailInput = screen.getByRole('textbox', { name: /email_label/i });
        const amountInput = screen.getByRole('spinbutton');
        const currencySelect = screen.getByRole('combobox');
        const messageInput = screen.getByRole('textbox', { name: /message/i });

        await user.type(nameInput, 'Alex');
        await user.type(emailInput, 'alex@domain.org');
        await user.clear(amountInput);
        await user.type(amountInput, '50');
        await user.selectOptions(currencySelect, 'EUR');
        await user.type(messageInput, 'Support donation');

        const submitBtn = screen.getByRole('button', { name: /admin\.donations\.form\.save/i });
        await user.click(submitBtn);

        // Assert
        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    from_name: 'Alex',
                    buyer_email: 'alex@domain.org',
                    amount: 50,
                    currency: 'EUR',
                    message: 'Support donation',
                    is_public: true,
                })
            );
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('disables submit button when saving is true', () => {
        // Arrange & Act
        renderWithProviders(
            <DonationFormModal
                isOpen={true}
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                initialData={null}
                saving={true}
            />
        );

        // Assert
        const submitBtn = screen.getByRole('button', { name: '' });
        expect(submitBtn).toBeDisabled();
    });
});
