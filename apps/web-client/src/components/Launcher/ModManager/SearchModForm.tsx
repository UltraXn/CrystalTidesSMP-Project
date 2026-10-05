import React from 'react';

const CONSTANTS = {
  BORDER_LOW_1_5: '1.5px solid var(--border-low)',
  DARK_BG_COLOR: 'rgba(0, 0, 0, 0.25)',
  BOX_BORDER_BOX: 'border-box' as const,
  INPUT_TRANSITION:
    'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
} as const;

interface SearchModFormProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedSource: string;
  selectedSort: string;
  setSelectedSort: (val: string) => void;
  pageSize: number;
  setPageSize: (val: number) => void;
  isSearching: boolean;
  hasResults: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const SearchModForm: React.FC<Readonly<SearchModFormProps>> = ({
  searchQuery,
  setSearchQuery,
  selectedSource,
  selectedSort,
  setSelectedSort,
  pageSize,
  setPageSize,
  isSearching,
  hasResults,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 12,
          border: CONSTANTS.BORDER_LOW_1_5,
          backgroundColor: CONSTANTS.DARK_BG_COLOR,
          padding: '4px 14px',
          height: 44,
          boxSizing: CONSTANTS.BOX_BORDER_BOX,
          transition: CONSTANTS.INPUT_TRANSITION,
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.08)';
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-low)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 16, marginRight: 10 }}>🔍</span>
        <input
          aria-label="Buscar mods por nombre o descripción"
          type="text"
          placeholder={`Buscar mods en ${selectedSource === 'curseforge' ? 'CurseForge' : 'Modrinth'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: 13,
            outline: 'none',
            padding: 0,
            width: '100%',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: CONSTANTS.DARK_BG_COLOR,
          border: CONSTANTS.BORDER_LOW_1_5,
          borderRadius: 12,
          padding: '0 14px',
          height: 44,
          boxSizing: CONSTANTS.BOX_BORDER_BOX,
        }}
      >
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
          Ordenar:
        </span>
        <select
          aria-label="Ordenar resultados de búsqueda"
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          style={{
            width: 'auto',
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: 13,
            outline: 'none',
            cursor: 'pointer',
            padding: '0 24px 0 0',
            height: '100%',
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0 center',
          }}
        >
          <option value="relevance" style={{ backgroundColor: '#0b0d14' }}>
            Relevancia
          </option>
          <option value="downloads" style={{ backgroundColor: '#0b0d14' }}>
            Más Descargados
          </option>
          <option value="updated" style={{ backgroundColor: '#0b0d14' }}>
            Actualizados
          </option>
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: CONSTANTS.DARK_BG_COLOR,
          border: CONSTANTS.BORDER_LOW_1_5,
          borderRadius: 12,
          padding: '0 14px',
          height: 44,
          boxSizing: CONSTANTS.BOX_BORDER_BOX,
        }}
      >
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
          Cantidad:
        </span>
        <select
          aria-label="Cantidad de mods por página"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          style={{
            width: 'auto',
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: 13,
            outline: 'none',
            cursor: 'pointer',
            padding: '0 24px 0 0',
            height: '100%',
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0 center',
          }}
        >
          <option value={10} style={{ backgroundColor: '#0b0d14' }}>
            10
          </option>
          <option value={15} style={{ backgroundColor: '#0b0d14' }}>
            15
          </option>
          <option value={25} style={{ backgroundColor: '#0b0d14' }}>
            25
          </option>
          <option value={50} style={{ backgroundColor: '#0b0d14' }}>
            50
          </option>
        </select>
      </div>

      <button
        aria-label="Buscar mods"
        aria-busy={isSearching}
        type="submit"
        className="btn btn-primary pressable"
        style={{ height: 44, padding: '0 24px' }}
      >
        {isSearching && !hasResults ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
};
