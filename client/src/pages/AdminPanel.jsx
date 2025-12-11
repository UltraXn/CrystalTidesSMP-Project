import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { FaUsers, FaChartLine, FaShieldAlt, FaExclamationTriangle, FaCogs, FaTicketAlt, FaHistory, FaCheck, FaSearch } from "react-icons/fa"

export default function AdminPanel() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')

    // Simulación de verificación de Admin
    const isAdmin = true

    useEffect(() => {
        if (!loading && !user) navigate('/login')
    }, [user, loading, navigate])

    if (loading) return <div className="section">Cargando panel...</div>
    if (!isAdmin) return <div className="section"><h2>Acceso Denegado 🛑</h2><p>No tienes permisos de Administrador.</p></div>

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h3 style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px' }}>Crystal Panel</h3>
                    <p style={{ color: '#666', fontSize: '0.8rem' }}>v1.0.0 Alpha</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <AdminVerifyBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FaChartLine />} label="General" />
                    <AdminVerifyBtn active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} icon={<FaTicketAlt />} label="Tickets & Soporte" />
                    <AdminVerifyBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<FaUsers />} label="Usuarios" />
                    <AdminVerifyBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<FaHistory />} label="Registro de Acciones" />
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0' }}></div>
                    <AdminVerifyBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<FaCogs />} label="Configuración" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <div className="admin-header">
                    <div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                            {activeTab === 'overview' && 'Dashboard General'}
                            {activeTab === 'tickets' && 'Centro de Tickets'}
                            {activeTab === 'users' && 'Gestión de Usuarios'}
                            {activeTab === 'logs' && 'Registro de Auditoría'}
                            {activeTab === 'settings' && 'Configuración del Sitio'}
                        </h2>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Bienvenido al panel de control administrativo.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{user?.email?.split('@')[0] || 'Admin'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Super Admin</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                            <FaShieldAlt />
                        </div>
                    </div>
                </div>

                {activeTab === 'overview' && <DashboardOverview />}
                {activeTab === 'tickets' && <TicketsManager />}
                {activeTab === 'users' && <UsersManager />}
                {activeTab === 'logs' && <AuditLog />}
                {activeTab === 'settings' && <div className="admin-card">Configuraciones globales del sitio (Mantenimiento, Textos, etc) - Próximamente</div>}
            </main>
        </div>
    )
}

function AdminVerifyBtn({ active, onClick, icon, label }) {
    return (
        <button
            className={`admin-nav-btn ${active ? 'active' : ''}`}
            onClick={onClick}
        >
            <span className="admin-icon">{icon}</span> {label}
        </button>
    )
}

function DashboardOverview() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <StatCard title="Usuarios Totales" value="1,240" percent="+12% este mes" />
            <StatCard title="Tickets Abiertos" value="5" percent="2 urgentes" color="#facc15" />
            <StatCard title="Donaciones (Mes)" value="$350" percent="+25% vs mes pasado" color="#4ade80" />
            <StatCard title="Reportes Pendientes" value="8" percent="Requieren revisión" color="#ff4444" />
        </div>
    )
}

function StatCard({ title, value, percent, color = 'var(--accent)' }) {
    return (
        <div className="admin-card">
            <h4 style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{value}</span>
                <span style={{ color: color, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {percent}
                </span>
            </div>
        </div>
    )
}

function TicketsManager() {
    // Mock data for tickets
    const tickets = [
        { id: '#T-1023', user: 'SteveMaster', subject: 'Problema con VIP', status: 'pending', priority: 'High', date: 'Hace 2 horas' },
        { id: '#T-1022', user: 'AlexGamer', subject: 'Reporte de Bug en Lobby', status: 'open', priority: 'Medium', date: 'Hace 5 horas' },
        { id: '#T-1021', user: 'Newbie123', subject: 'No puedo entrar al server', status: 'closed', priority: 'Low', date: 'Ayer' },
    ]

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input type="text" placeholder="Buscar tickets..." style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.9rem' }}>Filtrar</button>
                    <button className="btn-secondary" style={{ fontSize: '0.9rem', background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' }}>Nuevo Ticket</button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Asunto</th>
                            <th>Prioridad</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(t => (
                            <tr key={t.id}>
                                <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{t.id}</td>
                                <td>{t.user}</td>
                                <td>{t.subject}</td>
                                <td>
                                    <span style={{
                                        color: t.priority === 'High' ? '#ef4444' : t.priority === 'Medium' ? '#facc15' : '#4ade80',
                                        fontWeight: 'bold', fontSize: '0.85rem'
                                    }}>
                                        {t.priority}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-chip ${t.status === 'open' ? 'active' : t.status === 'pending' ? 'pending' : 'banned'}`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td style={{ color: '#888', fontSize: '0.85rem' }}>{t.date}</td>
                                <td><button style={{ color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Ver</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function AuditLog() {
    const logs = [
        { id: 1, action: 'Banned User', details: 'Banned user TrollFace for spamming', admin: 'AdminDave', time: '12 Oct 2023, 14:30' },
        { id: 2, action: 'Updated Settings', details: 'Changed site maintenance mode to OFF', admin: 'SuperAdmin', time: '12 Oct 2023, 10:15' },
        { id: 3, action: 'Resolved Ticket', details: 'Closed ticket #T-1021', admin: 'ModSarah', time: '11 Oct 2023, 18:45' },
    ]

    return (
        <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Actividad Reciente del Staff</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {logs.map(log => (
                    <div key={log.id} className="log-item">
                        <div className="log-time">{log.time}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: '#fff', fontWeight: '500' }}>{log.action}</span>
                                <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#aaa' }}>{log.admin}</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>{log.details}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function UsersManager() {
    const mockUsers = [
        { id: 1, name: 'SteveMaster', email: 'steve@mail.com', role: 'Usuario', status: 'Active' },
        { id: 2, name: 'AlexGamer', email: 'alex@mail.com', role: 'VIP', status: 'Active' },
        { id: 3, name: 'TrollFace', email: 'troll@mail.com', role: 'Usuario', status: 'Banned' },
        { id: 4, name: 'AdminDave', email: 'dave@admin.com', role: 'Admin', status: 'Active' },
    ]

    return (
        <div className="admin-card">
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Rol Web</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockUsers.map(u => (
                            <tr key={u.id}>
                                <td style={{ fontWeight: '500', color: '#fff' }}>{u.name}</td>
                                <td style={{ color: '#888' }}>{u.email}</td>
                                <td>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        background: u.role === 'Admin' ? 'rgba(109, 165, 192, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: u.role === 'Admin' ? 'var(--accent)' : '#aaa',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-chip ${u.status === 'Active' ? 'active' : 'banned'}`}>
                                        {u.status === 'Active' ? 'Activo' : 'Baneado'}
                                    </span>
                                </td>
                                <td>
                                    <button style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', transition: 'all 0.2s' }}>Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
