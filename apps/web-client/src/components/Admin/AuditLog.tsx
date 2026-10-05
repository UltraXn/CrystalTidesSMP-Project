import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Loader from '../UI/Loader';
import { AuditLogProps } from './Audit/types';
import { AuditFilters } from './Audit/AuditFilters';
import { AuditTable } from './Audit/AuditTable';
import { AuditPagination } from './Audit/AuditPagination';
import { useAuditLogState } from './Audit/useAuditLogState';

interface HistoryProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

function History({ size = 24, ...props }: HistoryProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="m12 7 0 5 3 3" />
    </svg>
  );
}

export default function AuditLog(props: AuditLogProps = {}) {
  const { t } = useTranslation();
  const {
    filterSource,
    handleFilterChange,
    page,
    setPage,
    search,
    setSearch,
    loading,
    logs,
    totalCount,
    totalPages,
  } = useAuditLogState(props);

  return (
    <div className="audit-log-container">
      <div className="audit-log-header">
        <div>
          <h3>{t('admin.audit.title')}</h3>
          <p>{t('admin.audit.subtitle')}</p>
        </div>

        <div className="audit-log-controls">
          <div className="audit-search-box">
            <Search size={18} aria-hidden="true" />
            <input
              aria-label={t('admin.audit.search_placeholder', 'Buscar por usuario o acción')}
              type="text"
              placeholder={t('admin.audit.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <AuditFilters
        filterSource={filterSource}
        onFilterChange={handleFilterChange}
        totalCount={totalCount}
        currentCount={logs.length}
      />

      {loading && (
        <div className="audit-loading-state">
          <Loader />
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="audit-empty-state">
          <div className="empty-icon-circle">
            <History size={48} aria-hidden="true" />
          </div>
          <h4>{t('admin.audit.no_logs_found')}</h4>
          <p>{t('admin.audit.try_adjust_filters')}</p>
        </div>
      )}

      {!loading && logs.length > 0 && <AuditTable logs={logs} />}

      <AuditPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
