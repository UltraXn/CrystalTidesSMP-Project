import { useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import SecureConsole from './Config/SecureConsole'
import Loader from "../UI/Loader"
import KPIStats from './Dashboard/KPIStats';
import ResourceUsage from './Dashboard/ResourceUsage';
import StaffActivity, { StaffMember } from './Dashboard/StaffActivity';
import { 
    useServerResources, 
    useServerLiveStatus, 
    useStaffOnlineStatus, 
    useTicketStats, 
    useDonationStats 
} from '../../hooks/useAdminData';

interface ServerStats {
    online: boolean;
    status: string;
    memory: { current: number; limit: number };
    cpu: number;
    players: { online: number; max: number };
    global: { total: number; new: number; playtime: number };
}

interface DashboardOverviewProps {
    mockServerStats?: ServerStats;
    mockStaffOnline?: StaffMember[];
    mockTicketStats?: { open: number, urgent: number };
    mockDonationStats?: { currentMonth: string, percentChange: number };
}

export default function DashboardOverview({ mockServerStats, mockStaffOnline, mockTicketStats, mockDonationStats }: DashboardOverviewProps = {}) {
    const { user } = useAuth()
    
    // TanStack Query Hooks
    const { data: resources, isLoading: loadingResources } = useServerResources();
    const { data: liveStatus, isLoading: loadingLive } = useServerLiveStatus();
    const { data: staffListRaw, isLoading: loadingStaff } = useStaffOnlineStatus();
    const { data: ticketStatsData, isLoading: loadingTickets } = useTicketStats();
    const { data: donationStatsData, isLoading: loadingDonations } = useDonationStats();

    // Derived states and data mapping
    const serverStats = useMemo(() => {
        if (mockServerStats) return mockServerStats;
        
        return {
            online: liveStatus?.online ?? (resources?.status === 'running'),
            status: resources?.status || (liveStatus?.online ? 'running' : 'offline'),
            memory: { 
                current: resources?.memory?.current || 0, 
                limit: resources?.memory?.limit || 24576 
            },
            cpu: resources?.cpu || 0,
            players: { 
                online: liveStatus?.players?.online ?? (resources?.online || 0), 
                max: liveStatus?.players?.max ?? 100 
            },
            global: {
                total: resources?.total_players || 0,
                new: resources?.new_players || 0,
                playtime: resources?.total_playtime_hours || 0
            }
        };
    }, [resources, liveStatus, mockServerStats]);

    const staffOnline = useMemo(() => {
        if (mockStaffOnline) return mockStaffOnline;
        if (!staffListRaw || !Array.isArray(staffListRaw)) return [];

        const adminRoles = ['neroferno', 'killuwu', 'developer', 'admin', 'staff'];
        const otherStaffRoles = ['moderator', 'mod', 'helper', 'staff'];
        const allAllowed = [...new Set([...adminRoles, ...otherStaffRoles])];
        
        return staffListRaw.filter((s: StaffMember) => 
            allAllowed.some(role => s.role.toLowerCase().includes(role)) &&
            (s.mc_status === 'online' || s.discord_status !== 'offline')
        );
    }, [staffListRaw, mockStaffOnline]);

    const ticketStats = useMemo(() => {
        if (mockTicketStats) return mockTicketStats;
        return ticketStatsData || { open: 0, urgent: 0 };
    }, [ticketStatsData, mockTicketStats]);

    const donationStats = useMemo(() => {
        if (mockDonationStats) return mockDonationStats;
        return donationStatsData || { currentMonth: "0.00", percentChange: 0 };
    }, [donationStatsData, mockDonationStats]);

    const isLoading = loadingResources || loadingLive || loadingStaff || loadingTickets || loadingDonations;

    if (isLoading && !mockServerStats) {
        return (
            <div style={{ padding: '5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader style={{ height: 'auto', minHeight: '150px' }} />
            </div>
        )
    }

    return (
        <div className="dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* KPI CARDS */}
            <KPIStats 
                serverStats={serverStats} 
                ticketStats={ticketStats} 
                donationStats={donationStats} 
            />

            {/* ANALYTICS SECTION */}
            <div className="admin-analytics-grid">
                {/* Resource Usage */}
                <ResourceUsage 
                    cpu={serverStats.cpu} 
                    memory={serverStats.memory} 
                />

                {/* Staff Activity */}
                <StaffActivity 
                    staffOnline={staffOnline} 
                    serverOnline={serverStats.online} 
                />
            </div>

            {/* Secure Console (Super Admin Only) */}
            {['neroferno', 'killu', 'developer'].some(role => user?.user_metadata?.role?.toLowerCase().includes(role)) && (
                <div style={{ marginTop: '0', background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', overflow: 'hidden' }}>
                    <SecureConsole />
                </div>
            )}
        </div>
    )
}
