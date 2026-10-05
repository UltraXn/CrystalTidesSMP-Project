import React from 'react';
import { Edit2, Plus, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorldLocation, LocationAuthor } from '../../../services/locationService';
import { LocationAuthorsSection } from './LocationAuthorsSection';

const LABEL_STYLE = {
  display: 'block',
  marginBottom: '0.8rem',
  color: 'rgba(255,255,255,0.7)',
  fontSize: '0.9rem',
  fontWeight: '700',
} as const;

interface LocationEditorFormProps {
  editingId: number | null;
  formData: Partial<WorldLocation>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<WorldLocation>>>;
  newAuthor: LocationAuthor;
  setNewAuthor: React.Dispatch<React.SetStateAction<LocationAuthor>>;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onAddAuthor: () => void;
  onRemoveAuthor: (idx: number) => void;
}

export function LocationEditorForm({
  editingId,
  formData,
  setFormData,
  newAuthor,
  setNewAuthor,
  saving,
  onSave,
  onCancel,
  onAddAuthor,
  onRemoveAuthor,
}: Readonly<LocationEditorFormProps>) {
  const { t } = useTranslation();

  return (
    <div className="admin-card editor-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: '800',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {editingId ? (
            <>
              <Edit2 style={{ color: '#facc15' }} />{' '}
              {t('locations_manager.edit_title', 'Editar Registro')}
            </>
          ) : (
            <>
              <Plus style={{ color: 'var(--accent)' }} />{' '}
              {t('locations_manager.create_title', 'Nuevo Registro')}
            </>
          )}
        </h4>
        <button
          aria-label={t('common.close', 'Cerrar formulario de localización')}
          type="button"
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
          }}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="form-grid">
        <div className="input-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="location-title" style={LABEL_STYLE}>
                {t('locations_manager.form.title', 'Título de la Localización')}
              </label>
              <input
                id="location-title"
                className="admin-input-premium"
                value={formData.title ?? ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('locations_manager.form.title_ph', 'Ej: Gran Biblioteca de Cristal')}
                style={{ width: '100%', padding: '1rem' }}
              />
            </div>
            <div>
              <label htmlFor="location-coords" style={LABEL_STYLE}>
                {t('locations_manager.form.coords', 'Coordenadas')}
              </label>
              <input
                id="location-coords"
                className="admin-input-premium"
                value={formData.coords ?? ''}
                onChange={(e) => setFormData({ ...formData, coords: e.target.value })}
                placeholder={t('locations_manager.form.coords_ph', '0, 64, 0')}
                style={{ width: '100%', padding: '1rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="location-image" style={LABEL_STYLE}>
                {t('locations_manager.form.image', 'URL de la Imagen')}
              </label>
              <input
                id="location-image"
                className="admin-input-premium"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                style={{ width: '100%', padding: '1rem' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="location-sort-order" style={LABEL_STYLE}>
                  {t('locations_manager.form.order', 'Orden')}
                </label>
                <input
                  id="location-sort-order"
                  type="number"
                  className="admin-input-premium"
                  value={formData.sort_order ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: Number.parseInt(e.target.value, 10) || 0,
                    })
                  }
                  style={{ width: '100%', padding: '1rem' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: formData.is_coming_soon
                      ? 'rgba(76, 175, 80, 0.1)'
                      : 'rgba(255,255,255,0.03)',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: formData.is_coming_soon
                      ? '1px solid rgba(76, 175, 80, 0.2)'
                      : '1px solid rgba(255,255,255,0.05)',
                    width: '100%',
                    height: '50px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: formData.is_coming_soon ? '#4ade80' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {t('locations_manager.secret', 'Secret?')}
                  </span>
                  <label
                    className="switch"
                    htmlFor="location-secret-toggle"
                    style={{ transform: 'scale(0.8)' }}
                  >
                    <input
                      id="location-secret-toggle"
                      type="checkbox"
                      checked={formData.is_coming_soon ?? false}
                      aria-label={t('locations_manager.secret', 'Secret?')}
                      onChange={(e) =>
                        setFormData({ ...formData, is_coming_soon: e.target.checked })
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="location-description" style={LABEL_STYLE}>
            {t('locations_manager.form.desc', 'Descripción Corta (Resumen)')}
          </label>
          <input
            id="location-description"
            className="admin-input-premium"
            value={formData.description ?? ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '1rem' }}
          />
        </div>

        <div>
          <label htmlFor="location-lore" style={LABEL_STYLE}>
            {t('locations_manager.form.lore', 'Historia / Lore Detallado')}
          </label>
          <textarea
            id="location-lore"
            className="admin-textarea-premium"
            rows={5}
            value={formData.long_description ?? ''}
            onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
            style={{ width: '100%', padding: '1.2rem', borderRadius: '16px' }}
          />
        </div>

        {/* Authors Section */}
        <LocationAuthorsSection
          authors={formData.authors}
          newAuthor={newAuthor}
          setNewAuthor={setNewAuthor}
          onAddAuthor={onAddAuthor}
          onRemoveAuthor={onRemoveAuthor}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '1rem 2rem',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontWeight: '700',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          {t('admin.locations.form.cancel', 'Cancelar')}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="modal-btn-primary hover-lift"
          style={{
            padding: '1rem 3rem',
            borderRadius: '16px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {saving ? (
            t('admin.locations.form.saving', 'Guardando...')
          ) : (
            <>
              <Save /> {t('admin.locations.form.save', 'Guardar Registro')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
