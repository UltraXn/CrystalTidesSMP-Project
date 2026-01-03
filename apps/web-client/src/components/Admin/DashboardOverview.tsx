import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import SecureConsole from './Config/SecureConsole'
import Loader from "../UI/Loader"
import { supabase } from '../../services/supabaseClient'

import KPIStats from './Dashboard/KPIStats';
import ResourceUsage from './Dashboard/ResourceUsage';
import StaffActivity, { StaffMember } from './Dashboard/StaffActivity';

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
    
    // Initial state with defaults
    const [serverStats, setServerStats] = useState<ServerStats>(mockServerStats || { 
        online: false, 
        status: 'offline', 
        memory: { current: 0, limit: 12000 }, 
        cpu: 0, 
        players: { online: 0, max: 100 },
        global: { total: 0, new: 0, playtime: 0 }
    })
    
    const API_URL = import.meta.env.VITE_API_URL

    const [staffOnline, setStaffOnline] = useState<StaffMember[]>(mockStaffOnline || [])
    const [ticketStats, setTicketStats] = useState(mockTicketStats || { open: 0, urgent: 0 })
    const [donationStats, setDonationStats] = useState(mockDonationStats || { currentMonth: "0.00", percentChange: 0 })
    const [loading, setLoading] = useState(!mockServerStats) // If mocks provided, not loading

    useEffect(() => {
        const fetchData = async () => {
             if (mockServerStats) return;
            try {
                // Get Supabase Session Token
                const { data: { session } } = await supabase.auth.getSession();
                const headers: HeadersInit = session ? { 'Authorization': `Bearer ${session.access_token}` } : {};

                // 1. Fetch Resources (Pterodactyl/Plan) AND Live Status (Query)
                const [resRes, resLive] = await Promise.all([
                    fetch(`${API_URL}/server/resources`, { headers }),
                    fetch(`${API_URL}/server/status/live`) // Live status remains public
                ]);

                const rawRes = resRes.ok ? await resRes.json() : null;
                const rawLive = resLive.ok ? await resLive.json() : null;
                
                const dataRes = rawRes?.success ? rawRes.data : rawRes;
                const dataLive = rawLive?.success ? rawLive.data : rawLive;

                if (dataRes || dataLive) {
                    setServerStats({
                        online: dataLive?.online ?? (dataRes?.status === 'running'),
                        status: dataRes?.status || (dataLive?.online ? 'running' : 'offline'),
                        memory: { 
                            current: dataRes?.memory?.current || 0, 
                            limit: dataRes?.memory?.limit || 24576 
                        },
                        cpu: dataRes?.cpu || 0,
                        players: { 
                            online: dataLive?.players?.online ?? (dataRes?.online || 0), 
                            max: dataLive?.players?.max ?? 100 
                        },
                        global: {
                            total: dataRes?.total_players || 0,
                            new: dataRes?.new_players || 0,
                            playtime: dataRes?.total_playtime_hours || 0
                        }
                    });
                } else {
                     setServerStats(prev => ({ ...prev, online: false, status: 'error' }));
                }

                // Fetch Staff Online
                const resStaff = await fetch(`${API_URL}/server/staff`, { headers })
                if (resStaff.ok) {
                    const rawStaff = await resStaff.json()
                    const staffList = (rawStaff.success ? rawStaff.data : rawStaff) || []
                    
                    if (Array.isArray(staffList)) {
                        // Priority administrative roles
                        const adminRoles = ['founder', 'owner', 'neroferno', 'killuwu', 'developer', 'admin', 'staff'];
                        // Decorative/Other roles (fundador is decorative ONLY and should not be here)
                        const otherStaffRoles = ['moderator', 'mod', 'helper', 'staff'];
                        const allAllowed = [...adminRoles, ...otherStaffRoles];
                        
                        const filteredStaff = staffList.filter((s: StaffMember) => 
                            allAllowed.some(role => s.role.toLowerCase().includes(role)) &&
                            (s.mc_status === 'online' || s.discord_status !== 'offline')
                        );
                        setStaffOnline(filteredStaff)
                    } else {
                        setStaffOnline([])
                    }
                }

                // Fetch Ticket Stats
                const resTickets = await fetch(`${API_URL}/tickets/stats`, { headers })
                if(resTickets.ok) {
                    const rawTickets = await resTickets.json()
                    const stats = rawTickets.success ? rawTickets.data : rawTickets
                    setTicketStats(stats || { open: 0, urgent: 0 })
                }

                // Fetch Donation Stats
                const resDonations = await fetch(`${API_URL}/donations/stats`, { headers })
                if(resDonations.ok) {
                    const rawDonations = await resDonations.json()
                    const stats = rawDonations.success ? rawDonations.data : rawDonations
                    setDonationStats(stats || { currentMonth: "0.00", percentChange: 0 })
                }

            } catch (error) {
                console.error("Error loading dashboard data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        
        // Real-time subscriptions
        const donationsChannel = supabase.channel('dashboard-donations')
            .on('postgres_changes', { event: '*', table: 'donations', schema: 'public' }, fetchData)
            .subscribe()
            
        const ticketsChannel = supabase.channel('dashboard-tickets')
            .on('postgres_changes', { event: '*', table: 'tickets', schema: 'public' }, fetchData)
            .subscribe()

        const interval = setInterval(fetchData, 10000) // Refresh every 10s for near real-time updates
        
        return () => {
            clearInterval(interval)
            supabase.removeChannel(donationsChannel)
            supabase.removeChannel(ticketsChannel)
        }
    }, [API_URL, mockServerStats])

    if (loading) {
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


