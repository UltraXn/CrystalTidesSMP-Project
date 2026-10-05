import type { SuggestionTypeFilter } from './types';

interface SuggestionFiltersBarProps {
  activeFilter: SuggestionTypeFilter;
  onFilterChange: (filter: SuggestionTypeFilter) => void;
}

const FILTER_OPTIONS: { id: SuggestionTypeFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'General', label: 'General' },
  { id: 'Bug', label: 'Bug' },
  { id: 'Mod', label: 'Mod' },
  { id: 'Complaint', label: 'Queja' },
  { id: 'Poll', label: 'Encuesta' },
];

export default function SuggestionFiltersBar({
  activeFilter,
  onFilterChange,
}: Readonly<SuggestionFiltersBarProps>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_OPTIONS.map((filter) => {
        const isActive = activeFilter === filter.id;
        const btnClass = isActive
          ? 'bg-white text-black font-black shadow-md'
          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5';

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${btnClass}`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
