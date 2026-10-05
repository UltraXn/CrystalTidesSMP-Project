import React from 'react';
import { RotateCcw, Maximize2, Flame } from 'lucide-react';
import { BossPhaseData, BossAttack } from './defaultBossData';
import { BossCardTheme } from './bossCardTheme';
import { useBossCard3D } from './useBossCard3D';

interface BossCardViewport3DProps {
  activeModel: string;
  themeStyles: BossCardTheme;
  activePhases: BossPhaseData[];
  selectedPhase: number;
  onSwitchPhase: (phaseNum: number) => void;
  cardWrapperRef: React.RefObject<HTMLDivElement | null>;
  selectedAttack: BossAttack | null;
  activeClipOverride?: string | null;
}

export function BossCardViewport3D({
  activeModel,
  themeStyles,
  activePhases,
  selectedPhase,
  onSwitchPhase,
  cardWrapperRef,
  selectedAttack,
  activeClipOverride,
}: Readonly<BossCardViewport3DProps>) {
  const {
    containerRef,
    isLoading,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    toggleFullscreen,
  } = useBossCard3D({
    activeModel,
    themeStyles,
    cardWrapperRef,
    selectedAttack,
    activeClipOverride,
  });

  return (
    <div
      role="application"
      aria-label="Visualizador 3D interactivo"
      tabIndex={0}
      className={`min-h-115 relative flex size-full cursor-grab items-center justify-center overflow-hidden border-b border-white/5 focus:outline-none active:cursor-grabbing lg:col-span-5 lg:border-b-0 lg:border-r ${themeStyles.viewportBg}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onKeyDown={(e) => {
        if (e.key === 'r' || e.key === 'R' || e.key === 'Home') {
          resetView();
        }
      }}
    >
      {isLoading && (
        <div className="backdrop-blur-xs absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
          <div className="mb-2 size-6 animate-spin rounded-full border-2 border-neutral-600 border-t-white" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Cargando 3D...
          </span>
        </div>
      )}

      <div ref={containerRef} className="absolute inset-0 z-10 size-full" />

      {activePhases.length > 1 && (
        <div className="absolute left-3 top-3 z-20 flex max-w-[85%] flex-wrap gap-2">
          {activePhases.map((phase) => (
            <button
              type="button"
              key={`phase-tab-${phase.phase_number}`}
              aria-pressed={selectedPhase === phase.phase_number}
              onClick={(e) => {
                e.stopPropagation();
                onSwitchPhase(phase.phase_number);
              }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                selectedPhase === phase.phase_number
                  ? themeStyles.activePhaseBtn
                  : 'border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Flame aria-hidden="true" className="size-3.5 text-neutral-400" />
              <span>{phase.phase_name || `Fase ${phase.phase_number}`}</span>
              {phase.hp && (
                <span className="font-mono text-[9px] tabular-nums text-neutral-500">
                  ({phase.hp})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            resetView();
          }}
          aria-label="Reiniciar cámara 360°"
          className="cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900/80 p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          title="Reiniciar Cámara 360°"
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          aria-label="Pantalla completa 3D"
          className="cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900/80 p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          title="Pantalla Completa 3D"
        >
          <Maximize2 aria-hidden="true" className="size-3.5" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-20">
        <span className="rounded-sm border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          Arrastra para rotar 360°
        </span>
      </div>
    </div>
  );
}
