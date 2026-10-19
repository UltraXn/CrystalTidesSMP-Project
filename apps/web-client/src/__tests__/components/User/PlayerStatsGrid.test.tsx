import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import PlayerStatsGrid from '@/components/User/PlayerStatsGrid';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('@/components/Account/PlaystyleRadarFinal', () => ({
  default: ({ stats }: { stats: Record<string, unknown> }) => (
    <div data-testid="mock-playstyle-radar" data-stats={JSON.stringify(stats)}>
      Radar Chart
    </div>
  ),
}));

describe('PlayerStatsGrid', () => {
  const sampleStats = {
    playtime: '10h 30m',
    kills: 42,
    mob_kills: 120,
    deaths: 5,
    money: '$1,500.50',
    blocks_mined: '2500',
    blocks_placed: '1800',
    rank: 'Diamond',
    is_top1_constructor: true,
    is_top1_luchador: false,
    is_top1_mercader: false,
    is_top1_constancia: true,
    is_top1_explorador: false,
    top1ConstructorScore: 120000,
    top1LuchadorScore: 6000,
    top1MercaderScore: 800,
    top1ConstanciaScore: 1000,
    top1ExploradorScore: 3500,
  };

  it('renders private message when stats are not public and viewer is not admin', () => {
    renderWithProviders(
      <PlayerStatsGrid stats={sampleStats} loading={false} isPublic={false} isAdmin={false} />,
    );

    expect(screen.getByText(/mantiene su estilo de juego en privado|private/i)).toBeInTheDocument();
  });

  it('renders radar chart and passes top1 benchmark scores and flags when stats are public and loaded', async () => {
    renderWithProviders(
      <PlayerStatsGrid stats={sampleStats} loading={false} isPublic={true} isAdmin={false} />,
    );

    const radar = await screen.findByTestId('mock-playstyle-radar');
    expect(radar).toBeInTheDocument();

    const passedStats = JSON.parse(radar.getAttribute('data-stats') || '{}');
    expect(passedStats.isTop1Constructor).toBe(true);
    expect(passedStats.isTop1Luchador).toBe(false);
    expect(passedStats.isTop1Constancia).toBe(true);
    expect(passedStats.top1ConstructorScore).toBe(120000);
    expect(passedStats.top1LuchadorScore).toBe(6000);
    expect(passedStats.top1MercaderScore).toBe(800);
    expect(passedStats.top1ConstanciaScore).toBe(1000);
    expect(passedStats.top1ExploradorScore).toBe(3500);
  });

  it('renders error state when stats are null and not loading', () => {
    renderWithProviders(
      <PlayerStatsGrid stats={null} loading={false} isPublic={true} isAdmin={false} />,
    );

    expect(screen.getByText(/No se pudieron cargar los datos de estilo/i)).toBeInTheDocument();
  });
});
