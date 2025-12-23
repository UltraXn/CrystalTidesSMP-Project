import { useState, useEffect } from 'react'

import { useAuth } from "../../context/AuthContext"

import { useTranslation } from 'react-i18next'

const API_URL = import.meta.env.VITE_API_URL
import { FaSearch, FaMedal, FaTimes, FaCheck } from 'react-icons/fa'

interface UserDefinition {
    id: string;
    email: string;
    role?: string;
    medals?: number[]; // Assuming medal IDs are optional strings or needed? Code uses strings or numbers?
    created_at: string;
    user_metadata?: { role?: string };
}

interface MedalDefinition {
    id: number;
    name: string;
    color: string;
    icon: string;
    description: string;
}

export default function UsersManager() {
    const { t } = useTranslation()
    const [users, setUsers] = useState<UserDefinition[]>([])
    const [loading, setLoading] = useState(false)
    const [emailQuery, setEmailQuery] = useState('')
    const [hasSearched, setHasSearched] = useState(false)
    
    // Medal Management State
    const [availableMedals, setAvailableMedals] = useState<MedalDefinition[]>([])
    const [editingUser, setEditingUser] = useState<UserDefinition | null>(null) // User being edited in modal
    const [savingMedals, setSavingMedals] = useState(false)

    const { user, logout } = useAuth() as { user: UserDefinition | null; logout: () => Promise<void> } 

    // Fetch available medals on load
    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => {
                if(!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => {
                if(data.medal_definitions) {
                    try {
                        const parsed = typeof data.medal_definitions === 'string' ? JSON.parse(data.medal_definitions) : data.medal_definitions;
                        setAvailableMedals(Array.isArray(parsed) ? parsed : []);
                    } catch { setAvailableMedals([]); }
                }
            })
            .catch(console.warn);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emailQuery.trim()) return

        try {
            setLoading(true)
            setHasSearched(true)
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

    const handleRoleChange = async (userId: string, newRole: string) => {
        if(!confirm(`${t('admin.users.confirm_role')} ${newRole}?`)) return
        try {
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            if(res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
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

    const handleSaveMedals = async () => {
        if (!editingUser) return;
        setSavingMedals(true);
        try {
            // Merge existing metadata with new medals array
            const res = await fetch(`${API_URL}/users/${editingUser.id}/metadata`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metadata: { medals: editingUser.medals } })
            });

            if (res.ok) {
                // Update local user list
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, medals: editingUser.medals } : u));
                setEditingUser(null); // Close modal
            } else {
                alert('Error al guardar medallas');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSavingMedals(false);
        }
    };

    const toggleMedal = (medalId: number) => {
        if (!editingUser) return;
        const hasMedal = editingUser.medals?.includes(medalId);
        let newMedals = editingUser.medals || [];
        
        if (hasMedal) {
            newMedals = newMedals.filter(id => id !== medalId);
        } else {
            newMedals = [...newMedals, medalId];
        }
        setEditingUser({ ...editingUser, medals: newMedals });
    };

    const canManageRoles = ['neroferno', 'killu'].includes(user?.user_metadata?.role || '');

    return (
        <div className="admin-card">
            <h3 style={{ marginBottom: '1rem' }}>{t('admin.users.title')}</h3>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input 
                    type="text" 
                    placeholder={t('admin.users.search_placeholder')} 
                    className="admin-input" 
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                    style={{ flex: 1 }}
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
                            <th>Gamificación</th>
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
                                <td>
                                    <button 
                                        onClick={() => setEditingUser(u)}
                                        style={{ 
                                            background: 'rgba(251, 191, 36, 0.1)', 
                                            border: '1px solid #fbbf24', 
                                            color: '#fbbf24',
                                            borderRadius: '4px',
                                            padding: '0.3rem 0.6rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        <FaMedal /> {u.medals?.length || 0} Medallas
                                    </button>
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
                {/* Empty states */}
                {users.length === 0 && hasSearched && !loading && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{t('admin.users.no_results')}</div>
                )}
                {users.length === 0 && !hasSearched && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{t('admin.users.initial_msg')}</div>
                )}
                {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>{t('admin.users.searching')}</div>}
            </div>

            {/* Medals Modal */}
            {editingUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="admin-card" style={{ width: '500px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Medallas de {editingUser.email.split('@')[0]}</h3>
                            <button onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><FaTimes /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {availableMedals.map(medal => {
                                const active = editingUser.medals?.includes(medal.id);
                                return (
                                    <div 
                                        key={medal.id}
                                        onClick={() => toggleMedal(medal.id)}
                                        style={{
                                            border: `1px solid ${active ? medal.color : '#333'}`,
                                            background: active ? `${medal.color}20` : 'rgba(255,255,255,0.02)',
                                            borderRadius: '6px',
                                            padding: '0.5rem',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            opacity: active ? 1 : 0.6,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ color: medal.color, fontSize: '1.5rem', marginBottom: '0.2rem' }}>
                                            {/* We can't use renderIcon here easily without ICONS map, using generic medal for now or importing logic */}
                                            <FaMedal /> 
                                        </div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{medal.name}</div>
                                        {active && <div style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.2rem' }}><FaCheck /></div>}
                                    </div>
                                )
                            })}
                            {availableMedals.length === 0 && <p style={{ color: '#666', gridColumn: '1/-1' }}>No hay medallas creadas en el sistema.</p>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={() => setEditingUser(null)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleSaveMedals} disabled={savingMedals}>
                                {savingMedals ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function RoleBadge({ role }: { role: string }) {
    const { t } = useTranslation()
    
    interface RoleInfo { label: string; img?: string; color?: string; icon?: React.ReactNode; }
    
    const roles: Record<string, RoleInfo> = {
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
