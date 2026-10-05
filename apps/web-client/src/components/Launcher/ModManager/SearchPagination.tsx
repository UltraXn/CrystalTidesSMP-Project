import React, { useMemo } from 'react';

const CONSTANTS = {
  SPACE_BETWEEN: 'space-between',
  ACCENT_VAR: 'var(--accent)',
  INPUT_TRANSITION:
    'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
} as const;

interface SearchPaginationProps {
  currentPage: number;
  totalResults: number;
  pageSize: number;
  isSearching: boolean;
  onPageChange: (newPage: number) => void;
}

export const SearchPagination: React.FC<Readonly<SearchPaginationProps>> = ({
  currentPage,
  totalResults,
  pageSize,
  isSearching,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  const pageButtons = useMemo(() => {
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - (maxButtons - 1));
    }
    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: CONSTANTS.INPUT_TRANSITION,
    fontSize: 13,
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: CONSTANTS.SPACE_BETWEEN,
        padding: '20px 0',
        borderTop: '1.5px solid rgba(255, 255, 255, 0.03)',
        marginTop: 16,
      }}
    >
      <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.45)' }}>
        Página {currentPage} de {totalPages} ({totalResults} resultados)
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isSearching}
          className="pressable"
          style={navBtnStyle(currentPage === 1 || isSearching)}
          title="Primera página"
        >
          «
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isSearching}
          className="pressable"
          style={navBtnStyle(currentPage === 1 || isSearching)}
          title="Página anterior"
        >
          ‹
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {pageButtons.map((p) => {
            const isCurrent = p === currentPage;
            return (
              <button
                aria-label={`Ir a página ${p}`}
                aria-current={isCurrent ? 'page' : undefined}
                type="button"
                key={`page-${p}`}
                onClick={() => onPageChange(p)}
                disabled={isSearching}
                className="pressable"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: isCurrent
                    ? '1px solid var(--accent)'
                    : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: isCurrent
                    ? 'rgba(45, 212, 191, 0.12)'
                    : 'rgba(255,255,255,0.02)',
                  color: isCurrent ? CONSTANTS.ACCENT_VAR : 'rgba(255,255,255,0.75)',
                  fontSize: 13,
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: CONSTANTS.INPUT_TRANSITION,
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isSearching}
          className="pressable"
          style={navBtnStyle(currentPage === totalPages || isSearching)}
          title="Página siguiente"
        >
          ›
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || isSearching}
          className="pressable"
          style={navBtnStyle(currentPage === totalPages || isSearching)}
          title="Última página"
        >
          »
        </button>
      </div>
    </div>
  );
};
