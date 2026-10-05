import { Loader2, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PollBasicFieldsProps {
  title: string;
  setTitle: (val: string) => void;
  titleEn: string;
  setTitleEn: (val: string) => void;
  question: string;
  setQuestion: (val: string) => void;
  questionEn: string;
  setQuestionEn: (val: string) => void;
  onTranslate: (text: string, targetField: string) => void;
  translatingField: string | null;
}

export function PollBasicFields({
  title,
  setTitle,
  titleEn,
  setTitleEn,
  question,
  setQuestion,
  questionEn,
  setQuestionEn,
  onTranslate,
  translatingField,
}: Readonly<PollBasicFieldsProps>) {
  const { t } = useTranslation();

  return (
    <>
      <div className="poll-form-row">
        <div className="form-group">
          <label htmlFor="poll-title-es" className="admin-label-premium">
            {t('admin.polls.form_extras.title_es')}
          </label>
          <input
            id="poll-title-es"
            className="admin-input-premium"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('admin.polls.form.title_ph')}
            required
          />
        </div>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="poll-title-en" className="admin-label-premium">
              {t('admin.polls.form_extras.title_en')}
            </label>
            <button
              type="button"
              onClick={() => onTranslate(title, 'title')}
              className="btn-secondary"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', marginBottom: '0.5rem' }}
              disabled={translatingField === 'title'}
            >
              {translatingField === 'title' ? (
                <Loader2 className="spin" />
              ) : (
                <>
                  <Languages /> {t('admin.polls.form_extras.translate')}
                </>
              )}
            </button>
          </div>
          <input
            id="poll-title-en"
            className="admin-input-premium"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="Poll Title"
          />
        </div>
      </div>

      <div className="poll-form-row">
        <div className="form-group">
          <label htmlFor="poll-question-es" className="admin-label-premium">
            {t('admin.polls.form_extras.question_es')}
          </label>
          <textarea
            id="poll-question-es"
            className="admin-textarea-premium"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('admin.polls.form.question_ph')}
            required
            rows={3}
          ></textarea>
        </div>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="poll-question-en" className="admin-label-premium">
              {t('admin.polls.form_extras.question_en')}
            </label>
            <button
              type="button"
              onClick={() => onTranslate(question, 'question')}
              className="btn-secondary"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', marginBottom: '0.5rem' }}
              disabled={translatingField === 'question'}
            >
              {translatingField === 'question' ? (
                <Loader2 className="spin" />
              ) : (
                <>
                  <Languages /> {t('admin.polls.form_extras.translate')}
                </>
              )}
            </button>
          </div>
          <textarea
            id="poll-question-en"
            className="admin-textarea-premium"
            value={questionEn}
            onChange={(e) => setQuestionEn(e.target.value)}
            placeholder="Poll Question"
            rows={3}
          ></textarea>
        </div>
      </div>
    </>
  );
}
