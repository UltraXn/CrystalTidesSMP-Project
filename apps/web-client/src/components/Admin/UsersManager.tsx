import { useState, useEffect } from 'react'

import { useAuth } from "../../context/AuthContext"

import { useTranslation } from 'react-i18next'
import { supabase } from '../../services/supabaseClient'
import { getAuthHeaders } from '../../services/adminAuth'
import { sendDiscordLog } from '../../services/discordService'

const API_URL = import.meta.env.VITE_API_URL
import { FaSearch } from 'react-icons/fa'

import UsersTable from './Users/UsersTable'
import UserMedalsModal from './Users/UserMedalsModal'
import UserRoleModal from './Users/UserRoleModal'
import { UserDefinition, MedalDefinition } from './Users/types'

interface UsersManagerProps {
    mockUsers?: UserDefinition[];
    mockMedals?: MedalDefinition[];
}

export default function UsersManager({ mockUsers, mockMedals }: UsersManagerProps = {}) {
    const { t } = useTranslation()
    const [users, setUsers] = useState<UserDefinition[]>(mockUsers || [])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [hasSearched, setHasSearched] = useState(!!mockUsers) // Assume searched if mocks provided
    
    // Medal Management State
    const [availableMedals, setAvailableMedals] = useState<MedalDefinition[]>(mockMedals || [])
    const [editingUser, setEditingUser] = useState<UserDefinition | null>(null)
    const [savingMedals, setSavingMedals] = useState(false)

    // Role Change Modal State
    const [roleChangeModal, setRoleChangeModal] = useState<{ userId: string, newRole: string } | null>(null)

    const { user } = useAuth() as { user: UserDefinition | null } 

    // Fetch available medals on load
    useEffect(() => {
        if (mockMedals) return;
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
        if (!searchQuery.trim()) return

        try {
            setLoading(true)
            setHasSearched(true)
            
            const { data: { session } } = await supabase.auth.getSession();
            const headers = getAuthHeaders(session?.access_token || null);

            const res = await fetch(`${API_URL}/users?search=${encodeURIComponent(searchQuery)}`, { headers })
            if(res.ok) {
                const response = await res.json()
                if (Array.isArray(response)) {
                    setUsers(response)
                } else if (response.data && Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    console.error("Unexpected users response format:", response);
                    setUsers([]);
                    if (response.error || response.message) alert(response.error || response.message);
                }
            }
        } catch (error) {
            console.error("Error fetching users", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = (userId: string, newRole: string) => {
        setRoleChangeModal({ userId, newRole });
    }

    const confirmRoleChange = async () => {
        if (!roleChangeModal) return;
        const { userId, newRole } = roleChangeModal;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ role: newRole })
            })
            if(res.ok) {
                // Determine target user name for log
                const targetUser = users.find(u => u.id === userId);
                const targetName = targetUser?.username || targetUser?.email || userId;
                const adminName = user?.username || user?.email || 'Unknown Admin';

                // Send Log to Discord
                sendDiscordLog(
                    'Admin Action: Role Change', 
                    `**Admin:** ${adminName}\n**User:** ${targetName}\n**New Role:** ${newRole.toUpperCase()}`, 
                    'action'
                );

                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
                if (user && user.id === userId) {
                    await supabase.auth.refreshSession();
                    window.location.reload();
                }
                setRoleChangeModal(null);
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
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const res = await fetch(`${API_URL}/users/${editingUser.id}/metadata`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ metadata: { medals: editingUser.medals } })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, medals: editingUser.medals } : u));
                setEditingUser(null);
            } else {
                alert(t('admin.users.error_medals'));
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
        <div className="admin-card" style={{ background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px', wordBreak: 'break-word' }}>{t('admin.users.title')}</h3>
                <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>Gestiona los permisos y medallas de la comunidad</p>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 100%', minWidth: '200px', position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder={t('admin.users.search_placeholder')} 
                        className="admin-input-premium" 
                        style={{ paddingLeft: '3rem', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                </div>
                <button type="submit" className="modal-btn-primary" style={{ flex: '1 1 auto', minWidth: '140px', height: '52px', borderRadius: '16px', padding: '0 2rem' }}>
                    {t('admin.users.search_btn')}
                </button>
            </form>

            <UsersTable 
                users={users} 
                loading={loading} 
                hasSearched={hasSearched} 
                canManageRoles={canManageRoles} 
                onEditMedals={setEditingUser} 
                onRoleChange={handleRoleChange} 
            />

            {/* Medals Modal */}
            {editingUser && (
                <UserMedalsModal 
                    user={editingUser} 
                    availableMedals={availableMedals} 
                    onClose={() => setEditingUser(null)} 
                    onSave={handleSaveMedals} 
                    saving={savingMedals} 
                    onToggleMedal={toggleMedal} 
                />
            )}

            {/* Role Change Confirmation Modal */}
            {roleChangeModal && roleChangeModal.userId && (
                <UserRoleModal 
                    user={users.find(u => u.id === roleChangeModal.userId)!} 
                    newRole={roleChangeModal.newRole} 
                    onClose={() => setRoleChangeModal(null)} 
                    onConfirm={confirmRoleChange} 
                />
            )}

        </div>
    )
}
