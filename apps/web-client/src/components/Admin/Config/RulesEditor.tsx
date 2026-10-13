import { Plus, FileOutput, FileInput } from 'lucide-react';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { useRulesEditor } from './useRulesEditor';
import { RuleFormModal } from './RuleFormModal';
import { RuleGroupCard } from './RuleGroupCard';

const JUSTIFY_SPACE_BETWEEN = 'space-between';

export default function RulesEditor() {
  const { t } = useTranslation();

  const {
    groupedRules,
    loading,
    saving,
    isCreating,
    editingRule,
    formData,
    setFormData,
    deleteConfirmId,
    setDeleteConfirmId,
    translatingField,
    handleTranslate,
    handleSave,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleCancel,
    startCreate,
    handleExport,
    handleImport,
  } = useRulesEditor();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        {t('admin.settings.rules.loading', 'Cargando reglas del servidor...')}
      </div>
    );
  }

  const categories = Object.keys(groupedRules);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: JUSTIFY_SPACE_BETWEEN,
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
            {t('admin.settings.rules.title_editor', 'Editor de Reglas del Servidor')}
          </h3>
          <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            {t(
              'admin.settings.rules.desc_editor',
              'Gestiona las normativas que se muestran en /reglas',
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExport}
            className="modal-btn-secondary"
            style={{
              height: '48px',
              padding: '0 1.5rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            title={t('admin.settings.rules.export_title')}
          >
            <FileOutput size={18} /> {t('admin.settings.rules.export_btn', 'Exportar')}
          </button>
          <label
            className="modal-btn-secondary"
            style={{
              height: '48px',
              padding: '0 1.5rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
            title={t('admin.settings.rules.import_title')}
          >
            <FileInput size={18} /> {t('admin.settings.rules.import_btn', 'Importar')}
            <input
              aria-label={t('admin.settings.rules.import_btn', 'Importar normativas')}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          {!isCreating && (
            <button
              type="button"
              onClick={startCreate}
              className="modal-btn-primary"
              style={{
                height: '48px',
                padding: '0 1.5rem',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Plus size={18} /> {t('admin.settings.rules.new_rule', 'Nueva Regla')}
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {isCreating && (
        <RuleFormModal
          editingRule={editingRule}
          formData={formData}
          setFormData={setFormData}
          saving={saving}
          translatingField={translatingField}
          onCancel={handleCancel}
          onSave={handleSave}
          onTranslate={handleTranslate}
        />
      )}

      {/* Rules List grouped by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {categories.length === 0 ? (
          <div
            className="admin-card"
            style={{
              background: 'rgba(15, 15, 20, 0.4)',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '3rem',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem' }}>
              {t(
                'admin.settings.rules.no_rules',
                'No hay reglas definidas. Crea la primera regla.',
              )}
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <RuleGroupCard
              key={category}
              category={category}
              categoryRules={groupedRules[category] ?? []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deleteConfirmId}
        title={t('admin.settings.rules.confirm_delete_title', 'Confirmar Eliminación')}
        message={t(
          'admin.settings.rules.confirm_delete_msg',
          '¿Estás seguro de que quieres eliminar esta regla?',
        )}
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmId(null)}
        isDanger={true}
      />
    </div>
  );
}
