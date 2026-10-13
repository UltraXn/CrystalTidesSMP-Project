import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User } from '@supabase/supabase-js';
import { NewsFormValues } from '../../schemas/news';
import { useNewsForm } from './News/useNewsForm';
import { NewsSpanishFields } from './News/NewsSpanishFields';
import { NewsEnglishFields } from './News/NewsEnglishFields';

interface NewsFormProps {
  initialData?: NewsFormValues;
  onSave: (data: NewsFormValues) => Promise<void>;
  onCancel: () => void;
  user: User | null;
}

export default function NewsForm({ initialData, onSave, onCancel }: Readonly<NewsFormProps>) {
  const { t } = useTranslation();
  const {
    form,
    contentFileInputRef,
    uploading,
    uploadError,
    translating,
    handleImageUpload,
    handleContentImageUpload,
    handleTranslate,
  } = useNewsForm(initialData);

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form;

  const title = watch('title');
  const titleEn = watch('title_en');
  const content = watch('content');
  const contentEn = watch('content_en');

  const saveButtonLabel = initialData?.id
    ? t('admin.news.form.save')
    : t('admin.news.form.publish');

  return (
    <div className="news-form-container">
      <div
        className="news-header"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
            fontWeight: 900,
            color: '#fff',
          }}
        >
          {initialData?.id ? t('admin.news.edit_title') : t('admin.news.create_title')}
        </h3>
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          style={{ borderRadius: '12px', height: '42px', flex: '1 1 auto', minWidth: '120px' }}
        >
          {t('admin.news.cancel')}
        </button>
      </div>

      <div
        className="poll-active-card"
        style={{ padding: '3rem', maxWidth: '100%', borderRadius: '32px' }}
      >
        <div className="modal-accent-line"></div>
        <form onSubmit={handleSubmit(onSave)} className="news-form-grid">
          <NewsSpanishFields
            form={form}
            contentFileInputRef={contentFileInputRef}
            translating={translating}
            uploading={uploading}
            onTranslateTitle={() => handleTranslate(title, 'en', 'title_en')}
            onTranslateContent={() => handleTranslate(content, 'en', 'content_en')}
            onContentImageUpload={handleContentImageUpload}
          />

          <NewsEnglishFields
            form={form}
            translating={translating}
            uploading={uploading}
            uploadError={uploadError}
            onTranslateTitle={() => handleTranslate(titleEn ?? '', 'es', 'title')}
            onTranslateContent={() => handleTranslate(contentEn ?? '', 'es', 'content')}
            onImageUpload={handleImageUpload}
          />

          <div
            className="news-form-footer"
            style={{
              gridColumn: '1 / -1',
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '2.5rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              className="modal-btn-secondary"
              style={{ flex: '1 1 auto', minWidth: '140px', height: '54px', padding: '0 2rem' }}
            >
              {t('admin.news.cancel')}
            </button>
            <button
              type="submit"
              className="modal-btn-primary"
              style={{ flex: '1 1 auto', minWidth: '140px', height: '54px', padding: '0 2rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="spin" /> : saveButtonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
