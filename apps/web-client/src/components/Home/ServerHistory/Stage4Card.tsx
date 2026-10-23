import { m as motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Minecraft3DServerRackCanvas } from '../Minecraft3DServerRackCanvas';
import { FloatingItem, StageHeader } from './StageSharedComponents';
import { StageFeatures } from './Stage1Card';
import type { Stage, StageFloatingItem } from './types';

export function Stage4Card({
  stage,
  floatingItems,
}: Readonly<{ stage: Stage; floatingItems: StageFloatingItem[] }>) {
  const { t } = useTranslation();
  return (
    <div className="bg-linear-to-b relative space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#0b1320]/95 p-8 shadow-[0_0_50px_rgba(233,84,32,0.15)] md:p-10">
      <div className="pointer-events-none absolute inset-0 z-0 flex size-full items-center justify-center opacity-100">
        <Minecraft3DServerRackCanvas accentColor={stage.accentColor} />
      </div>
      {floatingItems.map((item, idx) => (
        <FloatingItem key={item.pos} item={item} idx={idx} />
      ))}
      <StageHeader stage={stage} />
      <div className="sm:min-h-70 pointer-events-auto relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
        <div className="max-w-85 z-10 hidden w-fit shrink-0 flex-col gap-3.5 md:flex">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group flex cursor-default items-center gap-3 rounded-2xl border border-[#e95420]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(233,84,32,0.2)] backdrop-blur-xl transition-colors hover:border-[#e95420]"
          >
            <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e95420]/50 bg-slate-900/80 p-1 shadow-md">
              <img
                src="/images/items/Impulse_Command_Block_JE1.png"
                alt="Nuevo Hosting"
                className="size-full object-contain"
              />
            </div>
            <div className="min-w-0 whitespace-nowrap pr-1 text-left">
              <span className="block font-mono text-[9px] font-black uppercase tracking-wider text-[#e95420]">
                {t('history_section.stage4.new_hosting', 'NUEVO HOSTING')}
              </span>
              <h6 className="text-xs font-black text-white">
                {t('history_section.stage4.ubuntu_tps', 'Ubuntu 20 TPS Sostenidos')}
              </h6>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group flex cursor-default items-center gap-3 rounded-2xl border border-[#10b981]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-xl transition-colors hover:border-[#10b981]"
          >
            <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#10b981]/50 bg-slate-900/80 p-1 shadow-md">
              <img
                src="/images/items/xp_bottle.webp"
                alt="Recompensas Diarias"
                className="size-full object-contain"
              />
            </div>
            <div className="min-w-0 whitespace-nowrap pr-1 text-left">
              <span className="block font-mono text-[9px] font-black uppercase tracking-wider text-[#10b981]">
                {t('history_section.stage4.daily_rewards', 'RECOMPENSAS DIARIAS')}
              </span>
              <h6 className="text-xs font-black text-white">
                {t('history_section.stage4.daily_loot', 'Premios & Loot por Entrar')}
              </h6>
            </div>
          </motion.div>
        </div>
        <div className="pointer-events-none flex-1" />
        <div className="max-w-85 z-10 hidden w-fit shrink-0 flex-col gap-3.5 md:flex">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group flex cursor-default items-center gap-3 rounded-2xl border border-[#00e5ff]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(0,229,255,0.2)] backdrop-blur-xl transition-colors hover:border-[#00e5ff]"
          >
            <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#00e5ff]/50 bg-slate-900/80 p-1 shadow-md">
              <img
                src="/images/items/enchanted_book.webp"
                alt="Nuevas Estadisticas"
                className="size-full object-contain"
              />
            </div>
            <div className="min-w-0 whitespace-nowrap pr-1 text-left">
              <span className="block font-mono text-[9px] font-black uppercase tracking-wider text-[#00e5ff]">
                {t('history_section.stage4.new_stats', 'NUEVAS ESTADÍSTICAS')}
              </span>
              <h6 className="text-xs font-black text-white">
                {t('history_section.stage4.live_metrics', 'Métricas & Kills en Vivo')}
              </h6>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group flex cursor-default items-center gap-3 rounded-2xl border border-[#a855f7]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-xl transition-colors hover:border-[#a855f7]"
          >
            <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#a855f7]/50 bg-slate-900/80 p-1 shadow-md">
              <img
                src="/images/killucoin.png"
                alt="Economia Mejorada"
                className="size-full object-contain"
              />
            </div>
            <div className="min-w-0 whitespace-nowrap pr-1 text-left">
              <span className="block font-mono text-[9px] font-black uppercase tracking-wider text-[#a855f7]">
                {t('history_section.stage4.improved_economy', 'ECONOMÍA MEJORADA')}
              </span>
              <h6 className="text-xs font-black text-white">
                {t('history_section.stage4.economy_system', 'Sistema de economía mejorado')}
              </h6>
            </div>
          </motion.div>
        </div>
      </div>
      <p className="relative z-10 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/60 p-5 text-sm/relaxed font-medium text-gray-200 shadow-2xl backdrop-blur-md sm:p-6 md:text-base">
        {stage.narrativeSummary}
      </p>
      {stage.features && <StageFeatures features={stage.features} />}
    </div>
  );
}
