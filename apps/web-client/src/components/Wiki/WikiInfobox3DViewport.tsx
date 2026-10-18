import { RotateCcw, Sparkles, AlertTriangle } from 'lucide-react';
import { WikiArticle } from '../../services/wikiService';
import { useWikiInfobox3D } from './useWikiInfobox3D';

interface WikiInfobox3DViewportProps {
  article: WikiArticle;
  activePhase: number;
  onPhaseChange: (phase: number) => void;
  hasMultiplePhases: boolean;
}

export function WikiInfobox3DViewport({
  article,
  activePhase,
  onPhaseChange,
  hasMultiplePhases,
}: Readonly<WikiInfobox3DViewportProps>) {
  const modelPath =
    activePhase === 2 && article.model_3d_url_phase_2
      ? article.model_3d_url_phase_2
      : article.model_3d_url;

  const { canvasRef, containerRef, isLoadingModel, modelError, resetRotation } =
    useWikiInfobox3D(modelPath);

  if (!article.model_3d_url) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-inner">
      <div
        ref={containerRef}
        className="h-65 relative flex w-full cursor-grab items-center justify-center focus:outline-none active:cursor-grabbing"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Modelo 3D interactivo de ${article.title}`}
          className="block size-full"
        >
          {article.title}
        </canvas>

        {isLoadingModel && (
          <div className="text-(--accent) absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 backdrop-blur-sm">
            <Sparkles size={24} aria-hidden="true" className="text-(--accent) animate-spin" />
            <span className="text-[11px] font-bold">Invocando Modelo 3D...</span>
          </div>
        )}

        {modelError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-4 text-center text-amber-400">
            <AlertTriangle size={24} aria-hidden="true" />
            <span className="text-xs font-bold">{modelError}</span>
          </div>
        )}

        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={resetRotation}
            aria-label="Restablecer rotación 3D"
            className="hover:text-(--accent) cursor-pointer rounded-lg border border-white/10 bg-black/60 p-1.5 text-xs text-white/70 transition-colors hover:bg-[#168c80]/40"
            title="Restablecer Rotación"
          >
            <RotateCcw size={13} aria-hidden="true" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 font-mono text-[10px] tracking-wider text-white/40">
          Arrastra para rotar 360°
        </div>
      </div>

      {hasMultiplePhases && (
        <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-[#06070b]/90 p-2">
          <button
            type="button"
            aria-pressed={activePhase === 1}
            onClick={() => onPhaseChange(1)}
            className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-black transition-colors ${
              activePhase === 1
                ? 'bg-[#168c80] text-white shadow-md'
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            Fase 1
          </button>
          <button
            type="button"
            aria-pressed={activePhase === 2}
            onClick={() => onPhaseChange(2)}
            className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-black transition-colors ${
              activePhase === 2
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            Fase 2 (Frenesí)
          </button>
        </div>
      )}
    </div>
  );
}
