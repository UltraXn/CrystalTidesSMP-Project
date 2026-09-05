import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/utils/test-utils';
import BanUserModal from '@/components/Admin/Tickets/BanUserModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
            if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
            return key;
        },
        i18n: { language: 'es' },
    }),
}));

vi.mock('../../../services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { access_token: 'mock-token' } },
            }),
        },
    },
}));

vi.mock('../../../services/adminAuth', () => ({
    getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer mock-token' }),
}));

describe('BanUserModal', () => {
    const defaultProps = {
        onClose: vi.fn(),
        onSuccess: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        } as Response);
    });

    it('renders modal with all form controls', () => {
        renderWithProviders(<BanUserModal {...defaultProps} />);

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Banear Usuario Importuno');
        expect(screen.getByLabelText('Nickname (Exacto)')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Temporal' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Permanente' })).toBeInTheDocument();
        expect(screen.getByLabelText('Cantidad')).toBeInTheDocument();
        expect(screen.getByLabelText('Unidad')).toBeInTheDocument();
        expect(screen.getByLabelText('Razón')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Aplicar Martillo' })).toBeInTheDocument();
    });

    it('shows alert when submitting without a nickname', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BanUserModal {...defaultProps} />);

        const submitBtn = screen.getByRole('button', { name: 'Aplicar Martillo' });
        await user.click(submitBtn);

        expect(screen.getByText('Debes ingresar un nickname')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('switches between temporary and permanent ban type', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BanUserModal {...defaultProps} />);

        expect(screen.getByLabelText('Cantidad')).toBeInTheDocument();

        const permBtn = screen.getByRole('button', { name: 'Permanente' });
        await user.click(permBtn);

        expect(screen.queryByLabelText('Cantidad')).not.toBeInTheDocument();

        const tempBtn = screen.getByRole('button', { name: 'Temporal' });
        await user.click(tempBtn);

        expect(screen.getByLabelText('Cantidad')).toBeInTheDocument();
    });

    it('submits form successfully and calls onSuccess', async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        renderWithProviders(<BanUserModal {...defaultProps} onSuccess={onSuccess} />);

        const nickInput = screen.getByLabelText('Nickname (Exacto)');
        const reasonInput = screen.getByLabelText('Razón');

        await user.type(nickInput, 'ToxicPlayer');
        await user.type(reasonInput, 'Griefing server spawn');

        const submitBtn = screen.getByRole('button', { name: 'Aplicar Martillo' });
        await user.click(submitBtn);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/tickets/ban'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    username: 'ToxicPlayer',
                    reason: '[TEMP: 7d] Griefing server spawn',
                }),
            })
        );
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking cancel button', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderWithProviders(<BanUserModal {...defaultProps} onClose={onClose} />);

        const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
        await user.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
