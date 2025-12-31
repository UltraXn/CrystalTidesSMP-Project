import { useEffect, useState } from 'react'
import { FaUser, FaServer, FaTicketAlt, FaMoneyBillWave, FaMemory, FaMicrochip, FaUsers, FaClock, FaDiscord } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import SecureConsole from './Config/SecureConsole'
import { useTranslation } from 'react-i18next'
import Loader from "../UI/Loader"
import AnimatedCounter from "../UI/AnimatedCounter"
import { supabase } from '../../services/supabaseClient'

interface StaffMember {
    username: string;
    avatar: string;
    role: string;
    role_image?: string;
    login_time: number;
    mc_status: string;
    discord_status: string;
}

const getRoleImage = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('developer')) return '/ranks/developer.png';
    if (r.includes('killuwu')) return '/ranks/rank-killu.png';
    if (r.includes('owner')) return '/ranks/rank-killu.png';
    if (r.includes('neroferno')) return '/ranks/rank-neroferno.png';
    if (r.includes('founder') || r.includes('fundador')) return '/ranks/rank-fundador.png'; 
    if (r.includes('admin')) return '/ranks/admin.png';
    if (r.includes('mod')) return '/ranks/moderator.png';
    if (r.includes('helper')) return '/ranks/helper.png';
    if (r.includes('staff')) return '/ranks/staff.png';
    return null;
};

const getStatusColor = (status: string) => {
    switch(status) {
        case 'online': return '#22c55e';
        case 'dnd': return '#ef4444';
        case 'idle': return '#eab308';
        default: return '#52525b';
    }
};

export default function DashboardOverview() {
    const { t } = useTranslation()
    const { user } = useAuth()
    
    // Initial state with defaults
    const [serverStats, setServerStats] = useState({ 
        online: false, 
        status: 'offline', 
        memory: { current: 0, limit: 12000 }, 
        cpu: 0, 
        players: { online: 0, max: 100 },
        global: { total: 0, new: 0, playtime: 0 }
    })
    
    const API_URL = import.meta.env.VITE_API_URL

    const [staffOnline, setStaffOnline] = useState<StaffMember[]>([])
    const [ticketStats, setTicketStats] = useState({ open: 0, urgent: 0 })
    const [donationStats, setDonationStats] = useState({ currentMonth: "0.00", percentChange: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
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
    }, [API_URL])

    // Calculate RAM usage percentage
    const memoryPercent = serverStats.memory.limit > 0 
        ? Math.round((serverStats.memory.current / serverStats.memory.limit) * 100) 
        : 0;

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
            <div className="admin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <StatCard
                    title={t('admin.dashboard.stats.server_status')}
                    value={serverStats.online ? t('admin.dashboard.stats.server_online') : (serverStats.status ? t(`admin.dashboard.stats.status_${serverStats.status}`) : t('admin.dashboard.stats.server_offline')).toUpperCase()}
                    percent={serverStats.online ? t('admin.dashboard.stats.running_smooth') : t('admin.dashboard.stats.check_console')}
                    icon={<FaServer />}
                    color={serverStats.online ? "#4ade80" : "#ef4444"}
                />
                <StatCard
                    title={t('admin.dashboard.stats.players')}
                    value={<AnimatedCounter value={serverStats.players.online} />}
                    percent={`${t('admin.dashboard.stats.capacity')}: ${serverStats.players.max}`}
                    icon={<FaUser />}
                    color="#3b82f6"
                />
                <StatCard
                    title={t('admin.dashboard.stats.pending_tickets')}
                    value={<AnimatedCounter value={ticketStats.open} />}
                    percent={`${ticketStats.urgent} ${t('admin.dashboard.stats.high_priority')}`}
                    icon={<FaTicketAlt />}
                    color="#facc15"
                />
                <StatCard
                    title={t('admin.dashboard.stats.revenue')}
                    value={<AnimatedCounter value={parseFloat(donationStats.currentMonth) || 0} decimals={2} prefix="$" />}
                    percent={`${Number(donationStats.percentChange) >= 0 ? '+' : ''}${donationStats.percentChange}% ${t('admin.dashboard.stats.vs_prev_month')}`}
                    icon={<FaMoneyBillWave />}
                    color="#c084fc"
                />
            </div>

            {/* ANALYTICS SECTION */}
            <div className="admin-analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                {/* Resource Usage (Real Data) */}
                <div style={{ 
                    background: 'rgba(10, 10, 15, 0.6)', 
                    backdropFilter: 'blur(20px)', 
                    border: '1px solid rgba(255, 255, 255, 0.05)', 
                    borderRadius: '24px', 
                    padding: '1.5rem',
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column' 
                }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
                            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaServer style={{ color: 'var(--accent)' }} /> 
                            </div>
                            {t('admin.dashboard.resources.title')}
                        </span>
                        <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('admin.dashboard.resources.updated_now')}</small>
                    </h3>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2.5rem', justifyContent: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: '0.9rem' }}>
                                    <FaMicrochip /> {t('admin.dashboard.resources.cpu')}
                                </span>
                                <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem' }}>{serverStats.cpu}%</span>
                            </div>
                            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: `${Math.min(serverStats.cpu, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f87171, #ef4444)', transition: 'width 1s ease-out', borderRadius: '12px', boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: '0.9rem' }}>
                                    <FaMemory /> {t('admin.dashboard.resources.ram')}
                                </span>
                                <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem', wordBreak: 'break-all' }}>
                                    {serverStats.memory.current} <span style={{color: '#666', fontSize: '0.9rem'}}>/</span> {serverStats.memory.limit} <span style={{fontSize: '0.8rem', color: '#888'}}>MB</span>
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: `${memoryPercent}%`, height: '100%', background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', transition: 'width 1s ease-out', borderRadius: '12px', boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff Activity */}
                <div style={{ 
                    background: 'rgba(10, 10, 15, 0.6)', 
                    backdropFilter: 'blur(20px)', 
                    border: '1px solid rgba(255, 255, 255, 0.05)', 
                    borderRadius: '24px', 
                    padding: '1.5rem',
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column' 
                }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaUsers style={{ color: 'var(--accent)' }} /> 
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{t('admin.dashboard.staff.title')}</span>
                        {staffOnline.length > 0 && <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', marginLeft: 'auto', letterSpacing: '0.5px' }}>{staffOnline.length} ON</span>}
                    </h3>
                    
                    <div style={{ flex: 1 }}>
                        {serverStats.online ? (
                            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }} className="custom-scrollbar">
                                {staffOnline.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {staffOnline.map((staff, idx) => {
                                            const discordColor = getStatusColor(staff.discord_status);
                                            return (
                                            <div key={idx} className="hover-lift" style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'auto 1fr auto', 
                                                gap: '1rem', 
                                                background: 'rgba(255,255,255,0.02)', 
                                                padding: '0.8rem', 
                                                borderRadius: '16px', 
                                                border: '1px solid rgba(255,255,255,0.03)', 
                                                transition: 'all 0.2s', 
                                                alignItems: 'center',
                                                cursor: 'default' 
                                            }}>
                                                <div style={{ position: 'relative' }}>
                                                    <img src={`https://mc-heads.net/avatar/${staff.username}/64`} alt={staff.username} style={{ width: '40px', height: '40px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'block' }} />
                                                    
                                                    {/* Status Stack - Bottom Right */}
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        bottom: -4, 
                                                        right: -4, 
                                                        display: 'flex', 
                                                        flexDirection: 'column-reverse', 
                                                        gap: '2px',
                                                        zIndex: 10
                                                    }}>
                                                        
                                                        {/* MC Status Badge (Bottom) */}
                                                        {staff.mc_status === 'online' && (
                                                            <div 
                                                                title="Jugando en Minecraft"
                                                                style={{ 
                                                                    width: '16px', height: '16px', 
                                                                    borderRadius: '50%',
                                                                    background: '#18181b', 
                                                                    border: '2px solid #18181b',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                                                                }} 
                                                            >
                                                                <img src="/images/ui/minecraft_logo_icon_168974.png" alt="MC" style={{ width: '10px', height: '10px' }} />
                                                            </div>
                                                        )}

                                                        {/* Discord Status Badge (Top) */}
                                                        <div 
                                                            title={`Discord: ${staff.discord_status}`}
                                                            style={{ 
                                                                width: '16px', height: '16px', 
                                                                borderRadius: '50%',
                                                                background: '#18181b',
                                                                border: `2px solid ${discordColor}`, // Status as Border
                                                                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }} 
                                                        >
                                                            <FaDiscord size={8} color="#fff" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fff', letterSpacing: '0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.username}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                        {getRoleImage(staff.role) || staff.role_image ? (
                                                            <img src={getRoleImage(staff.role) || staff.role_image} alt={staff.role} style={{ height: '14px', width: 'auto', maxWidth: '100%', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                                                        ) : (
                                                            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>{staff.role}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    {/* Status Text (Right Side) */}
                                                    <div style={{ fontSize: '0.75rem', color: discordColor, textAlign: 'right', fontWeight: 800, textShadow: `0 0 10px ${discordColor}40` }}>
                                                        {staff.mc_status !== 'online' ? (
                                                            <small>{staff.discord_status === 'dnd' ? 'NO MOLESTAR' : staff.discord_status.toUpperCase()}</small>
                                                        ) : (
                                                            <small style={{ color: '#4ade80' }}>JUGANDO</small>
                                                        )}
                                                    </div>
                                                    {(staff.login_time && staff.mc_status === 'online') && (
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                            <FaClock size={10} />
                                                            {(() => {
                                                                const diff = Date.now() - staff.login_time;
                                                                const hours = Math.floor(diff / 3600000);
                                                                const mins = Math.floor((diff % 3600000) / 60000);
                                                                return `${hours}h ${mins}m`;
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', opacity: 0.5 }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                            <FaUsers size={24} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                        </div>
                                        <p style={{ margin: 0, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{t('admin.dashboard.staff.no_staff')}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontWeight: '500' }}>{t('admin.dashboard.staff.offline_msg')}</p>
                            </div>
                        )}
                    </div>
                </div>

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

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    percent: string;
    color?: string;
    icon: React.ReactNode;
}

function StatCard({ title, value, percent, color = 'var(--accent)', icon }: StatCardProps) {
    return (
        <div style={{ 
            background: 'rgba(10, 10, 15, 0.6)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '1.75rem',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'start',
            transition: 'transform 0.2s',
            position: 'relative',
            overflow: 'hidden'
        }} className="hover-lift">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}, transparent)` }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>{title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{value}</span>
                    <span style={{ color: color, fontSize: '0.8rem', opacity: 0.9, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {percent}
                    </span>
                </div>
            </div>
            <div style={{
                background: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.1)`,
                width: '56px', height: '56px',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, fontSize: '1.5rem',
                border: `1px solid ${color}20`,
                boxShadow: `0 8px 20px -5px ${color}30`
            }}>
                {icon}
            </div>
        </div>
    )
}
