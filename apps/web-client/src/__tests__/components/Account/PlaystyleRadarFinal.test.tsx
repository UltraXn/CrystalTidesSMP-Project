import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import PlaystyleRadarFinal from '@/components/Account/PlaystyleRadarFinal';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
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
});
