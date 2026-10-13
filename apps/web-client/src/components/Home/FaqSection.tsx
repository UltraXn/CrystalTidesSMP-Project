import { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Gamepad2,
  Cpu,
  Coins,
  ShieldAlert,
  Headphones,
  LifeBuoy,
} from 'lucide-react';
import Section from '../Layout/Section';

interface FaqEntry {
  id: string;
  icon: typeof HelpCircle;
  questionKey: string;
  defaultQuestion: string;
  answerKey: string;
  defaultAnswer: string;
  category: 'general' | 'launcher' | 'gameplay' | 'donations';
  categoryLabel: string;
}

const FAQ_LIST: readonly FaqEntry[] = [
  {
    id: 'join-server',
    icon: Gamepad2,
    questionKey: 'home.faq.join_q',
    defaultQuestion: '¿Cómo me uno a jugar en CrystalTides SMP?',
    answerKey: 'home.faq.join_a',
    defaultAnswer:
      'Puedes ingresar directamente desde tu cliente de Minecraft Java conectándote a la IP play.crystaltidessmp.net (versión 1.21+). También puedes descargar nuestro Launcher Oficial para contar con optimizaciones gráficas, mods de sonido y texturas exclusivas instaladas de forma automática en 1-click.',
    category: 'general',
    categoryLabel: 'Conexión',
  },
  {
    id: 'bedrock-support',
    icon: Cpu,
    questionKey: 'home.faq.bedrock_q',
    defaultQuestion: '¿Puedo jugar desde Minecraft Bedrock (celular, consolas o Windows 10)?',
    answerKey: 'home.faq.bedrock_a',
    defaultAnswer:
      '¡Sí! Contamos con compatibilidad multiplataforma completa gracias a GeyserMC y Floodgate. Puedes ingresar desde cualquier dispositivo Bedrock utilizando la misma dirección play.crystaltidessmp.net y el puerto estándar 19132.',
    category: 'general',
    categoryLabel: 'Multiplataforma',
  },
  {
    id: 'launcher-required',
    icon: Sparkles,
    questionKey: 'home.faq.launcher_q',
    defaultQuestion: '¿Es obligatorio descargar y usar el Launcher Oficial?',
    answerKey: 'home.faq.launcher_a',
    defaultAnswer:
      'No es obligatorio, pero sí muy recomendado. El Launcher integra Sodium/Iris para triplicar los FPS, soporte para skins personalizadas en HD, chat de voz de proximidad y compatibilidad con nuestros ítems y modelos 3D sin complicaciones manuales.',
    category: 'launcher',
    categoryLabel: 'Launcher',
  },
  {
    id: 'survival-type',
    icon: ShieldAlert,
    questionKey: 'home.faq.survival_q',
    defaultQuestion: '¿Qué tipo de servidor es CrystalTides (Vanilla, RPG o Anárquico)?',
    answerKey: 'home.faq.survival_a',
    defaultAnswer:
      'Es un Survival Semi-RPG con economía balanceada de 7 gemas, bosses de mazmorra semanales en el Nether y dimensiones exclusivas, sistema de skills/clases, protecciones de terrenos respetuosas y eventos comunitarios guiados por el Staff.',
    category: 'gameplay',
    categoryLabel: 'Mecánicas',
  },
  {
    id: 'kofi-ranks',
    icon: Coins,
    questionKey: 'home.faq.kofi_q',
    defaultQuestion: '¿Cómo funcionan los rangos y donaciones de Ko-fi?',
    answerKey: 'home.faq.kofi_a',
    defaultAnswer:
      'El 100% de las donaciones se destina al mantenimiento de los servidores dedicados Ubuntu y mitigación DDoS. Los rangos son puramente cosméticos (títulos en chat, estéticas en Discord, acceso a betas tempranas y cosméticos visuales). En CrystalTides mantenemos una filosofía estricta Anti-P2W (sin ventajas injustas de combate).',
    category: 'donations',
    categoryLabel: 'Donaciones',
  },
  {
    id: 'voice-chat',
    icon: Headphones,
    questionKey: 'home.faq.voice_q',
    defaultQuestion: '¿El servidor cuenta con Chat de Voz de proximidad?',
    answerKey: 'home.faq.voice_a',
    defaultAnswer:
      '¡Sí! Soportamos Simple Voice Chat. Si utilizas el Launcher Oficial, el mod y sus dependencias ya vienen preinstalados y calibrados. Si usas tu propio cliente Fabric/Forge, solo necesitas instalar Simple Voice Chat 1.21.',
    category: 'gameplay',
    categoryLabel: 'Comunidad',
  },
  {
    id: 'support-contact',
    icon: LifeBuoy,
    questionKey: 'home.faq.support_q',
    defaultQuestion: '¿Dónde puedo pedir ayuda, apelar una sanción o reportar un error?',
    answerKey: 'home.faq.support_a',
    defaultAnswer:
      'Puedes abrir un ticket directo en nuestra sección de Soporte web, unirte al canal #tickets en nuestro Discord oficial, o enviar tu reporte a través del buzón de sugerencias e incidencias en esta misma página principal.',
    category: 'general',
    categoryLabel: 'Soporte',
  },
] as const;

interface FaqSectionProps {
  embedded?: boolean;
}

export default function FaqSection({ embedded = false }: Readonly<FaqSectionProps>) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>('join-server');
  const baseId = useId();

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const faqAccordion = (
    <div className="relative z-10 space-y-3.5">
      {FAQ_LIST.map((faq) => {
        const isOpen = openId === faq.id;
        const Icon = faq.icon;
        const contentId = `${baseId}-${faq.id}-content`;
        const headerId = `${baseId}-${faq.id}-header`;

        return (
          <div
            key={faq.id}
            className={`overflow-hidden rounded-2xl border transition-[colors,border-color,box-shadow] duration-300 ${
              isOpen
                ? 'border-(--accent)/40 bg-[#090d16]/95 shadow-[0_0_30px_rgba(137,217,209,0.1)]'
                : 'border-white/10 bg-[#080b12]/70 hover:border-white/20 hover:bg-[#0a0e18]/80'
            }`}
          >
            <button
              id={headerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => handleToggle(faq.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left transition-colors sm:p-5"
            >
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl border transition-[colors,border-color,box-shadow] duration-300 ${
                    isOpen
                      ? 'border-(--accent)/50 bg-(--accent)/15 text-(--accent) shadow-[0_0_15px_rgba(137,217,209,0.3)]'
                      : 'border-white/10 bg-white/5 text-gray-400'
                  }`}
                >
                  <Icon className="size-4.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-black uppercase tracking-wider text-cyan-400/80">
                    {faq.categoryLabel}
                  </span>
                  <h3 className="mt-0.5 text-xs font-bold text-white sm:text-sm">
                    {t(faq.questionKey, faq.defaultQuestion)}
                  </h3>
                </div>
              </div>

              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 ${
                  isOpen
                    ? 'border-(--accent)/40 bg-(--accent)/10 text-(--accent) rotate-180'
                    : 'border-white/10 bg-white/5 text-gray-400'
                }`}
              >
                <ChevronDown className="size-3.5" />
              </div>
            </button>

            <section
              id={contentId}
              aria-labelledby={headerId}
              className={`ease-[cubic-bezier(0.16,1,0.3,1)] grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="min-h-0">
                <div className="border-t border-white/5 bg-black/40 px-5 py-4 text-xs/relaxed text-gray-300 sm:px-6 sm:py-5 sm:text-sm/relaxed">
                  <p>{t(faq.answerKey, faq.defaultAnswer)}</p>
                </div>
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );

  const discordCallout = (
    <div className="bg-linear-to-r relative z-10 flex flex-col items-center justify-between gap-3.5 rounded-2xl border border-white/10 from-purple-950/20 via-black/40 to-cyan-950/20 p-5 text-center sm:flex-row sm:text-left">
      <div className="space-y-0.5">
        <h4 className="text-xs font-black uppercase tracking-wider text-white">
          {t('home.faq.footer_q', '¿Tienes alguna otra duda o consulta?')}
        </h4>
        <p className="text-[11px] text-gray-400">
          {t(
            'home.faq.footer_a',
            'Nuestra comunidad y equipo de Staff están siempre disponibles en Discord.',
          )}
        </p>
      </div>
      <a
        href="https://discord.com/invite/TDmwYNnvyT"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:border-(--accent)/50 hover:bg-(--accent)/10 inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition-[transform,colors,background-color,border-color,box-shadow] duration-300 hover:scale-105 active:scale-95"
      >
        <span>{t('home.faq.join_discord', 'Ir a Discord')}</span>
      </a>
    </div>
  );

  if (embedded) {
    return (
      <div id="faq" className="flex flex-col gap-6">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 flex size-12 shrink-0 items-center justify-center rounded-2xl border text-xl">
              <HelpCircle />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
              {t('home.faq.section_title', 'Preguntas Frecuentes')}
            </h3>
          </div>
          <p className="text-xs font-medium text-gray-400 sm:text-sm">
            {t(
              'home.faq.section_subtitle',
              'Resolvemos las dudas más habituales sobre conexión, compatibilidad, reglas y el launcher de CrystalTides SMP.',
            )}
          </p>
        </div>

        {faqAccordion}
        {discordCallout}
      </div>
    );
  }

  return (
    <Section
      title={
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="text-(--accent) text-3xl" />
          <span className="uppercase tracking-widest text-white">
            {t('home.faq.section_title', 'Preguntas Frecuentes')}
          </span>
        </div>
      }
    >
      <div className="relative mx-auto max-w-4xl space-y-8 px-4">
        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-center text-sm/relaxed font-medium text-gray-400 sm:text-base">
          {t(
            'home.faq.section_subtitle',
            'Resolvemos las dudas más habituales sobre conexión, compatibilidad, reglas y el launcher de CrystalTides SMP.',
          )}
        </p>

        {/* Ambient Glow */}
        <div
          className="mask-[linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] pointer-events-none absolute -inset-x-10 -top-10 bottom-0 z-0 select-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="bg-cyan-500/8 absolute left-1/2 top-10 h-72 w-96 -translate-x-1/2 rounded-full blur-[120px]" />
          <div className="bg-purple-600/8 absolute right-0 top-1/2 size-64 rounded-full blur-[100px]" />
        </div>

        {/* Accordion List */}
        <div className="relative z-10 space-y-3.5">
          {FAQ_LIST.map((faq) => {
            const isOpen = openId === faq.id;
            const Icon = faq.icon;
            const contentId = `${baseId}-${faq.id}-content`;
            const headerId = `${baseId}-${faq.id}-header`;

            return (
              <div
                key={faq.id}
                className={`overflow-hidden rounded-2xl border transition-[colors,border-color,box-shadow] duration-300 ${
                  isOpen
                    ? 'border-(--accent)/40 bg-[#090d16]/95 shadow-[0_0_30px_rgba(137,217,209,0.1)]'
                    : 'border-white/10 bg-[#080b12]/70 hover:border-white/20 hover:bg-[#0a0e18]/80'
                }`}
              >
                <button
                  id={headerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => handleToggle(faq.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors sm:p-6"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition-[colors,border-color,box-shadow] duration-300 ${
                        isOpen
                          ? 'border-(--accent)/50 bg-(--accent)/15 text-(--accent) shadow-[0_0_15px_rgba(137,217,209,0.3)]'
                          : 'border-white/10 bg-white/5 text-gray-400'
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-black uppercase tracking-wider text-cyan-400/80">
                        {faq.categoryLabel}
                      </span>
                      <h3 className="mt-0.5 text-sm font-bold text-white sm:text-base">
                        {t(faq.questionKey, faq.defaultQuestion)}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 ${
                      isOpen
                        ? 'border-(--accent)/40 bg-(--accent)/10 text-(--accent) rotate-180'
                        : 'border-white/10 bg-white/5 text-gray-400'
                    }`}
                  >
                    <ChevronDown className="size-4" />
                  </div>
                </button>

                <section
                  id={contentId}
                  aria-labelledby={headerId}
                  className={`ease-[cubic-bezier(0.16,1,0.3,1)] grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="min-h-0">
                    <div className="border-t border-white/5 bg-black/40 px-6 py-5 text-sm/relaxed text-gray-300 sm:px-8 sm:py-6">
                      <p>{t(faq.answerKey, faq.defaultAnswer)}</p>
                    </div>
                  </div>
                </section>
              </div>
            );
          })}
        </div>

        {/* Footer Help Callout */}
        <div className="bg-linear-to-r relative z-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 from-purple-950/20 via-black/40 to-cyan-950/20 p-6 text-center sm:flex-row sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              {t('home.faq.footer_q', '¿Tienes alguna otra duda o consulta?')}
            </h4>
            <p className="text-xs text-gray-400">
              {t(
                'home.faq.footer_a',
                'Nuestra comunidad y equipo de Staff están siempre disponibles en Discord.',
              )}
            </p>
          </div>
          <a
            href="https://discord.com/invite/TDmwYNnvyT"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:border-(--accent)/50 hover:bg-(--accent)/10 inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-[transform,colors,background-color,border-color,box-shadow] duration-300 hover:scale-105 active:scale-95"
          >
            <span>{t('home.faq.join_discord', 'Ir a Discord')}</span>
          </a>
        </div>
      </div>
    </Section>
  );
}
