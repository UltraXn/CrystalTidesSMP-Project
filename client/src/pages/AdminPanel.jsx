import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { FaUsers, FaChartLine, FaShieldAlt, FaCogs, FaTicketAlt, FaHistory, FaNewspaper } from "react-icons/fa"

// Sub-componentes del Admin Panel
import DashboardOverview from "@/components/Admin/DashboardOverview"
import UsersManager from "@/components/Admin/UsersManager"
import TicketsManager from "@/components/Admin/TicketsManager"
import AuditLog from "@/components/Admin/AuditLog"
import AdminNews from "@/components/Admin/AdminNews"

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
                    <p style={{ color: '#666', fontSize: '0.8rem' }}>v1.1.0 Beta</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <AdminVerifyBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FaChartLine />} label="General" />
                    <AdminVerifyBtn active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} icon={<FaTicketAlt />} label="Tickets & Soporte" />
                    <AdminVerifyBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<FaUsers />} label="Usuarios" />
                    <AdminVerifyBtn active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={<FaNewspaper />} label="Gestión Noticias" />
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
                            {activeTab === 'news' && 'Editor de Noticias'}
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
                {activeTab === 'news' && <AdminNews user={user} />}
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
