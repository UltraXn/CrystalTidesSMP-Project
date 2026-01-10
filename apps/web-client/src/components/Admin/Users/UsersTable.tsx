import { Search, Medal, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserDefinition } from './types';
import { UserRoleBadge } from './UserRoleBadge';
import Loader from "../../UI/Loader";

interface UsersTableProps {
    users: UserDefinition[];
    loading: boolean;
    hasSearched: boolean;
    canManageRoles: boolean;
    onEditMedals: (user: UserDefinition) => void;
    onEditAchievements: (user: UserDefinition) => void;
    onRoleChange: (userId: string, role: string) => void;
}

export default function UsersTable({ users, loading, hasSearched, canManageRoles, onEditMedals, onEditAchievements, onRoleChange }: UsersTableProps) {
    const { t } = useTranslation();

    return (
        <div className="admin-table-container" style={{ overflow: 'visible', background: 'transparent', border: 'none' }}>
            <table className="admin-table users-table-responsive" style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                <thead>
                    <tr>
                        <th style={{ background: 'transparent', border: 'none', paddingLeft: '1.5rem', color: '#666' }}>{t('admin.users.table.user')}</th>
                        <th className="th-mobile-hide" style={{ background: 'transparent', border: 'none', color: '#666' }}>{t('admin.users.table.id')}</th>
                        <th style={{ background: 'transparent', border: 'none', color: '#666' }}>{t('admin.users.table.role')}</th>
                        <th className="th-mobile-hide" style={{ background: 'transparent', border: 'none', color: '#666' }}>{t('admin.users.gamification')}</th>
                        {canManageRoles && <th style={{ background: 'transparent', border: 'none', color: '#666' }}>{t('admin.users.table.change_role')}</th>}
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="user-table-row" style={{ background: 'rgba(255, 255, 255, 0.02)', transition: 'transform 0.2s', cursor: 'default' }}>
                            <td className="user-cell-main" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRight: 'none', borderRadius: '16px 0 0 16px', padding: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ 
                                        width: '42px', height: '42px', minWidth: '42px', borderRadius: '12px', 
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)'
                                    }}>
                                        {u.username ? u.username[0].toUpperCase() : u.email[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: '1', minWidth: '0' }}>
                                        <div style={{fontWeight:'800', color:'#fff', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{u.username || u.email.split('@')[0]}</div>
                                        <div style={{fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="th-mobile-hide" style={{ border: '1px solid rgba(255,255,255,0.05)', borderLeft: 'none', borderRight: 'none', position: 'relative' }}>
                                <span style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '6px' }}>
                                    {u.id.substring(0,8)}...
                                </span>
                            </td>
                            <td className="user-cell-role" style={{ border: '1px solid rgba(255,255,255,0.05)', borderLeft: 'none', borderRight: 'none', minWidth: '120px' }}>
                                <UserRoleBadge role={u.role || 'user'} />
                            </td>
                            <td className="th-mobile-hide" style={{ border: '1px solid rgba(255,255,255,0.05)', borderLeft: 'none', borderRight: 'none' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <button 
                                        onClick={() => onEditMedals(u)}
                                        style={{ 
                                            background: u.medals && u.medals.length > 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                                            border: u.medals && u.medals.length > 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)', 
                                            color: u.medals && u.medals.length > 0 ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)',
                                            borderRadius: '10px',
                                            padding: '0.4rem 0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap',
                                            width: '100%'
                                        }}
                                        className="hover-lift"
                                    >
                                        <Medal size={14} /> {u.medals?.length || 0} {t('admin.users.medals', 'Medallas')}
                                    </button>
                                    <button 
                                        onClick={() => onEditAchievements(u)}
                                        style={{ 
                                            background: u.achievements && u.achievements.length > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                                            border: u.achievements && u.achievements.length > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)', 
                                            color: u.achievements && u.achievements.length > 0 ? '#10b981' : 'rgba(255, 255, 255, 0.4)',
                                            borderRadius: '10px',
                                            padding: '0.4rem 0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap',
                                            width: '100%'
                                        }}
                                        className="hover-lift"
                                    >
                                        <Trophy size={14} /> {u.achievements?.length || 0} {t('admin.users.achievements', 'Logros')}
                                    </button>
                                </div>
                            </td>
                            {canManageRoles && (
                                <td className="user-cell-actions" style={{ border: '1px solid rgba(255,255,255,0.05)', borderLeft: 'none', borderRadius: '0 16px 16px 0', paddingRight: '1.25rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <select 
                                            className="admin-select-premium" 
                                            style={{ padding: '0.6rem 2.5rem 0.6rem 1rem', fontSize: '0.85rem', minWidth: '140px', width: '100%', backgroundPosition: 'right 0.8rem center' }}
                                            value={u.role || 'user'}
                                            onChange={(e) => onRoleChange(u.id, e.target.value)}
                                        >
                                            <option value="neroferno">{t('account.roles.neroferno')}</option>
                                            <option value="killu">{t('account.roles.killu')}</option>
                                            <option value="founder">{t('account.roles.founder')}</option>
                                            <option value="developer">{t('account.roles.developer')}</option>
                                            <option value="admin">{t('account.roles.admin')}</option>
                                            <option value="staff">{t('account.roles.staff', 'Staff')}</option>
                                            <option value="helper">{t('account.roles.helper')}</option>
                                            <option value="donor">{t('account.roles.donor')}</option>
                                            <option value="user">{t('account.roles.user')}</option>
                                        </select>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Empty states */}
            {users.length === 0 && hasSearched && !loading && (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Search size={48} opacity={0.2} />
                    <div>{t('admin.users.no_results')}</div>
                </div>
            )}
            {users.length === 0 && !hasSearched && (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Search size={24} opacity={0.5} />
                    </div>
                    <div>{t('admin.users.initial_msg')}</div>
                </div>
            )}
            {loading && (
                <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                    <Loader style={{ height: 'auto', minHeight: '100px' }} />
                </div>
            )}
        </div>
    );
}
