import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementCard from '@/components/Account/AchievementCard';
import { renderWithProviders } from '@/utils/test-utils';

describe('AchievementCard', () => {
    it('renders unlocked achievement with title, description, and share button', async () => {
        const handleShare = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <AchievementCard
                title="Maestro Constructor"
                description="Coloca más de 10,000 bloques en el mundo"
                icon={<span data-testid="achievement-icon">🏆</span>}
                unlocked={true}
                onShare={handleShare}
            />
        );

        expect(screen.getByText('Maestro Constructor')).toBeInTheDocument();
        expect(screen.getByText('Coloca más de 10,000 bloques en el mundo')).toBeInTheDocument();
        expect(screen.getByTestId('achievement-icon')).toBeInTheDocument();

        const shareBtn = screen.getByTitle('Compartir Logro');
        expect(shareBtn).toBeInTheDocument();
        await user.click(shareBtn);
        expect(handleShare).toHaveBeenCalledOnce();
    });

    it('renders locked achievement with lock icon and criteria', () => {
        renderWithProviders(
            <AchievementCard
                title="Cazador del Vacío"
                description="Derrota al jefe de la dimensión Abyssal"
                icon={<span data-testid="achievement-icon">👾</span>}
                unlocked={false}
                criteria="Requiere matar 5 guardianes"
            />
        );

        expect(screen.getByText('Cazador del Vacío')).toBeInTheDocument();
        expect(screen.getByText(/Requiere matar 5 guardianes/)).toBeInTheDocument();
        expect(screen.queryByTitle('Compartir Logro')).not.toBeInTheDocument();
    });
});
