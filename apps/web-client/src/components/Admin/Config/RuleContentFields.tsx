import React from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Rule } from '../../../hooks/useAdminData';

const JUSTIFY_SPACE_BETWEEN = 'space-between';

interface RuleContentFieldsProps {
  formData: Partial<Rule>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Rule>>>;
  translatingField: string | null;
  onTranslate: (
    text: string,
    toLang: 'es' | 'en',
    field: 'title' | 'content' | 'title_en' | 'content_en',
  ) => void;
}

export function RuleContentFields({
  formData,
  setFormData,
  translatingField,
  onTranslate,
}: Readonly<RuleContentFieldsProps>) {
  const { t } = useTranslation();

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: JUSTIFY_SPACE_BETWEEN,
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <label
            htmlFor="rule-title-es"
            className="admin-label-premium"
            style={{ marginBottom: 0 }}
          >
            {t('admin.settings.rules.title_es', 'Título (Español)')}
          </label>
          <button
            type="button"
            className="modal-btn-secondary"
            style={{
              padding: '0.2rem 0.8rem',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            onClick={() => onTranslate(formData.title ?? '', 'en', 'title_en')}
            disabled={!formData.title}
          >
            {translatingField === 'title_en' ? (
              <Loader2 className="spin" size={12} />
            ) : (
              <Languages size={12} />
            )}{' '}
            {t('admin.settings.rules.translate_to_en', 'Traducir a EN')}
          </button>
        </div>
        <input
          id="rule-title-es"
          type="text"
          className="admin-input-premium"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: PVP Consensuado"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: JUSTIFY_SPACE_BETWEEN,
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <label
            htmlFor="rule-title-en"
            className="admin-label-premium"
            style={{ marginBottom: 0 }}
          >
            {t('admin.settings.rules.title_en', 'Título (Inglés)')}
          </label>
          <button
            type="button"
            className="modal-btn-secondary"
            style={{
              padding: '0.2rem 0.8rem',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            onClick={() => onTranslate(formData.title_en ?? '', 'es', 'title')}
            disabled={!formData.title_en}
          >
            {translatingField === 'title' ? (
              <Loader2 className="spin" size={12} />
            ) : (
              <Languages size={12} />
            )}{' '}
            {t('admin.settings.rules.translate_to_es', 'Traducir a ES')}
          </button>
        </div>
        <input
          id="rule-title-en"
          type="text"
          className="admin-input-premium"
          value={formData.title_en ?? ''}
          onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
          placeholder="Ex: Consensual PVP"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: JUSTIFY_SPACE_BETWEEN,
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <label
            htmlFor="rule-content-es"
            className="admin-label-premium"
            style={{ marginBottom: 0 }}
          >
            {t('admin.settings.rules.content_es', 'Contenido / Descripción (Español)')}
          </label>
          <button
            type="button"
            className="modal-btn-secondary"
            style={{
              padding: '0.2rem 0.8rem',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            onClick={() => onTranslate(formData.content ?? '', 'en', 'content_en')}
            disabled={!formData.content}
          >
            {translatingField === 'content_en' ? (
              <Loader2 className="spin" size={12} />
            ) : (
              <Languages size={12} />
            )}{' '}
            {t('admin.settings.rules.translate_to_en', 'Traducir a EN')}
          </button>
        </div>
        <textarea
          id="rule-content-es"
          className="admin-textarea-premium"
          rows={5}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Descripción detallada de la normativa..."
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: JUSTIFY_SPACE_BETWEEN,
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <label
            htmlFor="rule-content-en"
            className="admin-label-premium"
            style={{ marginBottom: 0 }}
          >
            {t('admin.settings.rules.content_en', 'Contenido / Descripción (Inglés)')}
          </label>
          <button
            type="button"
            className="modal-btn-secondary"
            style={{
              padding: '0.2rem 0.8rem',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            onClick={() => onTranslate(formData.content_en ?? '', 'es', 'content')}
            disabled={!formData.content_en}
          >
            {translatingField === 'content' ? (
              <Loader2 className="spin" size={12} />
            ) : (
              <Languages size={12} />
            )}{' '}
            {t('admin.settings.rules.translate_to_es', 'Traducir a ES')}
          </button>
        </div>
        <textarea
          id="rule-content-en"
          className="admin-textarea-premium"
          rows={5}
          value={formData.content_en ?? ''}
          onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
          placeholder="Detailed description of the rule..."
        />
      </div>
    </>
  );
}
