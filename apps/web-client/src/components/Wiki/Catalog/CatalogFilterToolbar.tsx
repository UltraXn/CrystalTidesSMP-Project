import { Search, X } from 'lucide-react';

interface CatalogFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  mods: string[];
  selectedTab: string;
  selectedMod: string;
  onSelectMod: (mod: string) => void;
  total3DCount: number;
  getModCount: (modName: string) => number;
}

const ACTIVE_MOD_CHIP_CLASS =
  'border-teal-400 bg-teal-500 font-black text-slate-950 shadow-md shadow-teal-500/20';
const INACTIVE_MOD_CHIP_CLASS =
  'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white';

export default function CatalogFilterToolbar({
  searchTerm,
  onSearchChange,
  onClearSearch,
  mods,
  selectedTab,
  selectedMod,
  onSelectMod,
  total3DCount,
  getModCount,
}: Readonly<CatalogFilterToolbarProps>) {
  return (
    <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg backdrop-blur-xl md:flex-row md:items-center">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search
          size={18}
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          aria-label="Buscar por nombre, mod, hábitat, ataque o recompensa"
          placeholder="Buscar por nombre, mod, hábitat, ataque o recompensa..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-11 pr-10 text-sm font-medium text-white placeholder-slate-500 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={onClearSearch}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 hover:text-white"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Mod Chips */}
      {mods.length > 0 && selectedTab !== 'guias_generales' && (
        <fieldset
          aria-label="Filtrar por mod"
          className="m-0 flex items-center gap-2 overflow-x-auto border-none p-0 pb-1 md:pb-0"
        >
          <span className="mr-1 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Mod:
          </span>
          <button
            type="button"
            aria-pressed={selectedMod === 'all'}
            onClick={() => onSelectMod('all')}
            className={`shrink-0 cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
              selectedMod === 'all' ? ACTIVE_MOD_CHIP_CLASS : INACTIVE_MOD_CHIP_CLASS
            }`}
          >
            Todos ({total3DCount})
          </button>
          {mods.map((modName) => {
            const isSelected = selectedMod === modName;
            const count = getModCount(modName);

            return (
              <button
                key={modName}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectMod(modName)}
                className={`shrink-0 cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                  isSelected ? ACTIVE_MOD_CHIP_CLASS : INACTIVE_MOD_CHIP_CLASS
                }`}
              >
                {modName} ({count})
              </button>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
