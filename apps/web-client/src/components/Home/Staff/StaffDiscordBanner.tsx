import React from 'react';
import { m as motion } from 'framer-motion';
import { MessageSquare, Sparkles, Hash, ExternalLink } from 'lucide-react';
import { DISCORD_CHANNELS } from './staffData';

interface StaffDiscordBannerProps {
  activeChannelIdx: number;
  setActiveChannelIdx: (idx: number) => void;
}

export const StaffDiscordBanner: React.FC<Readonly<StaffDiscordBannerProps>> = ({
  activeChannelIdx,
  setActiveChannelIdx,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-linear-to-r relative mx-auto mt-16 max-w-6xl overflow-hidden rounded-3xl border border-[#5865F2]/30 from-[#5865F2]/20 via-slate-900/90 to-[#5865F2]/10 p-8 text-left shadow-2xl backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#5865F2]/30 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        {/* Left Column: Discord Info & Direct Button */}
        <div className="space-y-4 lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5865F2]/40 bg-[#5865F2]/20 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-[#7289da]">
            <MessageSquare className="size-3.5" />
            Comunidad Oficial de Discord
          </div>

          <h3 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
            La Pecerita de los Killufishies <Sparkles className="size-5 text-amber-400" />
          </h3>

          <p className="text-sm/relaxed text-gray-300">
            Forma parte del servidor de Discord de <strong>CrystalTides SMP</strong>: conversa en
            vivo con el staff, revisa notas de parches, solicita soporte técnico y comparte tus
            creaciones artísticas.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-4 py-2">
              <div className="size-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <span className="text-xs font-bold text-white">Comunidad Activa & Soporte 24/7</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://discord.com/invite/TDmwYNnvyT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-[#5865F2] px-8 py-4 text-xs font-black uppercase tracking-widest text-white no-underline shadow-xl shadow-[#5865F2]/25 transition-colors duration-300 hover:scale-105 hover:bg-[#4752C4]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Unirme al Discord Oficial <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Real Discord Channels Tab Widget */}
        <div className="rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-xl lg:col-span-6">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300">
              <Hash className="size-3.5 text-[#5865F2]" /> Canales Destacados en Vivo
            </span>
            <span className="rounded-md border border-[#5865F2]/30 bg-[#5865F2]/20 px-2 py-0.5 text-[10px] font-bold text-[#7289da]">
              #discord.gg/crystaltides
            </span>
          </div>

          {/* Channels Grid Tabs */}
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DISCORD_CHANNELS.map((ch, idx) => (
              <button
                aria-label="Action"
                type="button"
                key={ch.name}
                onClick={() => setActiveChannelIdx(idx)}
                className={`flex cursor-pointer items-center gap-1.5 truncate rounded-xl border px-3 py-2 text-left font-mono text-xs font-bold transition-colors ${
                  activeChannelIdx === idx
                    ? 'scale-[1.02] border-[#5865F2] bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/30'
                    : 'border-white/5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-gray-400">#</span>
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>

          {/* Active Channel Details Box */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-slate-950/80 p-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-[#7289da]">
                #{DISCORD_CHANNELS[activeChannelIdx].name}
              </span>
            </div>
            <p className="text-xs/relaxed italic text-gray-300">
              &quot;{DISCORD_CHANNELS[activeChannelIdx].desc}&quot;
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
