import { Globe, Gamepad2, Shield, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AuditFiltersProps {
  filterSource: string;
  onFilterChange: (source: string) => void;
  totalCount: number;
  currentCount: number;
}

export function AuditFilters({
  filterSource,
  onFilterChange,
  totalCount,
  currentCount,
}: AuditFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="audit-filters-bar">
      <div
        className="filter-group"
        role="group"
        aria-label={t('admin.audit.filter_by_source', 'Filtrar por origen')}
      >
        <Filter size={16} aria-hidden="true" />
        <button
          type="button"
          aria-pressed={filterSource === 'all'}
          className={`filter-btn ${filterSource === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          {t('admin.audit.source_all')}
        </button>
        <button
          type="button"
          aria-pressed={filterSource === 'web'}
          className={`filter-btn ${filterSource === 'web' ? 'active' : ''}`}
          onClick={() => onFilterChange('web')}
        >
          <Globe size={14} aria-hidden="true" /> {t('admin.audit.source_web')}
        </button>
        <button
          type="button"
          aria-pressed={filterSource === 'game'}
          className={`filter-btn ${filterSource === 'game' ? 'active' : ''}`}
          onClick={() => onFilterChange('game')}
        >
          <Gamepad2 size={14} aria-hidden="true" /> {t('admin.audit.source_game')}
        </button>
        <button
          type="button"
          aria-pressed={filterSource === 'security-auditor'}
          className={`filter-btn ${filterSource === 'security-auditor' ? 'active' : ''}`}
          onClick={() => onFilterChange('security-auditor')}
        >
          <Shield size={14} aria-hidden="true" /> {t('admin.audit.source_security-auditor')}
        </button>
      </div>

      <output className="pagination-summary" aria-live="polite">
        {t('admin.audit.showing', { count: currentCount, total: totalCount })}
      </output>
    </div>
  );
}
