import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import UserMedalsModal from '@/components/Admin/Users/UserMedalsModal';
import { UserDefinition, MedalDefinition } from '@/components/Admin/Users/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

describe('UserMedalsModal', () => {
    const mockUser: UserDefinition = {
        id: 'user-001',
        email: 'player@crystaltides.com',
        username: 'ProBuilder',
        medals: [1],
        created_at: '2026-01-01T00:00:00Z',
    };

    const mockMedals: MedalDefinition[] = [
        {
            id: 1,
            name: 'Master Builder',
            description: 'Built a magnificent castle',
            icon: '🏰',
            color: '#fbbf24',
        },
        {
            id: 2,
            name: 'PVP Champion',
            description: 'Won the server tournament',
            icon: '⚔️',
            color: '#ef4444',
        },
    ];

    const defaultProps = {
        user: mockUser,
        availableMedals: mockMedals,
        onClose: vi.fn(),
        onSave: vi.fn(),
        saving: false,
        onToggleMedal: vi.fn(),
    };

    it('renders modal dialog with user name and medals', () => {
        renderWithProviders(<UserMedalsModal {...defaultProps} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('ProBuilder')).toBeInTheDocument();
        expect(screen.getByText('Master Builder')).toBeInTheDocument();
        expect(screen.getByText('PVP Champion')).toBeInTheDocument();
    });

    it('reflects active/assigned medals with aria-pressed', () => {
        renderWithProviders(<UserMedalsModal {...defaultProps} />);

        const masterBtn = screen.getByRole('button', { name: 'Remover medalla Master Builder' });
        expect(masterBtn).toHaveAttribute('aria-pressed', 'true');

        const pvpBtn = screen.getByRole('button', { name: 'Asignar medalla PVP Champion' });
        expect(pvpBtn).toHaveAttribute('aria-pressed', 'false');
    });

    it('calls onToggleMedal when clicking a medal', async () => {
        const user = userEvent.setup();
        const onToggleMedal = vi.fn();
        renderWithProviders(
            <UserMedalsModal {...defaultProps} onToggleMedal={onToggleMedal} />
        );

        const pvpBtn = screen.getByRole('button', { name: 'Asignar medalla PVP Champion' });
        await user.click(pvpBtn);

        expect(onToggleMedal).toHaveBeenCalledWith(2);
    });

    it('handles empty available medals list', () => {
        renderWithProviders(
            <UserMedalsModal {...defaultProps} availableMedals={[]} />
        );

        expect(screen.getByText('admin.users.no_medals')).toBeInTheDocument();
    });

    it('calls onClose and onSave on respective button clicks', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onSave = vi.fn();

        renderWithProviders(
            <UserMedalsModal {...defaultProps} onClose={onClose} onSave={onSave} />
        );

        const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
        await user.click(cancelBtn);
        expect(onClose).toHaveBeenCalledTimes(1);

        const saveBtn = screen.getByRole('button', { name: 'Guardar Medallas' });
        await user.click(saveBtn);
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('disables save button when saving is true', () => {
        renderWithProviders(
            <UserMedalsModal {...defaultProps} saving={true} />
        );

        const saveBtn = screen.getByRole('button', { name: 'Guardando...' });
        expect(saveBtn).toBeDisabled();
    });
});
