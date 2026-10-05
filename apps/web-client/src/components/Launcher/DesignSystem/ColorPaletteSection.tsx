import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { COLOR_PALETTE } from './types';

export const ColorPaletteSection: React.FC = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1800);
  };

  return (
    <div className="grid grid-cols-1 gap-5 duration-300 animate-in fade-in sm:grid-cols-2 lg:grid-cols-3">
      {COLOR_PALETTE.map((c) => (
        <button
          type="button"
          key={c.hex}
          onClick={() => copyHex(c.hex)}
          className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#0c0714] p-5 text-left shadow-xl transition-colors duration-300 hover:border-teal-500/40"
        >
          <div className="mb-4 flex items-center justify-between">
            <div
              className="size-14 rounded-xl border border-white/15 shadow-inner transition-transform group-hover:scale-105"
              style={{ backgroundColor: c.hex }}
            />
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase text-slate-300">
              {c.tag}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm font-bold text-white transition-colors group-hover:text-teal-300">
              <span>{c.name}</span>
              <span className="flex items-center gap-1 font-mono text-xs text-slate-400">
                {c.hex}
                {copiedColor === c.hex ? (
                  <Check className="size-3 text-teal-400" />
                ) : (
                  <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </span>
            </div>
            <p className="text-xs/snug text-slate-400">{c.role}</p>
          </div>

          {/* Bottom Subtle Gradient Indicator */}
          <div
            className="absolute inset-x-0 bottom-0 h-1 opacity-40 transition-opacity group-hover:opacity-100"
            style={{ backgroundColor: c.hex }}
          />
        </button>
      ))}
    </div>
  );
};
