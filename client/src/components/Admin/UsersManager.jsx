import { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { useAuth } from "@/context/AuthContext"

import { useTranslation } from 'react-i18next'

const API_URL = import.meta.env.VITE_API_URL

export default function UsersManager() {
    const { t } = useTranslation()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [emailQuery, setEmailQuery] = useState('')
    const [hasSearched, setHasSearched] = useState(false)

    const { user, logout } = useAuth() // Get current user and logout function

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!emailQuery.trim()) return

        try {
            setLoading(true)
            setHasSearched(true)
            // Backend should handle query param ?email=...
            const res = await fetch(`${API_URL}/users?email=${encodeURIComponent(emailQuery)}`)
            if(res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error("Error fetching users", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        if(!confirm(`${t('admin.users.confirm_role')} ${newRole}?`)) return
        try {
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            if(res.ok) {
                // Refresh list locally
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
                
                // Si el usuario se cambia el rol a SÍ MISMO, cerramos sesión para forzar la actualización de permisos
                // Esto soluciona que el token se quede con el rol antiguo
                if (user && user.id === userId) {
                    await logout()
                    window.location.href = '/login'
                }
            } else {
                alert(t('admin.users.error_role'))
            }
        } catch (error) {
            console.error(error)
        }
    }

    const canManageRoles = ['neroferno', 'killu'].includes(user?.user_metadata?.role)

    return (
        <div className="admin-card">
            <h3 style={{ marginBottom: '1rem' }}>{t('admin.users.title')}</h3>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input 
                    type="text" 
                    placeholder={t('admin.users.search_placeholder')} 
                    className="admin-input" // Assume this class exists or is basic input style
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                    style={{ 
                        flex: 1, 
                        padding: '0.8rem', 
                        borderRadius: '6px', 
                        border: '1px solid #444', 
                        background: 'rgba(0,0,0,0.2)', 
                        color: '#fff' 
                    }}
                />
                <button type="submit" className="btn-action close" style={{ background: 'var(--accent)', color: '#000' }}>
                    <FaSearch /> {t('admin.users.search_btn')}
                </button>
            </form>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.users.table.user')}</th>
                            <th>{t('admin.users.table.id')}</th>
                            <th>{t('admin.users.table.role')}</th>
                            {canManageRoles && <th>{t('admin.users.table.change_role')}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{fontWeight:'bold', color:'#fff'}}>{u.email}</div>
                                    <div style={{fontSize:'0.8rem', color:'#666'}}>{t('admin.users.registered')}: {new Date(u.created_at).toLocaleDateString()}</div>
                                </td>
                                <td style={{fontFamily:'monospace', fontSize:'0.8rem', color:'#555'}}>{u.id.substring(0,8)}...</td>
                                <td>
                                    <RoleBadge role={u.role || 'user'} />
                                </td>
                                {canManageRoles && (
                                    <td>
                                        <select 
                                            className="admin-input" 
                                            style={{padding:'0.3rem', width:'auto', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'4px'}}
                                            value={u.role || 'user'}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        >
                                            <option value="user">{t('account.roles.user')}</option>
                                            <option value="donor">{t('account.roles.donor')}</option>
                                            <option value="founder">{t('account.roles.founder')}</option>
                                            <option value="admin">{t('account.roles.admin')}</option>
                                            <option value="helper">{t('account.roles.helper')}</option>
                                            <option value="neroferno">{t('account.roles.neroferno')}</option>
                                            <option value="killu">{t('account.roles.killu')}</option>
                                        </select>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && hasSearched && !loading && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{t('admin.users.no_results')}</div>
                )}
                {users.length === 0 && !hasSearched && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{t('admin.users.initial_msg')}</div>
                )}
                {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>{t('admin.users.searching')}</div>}
            </div>
        </div>
    )
}

function RoleBadge({ role }) {
    const { t } = useTranslation()
    const roles = {
        neroferno: { label: t('account.roles.neroferno'), img: '/ranks/rank-neroferno.png' },
        killu: { label: t('account.roles.killu'), img: '/ranks/rank-killu.png' },
        founder: { label: t('account.roles.founder'), img: '/ranks/rank-fundador.png' },
        admin: { label: t('account.roles.admin'), img: '/ranks/admin.png' },
        helper: { label: t('account.roles.helper'), img: '/ranks/helper.png' },
        donor: { label: t('account.roles.donor'), img: '/ranks/rank-donador.png' },
        user: { label: t('account.roles.user'), img: '/ranks/user.png' }
    }
    const current = roles[role] || roles.user

    if(current.img) {
        return <img src={current.img} alt={role} title={current.label} />
    }

    return (
        <span style={{
            background: current.color || '#333',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }}>
            {current.icon} {current.label}
        </span>
    )
}
