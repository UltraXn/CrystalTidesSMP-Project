import { Plus, Edit2, X, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Rule } from '../../../hooks/useAdminData';
import { RuleGeneralFields } from './RuleGeneralFields';
import { RuleContentFields } from './RuleContentFields';

const JUSTIFY_SPACE_BETWEEN = 'space-between';

interface RuleFormModalProps {
  editingRule: Rule | null;
  formData: Partial<Rule>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Rule>>>;
  saving: boolean;
  translatingField: string | null;
  onCancel: () => void;
  onSave: () => void;
  onTranslate: (
    text: string,
    toLang: 'es' | 'en',
    field: 'title' | 'content' | 'title_en' | 'content_en',
  ) => void;
}

export function RuleFormModal({
  editingRule,
  formData,
  setFormData,
  saving,
  translatingField,
  onCancel,
  onSave,
  onTranslate,
}: Readonly<RuleFormModalProps>) {
  const { t } = useTranslation();

  return (
    <dialog
      open
      aria-labelledby="rules-editor-dialog-title"
      className="z-1000 fixed inset-0 flex size-full items-center justify-center border-none bg-transparent p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onCancel}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          border: 'none',
          width: '100%',
          height: '100%',
          cursor: 'default',
        }}
      />
      <div
        className="admin-card"
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2rem',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: JUSTIFY_SPACE_BETWEEN,
            alignItems: 'center',
          }}
        >
          <h4
            id="rules-editor-dialog-title"
            style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {editingRule ? (
              <>
                <Edit2 size={18} /> {t('admin.settings.rules.edit_title')}
              </>
            ) : (
              <>
                <Plus size={18} /> {t('admin.settings.rules.new_title')}
              </>
            )}
          </h4>
          <button
            aria-label={t('common.close', 'Cerrar ventana')}
            type="button"
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <RuleGeneralFields formData={formData} setFormData={setFormData} />

        <RuleContentFields
          formData={formData}
          setFormData={setFormData}
          translatingField={translatingField}
          onTranslate={onTranslate}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={onCancel}
            className="modal-btn-secondary"
            style={{ height: '48px', padding: '0 1.5rem' }}
          >
            {t('admin.settings.rules.cancel_btn', 'Cancelar')}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="modal-btn-primary"
            style={{
              height: '48px',
              padding: '0 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            disabled={saving}
          >
            <Save size={18} />{' '}
            {saving
              ? t('admin.settings.saving', 'Guardando...')
              : t('admin.settings.rules.save_btn', 'Guardar Regla')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
