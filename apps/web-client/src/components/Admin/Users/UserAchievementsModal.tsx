import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserDefinition, AchievementDefinition } from './types';

interface UserAchievementsModalProps {
    readonly user: UserDefinition;
    readonly availableAchievements: AchievementDefinition[];
    readonly onClose: () => void;
    readonly onSave: () => void;
    readonly saving: boolean;
    readonly onToggleAchievement: (id: string | number) => void;
}

export default function UserAchievementsModal({ user, availableAchievements, onClose, onSave, saving, onToggleAchievement }: Readonly<UserAchievementsModalProps>) {
    const { t } = useTranslation();
    const activeSet = new Set(user.achievements || []);
    const displayName = user.username || (user.email ? user.email.split('@')[0] : 'Usuario');

    return (
        <div className="premium-modal-overlay">
            <div className="premium-modal-content">
                <div className="modal-accent-line" />
                <div className="modal-header-premium">
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{t('admin.users.achievements_of', 'Logros de')} <span style={{color: 'var(--accent)'}}>{displayName}</span></h3>
                        <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{t('admin.users.assign_achievements', 'Asigna logros especiales manuales')}</p>
                    </div>
                    <button aria-label="Action" type="button" onClick={onClose} className="btn-close-premium"><X /></button>
                </div>

                <div className="modal-body-premium">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                        {availableAchievements.map(achievement => {
                            const active = activeSet.has(achievement.id);
                            return (
                                <button
                                    type="button"
                                    key={achievement.id}
                                    onClick={() => onToggleAchievement(achievement.id)}
                                    style={{
                                        position: 'relative',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        background: active ? 'rgba(var(--accent-rgb, 245, 158, 11), 0.12)' : 'rgba(255,255,255,0.02)',
                                        border: active ? '1px solid rgba(var(--accent-rgb, 245, 158, 11), 0.4)' : '1px solid rgba(255,255,255,0.06)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        gap: '0.5rem',
                                        transition: 'background 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '1.75rem',
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '10px',
                                        background: active ? 'rgba(var(--accent-rgb, 245, 158, 11), 0.2)' : 'rgba(255,255,255,0.04)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {achievement.icon || '🏆'}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: active ? '700' : '500', color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                                        {achievement.name}
                                    </span>
                                    {active && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '6px',
                                            right: '6px',
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            background: 'var(--accent)',
                                            color: '#000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px'
                                        }}>
                                            <Check size={10} />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                        {availableAchievements.length === 0 && <p style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>{t('admin.users.no_achievements', 'No hay logros definidos')}</p>}
                    </div>
                </div>

                <div className="modal-footer-premium">
                    <button type="button" className="modal-btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancelar')}</button>
                    <button type="button" className="modal-btn-primary" onClick={onSave} disabled={saving}>
                        {saving ? t('common.saving', 'Guardando...') : t('admin.users.save_achievements', 'Guardar Logros')}
                    </button>
                </div>
            </div>
        </div>
    );
}
