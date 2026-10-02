import { useState } from 'react';
import { m as motion } from 'framer-motion';
import { Zap, Download, ChevronRight, ShieldCheck } from 'lucide-react';
import { MainLayout } from '../components/Launcher/MainLayout';
import { AuthProvider } from '../components/Launcher/mockLauncherState';

/* ------------------------------------------
   OPTION 5: NUEVO LAUNCHER CRYSTALTIDESSMP (REDISEÑO DE ALTA FIDELIDAD)
   ------------------------------------------ */
const faqItems = [
  {
    q: '¿Necesito una cuenta oficial de Minecraft para usar el launcher?',
    a: 'Sí, el launcher oficial de CrystalTides se autentica directamente con los servidores de Microsoft usando OAuth 2.0 cifrado. Tu contraseña nunca toca nuestros servidores.',
  },
  {
    q: '¿Cómo funciona la sincronización automática de mods?',
    a: 'El cliente incluye un motor en Rust que calcula los hashes SHA-256 de tu carpeta de mods. Si el servidor actualiza un mod o añade uno nuevo, el launcher solo descarga los diffs necesarios en milisegundos.',
  },
  {
    q: '¿El launcher es compatible con shaders y paquetes de texturas?',
    a: '¡Totalmente! El modpack oficial integra Sodium, Iris Shaders y la API de recursos de Fabric. Puedes arrastrar tus shaders favoritos directamente a la interfaz.',
  },
  {
    q: '¿Por qué el launcher consume menos de 40MB de RAM?',
    a: 'A diferencia de launchers antiguos basados en Electron o Java swing, el nuevo launcher de CrystalTides está construido sobre Tauri + WebView2 nativo y Rust, eliminando el consumo innecesario de memoria.',
  },
];

const OptionLauncherShowcase = () => {
  // Benchmark State
  const [benchmarkMetric, setBenchmarkMetric] = useState<'ram' | 'startup' | 'fps'>('ram');

  // OS Installer State
  const [activeOs, setActiveOs] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [showChecksum, setShowChecksum] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="animate-fade-in space-y-16">
      {/* 1. HERO HEADER DE ALTA FIDELIDAD */}
      <div className="mx-auto max-w-4xl space-y-6 text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
        >
          <Zap className="h-3.5 w-3.5 animate-bounce text-cyan-400" /> CLIENTE OFICIAL ULTRA
          OPTIMIZADO (TAURI + RUST)
        </motion.span>

        <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
          El Launcher de Próxima Generación para{' '}
          <span className="bg-linear-to-r from-cyan-400 via-emerald-300 to-purple-400 bg-clip-text text-transparent">
            CrystalTidesSMP
          </span>
        </h2>

        <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-300 md:text-xl">
          Arranque instantáneo, +140% rendimiento de FPS, sincronización inteligente de mods en
          tiempo real y el radar de maestrías integrado en tu escritorio.
        </p>
      </div>

      {/* 2. LAUNCHER COMPLETO EN TIEMPO REAL (COMPONENTES NATIVOS DEL LAUNCHER) */}
      <div className="h-205 relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-950/90 text-left shadow-[0_0_60px_rgba(6,182,212,0.2)] backdrop-blur-2xl">
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </div>

      {/* 3. BENCHMARK COMPARATIVO DE RENDIMIENTO (INTERACTIVE PERFORMANCE SUITE) */}
      <div className="mx-auto max-w-5xl space-y-8 rounded-3xl border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl md:p-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Benchmark de Rendimiento
            </span>
            <h3 className="text-2xl font-black text-white md:text-3xl">
              ¿Por qué cambiar al nuevo launcher?
            </h3>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex gap-1.5 rounded-xl border border-white/10 bg-black/60 p-1 text-xs font-bold">
            <button
              aria-label="Action"
              type="button"
              onClick={() => setBenchmarkMetric('ram')}
              className={`rounded-lg px-3.5 py-1.5 transition-colors ${benchmarkMetric === 'ram' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Uso de RAM (MB)
            </button>
            <button
              aria-label="Action"
              type="button"
              onClick={() => setBenchmarkMetric('startup')}
              className={`rounded-lg px-3.5 py-1.5 transition-colors ${benchmarkMetric === 'startup' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Arranque (Seg)
            </button>
            <button
              aria-label="Action"
              type="button"
              onClick={() => setBenchmarkMetric('fps')}
              className={`rounded-lg px-3.5 py-1.5 transition-colors ${benchmarkMetric === 'fps' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Ganancia FPS (%)
            </button>
          </div>
        </div>

        {/* Benchmark Bars Visualizer */}
        <div className="space-y-5">
          {/* Bar 1: CrystalTides Launcher */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="h-3.5 w-3.5" /> CrystalTides Launcher (Tauri + Rust)
              </span>
              <span className="font-mono text-cyan-300">
                {benchmarkMetric === 'ram' && '38.4 MB (Mínimo Extremo)'}
                {benchmarkMetric === 'startup' && '0.6s (Instantáneo)'}
                {benchmarkMetric === 'fps' && '+140% FPS (Optimizado)'}
              </span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full border border-cyan-500/30 bg-slate-900 p-0.5">
              <div
                className="bg-linear-to-r h-full rounded-full from-cyan-500 to-emerald-400 transition-colors duration-500"
                style={{
                  width:
                    benchmarkMetric === 'ram'
                      ? '10%'
                      : benchmarkMetric === 'startup'
                        ? '8%'
                        : '95%',
                }}
              />
            </div>
          </div>

          {/* Bar 2: Official Mojang Launcher */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-400">
              <span>Launcher Oficial de Mojang (Electron/Java)</span>
              <span className="font-mono">
                {benchmarkMetric === 'ram' && '480 MB'}
                {benchmarkMetric === 'startup' && '8.2s'}
                {benchmarkMetric === 'fps' && '0% (Base)'}
              </span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full border border-white/5 bg-slate-900 p-0.5">
              <div
                className="h-full rounded-full bg-slate-600 transition-colors duration-500"
                style={{
                  width:
                    benchmarkMetric === 'ram'
                      ? '90%'
                      : benchmarkMetric === 'startup'
                        ? '85%'
                        : '20%',
                }}
              />
            </div>
          </div>

          {/* Bar 3: Third Party Clients */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-400">
              <span>Otros Launchers Secundarios (Feather/Lunar)</span>
              <span className="font-mono">
                {benchmarkMetric === 'ram' && '320 MB'}
                {benchmarkMetric === 'startup' && '4.5s'}
                {benchmarkMetric === 'fps' && '+45% FPS'}
              </span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full border border-white/5 bg-slate-900 p-0.5">
              <div
                className="h-full rounded-full bg-slate-700 transition-colors duration-500"
                style={{
                  width:
                    benchmarkMetric === 'ram'
                      ? '65%'
                      : benchmarkMetric === 'startup'
                        ? '50%'
                        : '45%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. MULTI-OS INSTALLER SUITE */}
      <div className="bg-linear-to-r relative mx-auto max-w-5xl space-y-8 overflow-hidden rounded-3xl border border-white/15 from-cyan-950/40 via-slate-900/90 to-purple-950/40 p-8 text-center shadow-2xl md:p-12">
        <div className="space-y-3">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
            Descargas Directas Multi-OS
          </span>
          <h3 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Consigue el Instalador Oficial para tu Sistema
          </h3>
          <p className="mx-auto max-w-xl text-sm text-gray-300">
            Compatible con Windows 10/11, macOS (Apple Silicon M1/M2/M3 & Intel) y distribuciones
            Linux.
          </p>
        </div>

        {/* OS Selector Tabs */}
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveOs('windows')}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition-colors ${
              activeOs === 'windows'
                ? 'scale-105 bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <span>🪟 Windows (10/11)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveOs('mac')}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition-colors ${
              activeOs === 'mac'
                ? 'scale-105 bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <span> macOS (DMG)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveOs('linux')}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition-colors ${
              activeOs === 'linux'
                ? 'scale-105 bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <span>🐧 Linux (AppImage)</span>
          </button>
        </div>

        {/* OS Action Cards */}
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-6 rounded-2xl border border-white/10 bg-black/40 p-6 text-left sm:flex-row">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">
              {activeOs === 'windows' && 'Instalador para Windows 64-bit'}
              {activeOs === 'mac' && 'Universal Binary macOS (M1/M2/M3 & Intel)'}
              {activeOs === 'linux' && 'Portable AppImage para Linux'}
            </h4>
            <p className="text-xs text-gray-400">
              {activeOs === 'windows' && 'Versión 2.4.0 • Formato .msi / .exe • 18.5 MB'}
              {activeOs === 'mac' && 'Versión 2.4.0 • Formato .dmg • 22.1 MB'}
              {activeOs === 'linux' && 'Versión 2.4.0 • Formato .AppImage • 24.8 MB'}
            </p>
          </div>

          <a
            href={
              activeOs === 'windows'
                ? '/downloads/CrystalTides-Launcher-Setup.msi'
                : activeOs === 'mac'
                  ? '/downloads/CrystalTides-Launcher-macOS.dmg'
                  : '/downloads/CrystalTides-Launcher-Linux.AppImage'
            }
            className="flex shrink-0 items-center gap-2.5 rounded-xl bg-cyan-500 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-cyan-500/20 transition-colors hover:scale-105 hover:bg-cyan-400"
          >
            <Download className="h-4 w-4" /> DESCARGAR AHORA
          </a>
        </div>

        {/* Security & SHA-256 Drawer */}
        <div className="space-y-3">
          <button
            aria-label="Action"
            type="button"
            onClick={() => setShowChecksum(!showChecksum)}
            className="cursor-pointer font-mono text-xs text-gray-400 underline hover:text-cyan-300"
          >
            {showChecksum
              ? 'Ocultar Hashes SHA-256 de Seguridad'
              : 'Ver Hashes SHA-256 de Verificación'}
          </button>

          {showChecksum && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-xl space-y-1 rounded-xl border border-white/10 bg-black/60 p-4 text-left font-mono text-[11px] text-gray-300"
            >
              <p>
                <span className="text-cyan-400">Windows (.msi):</span>{' '}
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </p>
              <p>
                <span className="text-purple-400">macOS (.dmg):</span>{' '}
                a8f5f167f44f4964e6c998dee827110c deep68f9b940026e6e232924157d6205
              </p>
            </motion.div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Archivos verificados contra malware • Firmados digitalmente • 100% Gratuito</span>
          </div>
        </div>
      </div>

      {/* 5. FAQ ACCORDION DE REQUISITOS Y PREGUNTAS FRECUENTES */}
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-purple-400">
            Preguntas Frecuentes
          </span>
          <h3 className="text-2xl font-black text-white md:text-3xl">
            Todo lo que necesitas saber
          </h3>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60"
              >
                <button
                  aria-label="Action"
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-white transition-colors hover:bg-white/5 md:text-base"
                >
                  <span>{item.q}</span>
                  <ChevronRight
                    className={`h-5 w-5 text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 bg-black/20 p-5 pt-0 text-xs leading-relaxed text-gray-300 md:text-sm">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OptionLauncherShowcase;
