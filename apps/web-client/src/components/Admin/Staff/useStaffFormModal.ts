import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StaffCardData } from './types';

const INITIAL_FORM_DATA: StaffCardData = {
  id: 0,
  name: '',
  role: 'Usuario',
  description: '',
  image: '',
  color: '#db7700',
  socials: { twitter: '', discord: '', youtube: '', twitch: '' },
};

export function useStaffFormModal(
  userData: StaffCardData | null,
  isNew: boolean,
  onSave: (data: StaffCardData) => void,
) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<StaffCardData>(() => {
    if (userData) return userData;
    return INITIAL_FORM_DATA;
  });

  const PRESET_ROLES = useMemo(
    () => [
      {
        value: 'Neroferno',
        label: t('admin.staff.roles.neroferno', 'Neroferno'),
        color: '#8b5cf6',
        badge: '/ranks/rank-neroferno.png',
      },
      {
        value: 'Killuwu',
        label: t('admin.staff.roles.killuwu', 'Killuwu'),
        color: '#0ea5e9',
        badge: '/ranks/rank-killu.png',
      },
      {
        value: 'Developer',
        label: t('admin.staff.roles.developer', 'Developer'),
        color: '#ec4899',
        badge: '/ranks/developer.png',
      },
      {
        value: 'Admin',
        label: t('admin.staff.roles.admin', 'Admin'),
        color: '#ef4444',
        badge: '/ranks/admin.png',
      },
      {
        value: 'Moderator',
        label: t('admin.staff.roles.moderator', 'Moderator'),
        color: '#21cb20',
        badge: '/ranks/moderator.png',
      },
      {
        value: 'Helper',
        label: t('admin.staff.roles.helper', 'Helper'),
        color: '#6bfa16',
        badge: '/ranks/helper.png',
      },
      { value: 'Staff', label: 'Staff', color: '#89c606', badge: '/ranks/staff.png' },
      {
        value: 'Usuario',
        label: t('admin.staff.roles.user', 'Usuario'),
        color: '#db7700',
        badge: '/ranks/user.png',
      },
      {
        value: 'Custom',
        label: t('admin.staff.roles.custom', 'Custom'),
        color: '#ffffff',
        badge: null,
      },
    ],
    [t],
  );

  const [lastSyncedId, setLastSyncedId] = useState<string | number | null>(
    () => userData?.id || (isNew ? 'NEW' : null),
  );

  const currentId = userData?.id || (isNew ? 'NEW' : null);

  if (currentId !== lastSyncedId) {
    setLastSyncedId(currentId);
    if (userData) {
      setFormData(userData);
    } else if (isNew) {
      setFormData(INITIAL_FORM_DATA);
    }
  }

  const handleChange = (field: keyof StaffCardData, value: string | number | boolean | object) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (network: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [network]: value },
    }));
  };

  const onRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = PRESET_ROLES.find((r) => r.value === e.target.value);
    if (selectedRole) {
      setFormData((prev) => ({
        ...prev,
        role: selectedRole.value === 'Custom' ? '' : selectedRole.value,
        color: selectedRole.value === 'Custom' ? prev.color : selectedRole.color,
      }));
    } else {
      handleChange('role', e.target.value);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const role = PRESET_ROLES.find((r) => r.value === roleName);
    return role?.badge;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return {
    t,
    formData,
    PRESET_ROLES,
    handleChange,
    handleSocialChange,
    onRoleChange,
    getRoleBadge,
    handleSubmit,
  };
}
