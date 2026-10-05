import React from 'react';

export const TypographySection: React.FC = () => {
  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      <div className="space-y-8 rounded-2xl border border-white/10 bg-[#0c0714] p-8 shadow-2xl">
        {/* Specimen 1: Display Black */}
        <div className="space-y-2 border-b border-white/5 pb-6">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-teal-400">
            <span>DISPLAY HEADINGS • WEIGHT 900 BLACK</span>
            <span>Figtree / Montserrat 900</span>
          </div>
          <div className="text-3xl font-black leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
            CRYSTALTIDES CLIENT 1.21
          </div>
          <p className="text-xs text-slate-400">
            Utilizado para títulos de impacto, números de versión y banners de alta jerarquía
            visual.
          </p>
        </div>

        {/* Specimen 2: Subheadings */}
        <div className="space-y-2 border-b border-white/5 pb-6">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-purple-400">
            <span>SECTION SUBTITLES • WEIGHT 700 BOLD</span>
            <span>Inter / Space Grotesk 700</span>
          </div>
          <div className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
            Gestor de Mods y Sincronización Delta SHA-256 en Tiempo Real
          </div>
          <p className="text-xs text-slate-400">
            Utilizado en nombres de perfiles, categorías de mods y encabezados de configuración.
          </p>
        </div>

        {/* Specimen 3: Monospace Data Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-emerald-400">
            <span>DATA HASHS & METRICS • MONOSPACE CODES</span>
            <span>JetBrains Mono / Fira Code</span>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/40 p-3 font-mono text-sm text-emerald-300 sm:text-base">
            SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 [0.6s •
            38.4MB]
          </div>
          <p className="text-xs text-slate-400">
            Utilizado para hashes de verificación, argumentos de Java, memoria RAM y diagnósticos.
          </p>
        </div>
      </div>
    </div>
  );
};
