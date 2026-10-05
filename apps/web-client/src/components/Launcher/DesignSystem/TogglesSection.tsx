import React, { useState } from 'react';
import { Sliders, ToggleLeft, ToggleRight } from 'lucide-react';

export const TogglesSection: React.FC = () => {
  const [toggleState1, setToggleState1] = useState(true);
  const [toggleState2, setToggleState2] = useState(false);
  const [toggleState3, setToggleState3] = useState(true);

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-[#0c0714] p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Switches de Mods & Opciones</h3>
        </div>
        <span className="font-mono text-[10px] uppercase text-slate-400">Interactive State</span>
      </div>

      <div className="space-y-3">
        {/* Switch 1 */}
        <button
          type="button"
          onClick={() => setToggleState1(!toggleState1)}
          className="bg-white/2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/5 p-3 text-left transition-colors hover:border-white/15"
        >
          <div>
            <div className="text-xs font-bold text-white">Sodium / Embeddium Engine</div>
            <div className="text-[11px] text-slate-400">
              Optimizador de renderizado y chunks (+140% FPS)
            </div>
          </div>
          {toggleState1 ? (
            <ToggleRight className="size-7 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-transform" />
          ) : (
            <ToggleLeft className="size-7 text-slate-600 transition-transform" />
          )}
        </button>

        {/* Switch 2 */}
        <button
          type="button"
          onClick={() => setToggleState2(!toggleState2)}
          className="bg-white/2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/5 p-3 text-left transition-colors hover:border-white/15"
        >
          <div>
            <div className="text-xs font-bold text-white">Iris Shaders (Sildur's Vibrant)</div>
            <div className="text-[11px] text-slate-400">Soporte nativo para sombreadores PBR</div>
          </div>
          {toggleState2 ? (
            <ToggleRight className="size-7 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-transform" />
          ) : (
            <ToggleLeft className="size-7 text-slate-600 transition-transform" />
          )}
        </button>

        {/* Switch 3 */}
        <button
          type="button"
          onClick={() => setToggleState3(!toggleState3)}
          className="bg-white/2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/5 p-3 text-left transition-colors hover:border-white/15"
        >
          <div>
            <div className="text-xs font-bold text-white">Sincronización Automática en la Nube</div>
            <div className="text-[11px] text-slate-400">
              Respaldo instantáneo de capas y presets
            </div>
          </div>
          {toggleState3 ? (
            <ToggleRight className="size-7 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-transform" />
          ) : (
            <ToggleLeft className="size-7 text-slate-600 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
};
