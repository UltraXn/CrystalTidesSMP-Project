import React from 'react';
import { m as motion } from 'framer-motion';
import { Crown, ScrollText, AlertCircle } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { Role } from '../aboutRolesData';

interface AboutRolesRulesCardProps {
  currentRole: Role;
  t: TFunction;
}

export const AboutRolesRulesCard: React.FC<Readonly<AboutRolesRulesCardProps>> = ({
  currentRole,
  t,
}) => {
  return (
    <motion.div
      key={`${currentRole.id}-rules`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-2xl md:p-7"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 size-80 rounded-full opacity-10 blur-3xl"
        style={{ background: currentRole.colorHex }}
      />

      <div className="relative z-10 space-y-5">
        {/* Header de la Tarjeta de Reglas */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="shrink-0 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2.5 text-cyan-400">
            <ScrollText className="size-6" />
          </div>
          <div>
            <h4 className="text-base font-black uppercase tracking-tight text-white">
              {t('about.roles.rules.header', 'Normativa y Reglas de la Maestría')}
            </h4>
            <p className="text-xs font-medium text-gray-400">
              {t('about.roles.rules.sub', 'Requisitos para disputar el puesto Top #1')}
            </p>
          </div>
        </div>

        {/* Header del Top 1 Supremo */}
        <div className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-xl bg-amber-500/20 p-2 text-amber-400">
              <Crown className="size-5" />
            </div>
            <div>
              <span className="block text-[9.5px] font-black uppercase tracking-widest text-amber-400">
                {t('about.roles.rules.top_honor', 'Título de Honor Top #1')}
              </span>
              <h5 className="text-sm font-black text-white">
                {t(`about.roles.branch.${currentRole.id}.topTitle`, currentRole.rules.topTitle)}
              </h5>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-left text-[10.5px] font-extrabold leading-relaxed text-amber-300">
            📍 {t(`about.roles.branch.${currentRole.id}.topReq`, currentRole.rules.topRequirement)}
          </div>
        </div>

        {/* Reglas Oficiales de la Maestría */}
        <div className="space-y-2.5">
          <h5 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
            <AlertCircle className="size-3.5 text-cyan-400" />{' '}
            {t('about.roles.rules.specific_rules', 'Reglas Específicas')}
          </h5>
          <ul className="space-y-2">
            {currentRole.rules.rulesList.map((rule, idx) => (
              <li
                key={rule}
                className="bg-white/3 flex items-start gap-2.5 rounded-xl border border-white/5 p-3 text-xs/relaxed text-gray-300 transition-colors hover:border-white/10"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black text-white">
                  {idx + 1}
                </span>
                <span>{t(`about.roles.branch.${currentRole.id}.rule.${idx}`, rule)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reglas del Rango Máximo */}
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs/relaxed text-amber-200/90">
          <div className="flex items-center gap-1.5 text-sm font-bold text-amber-400">
            🏆 {t('about.roles.rules.max_rank_title', 'Reglas del Rango Máximo')}
          </div>
          <div className="flex flex-col gap-1.5 text-[11.5px]">
            <div>
              • <strong>{t('about.roles.rules.req_label', 'Requisito Rango Máximo:')}</strong>{' '}
              {t(
                'about.roles.rules.max_rank_req',
                'Debes ser el jugador con más puntos/estadística de la categoría en la que estás destacando.',
              )}
            </div>
            <div>
              • <strong>{t('about.roles.rules.limit_label', 'Límite de 1 Rango Activo:')}</strong>{' '}
              {t(
                'about.roles.rules.limit_active',
                'Solo puedes poseer 1 título máximo simultáneo al mismo tiempo.',
              )}
            </div>
            <div>
              • <strong>{t('about.roles.rules.transfer_label', 'Transferencia Directa:')}</strong>{' '}
              {t(
                'about.roles.rules.transfer',
                'Se transfiere si otro jugador supera tu puntaje. El Duelo 1v1 es exclusivo del Señor de la Guerra.',
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
