import React from 'react';
import { Gamepad2, Crown, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AboutRolesSteps: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto grid w-full grid-cols-1 gap-6 rounded-3xl border border-white/5 bg-white/5 p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-xl md:grid-cols-3">
      <div className="flex items-start gap-3.5">
        <div className="shrink-0 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-400">
          <Gamepad2 className="size-6" />
        </div>
        <div>
          <h4 className="mb-1 text-sm font-black uppercase tracking-wider text-white">
            {t('about.roles.step1_title', '1. Juega como Quieras')}
          </h4>
          <p className="text-xs/relaxed text-gray-400">
            {t(
              'about.roles.step1_desc',
              'Construye, combate, comercia o explora libremente. No hay restricciones de estilo de juego.',
            )}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3.5">
        <div className="shrink-0 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-400">
          <Crown className="size-6" />
        </div>
        <div>
          <h4 className="mb-1 text-sm font-black uppercase tracking-wider text-white">
            {t('about.roles.step2_title', '2. Títulos por Progresión')}
          </h4>
          <p className="text-xs/relaxed text-gray-400">
            {t(
              'about.roles.step2_desc',
              'Al acumular bloques, kills, KilluCoins o días de racha desbloqueas títulos progresivos.',
            )}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3.5">
        <div className="shrink-0 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3 text-purple-400">
          <Trophy className="size-6" />
        </div>
        <div>
          <h4 className="mb-1 text-sm font-black uppercase tracking-wider text-white">
            {t('about.roles.step3_title', '3. Prestigio & Top #1')}
          </h4>
          <p className="text-xs/relaxed text-gray-400">
            {t(
              'about.roles.step3_desc',
              'Avanza en los 5 niveles de Prestigio mundial y compite por el puesto supremo de la rama.',
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
