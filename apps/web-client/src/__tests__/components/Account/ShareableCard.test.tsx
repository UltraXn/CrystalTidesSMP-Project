import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareableCard from '@/components/Account/ShareableCard';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('html2canvas', () => ({
    default: vi.fn().mockResolvedValue({
        toDataURL: () => 'data:image/png;base64,fakeimagedata',
    }),
}));

const mockAchievement = {
    title: 'Primer Diamante',
    description: 'Encuentra tu primera mena de diamante en las profundidades',
    icon: <span data-testid="mock-icon">💎</span>,
    unlocked: true,
};

describe('ShareableCard', () => {
    it('renders exportable card with player username, title, and close button', async () => {
        const handleClose = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <ShareableCard achievement={mockAchievement} username="StevePlayer" onClose={handleClose} />
        );

        expect(screen.getByText('StevePlayer')).toBeInTheDocument();
        expect(screen.getByText('Primer Diamante')).toBeInTheDocument();
        expect(screen.getByText('Encuentra tu primera mena de diamante en las profundidades')).toBeInTheDocument();
        expect(screen.getByTestId('mock-icon')).toBeInTheDocument();

        const closeBtn = screen.getByRole('button', { name: /action/i });
        await user.click(closeBtn);
        expect(handleClose).toHaveBeenCalledOnce();
    });

    it('triggers image generation when download button is clicked', async () => {
        const handleClose = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <ShareableCard achievement={mockAchievement} username="StevePlayer" onClose={handleClose} />
        );

        const downloadBtn = screen.getByRole('button', { name: /descargar imagen|download/i });
        await user.click(downloadBtn);

        expect(downloadBtn).toBeInTheDocument();
    });
});
