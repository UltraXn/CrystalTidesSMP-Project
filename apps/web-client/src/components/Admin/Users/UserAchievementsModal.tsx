import { X, Trophy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserDefinition, AchievementDefinition } from './types';

interface UserAchievementsModalProps {
    user: UserDefinition;
    availableAchievements: AchievementDefinition[];
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    onToggleAchievement: (id: string | number) => void;
}

export default function UserAchievementsModal({ user, availableAchievements, onClose, onSave, saving, onToggleAchievement }: UserAchievementsModalProps) {
    const { t } = useTranslation();

    return (
        <div className="premium-modal-overlay">
            <div className="premium-modal-content">
                <div className="modal-accent-line" />
                <div className="modal-header-premium">
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{t('admin.users.achievements_of', 'Logros de')} <span style={{color: 'var(--accent)'}}>{user.username || user.email.split('@')[0]}</span></h3>
                        <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{t('admin.users.assign_achievements', 'Asigna logros especiales manuales')}</p>
                    </div>
                    <button onClick={onClose} className="btn-close-premium"><X /></button>
                </div>

                <div className="modal-body-premium">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                        {availableAchievements.map(achievement => {
                            const active = user.achievements?.includes(achievement.id);
                            return (
                                <div 
                                    key={achievement.id}
                                    onClick={() => onToggleAchievement(achievement.id)}
                                    style={{
                                        position: 'relative',
                                        border: active ? `1px solid ${achievement.color || '#10b981'}` : '1px solid rgba(255,255,255,0.05)',
                                        background: active ? `linear-gradient(180deg, ${achievement.color || '#10b981'}26, ${achievement.color || '#10b981'}0d)` : 'rgba(255,255,255,0.02)',
                                        borderRadius: '16px',
                                        padding: '1rem 0.5rem',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: active ? 'translateY(-2px)' : 'none',
                                        boxShadow: active ? `0 10px 20px -5px ${achievement.color || '#10b981'}4d` : 'none'
                                    }}
                                >
                                    <div style={{ 
                                        color: achievement.color || '#10b981', 
                                        fontSize: '1.75rem', 
                                        marginBottom: '0.5rem',
                                        filter: active ? `drop-shadow(0 0 10px ${achievement.color || '#10b981'}99)` : 'grayscale(1) opacity(0.5)',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}>
                                        {achievement.image_url ? (
                                            <img 
                                                src={achievement.image_url} 
                                                alt={achievement.name}
                                                style={{ 
                                                    width: '40px', 
                                                    height: '40px', 
                                                    objectFit: 'contain',
                                                    filter: active ? `drop-shadow(0 0 5px ${achievement.color || '#10b981'}cc)` : 'grayscale(1) opacity(0.5)'
                                                }} 
                                            />
                                        ) : (
                                            <div style={{ fontSize: '2rem' }}>{achievement.icon || <Trophy />}</div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{achievement.name}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{achievement.id}</div> 
                                    
                                    {active && (
                                        <div style={{ 
                                            position: 'absolute', top: '8px', right: '8px', 
                                            background: '#10b981', color: '#000', 
                                            width: '18px', height: '18px', borderRadius: '50%', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontSize: '10px' 
                                        }}>
                                            <Check size={10} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {availableAchievements.length === 0 && <p style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>{t('admin.users.no_achievements', 'No hay logros definidos')}</p>}
                    </div>
                </div>

                <div className="modal-footer-premium">
                    <button className="modal-btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancelar')}</button>
                    <button className="modal-btn-primary" onClick={onSave} disabled={saving}>
                        {saving ? t('common.saving', 'Guardando...') : t('admin.users.save_achievements', 'Guardar Logros')}
                    </button>
                </div>
            </div>
        </div>
    );
}
