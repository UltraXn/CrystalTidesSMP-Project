import React from 'react';
import type { ScreenItem } from './screenShowcaseData';
import { ScreenIcon } from './ScreenIcon';

export interface ScreenSelectorStripProps {
  screens: ScreenItem[];
  activeScreen: number;
  onSelectScreen: (index: number) => void;
}

export const ScreenSelectorStrip: React.FC<Readonly<ScreenSelectorStripProps>> = ({
  screens,
  activeScreen,
  onSelectScreen,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {screens.map((s, idx) => {
        const isActive = activeScreen === idx;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectScreen(idx)}
            aria-label={s.title}
            className={`flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
              isActive
                ? 'border-teal-500/50 bg-[#130b1e] shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/30'
                : 'hover:bg-white/3 border-white/10 bg-[#09050e]/90 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-mono text-[11px] font-bold ${isActive ? 'text-teal-400' : 'text-slate-500'}`}
              >
                {s.num}
              </span>
              <span
                className={`rounded-lg p-1.5 ${isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-white/5 text-slate-400'}`}
              >
                <ScreenIcon iconName={s.iconName} />
              </span>
            </div>
            <div>
              <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {s.title.split('&')[0]}
              </div>
              <div className="truncate text-[10px] text-slate-500">{s.subtitle}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
