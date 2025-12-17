import { useEffect, useState } from 'react'
import { FaUser, FaServer, FaTicketAlt, FaMoneyBillWave, FaMemory, FaMicrochip, FaUsers, FaUserPlus, FaGlobe, FaClock } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

export default function DashboardOverview() {
    const { t } = useTranslation()
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

    const [staffOnline, setStaffOnline] = useState([])
    const [ticketStats, setTicketStats] = useState({ open: 0, urgent: 0 })
    const [donationStats, setDonationStats] = useState({ currentMonth: "0.00", percentChange: 0 })

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Resources (Pterodactyl/Plan) AND Live Status (Query)
                const [resRes, resLive] = await Promise.all([
                    fetch(`${API_URL}/server/resources`),
                    fetch(`${API_URL}/server/status/live`)
                ]);

                const dataRes = resRes.ok ? await resRes.json() : null;
                const dataLive = resLive.ok ? await resLive.json() : null;

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
                const resStaff = await fetch(`${API_URL}/server/staff`)
                if (resStaff.ok) {
                    const dataStaff = await resStaff.json()
                    setStaffOnline(dataStaff)
                }

                // Fetch Ticket Stats
                const resTickets = await fetch(`${API_URL}/tickets/stats`)
                if(resTickets.ok) {
                    const dataTickets = await resTickets.json()
                    setTicketStats(dataTickets)
                }

                // Fetch Donation Stats
                const resDonations = await fetch(`${API_URL}/donations/stats`)
                if(resDonations.ok) {
                    const dataDonations = await resDonations.json()
                    setDonationStats(dataDonations)
                }

            } catch (error) {
                console.error("Error loading dashboard data", error)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [API_URL])

    // Calculate RAM usage percentage
    const memoryPercent = serverStats.memory.limit > 0 
        ? Math.round((serverStats.memory.current / serverStats.memory.limit) * 100) 
        : 0;

    return (
        <div className="dashboard-wrapper">

            {/* KPI CARDS */}
            <div className="admin-kpi-grid">
                <StatCard
                    title={t('admin.dashboard.stats.server_status')}
                    value={serverStats.online ? "ONLINE" : (serverStats.status || "OFFLINE").toUpperCase()}
                    percent={serverStats.online ? t('admin.dashboard.stats.running_smooth') : t('admin.dashboard.stats.check_console')}
                    icon={<FaServer />}
                    color={serverStats.online ? "#4ade80" : "#ef4444"}
                />
                <StatCard
                    title={t('admin.dashboard.stats.players')}
                    value={serverStats.players.online}
                    percent={`${t('admin.dashboard.stats.capacity')}: ${serverStats.players.max}`}
                    icon={<FaUser />}
                    color="#3b82f6"
                />
                <StatCard
                    title={t('admin.dashboard.stats.pending_tickets')}
                    value={ticketStats.open}
                    percent={`${ticketStats.urgent} ${t('admin.dashboard.stats.high_priority')}`}
                    icon={<FaTicketAlt />}
                    color="#facc15"
                />
                <StatCard
                    title={t('admin.dashboard.stats.revenue')}
                    value={`$${donationStats.currentMonth}`}
                    percent={`${parseFloat(donationStats.percentChange) >= 0 ? '+' : ''}${donationStats.percentChange}% ${t('admin.dashboard.stats.vs_prev_month')}`}
                    icon={<FaMoneyBillWave />}
                    color="#c084fc"
                />
            </div>

            {/* ANALYTICS SECTION */}
            <div className="admin-analytics-grid">

                {/* Resource Usage (Real Data) */}
                <div className="admin-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaServer style={{ color: 'var(--accent)' }} /> 
                            {t('admin.dashboard.resources.title')}
                        </span>
                        <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{t('admin.dashboard.resources.updated_now')}</small>
                    </h3>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#ccc' }}>
                                    <FaMicrochip /> {t('admin.dashboard.resources.cpu')}
                                </span>
                                <span style={{ fontWeight: 'bold', color: '#fff' }}>{serverStats.cpu}%</span>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(serverStats.cpu, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f87171, #ef4444)', transition: 'width 1s ease-out' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#ccc' }}>
                                    <FaMemory /> {t('admin.dashboard.resources.ram')}
                                </span>
                                <span style={{ fontWeight: 'bold', color: '#fff' }}>{serverStats.memory.current} / {serverStats.memory.limit} MB</span>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${memoryPercent}%`, height: '100%', background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', transition: 'width 1s ease-out' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff Activity */}
                <div className="admin-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaUsers style={{ color: 'var(--accent)' }} /> 
                        Staff Online
                        {staffOnline.length > 0 && <span style={{ background: '#4ade80', color: '#000', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' }}>{staffOnline.length} Active</span>}
                    </h3>
                    
                    <div style={{ flex: 1 }}>
                        {serverStats.online ? (
                            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                                {staffOnline.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {staffOnline.map((staff, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                                <div style={{ position: 'relative' }}>
                                                    <img src={staff.avatar} alt={staff.username} style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', border: '2px solid #1a1a1a' }}></div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff' }}>{staff.username}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                        {staff.role_image ? (
                                                            <img src={staff.role_image} alt={staff.role} style={{ height: '24px', objectFit: 'contain' }} />
                                                        ) : (
                                                            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{staff.role}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {staff.login_time && (
                                                    <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                                            <FaClock size={12} />
                                                            {(() => {
                                                                const diff = Date.now() - staff.login_time;
                                                                const hours = Math.floor(diff / 3600000);
                                                                const mins = Math.floor((diff % 3600000) / 60000);
                                                                return `${hours}h ${mins}m`;
                                                            })()}
                                                        </div>
                                                        <small style={{ opacity: 0.6 }}>Online</small>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', opacity: 0.6 }}>
                                        <FaUsers size={32} style={{ marginBottom: '1rem', color: '#666' }} />
                                        <p style={{ margin: 0, fontStyle: 'italic', color: '#888' }}>No hay staff conectado</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ color: 'var(--muted)', textAlign: 'center' }}>{t('admin.dashboard.staff.offline_msg')}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

function StatCard({ title, value, percent, color = 'var(--accent)', icon }) {
    return (
        <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
                <h4 style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', lineHeight: 1 }}>{value}</span>
                    <span style={{ color: color, fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.9 }}>
                        {percent}
                    </span>
                </div>
            </div>
            <div style={{
                background: color,
                width: '45px', height: '45px',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#000', fontSize: '1.2rem',
                opacity: 0.8
            }}>
                {icon}
            </div>
        </div>
    )
}
