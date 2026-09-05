import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/test-utils';
import KPIStats, { KPIStatsProps } from '@/components/Admin/Dashboard/KPIStats';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('@/components/UI/AnimatedCounter', () => ({
    default: ({ value, prefix }: { value: number; prefix?: string }) => (
        <span data-testid="animated-counter">{prefix || ''}{value}</span>
    ),
}));

describe('KPIStats', () => {
    const mockPropsOnline: KPIStatsProps = {
        serverStats: {
            online: true,
            status: 'online',
            players: { online: 45, max: 100 },
        },
        ticketStats: { open: 12, urgent: 3 },
        donationStats: { currentMonth: '250.50', percentChange: 15 },
    };

    const mockPropsOffline: KPIStatsProps = {
        serverStats: {
            online: false,
            status: 'maintenance',
            players: { online: 0, max: 100 },
        },
        ticketStats: { open: 0, urgent: 0 },
        donationStats: { currentMonth: '0.00', percentChange: -5 },
    };

    it('renders server online state with running smooth indicator', () => {
        // Arrange & Act
        renderWithProviders(<KPIStats {...mockPropsOnline} />);

        // Assert
        expect(screen.getByText('admin.dashboard.stats.server_status')).toBeInTheDocument();
        expect(screen.getByText('admin.dashboard.stats.server_online')).toBeInTheDocument();
        expect(screen.getByText('admin.dashboard.stats.running_smooth')).toBeInTheDocument();
    });

    it('renders server offline state with console check indicator', () => {
        // Arrange & Act
        renderWithProviders(<KPIStats {...mockPropsOffline} />);

        // Assert
        expect(screen.getByText('admin.dashboard.stats.check_console')).toBeInTheDocument();
        expect(screen.getByText('ADMIN.DASHBOARD.STATS.STATUS_MAINTENANCE')).toBeInTheDocument();
    });

    it('renders player statistics with capacity', () => {
        // Arrange & Act
        renderWithProviders(<KPIStats {...mockPropsOnline} />);

        // Assert
        expect(screen.getByText('admin.dashboard.stats.players')).toBeInTheDocument();
        expect(screen.getByText('admin.dashboard.stats.capacity: 100')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('renders pending tickets and priority count', () => {
        // Arrange & Act
        renderWithProviders(<KPIStats {...mockPropsOnline} />);

        // Assert
        expect(screen.getByText('admin.dashboard.stats.pending_tickets')).toBeInTheDocument();
        expect(screen.getByText('3 admin.dashboard.stats.high_priority')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('renders revenue amount and positive comparison percentage', () => {
        // Arrange & Act
        renderWithProviders(<KPIStats {...mockPropsOnline} />);

        // Assert
        expect(screen.getByText('admin.dashboard.stats.revenue')).toBeInTheDocument();
        expect(screen.getByText('$250.5')).toBeInTheDocument();
        expect(screen.getByText('+15% admin.dashboard.stats.vs_prev_month')).toBeInTheDocument();
    });

    it('renders revenue with negative percentage when revenue drops', () => {
        // Arrange & Act
        renderWithProviders(<KPIStats {...mockPropsOffline} />);

        // Assert
        expect(screen.getByText('-5% admin.dashboard.stats.vs_prev_month')).toBeInTheDocument();
    });
});
