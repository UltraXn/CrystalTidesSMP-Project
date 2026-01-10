import { useState } from 'react'

import { useAuth } from "../../context/AuthContext"

import { useTranslation } from 'react-i18next'
import { supabase } from '../../services/supabaseClient'
import { sendDiscordLog } from '../../services/discordService'

import { Search } from 'lucide-react'
import { 
    useAdminSettings, 
    useSearchUsers, 
    useUpdateUserRole, 
    useUpdateUserMetadata 
} from '../../hooks/useAdminData'

import UsersTable from './Users/UsersTable'
import UserMedalsModal from './Users/UserMedalsModal'
import UserAchievementsModal from './Users/UserAchievementsModal'
import UserRoleModal from './Users/UserRoleModal'
import { UserDefinition, MedalDefinition, AchievementDefinition } from './Users/types'

interface UsersManagerProps {
    mockUsers?: UserDefinition[];
    mockMedals?: MedalDefinition[];
    mockAchievements?: AchievementDefinition[];
}

export default function UsersManager({ mockUsers }: UsersManagerProps = {}) {
    const { t } = useTranslation()
    const [users, setUsers] = useState<UserDefinition[]>(mockUsers || [])
    const [searchQuery, setSearchQuery] = useState('')
    const [hasSearched, setHasSearched] = useState(!!mockUsers) // Assume searched if mocks provided
    
    const [editingUser, setEditingUser] = useState<UserDefinition | null>(null)
    const [editingType, setEditingType] = useState<'medals' | 'achievements' | null>(null)
    const [roleChangeModal, setRoleChangeModal] = useState<{ userId: string, newRole: string } | null>(null)

    // TanStack Query Hooks
    const { data: adminSettings } = useAdminSettings();
    const searchMutation = useSearchUsers();
    const updateRoleMutation = useUpdateUserRole();
    const updateMetadataMutation = useUpdateUserMetadata();

    const { user } = useAuth() as { user: UserDefinition | null } 

    const availableMedals = adminSettings?.medals || [];
    const availableAchievements = adminSettings?.achievements || [];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setHasSearched(true)
        searchMutation.mutate(searchQuery, {
            onSuccess: (data) => setUsers(data)
        });
    }

    const handleRoleChange = (userId: string, newRole: string) => {
        setRoleChangeModal({ userId, newRole });
    }

    const confirmRoleChange = async () => {
        if (!roleChangeModal) return;
        const { userId, newRole } = roleChangeModal;

        updateRoleMutation.mutate({ userId, role: newRole }, {
            onSuccess: async () => {
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
            },
            onError: () => {
                alert(t('admin.users.error_role'))
            }
        });
    }

    const handleSaveMetadata = async () => {
        if (!editingUser || !editingType) return;
        
        const values = editingType === 'medals' 
            ? editingUser.medals 
            : editingUser.achievements;

        updateMetadataMutation.mutate({ 
            userId: editingUser.id, 
            type: editingType, 
            values: values || [] 
        }, {
            onSuccess: () => {
                const payload = editingType === 'medals' 
                    ? { medals: editingUser.medals } 
                    : { achievements: editingUser.achievements };

                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...payload } : u));
                setEditingUser(null);
                setEditingType(null);
            },
            onError: () => {
                alert(t('admin.users.error_update', 'Error al actualizar'));
            }
        });
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

    const toggleAchievement = (achievementId: string | number) => {
        if (!editingUser) return;
        const hasAchievement = editingUser.achievements?.includes(achievementId);
        let newAchievements = editingUser.achievements || [];
        
        if (hasAchievement) {
            newAchievements = newAchievements.filter(id => id !== achievementId);
        } else {
            newAchievements = [...newAchievements, achievementId];
        }
        setEditingUser({ ...editingUser, achievements: newAchievements });
    };

    const canManageRoles = ['neroferno', 'killu', 'killuwu', 'developer'].includes(user?.user_metadata?.role || '');

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
                    <Search style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                </div>
                <button type="submit" disabled={searchMutation.isPending} className="modal-btn-primary" style={{ flex: '1 1 auto', minWidth: '140px', height: '52px', borderRadius: '16px', padding: '0 2rem' }}>
                    {searchMutation.isPending ? t('common.searching', 'Buscando...') : t('admin.users.search_btn')}
                </button>
            </form>

            <UsersTable 
                users={users} 
                loading={searchMutation.isPending} 
                hasSearched={hasSearched} 
                canManageRoles={canManageRoles} 
                onEditMedals={(u) => { setEditingUser(u); setEditingType('medals'); }}
                onEditAchievements={(u) => { 
                    setEditingUser(u); 
                    setEditingType('achievements'); 
                }}
                onRoleChange={handleRoleChange} 
            />

            {/* Medals Modal */}
            {editingUser && editingType === 'medals' && (
                <UserMedalsModal 
                    user={editingUser} 
                    availableMedals={availableMedals as MedalDefinition[]} 
                    onClose={() => { setEditingUser(null); setEditingType(null); }} 
                    onSave={handleSaveMetadata} 
                    saving={updateMetadataMutation.isPending} 
                    onToggleMedal={toggleMedal} 
                />
            )}

            {/* Achievements Modal */}
            {editingUser && editingType === 'achievements' && (
                <UserAchievementsModal 
                    user={editingUser} 
                    availableAchievements={availableAchievements as AchievementDefinition[]} 
                    onClose={() => { setEditingUser(null); setEditingType(null); }} 
                    onSave={handleSaveMetadata} 
                    saving={updateMetadataMutation.isPending} 
                    onToggleAchievement={toggleAchievement} 
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
