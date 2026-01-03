import { FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { UserDefinition } from './types';

interface UserRoleModalProps {
    user: UserDefinition;
    newRole: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function UserRoleModal({ user, newRole, onClose, onConfirm }: UserRoleModalProps) {
    const { t } = useTranslation();

    return (
        <div className="premium-modal-overlay">
            <div className="premium-modal-content" style={{ maxWidth: '450px' }}>
                <div className="modal-accent-line" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', boxShadow: '0 0 20px #ef4444' }} />
                
                <div style={{ padding: '3rem 2rem 2rem', textAlign: 'center' }}>
                    <div style={{ 
                        margin: '0 auto 1.5rem', 
                        width: '80px', height: '80px', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: '#ef4444',
                        borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
                    }}>
                        <FaCheck />
                    </div>
                    
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '900' }}>{t('admin.users.role_modal.title')}</h3>
                    
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        {t('admin.users.role_modal.desc')}<br/>
                        <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{user.username || user.email}</strong><br/>
                        {t('admin.users.role_modal.to')} <span className="status-chip" style={{ background: '#fff', color: '#000', margin: '0 5px' }}>{newRole}</span>
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button 
                            className="modal-btn-secondary" 
                            onClick={onClose}
                            style={{ flex: 1, height: '48px' }}
                        >
                            {t('admin.users.role_modal.cancel')}
                        </button>
                        <button 
                            className="modal-btn-primary" 
                            onClick={onConfirm}
                            style={{ 
                                flex: 1, 
                                height: '48px', 
                                background: '#ef4444', 
                                boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)',
                                color: '#fff'
                            }}
                        >
                            {t('admin.users.role_modal.confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
