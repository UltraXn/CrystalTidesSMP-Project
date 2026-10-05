import React, { Suspense, lazy } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Crown, Trophy, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import type { TFunction } from 'i18next';
import type { Role } from '../aboutRolesData';
import { PRESTIGE_TIERS } from '../aboutRolesData';

const AboutRolesRadar = lazy(() => import('../AboutRolesRadar'));

interface AboutRolesDetailCardProps {
  currentRole: Role;
  radarData: Array<{ subject: string; A: number }>;
  activeDetailTab: 'titles' | 'prestige';
  setActiveDetailTab: (tab: 'titles' | 'prestige') => void;
  t: TFunction;
}

export const AboutRolesDetailCard: React.FC<Readonly<AboutRolesDetailCardProps>> = ({
  currentRole,
  radarData,
  activeDetailTab,
  setActiveDetailTab,
  t,
}) => {
  return (
    <motion.div
      key={currentRole.id}
      id={`role-panel-${currentRole.id}`}
      role="tabpanel"
      aria-labelledby={`role-tab-${currentRole.id}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-2xl md:p-7"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 size-96 rounded-full opacity-10 blur-3xl"
        style={{ background: currentRole.colorHex }}
      />

      <div className="relative z-10 space-y-6">
        {/* Header de la Rama Seleccionada */}
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex shrink-0 items-center justify-center rounded-2xl border p-2.5"
              style={{
                borderColor: `${currentRole.colorHex}50`,
                backgroundColor: `${currentRole.colorHex}15`,
              }}
            >
              <img
                src={currentRole.iconUrl}
                alt={currentRole.title}
                className="size-8 object-contain"
              />
            </div>
            <div>
              <span
                className="mb-0.5 block text-[10px] font-black uppercase tracking-widest"
                style={{ color: currentRole.colorHex }}
              >
                {t('about.roles.custom_branch', 'Rama de Progresión Custom')}
              </span>
              <h3 className="text-xl font-black text-white">
                {t(`about.roles.branch.${currentRole.id}.title`, currentRole.title)}
              </h3>
            </div>
          </div>

          <p className="text-xs/relaxed text-gray-300">
            {t(`about.roles.branch.${currentRole.id}.desc`, currentRole.description)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white/3 inline-flex items-center gap-2 rounded-xl border border-white/5 px-3 py-1.5 text-xs">
              <span className="font-medium text-gray-400">
                {t('about.roles.metric_label', 'Métrica:')}
              </span>
              <span className="font-extrabold text-white">
                {t(`about.roles.branch.${currentRole.id}.metric`, currentRole.benchmarkMetric)}
              </span>
            </div>

            <div className="bg-white/3 flex items-start gap-1.5 rounded-xl border border-white/5 px-3 py-1.5 text-[11px] leading-relaxed text-gray-300">
              <span className="shrink-0 font-bold text-amber-400">💡</span>
              <span>
                {t(`about.roles.branch.${currentRole.id}.formula`, currentRole.formulaDesc)}
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Radar Container */}
        <div className="bg-white/3 relative flex h-48 flex-col items-center justify-center rounded-2xl border border-white/5 p-3 shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
          <span className="absolute left-3 top-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
            {t('about.roles.radar_view', 'Vista de Radar')}
          </span>
          <div className="h-40 w-full min-w-0">
            <Suspense
              fallback={
                <div className="flex size-full items-center justify-center text-[10px] font-black uppercase tracking-wider text-gray-500">
                  {t('about.roles.loading_radar', 'Cargando radar...')}
                </div>
              }
            >
              <AboutRolesRadar data={radarData} colorHex={currentRole.colorHex} />
            </Suspense>
          </div>
        </div>

        {/* PESTAÑAS: Títulos y Prestigio */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          {/* Selector de Pestañas */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="bg-white/3 flex items-center gap-1.5 rounded-xl border border-white/5 p-1">
              <button
                type="button"
                onClick={() => setActiveDetailTab('titles')}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${
                  activeDetailTab === 'titles'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Crown className="size-3.5 text-amber-400" />{' '}
                {t('about.roles.titles_tab', 'Títulos (1-5)')}
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('prestige')}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${
                  activeDetailTab === 'prestige'
                    ? 'border border-purple-500/40 bg-purple-500/30 text-purple-300'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Trophy className="size-3.5 text-purple-400" />{' '}
                {t('about.roles.prestige_tab', 'Prestigios')}
              </button>
            </div>
          </div>

          {/* Contenido Dinámico de las Pestañas */}
          <AnimatePresence mode="wait">
            {activeDetailTab === 'titles' && (
              <motion.div
                key="tab-titles"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-5"
              >
                {currentRole.ranks.map((rank) => {
                  const isTop = rank.levelNum === 5;
                  return (
                    <div
                      key={rank.levelNum}
                      className={`flex flex-col items-center justify-between gap-2 rounded-2xl border p-3 text-center transition-colors hover:scale-[1.02] ${
                        isTop
                          ? 'border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-white/3 border-white/5 hover:border-white/15 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <span
                          className={`mb-0.5 block text-[9px] font-black uppercase tracking-wider ${
                            isTop ? 'text-amber-400' : 'text-gray-400'
                          }`}
                        >
                          {isTop
                            ? t('about.roles.top', '⭐ TOP')
                            : t('about.roles.level', 'NIVEL {{level}}', { level: rank.levelNum })}
                        </span>
                        <span className="block text-xs/snug font-extrabold text-white">
                          {t(
                            `about.roles.branch.${currentRole.id}.rank.${rank.levelNum}.name`,
                            rank.rankName,
                          )}
                        </span>
                      </div>
                      {rank.item && (
                        <img
                          src={rank.item}
                          alt={rank.rankName}
                          className="my-0.5 size-7 object-contain drop-shadow-md"
                        />
                      )}
                      <span
                        className={`rounded-md px-2 py-0.5 text-[9.5px] font-bold ${
                          isTop
                            ? 'border border-amber-500/30 bg-amber-500/20 text-amber-300'
                            : 'border border-white/5 bg-black/40 text-gray-400'
                        }`}
                      >
                        {t(
                          `about.roles.branch.${currentRole.id}.rank.${rank.levelNum}.req`,
                          rank.reqText,
                        )}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeDetailTab === 'prestige' && (
              <motion.div
                key="tab-prestige"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <p className="text-xs/relaxed text-gray-400">
                  {t(
                    'about.roles.prestige_desc',
                    'Los Niveles de Prestigio recompensan la constancia de los jugadores que maxean sus estadísticas de maestría en CrystalTides.',
                  )}
                </p>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                  {PRESTIGE_TIERS.map((tier) => (
                    <div
                      key={tier.level}
                      className="bg-white/3 flex flex-col justify-between gap-1.5 rounded-2xl border border-white/5 p-3 text-left transition-colors hover:border-white/15 hover:bg-white/5"
                    >
                      <span className="block text-xs font-black" style={{ color: tier.color }}>
                        {t(`about.roles.prestige.tier${tier.level}.badge`, tier.badge)}
                      </span>
                      <span className="block text-[11px] font-extrabold text-white">
                        {t(`about.roles.prestige.tier${tier.level}.name`, tier.name)}
                      </span>
                      <span className="block text-[9.5px] font-medium text-gray-400">
                        📍 {t(`about.roles.prestige.tier${tier.level}.req`, tier.req)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Barra Inferior Integrada con Acceso a Account */}
      <div className="bg-white/3 mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border-t border-white/5 p-4 pt-4 sm:flex-row">
        <div className="flex items-center gap-3 text-left">
          <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-400">
            <Trophy className="size-5" />
          </div>
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-white">
              {t('about.roles.track_progress', 'Mide tu Progresión en Tiempo Real')}
            </h5>
            <p className="text-[11px] text-gray-400">
              {t(
                'about.roles.track_desc',
                'Vincula tu cuenta de Minecraft para actualizar tus insignias.',
              )}
            </p>
          </div>
        </div>
        <Link
          to="/account?tab=overview"
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md transition-colors hover:scale-105"
          style={{ backgroundColor: currentRole.colorHex }}
        >
          {t('about.roles.view_status', 'Ver Mi Estado')} <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </motion.div>
  );
};
