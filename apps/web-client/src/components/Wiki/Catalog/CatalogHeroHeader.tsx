import { Sparkles, Flame, Skull, Heart } from 'lucide-react';

interface CatalogHeroHeaderProps {
  totalCount: number;
  bossesCount: number;
  hostilesCount: number;
  peacefulCount: number;
}

export default function CatalogHeroHeader({
  totalCount,
  bossesCount,
  hostilesCount,
  peacefulCount,
}: Readonly<CatalogHeroHeaderProps>) {
  return (
    <div className="bg-linear-to-br relative overflow-hidden rounded-[2.5rem] border border-teal-500/30 from-slate-900/90 via-slate-950/95 to-[#05080c] p-8 shadow-[0_0_50px_rgba(20,184,166,0.1)] backdrop-blur-2xl sm:p-12">
      {/* Background Aura Glows */}
      <div className="pointer-events-none absolute right-1/4 top-0 -mt-20 size-96 rounded-full bg-teal-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 -mb-20 size-80 rounded-full bg-purple-500/10 blur-[90px]" />
      <div className="bg-size-[24px_24px] pointer-events-none absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] opacity-10" />

      <div className="relative z-10 max-w-4xl space-y-5">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-teal-300 shadow-inner">
          <Sparkles size={14} className="animate-spin-slow text-teal-400" />
          <span>Compendio Enciclopédico & Bestiario 3D</span>
        </div>

        <h1 className="text-4xl/tight font-black tracking-tight text-white sm:text-6xl">
          Bestiario & Guías de <br className="hidden sm:block" />
          <span className="bg-linear-to-r from-teal-300 via-cyan-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
            CrystalTides SMP
          </span>
        </h1>

        <p className="max-w-2xl text-base/relaxed font-normal text-slate-300 sm:text-lg">
          Sumérgete en la enciclopedia oficial del reino. Inspecciona modelos 3D interactivos,
          estadísticas de combate en tiempo real, tablas de botín y manuales del servidor.
        </p>

        {/* Metric Quick Badges */}
        <div className="flex flex-wrap gap-4 border-t border-white/10 pt-4 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5">
            <span className="size-2 animate-pulse rounded-full bg-teal-400" aria-hidden="true" />
            <span className="tabular-nums">{totalCount} Entidades Totales</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-red-300">
            <Flame size={14} aria-hidden="true" className="text-red-400" />
            <span className="tabular-nums">{bossesCount} Jefes Supremos</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3.5 py-1.5 text-purple-300">
            <Skull size={14} aria-hidden="true" className="text-purple-400" />
            <span className="tabular-nums">{hostilesCount} Hostiles Míticos</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-emerald-300">
            <Heart size={14} aria-hidden="true" className="text-emerald-400" />
            <span className="tabular-nums">{peacefulCount} Mascotas & Fauna</span>
          </div>
        </div>
      </div>
    </div>
  );
}
