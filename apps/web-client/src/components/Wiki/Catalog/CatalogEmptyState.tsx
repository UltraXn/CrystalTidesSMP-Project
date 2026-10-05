import { Search } from 'lucide-react';

interface CatalogEmptyStateProps {
  onResetFilters: () => void;
}

export default function CatalogEmptyState({ onResetFilters }: CatalogEmptyStateProps) {
  return (
    <output
      aria-live="polite"
      className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/40 p-8 py-20 text-center backdrop-blur-xl"
    >
      <Search size={52} aria-hidden="true" className="mb-4 text-slate-600" />
      <h3 className="mb-2 text-xl font-bold text-white">No se encontraron criaturas o guías</h3>
      <p className="mb-6 max-w-sm text-xs text-slate-400">
        Prueba buscando con otros términos o seleccionando otra categoría en los filtros superiores.
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="cursor-pointer rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-teal-500/20 transition-colors hover:bg-teal-400"
      >
        Restablecer Filtros
      </button>
    </output>
  );
}
