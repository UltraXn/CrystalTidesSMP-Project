import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Image as ImageIcon, Loader2, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NewsFormValues } from '../../../schemas/news';

interface NewsSpanishFieldsProps {
  form: UseFormReturn<NewsFormValues>;
  contentFileInputRef: React.RefObject<HTMLInputElement | null>;
  translating: boolean;
  uploading: boolean;
  onTranslateTitle: () => void;
  onTranslateContent: () => void;
  onContentImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NewsSpanishFields({
  form,
  contentFileInputRef,
  translating,
  uploading,
  onTranslateTitle,
  onTranslateContent,
  onContentImageUpload,
}: NewsSpanishFieldsProps) {
  const { t } = useTranslation();
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const title = watch('title');
  const content = watch('content');

  return (
    <div className="news-form-section">
      <h4>
        <img
          alt=""
          src="/images/ui/logo.webp"
          width="20"
          style={{ verticalAlign: 'middle', marginRight: '8px' }}
        />{' '}
        {t('admin.news.form_extras.config_es', 'Contenido en Español')}
      </h4>

      <div className="form-group">
        <label htmlFor="news-form-title" className="admin-label-premium">
          {t('admin.news.form.title')}
        </label>
        <input
          id="news-form-title"
          aria-label={t('admin.news.form.title')}
          type="text"
          className="admin-input-premium"
          {...register('title')}
          placeholder="Escribe un título impactante..."
        />
        {errors.title && (
          <span
            style={{
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginTop: '5px',
              display: 'block',
            }}
          >
            {errors.title.message}
          </span>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn-translate-premium"
            onClick={onTranslateTitle}
            disabled={translating || !title}
          >
            {translating ? <Loader2 className="spin" /> : <Languages />}{' '}
            {t('admin.news.translate_to_en_title')}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="news-form-content" className="admin-label-premium">
          {t('admin.news.form.content')}
        </label>
        <div style={{ position: 'relative' }}>
          <textarea
            id="news-form-content"
            aria-label={t('admin.news.form.content')}
            className="admin-textarea-premium"
            rows={12}
            {...register('content')}
            placeholder="Desarrolla la noticia aquí..."
          ></textarea>
          <button
            type="button"
            onClick={() => contentFileInputRef.current?.click()}
            className="btn-translate-premium"
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
            }}
            disabled={uploading}
          >
            <ImageIcon /> {t('admin.news.insert_image')}
          </button>
          <input
            aria-label={t(
              'admin.news.upload_content_image',
              'Subir imagen para el contenido de la noticia',
            )}
            type="file"
            ref={contentFileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={onContentImageUpload}
          />
        </div>
        {errors.content && (
          <span
            style={{
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginTop: '5px',
              display: 'block',
            }}
          >
            {errors.content.message}
          </span>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn-translate-premium"
            onClick={onTranslateContent}
            disabled={translating || !content}
          >
            {translating ? <Loader2 className="spin" /> : <Languages />}{' '}
            {t('admin.news.translate_to_en_content')}
          </button>
        </div>
      </div>

      <div
        className="news-selectors-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="form-group">
          <label htmlFor="news-form-category" className="admin-label-premium">
            {t('admin.news.form.category')}
          </label>
          <select
            id="news-form-category"
            aria-label={t('admin.news.form.category')}
            className="admin-select-premium"
            {...register('category')}
          >
            <option value="General">General</option>
            <option value="Evento">Evento</option>
            <option value="Update">Update</option>
            <option value="Sistema">Sistema</option>
            <option value="Comunidad">Comunidad</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="news-form-status" className="admin-label-premium">
            {t('admin.news.form.status')}
          </label>
          <select
            id="news-form-status"
            aria-label={t('admin.news.form.status')}
            className="admin-select-premium"
            {...register('status')}
          >
            <option value="Draft">{t('admin.news.form.draft')}</option>
            <option value="Published">{t('admin.news.form.published')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
