import { useEffect, useState } from 'react'
import { FaUser, FaServer, FaTicketAlt, FaMoneyBillWave, FaMemory, FaMicrochip } from 'react-icons/fa'

export default function DashboardOverview() {
    const [serverStats, setServerStats] = useState({ online: false, players: { online: 0, max: 0 }, ping: 0 })
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/minecraft/status`)
                const data = await res.json()
                setServerStats(data)
            } catch (error) {
                console.error("Error loading server stats", error)
            }
        }

        fetchStats()
        // Refresh every 30s
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard
                    title="Estado del Servidor"
                    value={serverStats.online ? "ONLINE" : "OFFLINE"}
                    percent={serverStats.online ? `Ping: ${serverStats.ping}ms` : "Sin conexión"}
                    icon={<FaServer />}
                    color={serverStats.online ? "#4ade80" : "#ef4444"}
                />
                <StatCard
                    title="Jugadores Simultáneos"
                    value={serverStats.players?.online || 0}
                    percent={`Capacidad: ${serverStats.players?.max || 0}`}
                    icon={<FaUser />}
                    color="#3b82f6"
                />
                <StatCard
                    title="Tickets Pendientes"
                    value="5"
                    percent="2 de Alta Prioridad"
                    icon={<FaTicketAlt />}
                    color="#facc15"
                />
                <StatCard
                    title="Ingresos del Mes"
                    value="$350.00"
                    percent="+25% vs mes anter."
                    icon={<FaMoneyBillWave />}
                    color="#c084fc"
                />
            </div>

            {/* ANALYTICS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

                {/* Resource Usage (Mocked until Pterodactyl API is fully linked) */}
                <div className="admin-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Recursos del Sistema</span>
                        <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Actualizado ahora</small>
                    </h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaMicrochip /> CPU Load</span>
                            <span style={{ fontWeight: 'bold' }}>{serverStats.online ? "45%" : "0%"}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: serverStats.online ? '45%' : '0%', height: '100%', background: '#f87171', transition: 'width 1s' }}></div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaMemory /> RAM Usage</span>
                            <span style={{ fontWeight: 'bold' }}>{serverStats.online ? "6.2 GB / 12 GB" : "0 GB"}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: serverStats.online ? '52%' : '0%', height: '100%', background: '#60a5fa', transition: 'width 1s' }}></div>
                        </div>
                    </div>
                </div>

                {/* Staff Activity */}
                <div className="admin-card">
                    <h3 style={{ marginBottom: '1rem' }}>Staff Online</h3>
                    {serverStats.online ? (
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {/* Mock Staff List */}
                            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
                                    <img src="https://minotar.net/helm/Steve/32.png" alt="Steve" style={{ borderRadius: '50%', width: '24px' }} />
                                    <span>SteveAdmin</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Lobby</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#facc15', borderRadius: '50%' }}></div>
                                    <img src="https://minotar.net/helm/Alex/32.png" alt="Alex" style={{ borderRadius: '50%', width: '24px' }} />
                                    <span>AlexMod</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>AFK 5m</span>
                            </li>
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '2rem' }}>Servidor Offline - Sin actividad</p>
                    )}
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
