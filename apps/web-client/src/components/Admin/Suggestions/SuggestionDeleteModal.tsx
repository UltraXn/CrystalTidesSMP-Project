import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';

interface SuggestionDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function SuggestionDeleteModal({ isOpen, onClose, onConfirm }: SuggestionDeleteModalProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="admin-card modal-content" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.5rem' }}>
                    <Trash2 size={24} />
                </div>
                <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>{t('admin.suggestions.delete_modal.title')}</h3>
                <p style={{ marginBottom: '2rem', color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5' }}>{t('admin.suggestions.delete_modal.desc')}</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                        {t('admin.suggestions.delete_modal.cancel')}
                    </button>
                    <button onClick={onConfirm} className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444', flex: 1 }}>
                        {t('admin.suggestions.delete_modal.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
