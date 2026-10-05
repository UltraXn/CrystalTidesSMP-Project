import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeleteNewsModalProps {
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteNewsModal: React.FC<DeleteNewsModalProps> = ({
  isOpen,
  isPending,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="sync-modal-overlay">
      <div
        className="sync-modal-content"
        style={{ maxWidth: '450px', textAlign: 'center', padding: '3.5rem' }}
      >
        <div
          className="modal-accent-line"
          style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}
        ></div>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '2.5rem',
          }}
        >
          <TriangleAlert />
        </div>
        <h3
          style={{
            margin: '0 0 1rem 0',
            fontSize: '1.75rem',
            fontWeight: '900',
            color: '#fff',
          }}
        >
          {t('admin.news.delete_modal.title')}
        </h3>
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
            fontSize: '1rem',
          }}
        >
          {t('admin.news.delete_modal.desc')}
        </p>
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="modal-btn-secondary"
            onClick={onClose}
            style={{ flex: 1, height: '54px' }}
          >
            {t('admin.news.delete_modal.cancel')}
          </button>
          <button
            type="button"
            className="modal-btn-primary"
            onClick={onConfirm}
            disabled={isPending}
            style={{
              flex: 1,
              background: '#ef4444',
              color: '#fff',
              height: '54px',
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
            }}
          >
            {isPending ? t('common.deleting') : t('admin.news.delete_modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
