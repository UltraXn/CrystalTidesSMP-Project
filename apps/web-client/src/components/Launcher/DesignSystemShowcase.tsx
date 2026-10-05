import React, { useState } from 'react';
import { Layers, Palette, Type } from 'lucide-react';
import { ColorPaletteSection, TypographySection, ComponentsShowcaseSection } from './DesignSystem';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'palette' | 'typography' | 'components'>('palette');

  return (
    <section className="relative z-10 mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
          <Palette className="size-3.5 text-teal-400" />
          <span>SISTEMA DE DISEÑO & WIREFRAMES</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          Anatomía Visual del{' '}
          <span className="bg-linear-to-r from-teal-400 via-purple-400 to-teal-300 bg-clip-text text-transparent">
            Cliente
          </span>
        </h2>
        <p className="text-sm/relaxed text-slate-400 sm:text-base">
          Diseñado con estándares de precisión militar y estética de lujo oscuro (*Dark Luxury*):
          contraste óptico perfecto, cristal esmerilado y micro-interacciones de 60 FPS.
        </p>

        {/* Tab Selector */}
        <div className="flex justify-center pt-4">
          <div className="inline-flex gap-1 rounded-xl border border-white/10 bg-[#0e0717] p-1.5 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('palette')}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === 'palette'
                  ? 'bg-linear-to-r border border-teal-500/40 from-teal-500/20 to-purple-500/20 text-teal-300 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="size-3.5" />
              <span>Paleta Cromática</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('typography')}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === 'typography'
                  ? 'bg-linear-to-r border border-teal-500/40 from-teal-500/20 to-purple-500/20 text-teal-300 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="size-3.5" />
              <span>Tipografía & Jerarquía</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('components')}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === 'components'
                  ? 'bg-linear-to-r border border-teal-500/40 from-teal-500/20 to-purple-500/20 text-teal-300 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Componentes Atómicos UI</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB 1: PALETA CROMÁTICA ── */}
      {activeTab === 'palette' && <ColorPaletteSection />}

      {/* ── TAB 2: TIPOGRAFÍA & JERARQUÍA ── */}
      {activeTab === 'typography' && <TypographySection />}

      {/* ── TAB 3: COMPONENTES ATÓMICOS UI ── */}
      {activeTab === 'components' && <ComponentsShowcaseSection />}
    </section>
  );
};
