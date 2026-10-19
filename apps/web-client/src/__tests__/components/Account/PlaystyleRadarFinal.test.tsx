import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import PlaystyleRadarFinal from '@/components/Account/PlaystyleRadarFinal';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  RadarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: Array<{ subject: string; A: number }>;
  }) => (
    <div data-testid="radar-chart" data-scores={JSON.stringify(data)}>
      {children}
    </div>
  ),
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockStats = {
  blocksPlaced: 5000,
  blocksMined: 12000,
  kills: 45,
  mobKills: 850,
  playtimeHours: 64,
  money: 25000,
  rank: 'Donador',
  streakDays: 14,
  distanceKm: 320,
};

describe('PlaystyleRadarFinal', () => {
  it('renders the radar chart container with player archetype scores', () => {
    renderWithProviders(<PlaystyleRadarFinal stats={mockStats} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('calculates 100 max score when player is top 1 in a branch', () => {
    const statsWithTop1 = {
      ...mockStats,
      isTop1Constructor: true,
      top1ConstructorScore: 100000,
    };

    renderWithProviders(<PlaystyleRadarFinal stats={statsWithTop1} />);

    const radarChart = screen.getByTestId('radar-chart');
    const data = JSON.parse(radarChart.getAttribute('data-scores') || '[]');
    const constructorScore = data.find((d: { subject: string }) => d.subject === 'Constructor');

    expect(constructorScore?.A).toBe(100);
  });
});
