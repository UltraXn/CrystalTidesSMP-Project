import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectionCards, { ConnectionCardsProps } from '@/components/Account/ConnectionCards';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('@/services/microsoftAuthWeb', () => ({
    openMicrosoftOAuthPopup: vi.fn().mockReturnValue({ closed: false }),
    exchangeMicrosoftAuthCode: vi.fn(),
    formatUuidWithHyphens: (u: string) => u,
}));

const defaultProps: ConnectionCardsProps = {
    isLinked: false,
    mcUsername: undefined,
    statsDataUsername: undefined,
    linkCode: null,
    linkLoading: false,
    onGenerateCode: vi.fn(),
    onLinkProvider: vi.fn(),
    onUnlinkProvider: vi.fn(),
    onUnlinkMinecraft: vi.fn(),
    onUnlinkDiscord: vi.fn(),
};

describe('ConnectionCards', () => {
    it('renders unlinked Minecraft card with Microsoft link button', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <ConnectionCards {...defaultProps} />
        );

        expect(screen.getByText('Minecraft')).toBeInTheDocument();
        const msBtn = screen.getByRole('button', { name: /vincular premium \(microsoft\)/i });
        expect(msBtn).toBeInTheDocument();

        await user.click(msBtn);
        expect(msBtn).toBeInTheDocument();
    });

    it('renders linked Minecraft account state with username and unlink button', async () => {
        const handleUnlink = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <ConnectionCards
                {...defaultProps}
                isLinked={true}
                mcUsername="Notch"
                onUnlinkMinecraft={handleUnlink}
            />
        );

        expect(screen.getByText('Notch')).toBeInTheDocument();
        const unlinkBtn = screen.getByRole('button', { name: /desvincular|unlink/i });
        expect(unlinkBtn).toBeInTheDocument();

        await user.click(unlinkBtn);
        expect(handleUnlink).toHaveBeenCalled();
    });
});
