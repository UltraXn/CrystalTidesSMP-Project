import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TwoFactorSetup from '@/components/Profile/Security/TwoFactorSetup';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('@/hooks/useAccountData', () => ({
    use2FAStatus: () => ({ data: { enabled: false }, isLoading: false }),
    useSetup2FA: () => ({ mutate: vi.fn(), isPending: false }),
    useEnable2FA: () => ({ mutate: vi.fn(), isPending: false }),
    useDisable2FA: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('TwoFactorSetup', () => {
    it('renders setup 2FA button when disabled', async () => {
        const handleSetup = vi.fn().mockResolvedValue({
            success: true,
            data: { secret: 'JBSWY3DPEHPK3PXP', qrCode: 'data:image/svg+xml;base64,mockqr' },
        });
        const user = userEvent.setup();

        renderWithProviders(
            <TwoFactorSetup mockEnabled={false} onSetup={handleSetup} />
        );

        const configBtn = screen.getByRole('button', { name: /configurar 2fa|setup 2fa|activar/i });
        expect(configBtn).toBeInTheDocument();

        await user.click(configBtn);
        expect(handleSetup).toHaveBeenCalled();
    });

    it('renders disable 2FA button when already enabled', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const handleDisable = vi.fn().mockResolvedValue({ success: true });
        const user = userEvent.setup();

        renderWithProviders(
            <TwoFactorSetup mockEnabled={true} onDisable={handleDisable} />
        );

        const disableBtn = screen.getByRole('button', { name: /desactivar 2fa|disable 2fa/i });
        expect(disableBtn).toBeInTheDocument();

        await user.click(disableBtn);
        expect(handleDisable).toHaveBeenCalled();
    });
});
