
import { FaExclamationTriangle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface EventDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function EventDeleteModal({ isOpen, onClose, onConfirm }: EventDeleteModalProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="sync-modal-overlay">
            <div className="sync-modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '3.5rem' }}>
                <div className="modal-accent-line" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}></div>
                <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem',
                    fontSize: '2.5rem'
                }}>
                    <FaExclamationTriangle />
                </div>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.75rem', fontWeight: '900', color: '#fff' }}>{t('admin.events.delete_modal.title')}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
                    {t('admin.events.delete_modal.desc')}
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
                    <button 
                        className="modal-btn-secondary" 
                        onClick={onClose}
                        style={{ flex: 1, height: '54px' }}
                    >
                        {t('admin.events.delete_modal.cancel')}
                    </button>
                    <button 
                        className="modal-btn-primary" 
                        onClick={onConfirm}
                        style={{ 
                            flex: 1, 
                            background: '#ef4444', 
                            color: '#fff',
                            height: '54px',
                            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        {t('admin.events.delete_modal.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
