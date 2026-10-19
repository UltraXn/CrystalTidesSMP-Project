import { Maximize2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Lazy3DContainer from '../UI/Lazy3DContainer';
import { type EntityCard3DConfig, useEntityCard3D } from './useEntityCard3D';

export interface EntityCard3DAccent {
  /** Spinner ring classes, e.g. `border-emerald-500/30 border-t-emerald-500`. */
  spinner: string;
  /** Loading label text color. */
  label: string;
  /** Control button border, text and hover classes. */
  button: string;
}

interface EntityCard3DViewportProps {
  config: EntityCard3DConfig;
  accent: EntityCard3DAccent;
  showControls?: boolean;
}

function EntityCard3DScene({ config, accent, showControls }: Readonly<EntityCard3DViewportProps>) {
  const { t } = useTranslation();
  const { containerRef, isLoading, resetView, toggleFullscreen } = useEntityCard3D(config);
  const resetLabel = t('wiki.viewer3d.reset_camera', 'Reiniciar cámara');
  const fullscreenLabel = t('wiki.viewer3d.fullscreen', 'Pantalla completa');
  const buttonClassName = `cursor-pointer rounded-lg border bg-black/60 p-1.5 transition-colors ${accent.button}`;

  return (
    <>
      {isLoading && (
        <div className="backdrop-blur-xs absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
          <div className={`mb-2 size-6 animate-spin rounded-full border-2 ${accent.spinner}`} />
          <span className={`font-mono text-[9px] uppercase tracking-widest ${accent.label}`}>
            {t('wiki.viewer3d.loading_model', 'Cargando 3D...')}
          </span>
        </div>
      )}

      <div ref={containerRef} className="absolute inset-0 z-10 size-full" />

      {showControls && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={resetView}
            aria-label={resetLabel}
            className={buttonClassName}
            title={resetLabel}
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreenLabel}
            className={buttonClassName}
            title={fullscreenLabel}
          >
            <Maximize2 aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      )}
    </>
  );
}

/** Entity 3D viewport that only holds a WebGL context while it is near the screen. */
export function EntityCard3DViewport(props: Readonly<EntityCard3DViewportProps>) {
  return (
    <Lazy3DContainer className="absolute inset-0 size-full">
      <EntityCard3DScene {...props} />
    </Lazy3DContainer>
  );
}
