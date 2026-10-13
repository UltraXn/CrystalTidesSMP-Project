import { X, Save, UserPen } from 'lucide-react';
import Loader from '../../UI/Loader';
import { StaffCardData } from './types';
import { useStaffFormModal } from './useStaffFormModal';
import { StaffFormPreview } from './StaffFormPreview';
import { StaffSocialInputs } from './StaffSocialInputs';

export type { StaffCardData };

interface StaffFormModalProps {
  userData: StaffCardData | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (data: StaffCardData) => void;
  saving: boolean;
}

export default function StaffFormModal({
  userData,
  isNew,
  onClose,
  onSave,
  saving,
}: Readonly<StaffFormModalProps>) {
  const {
    t,
    formData,
    PRESET_ROLES,
    handleChange,
    handleSocialChange,
    onRoleChange,
    getRoleBadge,
    handleSubmit,
  } = useStaffFormModal(userData, isNew, onSave);

  if (!userData && !isNew) return null;

  return (
    <dialog open aria-labelledby="staff-form-title" className="staff-form-container">
      <div className="staff-form-header">
        <h4 id="staff-form-title">
          <UserPen style={{ marginRight: '8px', color: 'var(--accent)' }} aria-hidden="true" />
          {isNew ? t('admin.staff.form.new_title') : t('admin.staff.form.edit_title')}
          {formData.name && <span className="preview-label">- {formData.name}</span>}
        </h4>
        <button
          aria-label={t('common.close', 'Cerrar modal')}
          type="button"
          onClick={onClose}
          className="btn-close-mini"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="staff-form-grid">
        {/* Left Column: Preview & Avatar */}
        <StaffFormPreview
          formData={formData}
          getRoleBadge={getRoleBadge}
          previewNameFallback={t('admin.staff.form.preview_name')}
          previewRoleFallback={t('admin.staff.form.preview_role')}
        />

        {/* Right Column: Inputs */}
        <div className="staff-form-inputs">
          <div className="full-width">
            <label htmlFor="staff-name" className="admin-label-premium">
              {t('admin.staff.form.name_label')}
            </label>
            <input
              id="staff-name"
              className="admin-input-premium"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={t('admin.staff.form.name_ph')}
            />
          </div>

          <div className="full-width">
            <label htmlFor="staff-mc-nick" className="admin-label-premium">
              Nick MC (Opcional - Para Skin/Status)
            </label>
            <input
              id="staff-mc-nick"
              className="admin-input-premium"
              value={formData.mc_nickname ?? ''}
              onChange={(e) => handleChange('mc_nickname', e.target.value)}
              placeholder="Ej: Neroferno (Dejar vacío si es igual al nombre)"
            />
          </div>

          <div>
            <label htmlFor="staff-role" className="admin-label-premium">
              {t('admin.staff.form.role_label')}
            </label>
            <select
              id="staff-role"
              className="admin-select-premium"
              value={PRESET_ROLES.some((r) => r.value === formData.role) ? formData.role : 'Custom'}
              onChange={onRoleChange}
            >
              {PRESET_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {!PRESET_ROLES.some((r) => r.value === formData.role && r.value !== 'Custom') && (
              <input
                aria-label={t('admin.staff.form.custom_role_ph', 'Rol personalizado')}
                className="admin-input-premium"
                style={{ marginTop: '0.5rem' }}
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder={t('admin.staff.form.custom_role_ph')}
              />
            )}
          </div>

          <div>
            <label htmlFor="staff-color" className="admin-label-premium">
              {t('admin.staff.form.color_label')}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <input
                  id="staff-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                />
              </div>
              <span style={{ color: '#aaa', fontFamily: 'monospace', fontWeight: '800' }}>
                {formData.color.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="full-width">
            <label htmlFor="staff-avatar" className="admin-label-premium">
              {t('admin.staff.form.avatar_label')}
            </label>
            <input
              id="staff-avatar"
              className="admin-input-premium"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder={t('admin.staff.form.avatar_ph', 'Nick de Minecraft o URL de imagen')}
            />
            <div className="input-tip-premium">
              {t(
                'admin.staff.avatar_tip',
                'Usa un Nickname (Premium) o una URL directa al avatar/cabeza.',
              )}
            </div>
          </div>

          <div className="full-width">
            <label htmlFor="staff-bio" className="admin-label-premium">
              {t('admin.staff.form.bio_label')}
            </label>
            <textarea
              id="staff-bio"
              className="admin-textarea-premium"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('admin.staff.form.bio_ph')}
            />
          </div>

          <StaffSocialInputs socials={formData.socials} onChange={handleSocialChange} />

          <div className="staff-form-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('admin.staff.form.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <Loader style={{ width: '20px', height: '20px' }} />
              ) : (
                <>
                  <Save style={{ marginRight: '8px' }} size={16} />{' '}
                  {t('admin.staff.form.save_changes')}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
