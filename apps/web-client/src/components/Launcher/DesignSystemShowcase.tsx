import React, { useState } from "react";
import {
  Layers,
  Sliders,
  Cpu,
  Check,
  Copy,
  Palette,
  Type,
  ToggleRight,
  ToggleLeft,
  Play,
  RotateCw,
  Zap,
} from "lucide-react";

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "palette" | "typography" | "components"
  >("palette");
  const [toggleState1, setToggleState1] = useState(true);
  const [toggleState2, setToggleState2] = useState(false);
  const [toggleState3, setToggleState3] = useState(true);
  const [ramValue, setRamValue] = useState(6);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = [
    {
      name: "Beyond Black",
      hex: "#060305",
      role: "Fondo Principal / Canvas Canvas",
      tag: "Background",
    },
    {
      name: "Obsidian Deep",
      hex: "#0D0714",
      role: "Superficie de Tarjetas & Paneles",
      tag: "Surface",
    },
    {
      name: "Electric Teal",
      hex: "#2DD4BF",
      role: "Acento Primario / Glow de Acción",
      tag: "Brand Primary",
    },
    {
      name: "Void Violet",
      hex: "#A051A2",
      role: "Acento Secundario & Gradientes",
      tag: "Brand Secondary",
    },
    {
      name: "Luminescent Sky",
      hex: "#38BDF8",
      role: "Indicadores de Estado & Rich Presence",
      tag: "Info",
    },
    {
      name: "Danger Crimson",
      hex: "#EF4444",
      role: "Crash Diagnostics & Cierres",
      tag: "Danger",
    },
  ];

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1800);
  };

  return (
    <section className="relative z-10 mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
          <Palette className="h-3.5 w-3.5 text-teal-400" />
          <span>SISTEMA DE DISEÑO & WIREFRAMES</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          Anatomía Visual del{" "}
          <span className="bg-linear-to-r from-teal-400 via-purple-400 to-teal-300 bg-clip-text text-transparent">
            Cliente
          </span>
        </h2>
        <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
          Diseñado con estándares de precisión militar y estética de lujo oscuro
          (*Dark Luxury*): contraste óptico perfecto, cristal esmerilado y
          micro-interacciones de 60 FPS.
        </p>

        {/* Tab Selector */}
        <div className="flex justify-center pt-4">
          <div className="inline-flex gap-1 rounded-xl border border-white/10 bg-[#0e0717] p-1.5 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("palette")}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "palette"
                  ? "bg-linear-to-r border border-teal-500/40 from-teal-500/20 to-purple-500/20 text-teal-300 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Paleta Cromática</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("typography")}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "typography"
                  ? "bg-linear-to-r border border-teal-500/40 from-teal-500/20 to-purple-500/20 text-teal-300 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>Tipografía & Jerarquía</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("components")}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "components"
                  ? "bg-linear-to-r border border-teal-500/40 from-teal-500/20 to-purple-500/20 text-teal-300 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Componentes Atómicos UI</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB 1: PALETA CROMÁTICA ── */}
      {activeTab === "palette" && (
        <div className="grid grid-cols-1 gap-5 duration-300 animate-in fade-in sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((c) => (
            <button
              type="button"
              key={c.hex}
              onClick={() => copyHex(c.hex)}
              className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#0c0714] p-5 text-left shadow-xl transition-all duration-300 hover:border-teal-500/40"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className="h-14 w-14 rounded-xl border border-white/15 shadow-inner transition-transform group-hover:scale-105"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase text-slate-300">
                  {c.tag}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm font-bold text-white transition-colors group-hover:text-teal-300">
                  <span>{c.name}</span>
                  <span className="flex items-center gap-1 font-mono text-xs text-slate-400">
                    {c.hex}
                    {copiedColor === c.hex ? (
                      <Check className="h-3 w-3 text-teal-400" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </span>
                </div>
                <p className="text-xs leading-snug text-slate-400">{c.role}</p>
              </div>

              {/* Bottom Subtle Gradient Indicator */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-40 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: c.hex }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── TAB 2: TIPOGRAFÍA & JERARQUÍA ── */}
      {activeTab === "typography" && (
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
                Utilizado para títulos de impacto, números de versión y banners
                de alta jerarquía visual.
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
                Utilizado en nombres de perfiles, categorías de mods y
                encabezados de configuración.
              </p>
            </div>

            {/* Specimen 3: Monospace Data Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-emerald-400">
                <span>DATA HASHS & METRICS • MONOSPACE CODES</span>
                <span>JetBrains Mono / Fira Code</span>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/40 p-3 font-mono text-sm text-emerald-300 sm:text-base">
                SHA-256:
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                [0.6s • 38.4MB]
              </div>
              <p className="text-xs text-slate-400">
                Utilizado para hashes de verificación, argumentos de Java,
                memoria RAM y diagnósticos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: COMPONENTES ATÓMICOS UI ── */}
      {activeTab === "components" && (
        <div className="grid grid-cols-1 gap-6 duration-300 animate-in fade-in md:grid-cols-2">
          {/* Card 1: Buttons & Actions */}
          <div className="space-y-5 rounded-2xl border border-white/10 bg-[#0c0714] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">
                  Botones & Acciones
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase text-slate-400">
                Glass & Glow
              </span>
            </div>

            <div className="space-y-3">
              {/* Primary Action Button */}
              <button
                type="button"
                className="bg-linear-to-r flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl from-teal-400 to-teal-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-teal-500/25 transition-all hover:from-teal-300 hover:to-teal-400 hover:shadow-teal-500/40"
              >
                <Play className="h-4 w-4 fill-slate-950" />
                <span>INICIAR JUEGO (1.21.3 FABRIC)</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* Secondary Glass */}
                <button
                  type="button"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-teal-500/30 hover:bg-white/10"
                >
                  <RotateCw className="h-3.5 w-3.5 text-teal-400" />
                  <span>Cambiar Versión</span>
                </button>

                {/* Danger Button */}
                <button
                  type="button"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-300 transition-all hover:bg-red-500/20"
                >
                  <Zap className="h-3.5 w-3.5 text-red-400" />
                  <span>Reportar Crash</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Toggles & Switches */}
          <div className="space-y-5 rounded-2xl border border-white/10 bg-[#0c0714] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  Switches de Mods & Opciones
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase text-slate-400">
                Interactive State
              </span>
            </div>

            <div className="space-y-3">
              {/* Switch 1 */}
              <button
                type="button"
                onClick={() => setToggleState1(!toggleState1)}
                className="bg-white/2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/5 p-3 text-left transition-colors hover:border-white/15"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Sodium / Embeddium Engine
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Optimizador de renderizado y chunks (+140% FPS)
                  </div>
                </div>
                {toggleState1 ? (
                  <ToggleRight className="h-7 w-7 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-transform" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-slate-600 transition-transform" />
                )}
              </button>

              {/* Switch 2 */}
              <button
                type="button"
                onClick={() => setToggleState2(!toggleState2)}
                className="bg-white/2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/5 p-3 text-left transition-colors hover:border-white/15"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Iris Shaders (Sildur's Vibrant)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Soporte nativo para sombreadores PBR
                  </div>
                </div>
                {toggleState2 ? (
                  <ToggleRight className="h-7 w-7 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-transform" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-slate-600 transition-transform" />
                )}
              </button>

              {/* Switch 3 */}
              <button
                type="button"
                onClick={() => setToggleState3(!toggleState3)}
                className="bg-white/2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/5 p-3 text-left transition-colors hover:border-white/15"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Sincronización Automática en la Nube
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Respaldo instantáneo de capas y presets
                  </div>
                </div>
                {toggleState3 ? (
                  <ToggleRight className="h-7 w-7 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-transform" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-slate-600 transition-transform" />
                )}
              </button>
            </div>
          </div>

          {/* Card 3: Interactive RAM Allocation Slider */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0c0714] p-6 shadow-2xl md:col-span-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">
                  Control de Asignación de Memoria RAM (JVM)
                </h3>
              </div>
              <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 font-mono text-xs font-bold text-teal-300">
                {ramValue} GB Asignados (Recomendado: 4-8 GB)
              </span>
            </div>

            <div className="space-y-4 pt-2">
              <input
                type="range"
                min={2}
                max={32}
                step={1}
                value={ramValue}
                onChange={(e) => setRamValue(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-teal-400"
              />

              <div className="flex justify-between font-mono text-[11px] text-slate-400">
                <span>2 GB (Mínimo)</span>
                <span>4 GB</span>
                <span className="font-bold text-teal-400">8 GB (Ideal)</span>
                <span>16 GB</span>
                <span>32 GB (Extremo)</span>
              </div>

              {/* Real-time feedback badge */}
              <div className="bg-white/2 flex items-center justify-between rounded-xl border border-white/5 p-3 text-xs">
                <span className="text-slate-300">
                  Argumentos JVM generados automáticamente:
                </span>
                <code className="rounded border border-teal-500/20 bg-black/40 px-2 py-1 font-mono text-teal-300">
                  -Xms2G -Xmx{ramValue}G -XX:+UseG1GC -XX:G1ReservePercent=15
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
