import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import StaffSyncModal from '@/components/Admin/Staff/StaffSyncModal';
import { StaffCardData } from '@/components/Admin/Staff/StaffFormModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
    Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

describe('StaffSyncModal', () => {
    const sampleStaff: StaffCardData[] = [
        {
            id: 1,
            name: 'AlexDev',
            role: 'Developer',
            color: '#ec4899',
            description: 'Lead Developer',
            image: 'https://example.com/alex.png',
            socials: {
                discord: 'alex#0001',
                twitch: 'alex_twitch',
            },
        },
        {
            id: 2,
            name: 'ModSam',
            role: 'Moderator',
            color: '#21cb20',
            description: 'Server Mod',
            image: '',
        },
    ];

    it('renders null when isOpen is false', () => {
        // Arrange & Act
        const { container } = renderWithProviders(
            <StaffSyncModal
                isOpen={false}
                foundStaff={sampleStaff}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />
        );

        // Assert
        expect(container.firstChild).toBeNull();
    });

    it('renders modal with detected staff cards, roles, and warnings when isOpen is true', () => {
        // Arrange & Act
        renderWithProviders(
            <StaffSyncModal
                isOpen={true}
                foundStaff={sampleStaff}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />
        );

        // Assert
        expect(screen.getByText('admin.staff.confirm_modal.title')).toBeInTheDocument();
        expect(screen.getByText('admin.staff.confirm_modal.detected_msg')).toBeInTheDocument();
        expect(screen.getByText('admin.staff.confirm_modal.warning')).toBeInTheDocument();

        expect(screen.getByText('AlexDev')).toBeInTheDocument();
        expect(screen.getByText('Developer')).toBeInTheDocument();
        expect(screen.getByText('ModSam')).toBeInTheDocument();
        expect(screen.getByText('Moderator')).toBeInTheDocument();
    });

    it('calls onClose when cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onClose = vi.fn();

        renderWithProviders(
            <StaffSyncModal
                isOpen={true}
                foundStaff={sampleStaff}
                onClose={onClose}
                onConfirm={vi.fn()}
            />
        );

        // Act
        const cancelBtn = screen.getByRole('button', { name: 'admin.staff.confirm_modal.cancel' });
        await user.click(cancelBtn);

        // Assert
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when save button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onConfirm = vi.fn();

        renderWithProviders(
            <StaffSyncModal
                isOpen={true}
                foundStaff={sampleStaff}
                onClose={vi.fn()}
                onConfirm={onConfirm}
            />
        );

        // Act
        const saveBtn = screen.getByRole('button', { name: /admin\.staff\.confirm_modal\.save/i });
        await user.click(saveBtn);

        // Assert
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
