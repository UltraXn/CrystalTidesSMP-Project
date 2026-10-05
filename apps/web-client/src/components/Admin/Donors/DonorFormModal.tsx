import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, X, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { getAuthHeaders } from '../../../services/adminAuth';
import { DonorBasicFields } from './DonorBasicFields';
import { DonorDescriptionFields } from './DonorDescriptionFields';
import { DonorPreviewCard } from './DonorPreviewCard';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Donor {
  id: string;
  name: string;
  skinUrl: string;
  description: string;
  description_en?: string;
  ranks: string[];
  isPremium?: boolean;
}

interface DonorFormModalProps {
  donor: Donor | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (donor: Donor) => void;
  saving: boolean;
}

export default function DonorFormModal({
  donor,
  isNew,
  onClose,
  onSave,
  saving,
}: Readonly<DonorFormModalProps>) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Donor>({
    id: '',
    name: '',
    skinUrl: '',
    description: '',
    description_en: '',
    ranks: ['donador'],
    isPremium: false,
  });
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (donor) {
      setFormData(donor);
    }
  }, [donor]);

  const handleTranslate = async (
    text: string,
    toLang: 'es' | 'en',
    field: 'description' | 'description_en',
  ) => {
    if (!text) return;
    setTranslating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/translation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(session?.access_token || null),
        },
        body: JSON.stringify({ text, targetLang: toLang }),
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, [field]: data.translatedText }));
      }
    } catch (e) {
      console.error('Translation fail', e instanceof Error ? e.message : 'Unknown error');
      // Error handling could be passed up via callback if needed,
      // but for now logging is sufficient as UI feedback is limited in this scope
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = () => {
    // Validation could be added here
    onSave(formData);
  };

  if (!donor) return null;

  return (
    <dialog
      open
      aria-labelledby="donor-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="sync-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
        border: 'none',
        margin: 0,
        padding: 0,
        maxWidth: 'none',
        maxHeight: 'none',
      }}
    >
      <div className="sync-modal-content" style={{ maxWidth: '850px' }}>
        <div className="modal-accent-line"></div>

        <div className="poll-form-header">
          <h3
            id="donor-modal-title"
            style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: '900',
            }}
          >
            <Crown style={{ color: 'var(--accent)' }} aria-hidden="true" />
            {isNew ? t('admin.donors.new_title') : t('admin.donors.edit_title')}
          </h3>
          <button
            aria-label={t('common.close', 'Cerrar ventana')}
            type="button"
            onClick={onClose}
            className="btn-close-mini"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div
          className="poll-form-body"
          style={{ overflowY: 'auto', maxHeight: '70vh', padding: '0.5rem' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Left Side: Basic Info */}
            <DonorBasicFields formData={formData} setFormData={setFormData} />

            {/* Right Side: Descriptions & Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <DonorDescriptionFields
                formData={formData}
                setFormData={setFormData}
                translating={translating}
                onTranslate={handleTranslate}
              />
              <DonorPreviewCard formData={formData} />
            </div>
          </div>

          <div
            className="poll-form-footer"
            style={{ marginTop: '2.5rem', padding: '1.5rem 2.5rem' }}
          >
            <button
              type="button"
              className="modal-btn-secondary"
              onClick={onClose}
              style={{ height: '52px' }}
            >
              {t('admin.donors.form.cancel')}
            </button>
            <button
              type="button"
              className="modal-btn-primary"
              onClick={handleSubmit}
              disabled={saving}
              style={{ height: '52px', padding: '0 3rem', flex: 'none' }}
            >
              {saving ? (
                <Loader2 className="spin" />
              ) : (
                <>
                  <CheckCircle size={20} /> {t('admin.donors.form.save')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
