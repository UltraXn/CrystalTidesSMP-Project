import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Image as ImageIcon, Loader2, AlertTriangle, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NewsFormValues } from '../../../schemas/news';

interface NewsEnglishFieldsProps {
  form: UseFormReturn<NewsFormValues>;
  translating: boolean;
  uploading: boolean;
  uploadError: string | null;
  onTranslateTitle: () => void;
  onTranslateContent: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NewsEnglishFields({
  form,
  translating,
  uploading,
  uploadError,
  onTranslateTitle,
  onTranslateContent,
  onImageUpload,
}: NewsEnglishFieldsProps) {
  const { t } = useTranslation();
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const titleEn = watch('title_en');
  const contentEn = watch('content_en');
  const image = watch('image');

  return (
    <div className="news-form-section">
      <h4>
        <Languages /> {t('admin.news.form_extras.config_en', 'English Version')}
      </h4>

      <div className="form-group">
        <label htmlFor="news-form-title-en" className="admin-label-premium">
          {t('admin.news.form.title')} {t('admin.news.english_suffix')}
        </label>
        <input
          id="news-form-title-en"
          aria-label={t('admin.news.form.title')}
          type="text"
          className="admin-input-premium"
          {...register('title_en')}
          placeholder="Catchy title in English..."
        />
        {errors.title_en && (
          <span
            style={{
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginTop: '5px',
              display: 'block',
            }}
          >
            {errors.title_en.message}
          </span>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn-translate-premium"
            onClick={onTranslateTitle}
            disabled={translating || !titleEn}
          >
            {translating ? <Loader2 className="spin" /> : <Languages />}{' '}
            {t('admin.news.translate_to_es_title')}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="news-form-content-en" className="admin-label-premium">
          {t('admin.news.form.content')} {t('admin.news.english_suffix')}
        </label>
        <textarea
          id="news-form-content-en"
          aria-label={t('admin.news.form.content')}
          className="admin-textarea-premium"
          rows={12}
          {...register('content_en')}
          placeholder="Develop the news content in English..."
        ></textarea>
        {errors.content_en && (
          <span
            style={{
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginTop: '5px',
              display: 'block',
            }}
          >
            {errors.content_en.message}
          </span>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn-translate-premium"
            onClick={onTranslateContent}
            disabled={translating || !contentEn}
          >
            {translating ? <Loader2 className="spin" /> : <Languages />}{' '}
            {t('admin.news.translate_to_es_content')}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="news-form-image" className="admin-label-premium">
          {t('admin.news.form.image')}
        </label>
        <div className="news-img-preview-wrapper" style={{ marginBottom: '1rem' }}>
          {image ? (
            <img src={image} className="news-img-preview" alt="Preview" />
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.3 }}>
              <ImageIcon size={40} style={{ marginBottom: '10px' }} />
              <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>SIN IMAGEN PORTADA</p>
            </div>
          )}
          {uploading && (
            <div className="news-upload-loading">
              <Loader2 className="spin" size={24} />
              <span>SUBIENDO...</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            id="news-form-image"
            type="text"
            className="admin-input-premium"
            placeholder="https://su-imagen.webp"
            {...register('image')}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            aria-label="Subir imagen"
            className="modal-btn-primary"
            style={{ width: '54px', height: '54px', borderRadius: '14px', flexShrink: 0 }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e: Event) =>
                onImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
              input.click();
            }}
            disabled={uploading}
          >
            <ImageIcon size={20} />
          </button>
        </div>
        {uploadError && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle /> {uploadError}
          </div>
        )}
      </div>
    </div>
  );
}
