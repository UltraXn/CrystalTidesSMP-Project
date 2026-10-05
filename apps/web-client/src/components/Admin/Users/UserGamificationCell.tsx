import { Medal, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserDefinition } from './types';

const CELL_BORDER = '1px solid rgba(255,255,255,0.05)';

interface UserGamificationCellProps {
  user: UserDefinition;
  onEditMedals: (user: UserDefinition) => void;
  onEditAchievements: (user: UserDefinition) => void;
}

export function UserGamificationCell({
  user: u,
  onEditMedals,
  onEditAchievements,
}: Readonly<UserGamificationCellProps>) {
  const { t } = useTranslation();
  const hasMedals = (u.medals?.length ?? 0) > 0;
  const hasAchievements = (u.achievements?.length ?? 0) > 0;

  return (
    <td
      className="th-mobile-hide"
      aria-label={t('admin.users.medals_achievements', 'Medallas y Logros')}
      style={{
        border: CELL_BORDER,
        borderLeft: 'none',
        borderRight: 'none',
      }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
        <button
          type="button"
          onClick={() => onEditMedals(u)}
          style={{
            background: hasMedals ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            border: hasMedals
              ? '1px solid rgba(251, 191, 36, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            color: hasMedals ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)',
            borderRadius: '10px',
            padding: '0.4rem 0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
          className="hover-lift"
        >
          <Medal size={14} /> {u.medals?.length || 0} {t('admin.users.medals', 'Medallas')}
        </button>
        <button
          type="button"
          onClick={() => onEditAchievements(u)}
          style={{
            background: hasAchievements ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            border: hasAchievements
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            color: hasAchievements ? '#10b981' : 'rgba(255, 255, 255, 0.4)',
            borderRadius: '10px',
            padding: '0.4rem 0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
          className="hover-lift"
        >
          <Trophy size={14} /> {u.achievements?.length || 0}{' '}
          {t('admin.users.achievements', 'Logros')}
        </button>
      </div>
    </td>
  );
}
