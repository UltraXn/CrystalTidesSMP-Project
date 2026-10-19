import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Skull, AlertTriangle, Shield, Zap, Compass, MapPin, Award, Coins } from 'lucide-react';
import { EntityCard3DViewport, type EntityCard3DAccent } from './EntityCard3DViewport';

export interface WikiHostile3DCardProps {
  minimal3dOnly?: boolean;
  modelPath?: string;
  bossName?: string;
  subtitle?: string;
  hp?: string;
  damage?: string;
  speed?: string;
  location?: string;
  spawnMethod?: string;
  description?: string;
  drops?: string[];
  kcReward?: number;
}

const DEFAULT_DROPS = ['Piel Mítica', 'Diente Infectado'];

const HOSTILE_ACCENT: EntityCard3DAccent = {
  spinner: 'border-red-500/30 border-t-red-500',
  label: 'text-red-400',
  button: 'border-red-500/30 text-red-400 hover:bg-red-500/20',
};

export const WikiHostile3DCard: React.FC<Readonly<WikiHostile3DCardProps>> = ({
  minimal3dOnly = false,
  modelPath = '/models/mythology/chupacabra.gltf',
  bossName = 'Chupacabra',
  subtitle = 'Criatura Hostil Mitológica',
  hp = '40 HP (20 Corazones)',
  damage = '8 HP (Daño Físico)',
  speed = '0.35 (Marcha Agresiva)',
  location = 'Bosques Nocturnos & Cavernas',
  spawnMethod = 'Generación Natural Nocturna',
  description = 'Depredador nocturno sediento de sangre con mandíbulas retráctiles que acecha en la oscuridad.',
  drops = DEFAULT_DROPS,
  kcReward = 150,
}) => {
  const viewportConfig = {
    modelPath,
    dirLightColor: 0xef4444,
    dirLightIntensity: 2.2,
    pointLightColor: 0xf97316,
    pointLightIntensity: 1.5,
    fallbackColor: 0xef4444,
    fallbackEmissive: 0xd97706,
  };

  if (minimal3dOnly) {
    return (
      <div className="bg-radial relative flex size-full min-h-80 cursor-grab items-center justify-center overflow-hidden rounded-2xl border border-red-500/20 from-red-950/30 via-black to-black active:cursor-grabbing">
        <EntityCard3DViewport config={viewportConfig} accent={HOSTILE_ACCENT} />
      </div>
    );
  }

  return (
    <div className="my-1 w-full">
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-[#120606]/90 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 items-stretch gap-0 lg:grid-cols-12">
          {/* 3D Viewport Column */}
          <section
            aria-label="Visualizador 3D Hostil"
            className="min-h-95 bg-radial relative flex size-full cursor-grab items-center justify-center overflow-hidden border-b border-red-500/20 from-red-950/40 via-black to-black outline-none focus:outline-none active:cursor-grabbing lg:col-span-5 lg:border-b-0 lg:border-r"
          >
            <EntityCard3DViewport config={viewportConfig} accent={HOSTILE_ACCENT} showControls />
          </section>

          {/* Stats & Description Column */}
          <div className="flex flex-col justify-between space-y-3 p-5 lg:col-span-7">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-400">
                <Skull className="size-3" /> Mobs of Mythology • {subtitle}
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
                  <div className="rounded-lg bg-orange-500/10 p-1.5 text-orange-400">
                    <AlertTriangle className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Nivel de Amenaza
                    </div>
                    <div className="text-[11px] font-bold text-orange-300">Hostil (Depredador)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-red-500/10 p-1.5 text-red-400">
                    <Shield className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Salud de Combate
                    </div>
                    <div className="text-[11px] font-bold text-white">{hp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                    <Zap className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Poder de Daño
                    </div>
                    <div className="text-[11px] font-bold text-white">{damage}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-400">
                    <Compass className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Velocidad
                    </div>
                    <div className="text-[11px] font-bold text-white">{speed}</div>
                  </div>
                </div>
              </div>

              {/* Location & Spawn */}
              <div className="mb-2 space-y-1 rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  <MapPin size={12} /> Ubicación & Aparición
                </div>
                <p className="text-[10px] font-medium leading-tight text-gray-300">
                  <strong className="text-white">Hábitat:</strong> {location}
                </p>
                <p className="text-[10px] font-medium leading-tight text-gray-300">
                  <strong className="text-white">Aparición:</strong> {spawnMethod}
                </p>
              </div>

              {/* Drops */}
              <div className="mb-2">
                <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Award className="size-3.5 text-amber-400" /> Botín de Caza
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {drops.map((drop) => (
                    <span
                      key={drop}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-gray-200"
                    >
                      <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
                      {drop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Kill Bounty Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400">
                <Coins size={14} />
                <span>Recompensa de Caza</span>
              </div>
              <span className="font-mono text-base font-black text-amber-300">
                +{kcReward.toLocaleString()} KC
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiHostile3DCard;
