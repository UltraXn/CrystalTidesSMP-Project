import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserDefinition } from './types';
import { UserTableRow } from './UserTableRow';
import Loader from '../../UI/Loader';

interface UsersTableProps {
  users: UserDefinition[];
  loading: boolean;
  hasSearched: boolean;
  canManageRoles: boolean;
  onEditMedals: (user: UserDefinition) => void;
  onEditAchievements: (user: UserDefinition) => void;
  onRoleChange: (userId: string, role: string) => void;
}

export default function UsersTable({
  users,
  loading,
  hasSearched,
  canManageRoles,
  onEditMedals,
  onEditAchievements,
  onRoleChange,
}: Readonly<UsersTableProps>) {
  const { t } = useTranslation();

  return (
    <div
      className="admin-table-container"
      style={{ overflow: 'visible', background: 'transparent', border: 'none' }}
    >
      <table
        className="admin-table users-table-responsive"
        style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}
      >
        <thead>
          <tr>
            <th
              style={{
                background: 'transparent',
                border: 'none',
                paddingLeft: '1.5rem',
                color: '#666',
              }}
            >
              {t('admin.users.table.user')}
            </th>
            <th
              className="th-mobile-hide"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
              }}
            >
              {t('admin.users.table.id')}
            </th>
            <th
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
              }}
            >
              {t('admin.users.table.role')}
            </th>
            <th
              className="th-mobile-hide"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
              }}
            >
              {t('admin.users.gamification')}
            </th>
            {canManageRoles && (
              <th
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#666',
                }}
              >
                {t('admin.users.table.change_role')}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <UserTableRow
              key={u.id}
              user={u}
              canManageRoles={canManageRoles}
              onEditMedals={onEditMedals}
              onEditAchievements={onEditAchievements}
              onRoleChange={onRoleChange}
            />
          ))}
        </tbody>
      </table>
      {/* Empty states */}
      {users.length === 0 && hasSearched && !loading && (
        <div
          style={{
            padding: '4rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Search size={48} opacity={0.2} />
          <div>{t('admin.users.no_results')}</div>
        </div>
      )}
      {users.length === 0 && !hasSearched && (
        <div
          style={{
            padding: '4rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={24} opacity={0.5} />
          </div>
          <div>{t('admin.users.initial_msg')}</div>
        </div>
      )}
      {loading && (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
          <Loader style={{ height: 'auto', minHeight: '100px' }} />
        </div>
      )}
    </div>
  );
}
