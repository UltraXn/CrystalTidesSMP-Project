import React from 'react';
import type { TranslateFn } from './rulesData';
import { CategoryIcon } from './CategoryIcon';

export interface RulesFilterBarProps {
  categories: string[];
  activeFilter: string | null;
  onSelectCategory: (category: string | null) => void;
  allLabel: string;
  t: TranslateFn;
}

export const RulesFilterBar: React.FC<Readonly<RulesFilterBarProps>> = ({
  categories,
  activeFilter,
  onSelectCategory,
  allLabel,
  t,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={`rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
          activeFilter === null
            ? 'bg-(--accent) shadow-(--accent)/20 scale-105 text-black shadow-lg'
            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        {allLabel}
      </button>

      {categories.map((cat) => {
        const isActive = activeFilter === cat;

        return (
          <button
            type="button"
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
              isActive
                ? 'scale-105 bg-white text-black shadow-lg shadow-white/10'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CategoryIcon category={cat} size={14} />
            <span>{t(`rules.categories.${cat.toLowerCase()}`, cat)}</span>
          </button>
        );
      })}
    </div>
  );
};
