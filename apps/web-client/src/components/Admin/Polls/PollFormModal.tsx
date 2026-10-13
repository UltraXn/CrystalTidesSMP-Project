import { BarChart3, X, Plus, Loader2, Check } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { Poll } from './types';
import { usePollForm } from './usePollForm';
import { PollOptionCard } from './PollOptionCard';
import { PollBasicFields } from './PollBasicFields';

interface PollFormModalProps {
  onClose: () => void;
  onSubmit: (
    e: React.SyntheticEvent<HTMLFormElement>,
    data: {
      title: string;
      titleEn: string;
      question: string;
      questionEn: string;
      options: { label: string; labelEn: string }[];
      daysDuration: number;
    },
  ) => Promise<void>;
  poll?: Poll | null;
  creating: boolean;
  buttonSuccess: boolean;
  hasActivePoll: boolean;
  onTranslate: (text: string, targetField: string, index?: number) => void;
  translatingField: string | null;
  translatedValues: { title?: string; question?: string; option?: { idx: number; val: string } };
}

export default function PollFormModal({
  onClose,
  onSubmit,
  poll,
  creating,
  buttonSuccess,
  hasActivePoll,
  onTranslate,
  translatingField,
  translatedValues,
}: Readonly<PollFormModalProps>) {
  const { t } = useTranslation();
  const isEdit = !!poll;

  const {
    title,
    setTitle,
    titleEn,
    setTitleEn,
    question,
    setQuestion,
    questionEn,
    setQuestionEn,
    options,
    daysDuration,
    setDaysDuration,
    updateOption,
    removeOption,
    addOption,
    handleSubmit,
  } = usePollForm({ poll, translatedValues, onSubmit });

  const renderSubmitContent = () => {
    if (creating) {
      return <Loader2 className="spin" />;
    }
    if (buttonSuccess) {
      return (
        <>
          <Check /> {t('admin.polls.form.success')}
        </>
      );
    }
    const actionLabel = isEdit
      ? t('admin.polls.form.update', 'Actualizar')
      : t('admin.polls.form.submit');
    return (
      <>
        <Check /> {actionLabel}
      </>
    );
  };

  return (
    <dialog
      open
      aria-labelledby="poll-form-modal-title"
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
      <div className="sync-modal-content poll-modal-content" style={{ maxWidth: '750px' }}>
        <div className="modal-accent-line"></div>

        <div className="poll-form-header">
          <h3
            id="poll-form-modal-title"
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
            <BarChart3 style={{ color: 'var(--accent)' }} aria-hidden="true" />
            {isEdit
              ? t('admin.polls.edit_title', 'Editar Encuesta')
              : t('admin.polls.create_title')}
          </h3>
          <button
            aria-label={t('common.close', 'Cerrar modal')}
            type="button"
            onClick={onClose}
            className="btn-close-mini"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="poll-form-body" style={{ overflowY: 'auto', maxHeight: '75vh' }}>
          <form onSubmit={handleSubmit} className="poll-form-container">
            <PollBasicFields
              title={title}
              setTitle={setTitle}
              titleEn={titleEn}
              setTitleEn={setTitleEn}
              question={question}
              setQuestion={setQuestion}
              questionEn={questionEn}
              setQuestionEn={setQuestionEn}
              onTranslate={onTranslate}
              translatingField={translatingField}
            />

            <div className="form-group">
              <div className="admin-label-premium">{t('admin.polls.form.options')}</div>
              <div className="poll-options-grid">
                {options.map((opt, idx) => (
                  <PollOptionCard
                    key={opt.id}
                    option={opt}
                    index={idx}
                    canDelete={options.length > 2}
                    onUpdate={updateOption}
                    onRemove={removeOption}
                    onTranslate={onTranslate}
                    isTranslating={translatingField === `option-${idx}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="btn-secondary"
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  height: '50px',
                  borderRadius: '16px',
                  fontWeight: '800',
                }}
              >
                <Plus style={{ marginRight: '10px' }} /> {t('admin.polls.form.add_option')}
              </button>
            </div>

            <div className="poll-form-row">
              <div className="form-group">
                <label htmlFor="poll-duration" className="admin-label-premium">
                  {t('admin.polls.form.duration')} ({t('admin.polls.form.days', 'días')})
                </label>
                <input
                  id="poll-duration"
                  className="admin-input-premium"
                  type="number"
                  min="1"
                  max="30"
                  value={daysDuration}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (!raw) {
                      setDaysDuration(1);
                      return;
                    }
                    const val = Number.parseInt(raw, 10);
                    setDaysDuration(Number.isNaN(val) ? 1 : Math.max(1, Math.min(30, val)));
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                {hasActivePoll && !isEdit && (
                  <div
                    style={{
                      background: 'rgba(250, 204, 21, 0.1)',
                      color: '#facc15',
                      padding: '1rem',
                      borderRadius: '14px',
                      border: '1px solid rgba(250, 204, 21, 0.2)',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      lineHeight: '1.4',
                    }}
                  >
                    {t('admin.polls.form.warning_active')}
                  </div>
                )}
              </div>
            </div>

            <div className="poll-form-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ height: '50px', padding: '0 2rem' }}
              >
                {t('admin.polls.form_extras.cancel')}
              </button>
              <button
                type="submit"
                className="modal-btn-primary"
                style={{
                  height: '50px',
                  padding: '0 2.5rem',
                  background: buttonSuccess ? '#22c55e' : '',
                }}
                disabled={creating || buttonSuccess}
              >
                {renderSubmitContent()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}
