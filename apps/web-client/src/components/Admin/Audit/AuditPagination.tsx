import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function computePageRange(page: number, totalPages: number, maxButtons = 5): number[] {
  let startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, Math.max(1, startPage + maxButtons - 1));

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
}

interface AuditPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AuditPagination({ page, totalPages, onPageChange }: AuditPaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const pages = computePageRange(page, totalPages);

  return (
    <nav
      className="audit-pagination"
      aria-label={t('common.pagination', 'Paginación de registros')}
    >
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="pagination-btn"
        aria-label={t('common.previous', 'Página anterior')}
        title={t('common.previous')}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      <div className="pagination-pages">
        {pages.map((p) => (
          <button
            type="button"
            key={p}
            aria-label={t('common.page_number', { defaultValue: `Página ${p}`, page: p })}
            aria-current={page === p ? 'page' : undefined}
            className={`page-num ${page === p ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="pagination-btn"
        aria-label={t('common.next', 'Página siguiente')}
        title={t('common.next')}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}
