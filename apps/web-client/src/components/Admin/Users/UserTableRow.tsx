import { UserDefinition } from './types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserGamificationCell } from './UserGamificationCell';
import { UserRoleCell } from './UserRoleCell';

const CELL_BORDER = '1px solid rgba(255,255,255,0.05)';

function getUserInitial(user: { username?: string; email?: string }): string {
  const name = user.username || user.email || '?';
  return name[0]?.toUpperCase() ?? '?';
}

interface UserTableRowProps {
  user: UserDefinition;
  canManageRoles: boolean;
  onEditMedals: (user: UserDefinition) => void;
  onEditAchievements: (user: UserDefinition) => void;
  onRoleChange: (userId: string, role: string) => void;
}

export function UserTableRow({
  user: u,
  canManageRoles,
  onEditMedals,
  onEditAchievements,
  onRoleChange,
}: Readonly<UserTableRowProps>) {
  return (
    <tr
      className="user-table-row"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        transition: 'transform 0.2s',
        cursor: 'default',
      }}
    >
      <td
        className="user-cell-main"
        aria-label={u.username || u.email}
        style={{
          border: CELL_BORDER,
          borderRight: 'none',
          borderRadius: '16px 0 0 16px',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              minWidth: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
              overflow: 'hidden',
            }}
          >
            {u.avatar_url ? (
              <img
                src={u.avatar_url}
                alt={u.username}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerText = getUserInitial(u);
                }}
              />
            ) : (
              getUserInitial(u)
            )}
          </div>
          <div style={{ flex: '1', minWidth: '0' }}>
            <div
              style={{
                fontWeight: '800',
                color: '#fff',
                fontSize: '1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {u.username || u.email.split('@')[0]}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)',
                marginTop: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {u.email}
            </div>
          </div>
        </div>
      </td>
      <td
        className="th-mobile-hide"
        style={{
          border: CELL_BORDER,
          borderLeft: 'none',
          borderRight: 'none',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.3)',
            background: 'rgba(0,0,0,0.3)',
            padding: '4px 8px',
            borderRadius: '6px',
          }}
        >
          {u.id.substring(0, 8)}...
        </span>
      </td>
      <td
        className="user-cell-role"
        style={{
          border: CELL_BORDER,
          borderLeft: 'none',
          borderRight: 'none',
          minWidth: '120px',
        }}
      >
        <UserRoleBadge role={u.role || 'user'} />
      </td>
      <UserGamificationCell
        user={u}
        onEditMedals={onEditMedals}
        onEditAchievements={onEditAchievements}
      />
      {canManageRoles && <UserRoleCell user={u} onRoleChange={onRoleChange} />}
    </tr>
  );
}
