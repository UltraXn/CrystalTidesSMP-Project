import React, { useState } from 'react';
import { ChevronRight, Sparkles, Check } from 'lucide-react';
import { SCREEN_SHOWCASE_ITEMS } from './ScreenShowcase/screenShowcaseData';
import { ScreenSelectorStrip } from './ScreenShowcase/ScreenSelectorStrip';
import { ScreenDetailMockup } from './ScreenShowcase/ScreenDetailMockup';

export const ScreenShowcaseSection: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<number>(0);
  const current = SCREEN_SHOWCASE_ITEMS[activeScreen];

  return (
    <section className="relative z-10 mx-auto max-w-6xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
          <Sparkles className="size-3.5 text-purple-400" />
          <span>EXPERIENCIA DE PANTALLAS UI/UX</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          Diseñado Pantalla a Pantalla para la <span className="text-teal-400">Élite</span>
        </h2>
        <p className="text-sm/relaxed text-slate-400 sm:text-base">
          Explora la arquitectura de cada módulo del cliente: interfaces limpias, ausencia de ruido
          visual y accesibilidad inmediata para tus partidas.
        </p>
      </div>

      {/* Screen Selector Strip */}
      <ScreenSelectorStrip
        screens={SCREEN_SHOWCASE_ITEMS}
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
      />

      {/* Screen Detail Stage & Mockup Visualizer */}
      <div className="relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0512] p-6 shadow-2xl sm:p-10 lg:grid-cols-12">
        {/* Glow Background */}
        <div
          className={`bg-linear-to-br absolute inset-0 ${current.previewColor} pointer-events-none opacity-60`}
        />

        {/* Left Column: Descriptive Breakdown */}
        <div className="relative z-10 space-y-6 lg:col-span-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 font-mono text-xs font-black text-teal-400">
                PANTALLA {current.num}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                {current.badge}
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {current.title}
            </h3>
            <p className="text-xs/relaxed text-slate-300 sm:text-sm">{current.desc}</p>
          </div>

          {/* Features Checkpoints */}
          <div className="space-y-2.5 border-t border-white/5 pt-2">
            {current.features.map((feat) => (
              <div
                key={`feature-${feat}`}
                className="flex items-start gap-2.5 text-xs text-slate-200"
              >
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                  <Check className="stroke-3 size-2.5" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() =>
                document.getElementById('launcher')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 transition-colors hover:text-teal-300"
            >
              <span>Probar en el simulador interactivo arriba</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: High-Fidelity UI Wireframe Mockup */}
        <div className="relative z-10 lg:col-span-7">
          <ScreenDetailMockup current={current} activeScreen={activeScreen} />
        </div>
      </div>
    </section>
  );
};
