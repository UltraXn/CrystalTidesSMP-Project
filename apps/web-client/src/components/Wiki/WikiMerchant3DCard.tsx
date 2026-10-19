import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ShoppingBag, Coins, Store, Shield, Compass, MapPin } from 'lucide-react';
import { EntityCard3DViewport, type EntityCard3DAccent } from './EntityCard3DViewport';

export interface WikiMerchant3DCardProps {
  minimal3dOnly?: boolean;
  modelPath?: string;
  bossName?: string;
  subtitle?: string;
  hp?: string;
  currency?: string;
  location?: string;
  description?: string;
  trades?: string[];
}

const DEFAULT_TRADES = ['Semillas Raras', 'Señuelos Míticos', 'Ingredientes de Alquimia'];

const MERCHANT_ACCENT: EntityCard3DAccent = {
  spinner: 'border-amber-500/30 border-t-amber-500',
  label: 'text-amber-400',
  button: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/20',
};

export const WikiMerchant3DCard: React.FC<Readonly<WikiMerchant3DCardProps>> = ({
  minimal3dOnly = false,
  modelPath = '/models/ribbits/ribbit_merchant.gltf',
  bossName = 'Merchant Ribbit',
  subtitle = 'Mercader Ambulante',
  hp = '30 HP (Protegido)',
  currency = 'KilluCoins (KC) / Esmeraldas',
  location = 'Pantanos, Ríos y Aldeas',
  description = 'Comerciante itinerante de la raza Ribbit que ofrece semillas exóticas y artefactos de pesca.',
  trades = DEFAULT_TRADES,
}) => {
  const viewportConfig = {
    modelPath,
    dirLightColor: 0xf59e0b,
    dirLightIntensity: 2.0,
    pointLightColor: 0x8b5cf6,
    pointLightIntensity: 1.5,
    fallbackColor: 0xf59e0b,
    fallbackEmissive: 0xd97706,
    roughness: 0.6,
    metalness: 0.1,
  };

  if (minimal3dOnly) {
    return (
      <div className="bg-radial relative flex size-full min-h-80 cursor-grab items-center justify-center overflow-hidden rounded-2xl border border-amber-500/20 from-amber-950/20 via-black to-black active:cursor-grabbing">
        <EntityCard3DViewport config={viewportConfig} accent={MERCHANT_ACCENT} />
      </div>
    );
  }

  return (
    <div className="my-1 w-full">
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-[#120e06]/90 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 items-stretch gap-0 lg:grid-cols-12">
          {/* 3D Viewport Column */}
          <section
            aria-label="Visualizador 3D Mercader"
            className="min-h-95 bg-radial relative flex size-full cursor-grab items-center justify-center overflow-hidden border-b border-amber-500/20 from-amber-950/30 via-black to-black outline-none focus:outline-none active:cursor-grabbing lg:col-span-5 lg:border-b-0 lg:border-r"
          >
            <EntityCard3DViewport config={viewportConfig} accent={MERCHANT_ACCENT} showControls />
          </section>

          {/* Stats & Description Column */}
          <div className="flex flex-col justify-between space-y-3 p-5 lg:col-span-7">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400">
                <ShoppingBag className="size-3" /> Ribbits & Traders • {subtitle}
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
                  <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                    <Coins className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Moneda de Cambio
                    </div>
                    <div className="text-[11px] font-bold text-amber-300">{currency}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-400">
                    <Store className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Especialidad de Tienda
                    </div>
                    <div className="text-[11px] font-bold text-white">
                      Mercader de Pantano & Ríos
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-400">
                    <Shield className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Resistencia NPC
                    </div>
                    <div className="text-[11px] font-bold text-white">{hp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                    <Compass className="size-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Disponibilidad
                    </div>
                    <div className="text-[11px] font-bold text-white">Encuentro Frecuente</div>
                  </div>
                </div>
              </div>

              {/* Trade Catalogue Sheet */}
              <div className="mb-3 space-y-2 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    <ShoppingBag size={13} /> Catálogo de Intercambio Offered
                  </div>
                  <span className="font-mono text-[9px] text-gray-400">Tienda de Aldea</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trades.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-amber-200"
                    >
                      🪙 {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  <MapPin size={12} /> Ubicación de Encuentro
                </div>
                <p className="text-[10px] font-medium leading-tight text-gray-300">
                  <strong className="text-white">Ubicación:</strong> {location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiMerchant3DCard;
