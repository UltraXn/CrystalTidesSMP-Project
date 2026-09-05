import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import UserRoleModal from '@/components/Admin/Users/UserRoleModal';
import { UserDefinition } from '@/components/Admin/Users/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

describe('UserRoleModal', () => {
    const mockUser: UserDefinition = {
        id: 'user-001',
        email: 'alex@crystaltides.com',
        username: 'AlexAdmin',
        role: 'user',
        created_at: '2026-01-01T00:00:00Z',
    };

    const defaultProps = {
        user: mockUser,
        newRole: 'moderator',
        onClose: vi.fn(),
        onConfirm: vi.fn(),
    };

    it('renders user details and proposed role', () => {
        renderWithProviders(<UserRoleModal {...defaultProps} />);

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('admin.users.role_modal.title');
        expect(screen.getByText('AlexAdmin')).toBeInTheDocument();
        expect(screen.getByText('moderator')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.users.role_modal.cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'admin.users.role_modal.confirm' })).toBeInTheDocument();
    });

    it('falls back to email if username is missing', () => {
        const userWithoutUsername: UserDefinition = {
            ...mockUser,
            username: undefined,
        };
        renderWithProviders(<UserRoleModal {...defaultProps} user={userWithoutUsername} />);

        expect(screen.getByText('alex@crystaltides.com')).toBeInTheDocument();
    });

    it('calls onClose when clicking cancel', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderWithProviders(<UserRoleModal {...defaultProps} onClose={onClose} />);

        const cancelBtn = screen.getByRole('button', { name: 'admin.users.role_modal.cancel' });
        await user.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when clicking confirm', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        renderWithProviders(<UserRoleModal {...defaultProps} onConfirm={onConfirm} />);

        const confirmBtn = screen.getByRole('button', { name: 'admin.users.role_modal.confirm' });
        await user.click(confirmBtn);

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
