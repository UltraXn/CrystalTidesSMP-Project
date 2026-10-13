import MinecraftAvatar from '../../UI/MinecraftAvatar';
import { StaffCardData } from './types';

interface StaffFormPreviewProps {
  formData: StaffCardData;
  getRoleBadge: (roleName: string) => string | null | undefined;
  previewNameFallback: string;
  previewRoleFallback: string;
}

export function StaffFormPreview({
  formData,
  getRoleBadge,
  previewNameFallback,
  previewRoleFallback,
}: Readonly<StaffFormPreviewProps>) {
  const badge = getRoleBadge(formData.role);

  return (
    <div className="staff-form-preview">
      <div
        className="staff-avatar-ring"
        style={{ borderColor: formData.color, boxShadow: `0 0 30px ${formData.color}30` }}
      >
        <div className="staff-avatar-content">
          <MinecraftAvatar
            src={formData.image ?? formData.mc_nickname ?? formData.name}
            alt="Preview"
            size={120}
          />
        </div>
      </div>
      <div className="staff-preview-info">
        <div className="preview-name">{formData.name || previewNameFallback}</div>
        {badge ? (
          <div className="preview-badge-wrapper">
            <img src={badge} alt={formData.role} />
          </div>
        ) : (
          <div
            className="staff-role-badge"
            style={{ color: formData.color, background: `${formData.color}15` }}
          >
            {formData.role || previewRoleFallback}
          </div>
        )}
      </div>
    </div>
  );
}
