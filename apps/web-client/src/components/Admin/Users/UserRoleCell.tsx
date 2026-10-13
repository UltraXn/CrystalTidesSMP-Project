import { useTranslation } from 'react-i18next';
import { UserDefinition } from './types';

const CELL_BORDER = '1px solid rgba(255,255,255,0.05)';

interface UserRoleCellProps {
  user: UserDefinition;
  onRoleChange: (userId: string, role: string) => void;
}

export function UserRoleCell({ user: u, onRoleChange }: Readonly<UserRoleCellProps>) {
  const { t } = useTranslation();

  return (
    <td
      className="user-cell-actions"
      style={{
        border: CELL_BORDER,
        borderLeft: 'none',
        borderRadius: '0 16px 16px 0',
        paddingRight: '1.25rem',
      }}
    >
      <div style={{ position: 'relative' }}>
        <select
          aria-label={t('admin.users.select_role', `Rol para ${u.username ?? 'usuario'}`)}
          className="admin-select-premium"
          style={{
            padding: '0.6rem 2.5rem 0.6rem 1rem',
            fontSize: '0.85rem',
            minWidth: '140px',
            width: '100%',
            backgroundPosition: 'right 0.8rem center',
          }}
          value={u.role ?? 'user'}
          onChange={(e) => onRoleChange(u.id, e.target.value)}
        >
          <option value="neroferno">{t('account.roles.neroferno')}</option>
          <option value="killu">{t('account.roles.killu')}</option>
          <option value="developer">{t('account.roles.developer')}</option>
          <option value="admin">{t('account.roles.admin')}</option>
          <option value="moderator">{t('account.roles.moderator', 'Moderator')}</option>
          <option value="helper">{t('account.roles.helper')}</option>
          <option value="staff">{t('account.roles.staff', 'Staff')}</option>
          <option value="founder">{t('account.roles.founder')}</option>
          <option value="donor">{t('account.roles.donor')}</option>
          <option value="user">{t('account.roles.user')}</option>
        </select>
      </div>
    </td>
  );
}
