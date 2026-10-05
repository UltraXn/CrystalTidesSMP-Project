import { AnimatePresence, m as motion } from 'framer-motion';
import type { TFunction } from 'i18next';
import type React from 'react';
import MinecraftAvatar from '../../UI/MinecraftAvatar';

interface Stage2StaffBiosProps {
  linkedMembers: Set<string>;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
  t: TFunction;
}

export function Stage2StaffBios({ linkedMembers, dropZoneRef, t }: Readonly<Stage2StaffBiosProps>) {
  return (
    <div className="min-h-95 sm:min-h-110 pointer-events-auto relative z-10 my-2 flex items-center justify-between px-2 sm:px-4">
      {/* LEFT COLUMN FLOATING BIO CARDS (Killu - Top, Nero - Bottom) */}
      <div className="sm:w-68 z-10 hidden w-60 flex-col gap-4 md:flex">
        {/* 1. KillubysmaliVT Floating Bio Card */}
        <AnimatePresence>
          {linkedMembers.has('KillubysmaliVT') && (
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.9 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-2 rounded-2xl border border-[#00637c]/60 bg-black/85 p-3.5 text-left shadow-[0_0_25px_rgba(0,99,124,0.3)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 border-b border-[#00637c]/30 pb-2">
                <div className="size-8 shrink-0 overflow-hidden rounded-full border border-[#00637c] bg-slate-900">
                  <MinecraftAvatar
                    src="/skins/killu.png"
                    alt="KillubysmaliVT"
                    size={32}
                    className="size-full object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#5eead4]">
                    ✦ {t('history_section.members.killu.role', 'Directora & Comunidad')}
                  </span>
                  <h6 className="truncate text-xs font-black text-white">KillubysmaliVT</h6>
                </div>
              </div>
              <p className="text-[10.5px] font-medium leading-snug text-gray-200">
                {t(
                  'history_section.members.killu.desc',
                  'Apasionada, alegre y el alma protectora de la Pecerita. Crea un ambiente acogedor, organiza eventos y guía con calidez humana.',
                )}
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="rounded-md border border-[#00637c]/40 bg-[#00637c]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#5eead4]">
                  {t('history_section.members.killu.tag1', 'Carismática')}
                </span>
                <span className="rounded-md border border-[#00637c]/40 bg-[#00637c]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#5eead4]">
                  {t('history_section.members.killu.tag2', 'Eventos')}
                </span>
                <span className="rounded-md border border-[#00637c]/40 bg-[#00637c]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#5eead4]">
                  {t('history_section.members.killu.tag3', 'Voz Principal')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Neroferno ultranix Floating Bio Card */}
        <AnimatePresence>
          {linkedMembers.has('Neroferno ultranix') && (
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.9 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-2 rounded-2xl border border-[#ff00b7]/60 bg-black/85 p-3.5 text-left shadow-[0_0_25px_rgba(255,0,183,0.3)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 border-b border-[#ff00b7]/30 pb-2">
                <div className="size-8 shrink-0 overflow-hidden rounded-full border border-[#ff00b7] bg-slate-900">
                  <MinecraftAvatar
                    src="https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c"
                    alt="Neroferno"
                    size={32}
                    className="size-full object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#e879f9]">
                    ✦ {t('history_section.members.nero.role', 'Dev Lead & Infra')}
                  </span>
                  <h6 className="truncate text-xs font-black text-white">Neroferno ultranix</h6>
                </div>
              </div>
              <p className="text-[10.5px] font-medium leading-snug text-gray-200">
                {t(
                  'history_section.members.nero.desc',
                  'Mente lógica e inyectado de euforia técnica. Obsesionado con el rendimiento del servidor, parches custom y código limpio sin fallos.',
                )}
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="rounded-md border border-[#ff00b7]/40 bg-[#ff00b7]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#e879f9]">
                  {t('history_section.members.nero.tag1', 'Euforia Técnica')}
                </span>
                <span className="rounded-md border border-[#ff00b7]/40 bg-[#ff00b7]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#e879f9]">
                  {t('history_section.members.nero.tag2', 'Infra Fullstack')}
                </span>
                <span className="rounded-md border border-[#ff00b7]/40 bg-[#ff00b7]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#e879f9]">
                  {t('history_section.members.nero.tag3', 'Cero Bugs')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CENTER SPACE & INVISIBLE DROP ZONE TARGET */}
      <div className="pointer-events-none flex flex-1 items-center justify-center">
        <div
          ref={dropZoneRef}
          className="pointer-events-auto flex size-48 items-center justify-center rounded-full"
        />
      </div>

      {/* RIGHT COLUMN FLOATING BIO CARDS (Churly - Top, Japa - Bottom) */}
      <div className="sm:w-68 z-10 hidden w-60 flex-col gap-4 md:flex">
        {/* 3. Xurlito Floating Bio Card */}
        <AnimatePresence>
          {linkedMembers.has('Xurlito') && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-2 rounded-2xl border border-[#00aeef]/60 bg-black/85 p-3.5 text-left shadow-[0_0_25px_rgba(0,174,239,0.3)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 border-b border-[#00aeef]/30 pb-2">
                <div className="size-8 shrink-0 overflow-hidden rounded-full border border-[#00aeef] bg-slate-900">
                  <MinecraftAvatar
                    src="/skins/churly.png"
                    alt="Xurlito"
                    size={32}
                    className="size-full object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#38bdf8]">
                    ✦ {t('history_section.members.churly.role', 'Diseño & Arte Lead')}
                  </span>
                  <h6 className="truncate text-xs font-black text-white">Xurlito</h6>
                </div>
              </div>
              <p className="text-[10.5px] font-medium leading-snug text-gray-200">
                {t(
                  'history_section.members.churly.desc',
                  'Perfeccionista visual, creativo y visionario de la estética. Diseña interfaces, conceptos de arte e identidades visuales únicas.',
                )}
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="rounded-md border border-[#00aeef]/40 bg-[#00aeef]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#38bdf8]">
                  {t('history_section.members.churly.tag1', 'Visión Artística')}
                </span>
                <span className="rounded-md border border-[#00aeef]/40 bg-[#00aeef]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#38bdf8]">
                  {t('history_section.members.churly.tag2', 'UI/UX Lead')}
                </span>
                <span className="rounded-md border border-[#00aeef]/40 bg-[#00aeef]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#38bdf8]">
                  {t('history_section.members.churly.tag3', 'Estética Pulida')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. JAPA325 Floating Bio Card */}
        <AnimatePresence>
          {linkedMembers.has('JAPA325') && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-2 rounded-2xl border border-[#1d4ed8]/60 bg-black/85 p-3.5 text-left shadow-[0_0_25px_rgba(29,78,216,0.3)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 border-b border-[#1d4ed8]/30 pb-2">
                <div className="size-8 shrink-0 overflow-hidden rounded-full border border-[#1d4ed8] bg-slate-900">
                  <MinecraftAvatar
                    src="JAPA325"
                    alt="JAPA325"
                    size={32}
                    className="size-full object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#60a5fa]">
                    ✦ {t('history_section.members.japa.role', 'QA & BETA TESTER')}
                  </span>
                  <h6 className="truncate text-xs font-black text-white">JAPA325</h6>
                </div>
              </div>
              <p className="text-[10.5px] font-medium leading-snug text-gray-200">
                {t(
                  'history_section.members.japa.desc',
                  'Curioso, persistente e implacable buscando romper mecánicas para mejorarlas. El agente del caos a prueba de fallos personal de killu.',
                )}
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="rounded-md border border-[#1d4ed8]/40 bg-[#1d4ed8]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#60a5fa]">
                  {t('history_section.members.japa.tag1', 'Agente Caos')}
                </span>
                <span className="rounded-md border border-[#1d4ed8]/40 bg-[#1d4ed8]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#60a5fa]">
                  {t('history_section.members.japa.tag2', 'QA Tester')}
                </span>
                <span className="rounded-md border border-[#1d4ed8]/40 bg-[#1d4ed8]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#60a5fa]">
                  {t('history_section.members.japa.tag3', 'Gameplay Solid')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
