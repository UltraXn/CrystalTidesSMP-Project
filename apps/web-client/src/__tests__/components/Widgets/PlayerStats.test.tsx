import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import PlayerStats from '@/components/Widgets/PlayerStats';
import { renderWithProviders } from '@/utils/test-utils';

vi.mock('framer-motion', () => {
    const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...props}>{children}</div>
    );
    return {
        m: {
            div: Component,
            span: Component,
        },
        motion: {
            div: Component,
            span: Component,
        },
        AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <>{children}</>,
    };
});

const mockStatsData = {
    rank: 'Donador',
    money: 15400,
    playtime: '124 horas',
    member_since: '2024-01-15',
    kills: 87,
    mob_kills: 1420,
    deaths: 12,
    blocks_mined: 35200,
    blocks_placed: 12800,
};

describe('PlayerStats', () => {
    it('renders error message when error prop is provided', () => {
        renderWithProviders(<PlayerStats statsData={null} loading={false} error={new Error('Failed to load')} />);

        expect(screen.getByText(/account\.stats\.error/i)).toBeInTheDocument();
    });

    it('renders loader when loading is true', () => {
        renderWithProviders(<PlayerStats statsData={null} loading={true} error={null} />);

        expect(screen.getByText(/account\.stats\.loading|loading/i)).toBeInTheDocument();
    });

    it('renders player statistics correctly when data is loaded', () => {
        renderWithProviders(<PlayerStats statsData={mockStatsData} loading={false} error={null} />);

        expect(screen.getByText('124 horas')).toBeInTheDocument();
        expect(screen.getByText('87')).toBeInTheDocument();
        expect(screen.getByText('1420')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('35200')).toBeInTheDocument();
        expect(screen.getByText('12800')).toBeInTheDocument();
    });
});
