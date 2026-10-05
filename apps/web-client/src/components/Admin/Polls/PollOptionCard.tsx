import { Loader2, Languages, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PollOptionItem } from './usePollForm';

interface PollOptionCardProps {
  option: PollOptionItem;
  index: number;
  canDelete: boolean;
  onUpdate: (index: number, field: 'label' | 'labelEn', value: string) => void;
  onRemove: (index: number) => void;
  onTranslate: (text: string, targetField: string, index?: number) => void;
  isTranslating: boolean;
}

export function PollOptionCard({
  option,
  index,
  canDelete,
  onUpdate,
  onRemove,
  onTranslate,
  isTranslating,
}: Readonly<PollOptionCardProps>) {
  const { t } = useTranslation();

  return (
    <div className="poll-option-edit-card">
      <div className="poll-option-index" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {index + 1}
      </div>

      <div className="poll-option-inputs">
        <input
          aria-label={`${t('admin.polls.form_extras.option_es', 'Opción en español')} ${index + 1}`}
          className="admin-input-premium"
          value={option.label}
          onChange={(e) => onUpdate(index, 'label', e.target.value)}
          placeholder={t('admin.polls.form_extras.option_es')}
          required
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            aria-label={`${t('admin.polls.form_extras.option_en', 'Opción en inglés')} ${index + 1}`}
            className="admin-input-premium"
            value={option.labelEn}
            onChange={(e) => onUpdate(index, 'labelEn', e.target.value)}
            placeholder={t('admin.polls.form_extras.option_en')}
          />
          <button
            aria-label={`Traducir opción ${index + 1}`}
            type="button"
            onClick={() => onTranslate(option.label, 'options', index)}
            className="btn-secondary"
            style={{ padding: '0 1rem', borderRadius: '12px' }}
            disabled={isTranslating}
          >
            {isTranslating ? <Loader2 className="spin" /> : <Languages size={18} />}
          </button>
        </div>
      </div>

      {canDelete && (
        <button
          type="button"
          aria-label={`${t('admin.polls.form_extras.delete_option', 'Eliminar opción')} ${index + 1}`}
          onClick={() => onRemove(index)}
          className="poll-btn-action delete"
          style={{ height: '42px' }}
          title={t('admin.polls.form_extras.delete_option')}
        >
          <X />
        </button>
      )}
    </div>
  );
}
