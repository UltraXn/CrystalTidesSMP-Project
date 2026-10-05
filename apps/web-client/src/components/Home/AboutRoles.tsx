import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { roles } from './aboutRolesData';
import { AboutRolesSteps } from './AboutRoles/AboutRolesSteps';
import { AboutRolesBranchList } from './AboutRoles/AboutRolesBranchList';
import { AboutRolesDetailCard } from './AboutRoles/AboutRolesDetailCard';
import { AboutRolesRulesCard } from './AboutRoles/AboutRolesRulesCard';

function buildRadarData(t: TFunction, currentRoleId: string) {
  return [
    {
      subject: t('about.roles.radar.builder', 'Constructor'),
      A: currentRoleId === 'constructor' ? 100 : 45,
    },
    {
      subject: t('about.roles.radar.fighter', 'Luchador'),
      A: currentRoleId === 'luchador' ? 100 : 50,
    },
    {
      subject: t('about.roles.radar.merchant', 'Mercader'),
      A: currentRoleId === 'mercader' ? 100 : 40,
    },
    {
      subject: t('about.roles.radar.constancy', 'Constancia'),
      A: currentRoleId === 'constancia' ? 100 : 55,
    },
    {
      subject: t('about.roles.radar.explorer', 'Explorador'),
      A: currentRoleId === 'explorador' ? 100 : 48,
    },
  ];
}

export default function AboutRoles() {
  const { t } = useTranslation();
  const [activeRoleId, setActiveRoleId] = useState<string>('constructor');
  const [activeDetailTab, setActiveDetailTab] = useState<'titles' | 'prestige'>('titles');

  const currentRole = roles.find((r) => r.id === activeRoleId) || roles[0];
  const radarData = buildRadarData(t, currentRole.id);

  return (
    <div className="max-w-400 mx-auto w-full space-y-10 px-4 py-8 lg:px-8">
      {/* Encabezado Principal y Filosofía del Servidor */}
      <div className="mx-auto max-w-5xl space-y-4 text-center">
        <div className="text-(--accent) inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
          <Code2 className="size-3.5 text-cyan-400" />{' '}
          {t('about.roles.badge', 'Sistema Custom de Mecánicas Creado a Medida')}
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white md:text-5xl">
          {t('about.roles.title', 'Elige tu Camino en CrystalTides')}
        </h2>
        <p className="mx-auto max-w-3xl text-sm/relaxed text-gray-300 md:text-base">
          {t(
            'about.roles.subtitle',
            'El servidor tiene el objetivo principal de ser divertido y pasársela genial jugando, ya sea de manera relajada (chill) con amigos o tryhardeando para subir en los rankings. Tu progreso en el juego te permite desbloquear títulos cosméticos y ascender de prestigio.',
          )}
        </p>
      </div>

      {/* Banner Explicativo: 3 Pasos de la Experiencia */}
      <AboutRolesSteps />

      {/* Grid de Selector de Ramas + Detalles */}
      <div className="mx-auto grid w-full grid-cols-1 items-start gap-6 text-left lg:grid-cols-12">
        {/* Selector de 5 Ramas (Columna Izquierda) */}
        <AboutRolesBranchList
          roles={roles}
          activeRoleId={activeRoleId}
          onSelectRole={setActiveRoleId}
          t={t}
        />

        {/* Panel de Detalle Dinámico de la Rama Seleccionada (Columna Derecha) */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:col-span-9 xl:grid-cols-12">
          <div className="flex flex-col xl:col-span-7">
            <AnimatePresence mode="wait">
              <AboutRolesDetailCard
                key={currentRole.id}
                currentRole={currentRole}
                radarData={radarData}
                activeDetailTab={activeDetailTab}
                setActiveDetailTab={setActiveDetailTab}
                t={t}
              />
            </AnimatePresence>
          </div>

          <div className="flex flex-col xl:col-span-5">
            <AnimatePresence mode="wait">
              <AboutRolesRulesCard
                key={`${currentRole.id}-rules`}
                currentRole={currentRole}
                t={t}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
