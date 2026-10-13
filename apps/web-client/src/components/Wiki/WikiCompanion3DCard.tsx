import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Heart,
  Smile,
  Shield,
  Compass,
  MapPin,
  Sparkles,
  Gift,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { useEntityCard3D } from './useEntityCard3D';

export interface WikiCompanion3DCardProps {
  minimal3dOnly?: boolean;
  modelPath?: string;
  bossName?: string;
  subtitle?: string;
  hp?: string;
  speed?: string;
  location?: string;
  description?: string;
  tamingItems?: string[];
  drops?: string[];
}

const DEFAULT_TAMING_ITEMS = ['Bamboo', 'Sweet Berries'];
const DEFAULT_DROPS = ['Bamboo', 'Cuero Suave'];

export const WikiCompanion3DCard: React.FC<Readonly<WikiCompanion3DCardProps>> = ({
  minimal3dOnly = false,
  modelPath = '/models/critters/red_panda.gltf',
  bossName = 'Red Panda',
  subtitle = 'Fauna Domésticable',
  hp = '20 HP (10 Corazones)',
  speed = '0.30 (Pasivo)',
  location = 'Bosques Templados & Selvas',
  description = 'Criatura dócil y juguetona que puede ser domesticada como mascota fiel.',
  tamingItems = DEFAULT_TAMING_ITEMS,
  drops = DEFAULT_DROPS,
}) => {
  const { containerRef, isLoading, resetView, toggleFullscreen } = useEntityCard3D({
    modelPath,
    dirLightColor: 0x10b981,
    dirLightIntensity: 2.0,
    pointLightColor: 0x06b6d4,
    pointLightIntensity: 1.5,
    fallbackColor: 0x10b981,
    fallbackEmissive: 0x059669,
  });

  if (minimal3dOnly) {
    return (
      <div className="bg-radial relative flex size-full min-h-80 cursor-grab items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/20 from-emerald-950/20 via-black to-black active:cursor-grabbing">
        {isLoading && (
          <div className="backdrop-blur-xs absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
            <div className="mb-2 size-6 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">
              Cargando 3D...
            </span>
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0 z-10 size-full" />
      </div>
    );
  }

  return (
    <div className="my-1 w-full">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#06100c]/90 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 items-stretch gap-0 lg:grid-cols-12">
          {/* 3D Viewport Column */}
          <div className="min-h-95 bg-radial relative flex size-full cursor-grab items-center justify-center overflow-hidden border-b border-emerald-500/20 from-emerald-950/30 via-black to-black outline-none focus:outline-none active:cursor-grabbing lg:col-span-5 lg:border-b-0 lg:border-r">
            {isLoading && (
              <div className="backdrop-blur-xs absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
                <div className="mb-2 size-6 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">
                  Cargando 3D...
                </span>
              </div>
            )}

            <div ref={containerRef} className="absolute inset-0 z-10 size-full" />

            {/* Controls */}
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetView}
                aria-label="Reiniciar cámara"
                className="cursor-pointer rounded-lg border border-emerald-500/30 bg-black/60 p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/20"
                title="Reiniciar Cámara"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Pantalla completa"
                className="cursor-pointer rounded-lg border border-emerald-500/30 bg-black/60 p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/20"
                title="Pantalla Completa"
              >
                <Maximize2 aria-hidden="true" className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Stats & Description Column */}
          <div className="flex flex-col justify-between space-y-3 p-5 lg:col-span-7">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <Heart className="size-3" /> Critters & Companions • {subtitle}
              </div>

              <h2 className="mb-1 text-xl font-black uppercase tracking-tight text-white">
                {bossName}
              </h2>

              {description && (
                <div className="mb-3 space-y-1.5 text-[11px] font-medium leading-relaxed text-gray-300 [&_p]:mb-1">
                  <ReactMarkdown>{description.replaceAll('\\n', '\n')}</ReactMarkdown>
                </div>
              )}

              {/* Attributes Grid */}
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                    <Heart className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Domesticación
                    </div>
                    <div className="text-[11px] font-bold text-emerald-300">
                      {tamingItems.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-400">
                    <Smile className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Temperamento
                    </div>
                    <div className="text-[11px] font-bold text-white">Pasivo & Dócil (Mascota)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-red-500/10 p-1.5 text-red-400">
                    <Shield className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Salud de Mascota
                    </div>
                    <div className="text-[11px] font-bold text-white">{hp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-400">
                    <Compass className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Marcha & Agilidad
                    </div>
                    <div className="text-[11px] font-bold text-white">{speed}</div>
                  </div>
                </div>
              </div>

              {/* Companion Trait */}
              <div className="mb-2 space-y-1 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  <Sparkles size={12} /> Beneficio de Mascota
                </div>
                <p className="text-[10px] font-medium leading-tight text-gray-300">
                  <strong className="text-white">Domesticable:</strong> Al alimentarlo con su comida
                  favorita, este compañero te seguirá fielmente por CrystalTides.
                </p>
              </div>

              {/* Location */}
              <div className="mb-2 space-y-1 rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  <MapPin size={12} /> Hábitat Natural
                </div>
                <p className="text-[10px] font-medium leading-tight text-gray-300">
                  <strong className="text-white">Ubicación:</strong> {location}
                </p>
              </div>

              {/* Drops */}
              <div>
                <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Gift className="size-3.5 text-emerald-400" /> Drops & Recompensas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {drops.map((drop) => (
                    <span
                      key={drop}
                      className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200"
                    >
                      🐾 {drop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiCompanion3DCard;
