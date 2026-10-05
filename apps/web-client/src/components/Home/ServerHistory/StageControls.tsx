import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Stage } from './types';

interface StageControlsProps {
  stages: Stage[];
  activeStage: number;
  handleStageChange: (index: number) => void;
}

function getProgressDotClass(idx: number, activeStage: number): string {
  if (idx === activeStage) {
    return 'w-6 bg-cyan-400';
  }
  if (idx < activeStage) {
    return 'w-2 bg-cyan-800';
  }
  return 'w-2 bg-white/20';
}

export function StageControls({
  stages,
  activeStage,
  handleStageChange,
}: Readonly<StageControlsProps>) {
  return (
    <div className="relative z-10 mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleStageChange(Math.max(0, activeStage - 1))}
          disabled={activeStage === 0}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 transition-colors duration-200 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Etapa Anterior
        </button>
        <button
          type="button"
          onClick={() => handleStageChange(Math.min(stages.length - 1, activeStage + 1))}
          disabled={activeStage === stages.length - 1}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 transition-colors duration-200 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          Siguiente Etapa <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>Progreso de la era:</span>
        <div className="flex gap-1.5">
          {stages.map((stageItem, idx) => (
            <button
              key={stageItem.id}
              type="button"
              onClick={() => handleStageChange(idx)}
              className={`h-2 rounded-full transition-[width,background-color] duration-300 ${getProgressDotClass(idx, activeStage)}`}
              aria-label={`Ir a etapa ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
