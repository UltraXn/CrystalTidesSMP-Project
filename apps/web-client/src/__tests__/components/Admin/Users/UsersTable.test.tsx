import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import UsersTable from '@/components/Admin/Users/UsersTable';
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

describe('UsersTable', () => {
    const mockUsers: UserDefinition[] = [
        {
            id: '12345678-abcd-ef01-2345-6789abcdef01',
            email: 'admin@crystaltides.com',
            username: 'SuperAdmin',
            role: 'admin',
            medals: [1, 2],
            achievements: ['first_mine'],
            created_at: '2026-01-01T00:00:00Z',
            avatar_url: 'https://example.com/avatar.png',
        },
        {
            id: '87654321-dcba-10fe-5432-10fedcba9876',
            email: 'steve@minecraft.net',
            role: 'user',
            created_at: '2026-02-01T00:00:00Z',
        },
    ];

    const defaultProps = {
        users: mockUsers,
        loading: false,
        hasSearched: true,
        canManageRoles: true,
        onEditMedals: vi.fn(),
        onEditAchievements: vi.fn(),
        onRoleChange: vi.fn(),
    };

    it('renders users list with details, medals, and achievements', () => {
        renderWithProviders(<UsersTable {...defaultProps} />);

        expect(screen.getByText('SuperAdmin')).toBeInTheDocument();
        expect(screen.getByText('admin@crystaltides.com')).toBeInTheDocument();
        expect(screen.getByText('12345678...')).toBeInTheDocument();

        // Steve fallback username from email
        expect(screen.getByText('steve')).toBeInTheDocument();
        expect(screen.getByText('steve@minecraft.net')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /2 Medallas/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /1 Logros/i })).toBeInTheDocument();
    });

    it('renders initial message when not searched and empty', () => {
        renderWithProviders(
            <UsersTable {...defaultProps} users={[]} hasSearched={false} />
        );

        expect(screen.getByText('admin.users.initial_msg')).toBeInTheDocument();
    });

    it('renders no results message when searched and empty', () => {
        renderWithProviders(
            <UsersTable {...defaultProps} users={[]} hasSearched={true} />
        );

        expect(screen.getByText('admin.users.no_results')).toBeInTheDocument();
    });

    it('calls onEditMedals and onEditAchievements when clicking respective buttons', async () => {
        const user = userEvent.setup();
        const onEditMedals = vi.fn();
        const onEditAchievements = vi.fn();

        renderWithProviders(
            <UsersTable
                {...defaultProps}
                onEditMedals={onEditMedals}
                onEditAchievements={onEditAchievements}
            />
        );

        const medalsBtn = screen.getByRole('button', { name: /2 Medallas/i });
        await user.click(medalsBtn);
        expect(onEditMedals).toHaveBeenCalledWith(mockUsers[0]);

        const achievementsBtn = screen.getByRole('button', { name: /1 Logros/i });
        await user.click(achievementsBtn);
        expect(onEditAchievements).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('calls onRoleChange when changing role in select dropdown', async () => {
        const user = userEvent.setup();
        const onRoleChange = vi.fn();

        renderWithProviders(
            <UsersTable {...defaultProps} onRoleChange={onRoleChange} />
        );

        const roleSelects = screen.getAllByRole('combobox');
        await user.selectOptions(roleSelects[0], 'developer');

        expect(onRoleChange).toHaveBeenCalledWith(mockUsers[0].id, 'developer');
    });

    it('hides role select column if canManageRoles is false', () => {
        renderWithProviders(<UsersTable {...defaultProps} canManageRoles={false} />);

        expect(screen.queryByText('admin.users.table.change_role')).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
});
