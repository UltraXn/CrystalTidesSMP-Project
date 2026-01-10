import { Server, User, Ticket, Banknote } from 'lucide-react';
import AnimatedCounter from '../../UI/AnimatedCounter';
import StatCard from '../../UI/StatCard';
import { useTranslation } from 'react-i18next';

export interface KPIStatsProps {
    serverStats: {
        online: boolean;
        status: string;
        players: { online: number; max: number };
    };
    ticketStats: { open: number; urgent: number };
    donationStats: { currentMonth: string; percentChange: number };
}

export default function KPIStats({ serverStats, ticketStats, donationStats }: KPIStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="admin-kpi-grid">
            <StatCard
                title={t('admin.dashboard.stats.server_status')}
                value={serverStats.online ? t('admin.dashboard.stats.server_online') : (serverStats.status ? t(`admin.dashboard.stats.status_${serverStats.status}`) : t('admin.dashboard.stats.server_offline')).toUpperCase()}
                percent={serverStats.online ? t('admin.dashboard.stats.running_smooth') : t('admin.dashboard.stats.check_console')}
                icon={<Server />}
                color={serverStats.online ? "#4ade80" : "#ef4444"}
            />
            <StatCard
                title={t('admin.dashboard.stats.players')}
                value={<AnimatedCounter value={serverStats.players.online} />}
                percent={`${t('admin.dashboard.stats.capacity')}: ${serverStats.players.max}`}
                icon={<User />}
                color="#3b82f6"
            />
            <StatCard
                title={t('admin.dashboard.stats.pending_tickets')}
                value={<AnimatedCounter value={ticketStats.open} />}
                percent={`${ticketStats.urgent} ${t('admin.dashboard.stats.high_priority')}`}
                icon={<Ticket />}
                color="#facc15"
            />
            <StatCard
                title={t('admin.dashboard.stats.revenue')}
                value={<AnimatedCounter value={parseFloat(donationStats.currentMonth) || 0} decimals={2} prefix="$" />}
                percent={`${Number(donationStats.percentChange) >= 0 ? '+' : ''}${donationStats.percentChange}% ${t('admin.dashboard.stats.vs_prev_month')}`}
                icon={<Banknote />}
                color="#c084fc"
            />
        </div>
    );
}
