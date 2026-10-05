import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Globe } from 'lucide-react';
import { Donor } from './DonorFormModal';

interface DonorDescriptionFieldsProps {
  formData: Donor;
  setFormData: React.Dispatch<React.SetStateAction<Donor>>;
  translating: boolean;
  onTranslate: (text: string, toLang: 'es' | 'en', field: 'description' | 'description_en') => void;
}

export function DonorDescriptionFields({
  formData,
  setFormData,
  translating,
  onTranslate,
}: Readonly<DonorDescriptionFieldsProps>) {
  const { t } = useTranslation();

  return (
    <>
      <div className="form-group">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <label htmlFor="donor-desc" className="admin-label-premium">
            {t('admin.donors.form.desc')}
          </label>
          <button
            type="button"
            className="btn-premium-mini"
            onClick={() => onTranslate(formData.description, 'en', 'description_en')}
            disabled={translating || !formData.description}
          >
            {translating ? <Loader2 className="spin" size={14} /> : <Globe size={14} />}
            {t('admin.donors.form.translate_en')}
          </button>
        </div>
        <textarea
          id="donor-desc"
          className="admin-textarea-premium"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('admin.donors.form.desc_ph')}
          rows={3}
        />
      </div>

      <div className="form-group">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <label htmlFor="donor-desc-en" className="admin-label-premium">
            {t('admin.donors.form.desc_en')}
          </label>
          <button
            type="button"
            className="btn-premium-mini"
            onClick={() => onTranslate(formData.description_en || '', 'es', 'description')}
            disabled={translating || !formData.description_en}
          >
            {translating ? <Loader2 className="spin" size={14} /> : <Globe size={14} />}
            {t('admin.donors.form.translate_es')}
          </button>
        </div>
        <textarea
          id="donor-desc-en"
          className="admin-textarea-premium"
          value={formData.description_en || ''}
          onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
          placeholder={t('admin.donors.form.desc_en_ph')}
          rows={3}
        />
      </div>
    </>
  );
}
