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
  Zap
} from "lucide-react";

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"palette" | "typography" | "components">("palette");
  const [toggleState1, setToggleState1] = useState(true);
  const [toggleState2, setToggleState2] = useState(false);
  const [toggleState3, setToggleState3] = useState(true);
  const [ramValue, setRamValue] = useState(6);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = [
    { name: "Beyond Black", hex: "#060305", role: "Fondo Principal / Canvas Canvas", tag: "Background" },
    { name: "Obsidian Deep", hex: "#0D0714", role: "Superficie de Tarjetas & Paneles", tag: "Surface" },
    { name: "Electric Teal", hex: "#2DD4BF", role: "Acento Primario / Glow de Acción", tag: "Brand Primary" },
    { name: "Void Violet", hex: "#A051A2", role: "Acento Secundario & Gradientes", tag: "Brand Secondary" },
    { name: "Luminescent Sky", hex: "#38BDF8", role: "Indicadores de Estado & Rich Presence", tag: "Info" },
    { name: "Danger Crimson", hex: "#EF4444", role: "Crash Diagnostics & Cierres", tag: "Danger" },
  ];

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1800);
  };

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-teal-400" />
          <span>SISTEMA DE DISEÑO & WIREFRAMES</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Anatomía Visual del <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-400 via-purple-400 to-teal-300">Cliente</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Diseñado con estándares de precisión militar y estética de lujo oscuro (*Dark Luxury*): contraste óptico perfecto, cristal esmerilado y micro-interacciones de 60 FPS.
        </p>

        {/* Tab Selector */}
        <div className="flex justify-center pt-4">
          <div className="inline-flex p-1.5 rounded-xl bg-[#0e0717] border border-white/10 shadow-2xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("palette")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "palette"
                  ? "bg-linear-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/40 text-teal-300 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Paleta Cromática</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("typography")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "typography"
                  ? "bg-linear-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/40 text-teal-300 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Tipografía & Jerarquía</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("components")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "components"
                  ? "bg-linear-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/40 text-teal-300 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Componentes Atómicos UI</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB 1: PALETA CROMÁTICA ── */}
      {activeTab === "palette" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
          {colors.map((c) => (
            <div
              key={c.hex}
              onClick={() => copyHex(c.hex)}
              className="group p-5 rounded-2xl bg-[#0c0714] border border-white/10 hover:border-teal-500/40 transition-all duration-300 shadow-xl cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-xl border border-white/15 shadow-inner transition-transform group-hover:scale-105"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
                  {c.tag}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors flex items-center justify-between">
                  <span>{c.name}</span>
                  <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                    {c.hex}
                    {copiedColor === c.hex ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-snug">
                  {c.role}
                </p>
              </div>

              {/* Bottom Subtle Gradient Indicator */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: c.hex }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: TIPOGRAFÍA & JERARQUÍA ── */}
      {activeTab === "typography" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-8 rounded-2xl bg-[#0c0714] border border-white/10 shadow-2xl space-y-8">
            {/* Specimen 1: Display Black */}
            <div className="space-y-2 border-b border-white/5 pb-6">
              <div className="flex items-center justify-between text-xs text-teal-400 font-mono font-bold">
                <span>DISPLAY HEADINGS • WEIGHT 900 BLACK</span>
                <span>Figtree / Montserrat 900</span>
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                CRYSTALTIDES CLIENT 1.21
              </div>
              <p className="text-xs text-slate-400">
                Utilizado para títulos de impacto, números de versión y banners de alta jerarquía visual.
              </p>
            </div>

            {/* Specimen 2: Subheadings */}
            <div className="space-y-2 border-b border-white/5 pb-6">
              <div className="flex items-center justify-between text-xs text-purple-400 font-mono font-bold">
                <span>SECTION SUBTITLES • WEIGHT 700 BOLD</span>
                <span>Inter / Space Grotesk 700</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                Gestor de Mods y Sincronización Delta SHA-256 en Tiempo Real
              </div>
              <p className="text-xs text-slate-400">
                Utilizado en nombres de perfiles, categorías de mods y encabezados de configuración.
              </p>
            </div>

            {/* Specimen 3: Monospace Data Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-mono font-bold">
                <span>DATA HASHS & METRICS • MONOSPACE CODES</span>
                <span>JetBrains Mono / Fira Code</span>
              </div>
              <div className="font-mono text-sm sm:text-base text-emerald-300 bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/20">
                SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 [0.6s • 38.4MB]
              </div>
              <p className="text-xs text-slate-400">
                Utilizado para hashes de verificación, argumentos de Java, memoria RAM y diagnósticos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: COMPONENTES ATÓMICOS UI ── */}
      {activeTab === "components" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Card 1: Buttons & Actions */}
          <div className="p-6 rounded-2xl bg-[#0c0714] border border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Botones & Acciones</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Glass & Glow</span>
            </div>

            <div className="space-y-3">
              {/* Primary Action Button */}
              <button
                type="button"
                className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>INICIAR JUEGO (1.21.3 FABRIC)</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* Secondary Glass */}
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/30 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-teal-400" />
                  <span>Cambiar Versión</span>
                </button>

                {/* Danger Button */}
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-red-400" />
                  <span>Reportar Crash</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Toggles & Switches */}
          <div className="p-6 rounded-2xl bg-[#0c0714] border border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Switches de Mods & Opciones</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Interactive State</span>
            </div>

            <div className="space-y-3">
              {/* Switch 1 */}
              <div 
                onClick={() => setToggleState1(!toggleState1)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/15 transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white">Sodium / Embeddium Engine</div>
                  <div className="text-[11px] text-slate-400">Optimizador de renderizado y chunks (+140% FPS)</div>
                </div>
                {toggleState1 ? (
                  <ToggleRight className="w-7 h-7 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-transform" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-600 transition-transform" />
                )}
              </div>

              {/* Switch 2 */}
              <div 
                onClick={() => setToggleState2(!toggleState2)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/15 transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white">Iris Shaders (Sildur's Vibrant)</div>
                  <div className="text-[11px] text-slate-400">Soporte nativo para sombreadores PBR</div>
                </div>
                {toggleState2 ? (
                  <ToggleRight className="w-7 h-7 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-transform" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-600 transition-transform" />
                )}
              </div>

              {/* Switch 3 */}
              <div 
                onClick={() => setToggleState3(!toggleState3)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/15 transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white">Sincronización Automática en la Nube</div>
                  <div className="text-[11px] text-slate-400">Respaldo instantáneo de capas y presets</div>
                </div>
                {toggleState3 ? (
                  <ToggleRight className="w-7 h-7 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-transform" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-600 transition-transform" />
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Interactive RAM Allocation Slider */}
          <div className="p-6 rounded-2xl bg-[#0c0714] border border-white/10 shadow-2xl space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Control de Asignación de Memoria RAM (JVM)</h3>
              </div>
              <span className="text-xs font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
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
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>2 GB (Mínimo)</span>
                <span>4 GB</span>
                <span className="text-teal-400 font-bold">8 GB (Ideal)</span>
                <span>16 GB</span>
                <span>32 GB (Extremo)</span>
              </div>

              {/* Real-time feedback badge */}
              <div className="p-3 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Argumentos JVM generados automáticamente:
                </span>
                <code className="font-mono text-teal-300 bg-black/40 px-2 py-1 rounded border border-teal-500/20">
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
