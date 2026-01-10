
import { Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
    isOpen: boolean;
    type: 'delete' | 'import' | null;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DonorsConfirmModal({ isOpen, type, onClose, onConfirm }: ConfirmModalProps) {
    const { t } = useTranslation();

    if (!isOpen || !type) return null;

    return (
        <div className="sync-modal-overlay">
            <div className="sync-modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
                <div className="modal-accent-line" style={{ background: type === 'delete' ? 'linear-gradient(90deg, transparent, #ef4444, transparent)' : '' }}></div>
                <div style={{ 
                    width: '80px', height: '80px', 
                    background: type === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--accent-rgb), 0.1)', 
                    color: type === 'delete' ? '#ef4444' : 'var(--accent)', 
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', fontSize: '2rem' 
                }}>
                    {type === 'delete' ? <Trash2 /> : <AlertTriangle />}
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.75rem', fontWeight: '900' }}>
                   {type === 'delete' ? t('admin.donors.delete_confirm.title') : t('admin.donors.import_confirm.title')}
                </h3>
                <p style={{ marginBottom: '2.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: '1.6', fontWeight: '500' }}>
                    {type === 'delete' ? t('admin.donors.delete_confirm.msg') : t('admin.donors.import_confirm.msg')}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={onClose} className="modal-btn-secondary" style={{ flex: 1 }}>
                        {t('common.cancel', 'Cancelar')}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="modal-btn-primary" 
                        style={{ 
                            background: type === 'delete' ? '#ef4444' : '', 
                            color: '#fff', flex: 1, 
                            boxShadow: type === 'delete' ? '0 10px 30px rgba(239, 68, 68, 0.3)' : '' 
                        }}
                    >
                        {type === 'delete' ? t('admin.donors.delete_confirm.btn') : t('admin.donors.import_confirm.btn')}
                    </button>
                </div>
            </div>
        </div>
    );
}
