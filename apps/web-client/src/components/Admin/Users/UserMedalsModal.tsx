import { X, Medal, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserDefinition, MedalDefinition } from './types';
import { MEDAL_ICONS } from '../../../utils/MedalIcons';

interface UserMedalsModalProps {
    user: UserDefinition;
    availableMedals: MedalDefinition[];
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    onToggleMedal: (medalId: number) => void;
}

export default function UserMedalsModal({ user, availableMedals, onClose, onSave, saving, onToggleMedal }: UserMedalsModalProps) {
    const { t } = useTranslation();

    return (
        <div className="premium-modal-overlay">
            <div className="premium-modal-content">
                <div className="modal-accent-line" />
                <div className="modal-header-premium">
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{t('admin.users.medals_of')} <span style={{color: 'var(--accent)'}}>{user.username || user.email.split('@')[0]}</span></h3>
                        <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Asigna medallas especiales a este usuario</p>
                    </div>
                    <button onClick={onClose} className="btn-close-premium"><X /></button>
                </div>

                <div className="modal-body-premium">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                        {availableMedals.map(medal => {
                            const active = user.medals?.includes(medal.id);
                            return (
                                <div 
                                    key={medal.id}
                                    onClick={() => onToggleMedal(medal.id)}
                                    style={{
                                        position: 'relative',
                                        border: active ? `1px solid ${medal.color}` : '1px solid rgba(255,255,255,0.05)',
                                        background: active ? `linear-gradient(180deg, ${medal.color}15, ${medal.color}05)` : 'rgba(255,255,255,0.02)',
                                        borderRadius: '16px',
                                        padding: '1rem 0.5rem',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: active ? 'translateY(-2px)' : 'none',
                                        boxShadow: active ? `0 10px 20px -5px ${medal.color}30` : 'none'
                                    }}
                                >
                                    <div style={{ 
                                        color: medal.color, 
                                        fontSize: '1.75rem', 
                                        marginBottom: '0.5rem',
                                        filter: active ? `drop-shadow(0 0 10px ${medal.color}60)` : 'grayscale(1) opacity(0.5)',
                                        transition: 'all 0.3s'
                                    }}>
                                        {medal.image_url ? (
                                            <img 
                                                src={medal.image_url} 
                                                alt={medal.name} 
                                                style={{ 
                                                    width: '32px', 
                                                    height: '32px', 
                                                    objectFit: 'contain',
                                                    filter: active ? `drop-shadow(0 0 5px ${medal.color}80)` : 'grayscale(1) opacity(0.5)'
                                                }} 
                                            />
                                        ) : (
                                            (() => {
                                                const Icon = MEDAL_ICONS[medal.icon as keyof typeof MEDAL_ICONS] || Medal;
                                                return <Icon />;
                                            })()
                                        )} 
                                    </div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{medal.name}</div>
                                    {active && (
                                        <div style={{ 
                                            position: 'absolute', top: '8px', right: '8px', 
                                            background: medal.color, color: '#000', 
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
                        {availableMedals.length === 0 && <p style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>{t('admin.users.no_medals')}</p>}
                    </div>
                </div>

                <div className="modal-footer-premium">
                    <button className="modal-btn-secondary" onClick={onClose}>{t('admin.users.role_modal.cancel')}</button>
                    <button className="modal-btn-primary" onClick={onSave} disabled={saving}>
                        {saving ? t('admin.users.saving') : t('admin.users.save_medals')}
                    </button>
                </div>
            </div>
        </div>
    );
}
