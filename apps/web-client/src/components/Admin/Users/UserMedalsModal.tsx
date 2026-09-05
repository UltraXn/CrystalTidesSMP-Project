import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserDefinition, MedalDefinition } from './types';

interface UserMedalsModalProps {
    readonly user: UserDefinition;
    readonly availableMedals: MedalDefinition[];
    readonly onClose: () => void;
    readonly onSave: () => void;
    readonly saving: boolean;
    readonly onToggleMedal: (id: number) => void;
}

export default function UserMedalsModal({ user, availableMedals, onClose, onSave, saving, onToggleMedal }: Readonly<UserMedalsModalProps>) {
    const { t } = useTranslation();
    const activeSet = new Set(user.medals || []);
    const displayName = user.username || (user.email ? user.email.split('@')[0] : 'Usuario');

    return (
        <div className="premium-modal-overlay">
            <div role="dialog" aria-modal="true" aria-labelledby="user-medals-modal-title" className="premium-modal-content">
                <div className="modal-accent-line" />
                <div className="modal-header-premium">
                    <div>
                        <h3 id="user-medals-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Medallas de <span style={{color: 'var(--accent)'}}>{displayName}</span></h3>
                        <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Asigna medallas especiales a este usuario</p>
                    </div>
                    <button aria-label={t('common.close', 'Cerrar modal')} type="button" onClick={onClose} className="btn-close-premium"><X aria-hidden="true" /></button>
                </div>

                <div className="modal-body-premium">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                        {availableMedals.map(medal => {
                            const active = activeSet.has(medal.id);
                            return (
                                <button
                                    type="button"
                                    key={medal.id}
                                    aria-label={`${active ? 'Remover' : 'Asignar'} medalla ${medal.name || medal.id}`}
                                    aria-pressed={active}
                                    onClick={() => onToggleMedal(medal.id as number)}
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
                                        transition: 'background 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        appearance: 'none',
                                        fontFamily: 'inherit'
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
                                        {medal.icon || '🎖️'}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: active ? '700' : '500', color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                                        {medal.name}
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
                        {availableMedals.length === 0 && <p style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>{t('admin.users.no_medals')}</p>}
                    </div>
                </div>

                <div className="modal-footer-premium">
                    <button type="button" className="modal-btn-secondary" onClick={onClose}>{t('common.cancel', 'Cancelar')}</button>
                    <button type="button" className="modal-btn-primary" onClick={onSave} disabled={saving}>
                        {saving ? t('common.saving', 'Guardando...') : t('admin.users.save_medals', 'Guardar Medallas')}
                    </button>
                </div>
            </div>
        </div>
    );
}
