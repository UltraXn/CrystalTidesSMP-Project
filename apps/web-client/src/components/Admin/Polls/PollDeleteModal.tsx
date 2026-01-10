import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PollDeleteModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export default function PollDeleteModal({ onConfirm, onCancel }: PollDeleteModalProps) {
    const { t } = useTranslation();

    return (
        <div className="sync-modal-overlay">
            <div className="sync-modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
                <div className="modal-accent-line" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}></div>
                <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', fontSize: '2rem' }}>
                    <Trash2 />
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.75rem', fontWeight: '900' }}>
                   {t('admin.polls.delete_confirm_title', '¿Eliminar Encuesta?')}
                </h3>
                <p style={{ marginBottom: '2.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: '1.6', fontWeight: '500' }}>
                    {t('admin.polls.delete_confirm_desc', 'Esta acción no se puede deshacer y todos los votos acumulados se perderán permanentemente.')}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={onCancel} className="modal-btn-secondary" style={{ flex: 1 }}>
                        {t('admin.polls.form_extras.cancel')}
                    </button>
                    <button onClick={onConfirm} className="modal-btn-primary" style={{ background: '#ef4444', color: '#fff', flex: 1, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' }}>
                        {t('admin.polls.delete_btn', 'Eliminar')}
                    </button>
                </div>
            </div>
        </div>
    );
}
