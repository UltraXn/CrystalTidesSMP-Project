import { m as motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Minecraft3DAltarCanvas } from '../Minecraft3DAltarCanvas';
import { FloatingItem, StageHeader } from './StageSharedComponents';
import { StageFeatures } from './Stage1Card';
import type { Stage, StageFloatingItem } from './types';

export function Stage3Card({
  stage,
  floatingItems,
  setShowWitherVideo,
  setSelectedPhotoModal,
  showWitherVideo,
  selectedPhotoModal,
}: Readonly<{
  stage: Stage;
  floatingItems: StageFloatingItem[];
  setShowWitherVideo: (v: boolean) => void;
  setSelectedPhotoModal: (src: string | null) => void;
  showWitherVideo: boolean;
  selectedPhotoModal: string | null;
}>) {
  const { t } = useTranslation();
  return (
    <div className="bg-linear-to-b relative space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#0b1320]/95 p-8 shadow-[0_0_50px_rgba(137,217,209,0.15)] md:p-10">
      <div className="pointer-events-none absolute inset-0 z-0 flex size-full items-center justify-center opacity-100">
        <Minecraft3DAltarCanvas stageId={3} accentColor={stage.accentColor} />
      </div>
      {floatingItems.map((item, idx) => (
        <FloatingItem key={item.pos} item={item} idx={idx} />
      ))}
      <StageHeader stage={stage} />
      <div className="pointer-events-auto relative z-20 my-2.5 flex justify-center">
        <motion.button
          type="button"
          onClick={() => setShowWitherVideo(true)}
          animate={{ y: [-2, 3, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ef4444]/60 bg-[#ef4444]/25 px-5 py-2.5 shadow-[0_0_25px_rgba(239,68,68,0.4)] backdrop-blur-xl transition-colors hover:scale-105 hover:bg-[#ef4444]/40"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-[#ef4444] bg-[#ef4444]/40 shadow-lg transition-transform group-hover:scale-110">
            <Play className="size-4 fill-white text-white" />
          </div>
          <div className="overflow-hidden text-left">
            <span className="block truncate font-mono text-[9.5px] font-black uppercase tracking-wider text-[#ef4444]">
              {t('history_section.stage3.live_combat', '🔴 VER REGISTRO DE COMBATE EN VIVO')}
            </span>
            <h6 className="truncate text-xs font-black text-white">
              {t('history_section.stage3.wither_boss', 'Wither Terror Boss Fight')}
            </h6>
          </div>
        </motion.button>
      </div>
      <div className="sm:min-h-70 pointer-events-auto relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
        <div className="z-10 hidden w-52 flex-col gap-3.5 sm:w-60 md:flex">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedPhotoModal('/images/memories/memory_1.jfif')}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#00e5ff]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(0,229,255,0.2)] backdrop-blur-xl transition-colors hover:border-[#00e5ff]"
          >
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-[#00e5ff]/50 bg-slate-900 shadow-md">
              <img
                src="/images/memories/memory_1.jfif"
                alt="Ciudadela Nether"
                className="size-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 overflow-hidden text-left">
              <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#00e5ff]">
                {t('history_section.stage3.nether_raid', 'NETHER RAID')}
              </span>
              <h6 className="truncate text-xs font-black text-white">
                {t('history_section.stage3.nether_citadel', 'Ciudadela Nether')}
              </h6>
            </div>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedPhotoModal('/images/memories/memory_4.png')}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#a855f7]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-xl transition-colors hover:border-[#a855f7]"
          >
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-[#a855f7]/50 bg-slate-900 shadow-md">
              <img
                src="/images/memories/memory_4.png"
                alt="Bosque Sakura"
                className="size-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 overflow-hidden text-left">
              <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#a855f7]">
                {t('history_section.stage3.community', 'COMUNIDAD')}
              </span>
              <h6 className="truncate text-xs font-black text-white">
                {t('history_section.stage3.sakura_forest', 'Bosque Sakura')}
              </h6>
            </div>
          </motion.button>
        </div>
        <div className="pointer-events-none flex-1" />
        <div className="z-10 hidden w-52 flex-col gap-3.5 sm:w-60 md:flex">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedPhotoModal('/images/memories/memory_2.jfif')}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ef4444]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(239,68,68,0.2)] backdrop-blur-xl transition-colors hover:border-[#ef4444]"
          >
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-[#ef4444]/50 bg-slate-900 shadow-md">
              <img
                src="/images/memories/memory_2.jfif"
                alt="Batalla Nether"
                className="size-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 overflow-hidden text-left">
              <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#ef4444]">
                {t('history_section.stage3.showdown', 'ENFRENTAMIENTO')}
              </span>
              <h6 className="truncate text-xs font-black text-white">
                {t('history_section.stage3.nether_battle', 'Batalla Nether')}
              </h6>
            </div>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedPhotoModal('/images/memories/memory_3.png')}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#10b981]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-xl transition-colors hover:border-[#10b981]"
          >
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-[#10b981]/50 bg-slate-900 shadow-md">
              <img
                src="/images/memories/memory_3.png"
                alt="Gran Bóveda"
                className="size-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 overflow-hidden text-left">
              <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#10b981]">
                {t('history_section.stage3.economy', 'ECONOMÍA')}
              </span>
              <h6 className="truncate text-xs font-black text-white">
                {t('history_section.stage3.grand_vault', 'Gran Bóveda')}
              </h6>
            </div>
          </motion.button>
        </div>
      </div>
      <p className="relative z-10 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/60 p-5 text-sm/relaxed font-medium text-gray-200 shadow-2xl backdrop-blur-md sm:p-6 md:text-base">
        {stage.narrativeSummary}
      </p>
      {stage.features && <StageFeatures features={stage.features} />}

      {/* CINEMATIC LIGHTBOX VIDEO POPUP MODAL (ISOLATED TO CARD) */}
      <AnimatePresence>
        {showWitherVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center rounded-3xl bg-black/90 p-4 backdrop-blur-2xl sm:p-6"
            onClick={() => setShowWitherVideo(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[#ef4444]/50 bg-[#090b10] shadow-[0_0_60px_rgba(239,68,68,0.35)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#ef4444]/20 bg-black/60 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="size-3 animate-ping rounded-full bg-[#ef4444]" />
                  <div className="text-left">
                    <span className="block font-mono text-[10px] font-black uppercase tracking-wider text-[#ef4444]">
                      🔴 REGISTRO DE COMBATE EN VIVO
                    </span>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white sm:text-base">
                      Forgotten Terror Wither Boss Fight
                    </h4>
                  </div>
                </div>
                <button
                  aria-label="Action"
                  type="button"
                  onClick={() => setShowWitherVideo(false)}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-colors hover:bg-[#ef4444]"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="relative aspect-video w-full bg-black">
                <video
                  src="/videos/wither_battle_clip.mp4"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="size-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHOTO LIGHTBOX PREVIEW MODAL (ISOLATED TO CARD) */}
      <AnimatePresence>
        {selectedPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-black/90 p-4 backdrop-blur-2xl sm:p-6"
            onClick={() => setSelectedPhotoModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                aria-label="Action"
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="absolute right-3 top-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/80 text-white transition-colors hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
              <img
                src={selectedPhotoModal}
                alt="Memoria Minecraft"
                className="mx-auto h-auto max-h-[70vh] w-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
