import { CATEGORY_TABS } from './types';

interface CatalogCategoryTabsProps {
  selectedTab: string;
  tabCounts: Record<string, number>;
  onSelectTab: (tabId: string) => void;
}

export default function CatalogCategoryTabs({
  selectedTab,
  tabCounts,
  onSelectTab,
}: CatalogCategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por categoría"
      className="scrollbar-none flex items-center gap-2.5 overflow-x-auto pb-2"
    >
      {CATEGORY_TABS.map((tab) => {
        const Icon = tab.icon;
        const isSelected = selectedTab === tab.id;
        const count = tabCounts[tab.id] || 0;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls="wiki-results-grid"
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex shrink-0 cursor-pointer items-center gap-2.5 rounded-2xl border px-5 py-3 text-xs font-black transition-colors duration-300 sm:text-sm ${
              isSelected
                ? `bg-linear-to-r ${tab.activeBg} ${tab.color} ${tab.borderColor} scale-102 shadow-[0_0_20px_rgba(20,184,166,0.15)]`
                : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Icon
              size={16}
              aria-hidden="true"
              className={`transition-transform group-hover:scale-110 ${isSelected ? tab.color : 'text-slate-500 group-hover:text-white'}`}
            />
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-black tabular-nums ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-slate-500 group-hover:text-slate-300'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
