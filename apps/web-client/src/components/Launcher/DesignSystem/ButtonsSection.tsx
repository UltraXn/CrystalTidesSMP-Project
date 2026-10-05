import React from 'react';
import { Play, RotateCw, Zap } from 'lucide-react';

export const ButtonsSection: React.FC = () => {
  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-[#0c0714] p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Play className="size-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white">Botones & Acciones</h3>
        </div>
        <span className="font-mono text-[10px] uppercase text-slate-400">Glass & Glow</span>
      </div>

      <div className="space-y-3">
        {/* Primary Action Button */}
        <button
          type="button"
          className="bg-linear-to-r flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl from-teal-400 to-teal-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-teal-500/25 transition-colors hover:from-teal-300 hover:to-teal-400 hover:shadow-teal-500/40"
        >
          <Play className="size-4 fill-slate-950" />
          <span>INICIAR JUEGO (1.21.3 FABRIC)</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {/* Secondary Glass */}
          <button
            type="button"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:border-teal-500/30 hover:bg-white/10"
          >
            <RotateCw className="size-3.5 text-teal-400" />
            <span>Cambiar Versión</span>
          </button>

          {/* Danger Button */}
          <button
            type="button"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20"
          >
            <Zap className="size-3.5 text-red-400" />
            <span>Reportar Crash</span>
          </button>
        </div>
      </div>
    </div>
  );
};
