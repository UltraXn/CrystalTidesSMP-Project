import React from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import type { ScreenItem } from './screenShowcaseData';

export const ScreenDetailMockup: React.FC<
  Readonly<{ current: ScreenItem; activeScreen: number }>
> = ({ current, activeScreen }) => {
  return (
    <div className="space-y-4 rounded-2xl border border-white/15 bg-[#07030a]/90 p-4 shadow-2xl sm:p-6">
      {/* Mockup Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-500/80" />
            <div className="size-2.5 rounded-full bg-amber-500/80" />
            <div className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-slate-400">
            CrystalTides Client • {current.title}
          </span>
        </div>
        <span className="rounded-sm border border-teal-500/20 bg-teal-950/60 px-2 py-0.5 font-mono text-[10px] text-teal-400">
          60 FPS
        </span>
      </div>

      {/* Mockup Specific Renderers depending on active screen */}
      {activeScreen === 0 && (
        <div className="space-y-4 pt-1">
          <div className="bg-linear-to-r flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-500/20 from-teal-950/40 via-purple-950/30 to-black p-4">
            <div>
              <div className="text-xs text-slate-400">Buenos días,</div>
              <div className="text-base font-black text-white">AlexGamer99 👑</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase text-teal-400">
                mc.crystaltidesSMP.net
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
                <span>142 Jugadores en línea</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-[#0f081b] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-bold text-white">
                <Download className="size-3.5 text-teal-400" />
                DESCARGANDO ACTUALIZACIÓN (Fabric 1.21.3)
              </span>
              <span className="font-mono font-bold text-teal-300">84.2 MB / 112.5 MB (75%)</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-900 p-0.5">
              <div className="bg-linear-to-r h-full w-3/4 animate-pulse rounded-full from-teal-400 to-purple-500" />
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-400">
              <span>Velocidad: 18.4 MB/s</span>
              <span>Delta Sync SHA-256 Verificado</span>
            </div>
          </div>
        </div>
      )}

      {activeScreen === 1 && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-linear-to-br space-y-2 rounded-xl border border-purple-500/30 from-purple-900/30 to-black p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-purple-300">Snapshot</span>
              <span className="rounded-sm bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold text-purple-300">
                26.1
              </span>
            </div>
            <div className="text-2xl font-black text-white">26.1.1</div>
            <div className="text-[11px] text-slate-400">Future Snapshot • Fabric</div>
          </div>

          <div className="bg-linear-to-br space-y-2 rounded-xl border border-teal-500/40 from-teal-900/30 to-black p-3.5 ring-1 ring-teal-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-teal-300">Recomendado</span>
              <span className="rounded-sm bg-teal-500/20 px-2 py-0.5 text-[9px] font-bold text-teal-300">
                1.21
              </span>
            </div>
            <div className="text-2xl font-black text-white">1.21.3</div>
            <div className="text-[11px] font-semibold text-teal-300">CrystalTides SMP • Fabric</div>
          </div>
        </div>
      )}

      {activeScreen === 2 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
            <span className="font-bold text-white">Sodium 0.6.2 (Optimization)</span>
            <span className="rounded-sm bg-teal-500/10 px-2 py-0.5 font-mono text-[10px] text-teal-400">
              ACTIVO
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
            <span className="font-bold text-white">Iris Shaders 1.8.0</span>
            <span className="rounded-sm bg-teal-500/10 px-2 py-0.5 font-mono text-[10px] text-teal-400">
              ACTIVO
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
            <span className="font-bold text-white">Cloth Config v15</span>
            <span className="rounded-sm bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              INACTIVO
            </span>
          </div>
        </div>
      )}

      {activeScreen === 3 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/40 p-4">
          <div className="flex size-24 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-950/30 text-3xl shadow-inner">
            🧙‍♂️
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="text-xs font-bold text-white">Capa Oficial CrystalTides 2026</div>
            <div className="text-[11px] text-teal-400">Estado: Equipada en Servidor</div>
            <div className="font-mono text-[10px] text-slate-400">
              Shader Preset: High Ultra (PBR)
            </div>
          </div>
        </div>
      )}

      {activeScreen === 4 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between rounded-lg border border-teal-500/20 bg-teal-500/10 p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-teal-400" />
              <span className="font-bold text-white">172px</span>
            </div>
            <span className="font-mono text-[10px] text-teal-300">En CrystalTides SMP 💎</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-purple-400" />
              <span className="font-bold text-white">daaaavidds</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">En el Launcher</span>
          </div>
        </div>
      )}

      {activeScreen === 5 && (
        <div className="space-y-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400">
            <AlertTriangle className="size-4" />
            <span>Cierre Inesperado Detectado (Exit Code: 255)</span>
          </div>
          <div className="rounded-sm border border-red-500/20 bg-black/50 p-2 font-mono text-[11px] text-slate-300">
            Causa sospechosa: Lithium (lithium-fabric-mc1.21.3.jar)
          </div>
          <div className="flex justify-end gap-2 text-[10px]">
            <span className="rounded-sm bg-teal-500 px-2.5 py-1 font-bold text-slate-950">
              Reiniciar Juego
            </span>
            <span className="rounded-sm bg-white/10 px-2.5 py-1 font-bold text-white">
              Copiar Log
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
