import { Link } from 'react-router';
import { Compass, Users, BookOpen, Sword, Cpu, Flame } from 'lucide-react';

export function Stage2Showcase() {
  return (
    <div className="mt-8 space-y-6">
      {/* HERO BANNER & 3D VIEWER ENTRY */}
      <div className="bg-linear-to-r relative overflow-hidden rounded-2xl border border-cyan-500/30 from-cyan-950/40 via-slate-900/60 to-purple-950/40 p-6 md:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
              <Compass size={14} /> La Frontera Viviente
            </span>
            <h4 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
              CrystalTides SMP v2.0
            </h4>
            <p className="mt-2 text-sm/relaxed text-gray-300">
              Una experiencia multijugador sin precedentes con combate customizado, jefes animados
              en 3D por fases, economía real y un ecosistema social respaldado por tecnología web
              moderna.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a
              href="https://discord.gg/crystaltides"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-linear-to-r flex items-center justify-center gap-2 rounded-xl from-cyan-500 to-blue-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-cyan-500/20 transition-transform duration-200 hover:scale-105 hover:from-cyan-400 hover:to-blue-500"
            >
              <Users size={16} /> Unirse a la Comunidad
            </a>
            <Link
              to="/wiki/bosses"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-gray-300 backdrop-blur-md transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <BookOpen size={16} /> Ver Guía de Jefes
            </Link>
          </div>
        </div>
      </div>

      {/* PILLARS GRID */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md transition-colors duration-300 hover:border-cyan-500/30 hover:bg-black/60">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Sword size={20} />
          </div>
          <h5 className="mt-4 text-sm font-bold text-white">Combate Progresivo</h5>
          <p className="mt-1.5 text-xs/relaxed text-gray-400">
            Árboles de maestrías, armas elementales únicas y un sistema de daño balanceado
            meticulosamente para PvP y PvE.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Combate 3D', 'Maestrías', 'Reliquias'].map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md transition-colors duration-300 hover:border-purple-500/30 hover:bg-black/60">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <Cpu size={20} />
          </div>
          <h5 className="mt-4 text-sm font-bold text-white">Launcher & Infraestructura</h5>
          <p className="mt-1.5 text-xs/relaxed text-gray-400">
            Sincronización de mods en milisegundos construida con Tauri v2 y Rust. Cero
            configuraciones manuales.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Tauri v2', 'Rust Core', 'Auto-Update'].map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md transition-colors duration-300 hover:border-emerald-500/30 hover:bg-black/60">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Flame size={20} />
          </div>
          <h5 className="mt-4 text-sm font-bold text-white">Eventos Dinámicos</h5>
          <p className="mt-1.5 text-xs/relaxed text-gray-400">
            Incursiones mundiales, jefes de servidor con recompensas escaladas y temporadas con
            resets parciales consensuados.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['World Bosses', 'Gacha Web', 'Torneos'].map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
