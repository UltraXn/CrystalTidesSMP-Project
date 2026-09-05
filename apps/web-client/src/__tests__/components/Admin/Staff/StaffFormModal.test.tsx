import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import StaffFormModal, { StaffCardData } from '@/components/Admin/Staff/StaffFormModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@/components/UI/MinecraftAvatar', () => ({
    default: ({ alt }: { alt: string }) => <div data-testid="minecraft-avatar">{alt}</div>,
}));

vi.mock('@/components/UI/Loader', () => ({
    default: () => <div data-testid="loader">Loading...</div>,
}));

describe('StaffFormModal', () => {
    const sampleStaff: StaffCardData = {
        id: 10,
        name: 'ModJess',
        mc_nickname: 'Jess_MC',
        role: 'Moderator',
        color: '#21cb20',
        description: 'Community moderator',
        image: 'https://example.com/jess.png',
        socials: {
            discord: 'jess#1234',
            twitch: 'jess_live',
            twitter: 'https://x.com/jess',
            youtube: 'https://youtube.com/jess',
        },
    };

    it('returns null when userData is null and isNew is false', () => {
        // Arrange & Act
        const { container } = renderWithProviders(
            <StaffFormModal
                userData={null}
                isNew={false}
                onClose={vi.fn()}
                onSave={vi.fn()}
                saving={false}
            />
        );

        // Assert
        expect(container.firstChild).toBeNull();
    });

    it('renders creation mode with new staff title when isNew is true', () => {
        // Arrange & Act
        renderWithProviders(
            <StaffFormModal
                userData={null}
                isNew={true}
                onClose={vi.fn()}
                onSave={vi.fn()}
                saving={false}
            />
        );

        // Assert
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('admin.staff.form.new_title')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'admin.staff.form.name_label' })).toHaveValue('');
    });

    it('populates fields in edit mode when userData is provided', () => {
        // Arrange & Act
        renderWithProviders(
            <StaffFormModal
                userData={sampleStaff}
                isNew={false}
                onClose={vi.fn()}
                onSave={vi.fn()}
                saving={false}
            />
        );

        // Assert
        expect(screen.getByText(/admin\.staff\.form\.edit_title/i)).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'admin.staff.form.name_label' })).toHaveValue('ModJess');
        expect(screen.getByRole('textbox', { name: /nick mc/i })).toHaveValue('Jess_MC');
        expect(screen.getByRole('combobox', { name: 'admin.staff.form.role_label' })).toHaveValue('Moderator');
        expect(screen.getByRole('textbox', { name: 'admin.staff.form.avatar_label' })).toHaveValue('https://example.com/jess.png');
        expect(screen.getByRole('textbox', { name: 'admin.staff.form.bio_label' })).toHaveValue('Community moderator');
    });

    it('handles custom role input when Custom option is selected', async () => {
        // Arrange
        const user = userEvent.setup();
        renderWithProviders(
            <StaffFormModal
                userData={sampleStaff}
                isNew={false}
                onClose={vi.fn()}
                onSave={vi.fn()}
                saving={false}
            />
        );

        // Act: switch role to Custom
        const roleSelect = screen.getByRole('combobox', { name: 'admin.staff.form.role_label' });
        await user.selectOptions(roleSelect, 'Custom');

        // Assert: custom role input appears
        const customRoleInput = screen.getByRole('textbox', { name: 'Rol personalizado' });
        expect(customRoleInput).toBeInTheDocument();

        // Act: type custom role
        await user.type(customRoleInput, 'Event Coordinator');
        expect(customRoleInput).toHaveValue('Event Coordinator');
    });

    it('submits form with updated data when save button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onSave = vi.fn();

        renderWithProviders(
            <StaffFormModal
                userData={sampleStaff}
                isNew={false}
                onClose={vi.fn()}
                onSave={onSave}
                saving={false}
            />
        );

        // Act: update description and submit
        const bioInput = screen.getByRole('textbox', { name: 'admin.staff.form.bio_label' });
        await user.clear(bioInput);
        await user.type(bioInput, 'Lead server moderator and event planner');

        const saveBtn = screen.getByRole('button', { name: /admin\.staff\.form\.save_changes/i });
        await user.click(saveBtn);

        // Assert
        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'ModJess',
                description: 'Lead server moderator and event planner',
            })
        );
    });

    it('calls onClose when cancel or close button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onClose = vi.fn();

        renderWithProviders(
            <StaffFormModal
                userData={sampleStaff}
                isNew={false}
                onClose={onClose}
                onSave={vi.fn()}
                saving={false}
            />
        );

        // Act: click header close
        const closeBtn = screen.getByRole('button', { name: 'Cerrar modal' });
        await user.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);

        // Act: click cancel button
        const cancelBtn = screen.getByRole('button', { name: 'admin.staff.form.cancel' });
        await user.click(cancelBtn);
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('disables save button and displays loader when saving is true', () => {
        // Arrange & Act
        renderWithProviders(
            <StaffFormModal
                userData={sampleStaff}
                isNew={false}
                onClose={vi.fn()}
                onSave={vi.fn()}
                saving={true}
            />
        );

        // Assert
        const saveBtn = screen.getByRole('button', { name: /loading\.\.\./i });
        expect(saveBtn).toBeDisabled();
    });
});
