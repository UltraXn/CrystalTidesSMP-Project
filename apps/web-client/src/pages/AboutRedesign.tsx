import { useState } from 'react';
import { m as motion } from 'framer-motion';
import { Zap, Download, ChevronRight, ShieldCheck } from 'lucide-react';
import { MainLayout } from '../components/Launcher/MainLayout';
import { AuthProvider } from '../components/Launcher/mockLauncherState';

/* ------------------------------------------
   CONSTANTS & CONFIGURATION
   ------------------------------------------ */
type BenchmarkMetric = 'ram' | 'startup' | 'fps';
type OperatingSystem = 'windows' | 'mac' | 'linux';

interface FaqItem {
  readonly q: string;
  readonly a: string;
}

interface BenchmarkMetricData {
  readonly label: string;
  readonly activeClass: string;
  readonly crystalTides: { readonly value: string; readonly width: string };
  readonly mojang: { readonly value: string; readonly width: string };
  readonly thirdParty: { readonly value: string; readonly width: string };
}

interface OsDetails {
  readonly tabLabel: string;
  readonly title: string;
  readonly specs: string;
  readonly downloadUrl: string;
  readonly activeClass: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
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
] as const;

const BENCHMARK_METRICS: Record<BenchmarkMetric, BenchmarkMetricData> = {
  ram: {
    label: 'Uso de RAM (MB)',
    activeClass: 'bg-cyan-500 text-black',
    crystalTides: { value: '38.4 MB (Mínimo Extremo)', width: '10%' },
    mojang: { value: '480 MB', width: '90%' },
    thirdParty: { value: '320 MB', width: '65%' },
  },
  startup: {
    label: 'Arranque (Seg)',
    activeClass: 'bg-emerald-500 text-black',
    crystalTides: { value: '0.6s (Instantáneo)', width: '8%' },
    mojang: { value: '8.2s', width: '85%' },
    thirdParty: { value: '4.5s', width: '50%' },
  },
  fps: {
    label: 'Ganancia FPS (%)',
    activeClass: 'bg-purple-500 text-white',
    crystalTides: { value: '+140% FPS (Optimizado)', width: '95%' },
    mojang: { value: '0% (Base)', width: '20%' },
    thirdParty: { value: '+45% FPS', width: '45%' },
  },
} as const;

const OS_INSTALLER_OPTIONS: Record<OperatingSystem, OsDetails> = {
  windows: {
    tabLabel: '🪟 Windows (10/11)',
    title: 'Instalador para Windows 64-bit',
    specs: 'Versión 2.4.0 • Formato .msi / .exe • 18.5 MB',
    downloadUrl: '/downloads/CrystalTides-Launcher-Setup.msi',
    activeClass: 'scale-105 bg-cyan-500 text-black shadow-lg shadow-cyan-500/25',
  },
  mac: {
    tabLabel: ' macOS (DMG)',
    title: 'Universal Binary macOS (M1/M2/M3 & Intel)',
    specs: 'Versión 2.4.0 • Formato .dmg • 22.1 MB',
    downloadUrl: '/downloads/CrystalTides-Launcher-macOS.dmg',
    activeClass: 'scale-105 bg-purple-500 text-white shadow-lg shadow-purple-500/25',
  },
  linux: {
    tabLabel: '🐧 Linux (AppImage)',
    title: 'Portable AppImage para Linux',
    specs: 'Versión 2.4.0 • Formato .AppImage • 24.8 MB',
    downloadUrl: '/downloads/CrystalTides-Launcher-Linux.AppImage',
    activeClass: 'scale-105 bg-emerald-500 text-black shadow-lg shadow-emerald-500/25',
  },
} as const;

const SHA256_HASHES = {
  windows: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  mac: 'a8f5f167f44f4964e6c998dee827110c deep68f9b940026e6e232924157d6205',
} as const;

const INACTIVE_TAB_CLASS = 'text-gray-400 hover:text-white';
const INACTIVE_OS_CLASS = 'bg-white/5 text-gray-400 hover:text-white';

/* ------------------------------------------
   HERO SECTION
   ------------------------------------------ */
const HeroSection = () => (
  <div className="mx-auto max-w-4xl space-y-6 text-center">
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
    >
      <Zap className="h-3.5 w-3.5 animate-bounce text-cyan-400" /> CLIENTE OFICIAL ULTRA OPTIMIZADO
      (TAURI + RUST)
    </motion.span>

    <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
      El Launcher de Próxima Generación para{' '}
      <span className="bg-linear-to-r from-cyan-400 via-emerald-300 to-purple-400 bg-clip-text text-transparent">
        CrystalTidesSMP
      </span>
    </h2>

    <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-300 md:text-xl">
      Arranque instantáneo, +140% rendimiento de FPS, sincronización inteligente de mods en tiempo
      real y el radar de maestrías integrado en tu escritorio.
    </p>
  </div>
);

/* ------------------------------------------
   LAUNCHER PREVIEW CONTAINER
   ------------------------------------------ */
const LauncherShowcasePreview = () => (
  <div className="h-205 relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-950/90 text-left shadow-[0_0_60px_rgba(6,182,212,0.2)] backdrop-blur-2xl">
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  </div>
);

/* ------------------------------------------
   BENCHMARK SECTION COMPONENTS
   ------------------------------------------ */
interface BenchmarkBarRowProps {
  readonly label: string;
  readonly value: string;
  readonly width: string;
  readonly barClass: string;
  readonly containerBorderClass: string;
  readonly labelColorClass: string;
  readonly isPrimary?: boolean;
}

const BenchmarkBarRow = ({
  label,
  value,
  width,
  barClass,
  containerBorderClass,
  labelColorClass,
  isPrimary = false,
}: BenchmarkBarRowProps) => (
  <div className="space-y-2">
    <div className={`flex justify-between text-xs font-bold ${labelColorClass}`}>
      <span className="flex items-center gap-1.5">
        {isPrimary && <Zap className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className={`font-mono ${isPrimary ? 'text-cyan-300' : ''}`}>{value}</span>
    </div>
    <div
      className={`h-4 w-full overflow-hidden rounded-full border ${containerBorderClass} bg-slate-900 p-0.5`}
    >
      <div
        className={`h-full rounded-full transition-colors duration-500 ${barClass}`}
        style={{ width }}
      />
    </div>
  </div>
);

const BenchmarkSection = () => {
  const [benchmarkMetric, setBenchmarkMetric] = useState<BenchmarkMetric>('ram');
  const metricData = BENCHMARK_METRICS[benchmarkMetric];
  const metricKeys: readonly BenchmarkMetric[] = ['ram', 'startup', 'fps'];

  return (
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

        <div className="flex gap-1.5 rounded-xl border border-white/10 bg-black/60 p-1 text-xs font-bold">
          {metricKeys.map((key) => {
            const isSelected = benchmarkMetric === key;
            const data = BENCHMARK_METRICS[key];
            return (
              <button
                key={key}
                aria-label={`Seleccionar métrica de ${data.label}`}
                type="button"
                onClick={() => setBenchmarkMetric(key)}
                className={`rounded-lg px-3.5 py-1.5 transition-colors ${
                  isSelected ? data.activeClass : INACTIVE_TAB_CLASS
                }`}
              >
                {data.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        <BenchmarkBarRow
          isPrimary
          label="CrystalTides Launcher (Tauri + Rust)"
          value={metricData.crystalTides.value}
          width={metricData.crystalTides.width}
          labelColorClass="text-cyan-400"
          containerBorderClass="border-cyan-500/30"
          barClass="bg-linear-to-r from-cyan-500 to-emerald-400"
        />

        <BenchmarkBarRow
          label="Launcher Oficial de Mojang (Electron/Java)"
          value={metricData.mojang.value}
          width={metricData.mojang.width}
          labelColorClass="text-gray-400"
          containerBorderClass="border-white/5"
          barClass="bg-slate-600"
        />

        <BenchmarkBarRow
          label="Otros Launchers Secundarios (Feather/Lunar)"
          value={metricData.thirdParty.value}
          width={metricData.thirdParty.width}
          labelColorClass="text-gray-400"
          containerBorderClass="border-white/5"
          barClass="bg-slate-700"
        />
      </div>
    </div>
  );
};

/* ------------------------------------------
   MULTI-OS INSTALLER SECTION
   ------------------------------------------ */
interface SecurityChecksumDrawerProps {
  readonly showChecksum: boolean;
  readonly onToggle: () => void;
}

const SecurityChecksumDrawer = ({
  showChecksum,
  onToggle,
}: Readonly<SecurityChecksumDrawerProps>) => (
  <div className="space-y-3">
    <button
      aria-label="Alternar verificación de hashes de seguridad"
      type="button"
      onClick={onToggle}
      className="cursor-pointer font-mono text-xs text-gray-400 underline hover:text-cyan-300"
    >
      {showChecksum ? 'Ocultar Hashes SHA-256 de Seguridad' : 'Ver Hashes SHA-256 de Verificación'}
    </button>

    {showChecksum && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl space-y-1 rounded-xl border border-white/10 bg-black/60 p-4 text-left font-mono text-[11px] text-gray-300"
      >
        <p>
          <span className="text-cyan-400">Windows (.msi):</span> {SHA256_HASHES.windows}
        </p>
        <p>
          <span className="text-purple-400">macOS (.dmg):</span> {SHA256_HASHES.mac}
        </p>
      </motion.div>
    )}

    <div className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold text-emerald-400">
      <ShieldCheck className="h-4 w-4 text-emerald-400" />
      <span>Archivos verificados contra malware • Firmados digitalmente • 100% Gratuito</span>
    </div>
  </div>
);

const InstallerSection = () => {
  const [activeOs, setActiveOs] = useState<OperatingSystem>('windows');
  const [showChecksum, setShowChecksum] = useState(false);
  const currentOs = OS_INSTALLER_OPTIONS[activeOs];
  const osKeys: readonly OperatingSystem[] = ['windows', 'mac', 'linux'];

  return (
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

      <div className="flex justify-center gap-3">
        {osKeys.map((osKey) => {
          const item = OS_INSTALLER_OPTIONS[osKey];
          const isSelected = activeOs === osKey;
          return (
            <button
              key={osKey}
              type="button"
              onClick={() => setActiveOs(osKey)}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition-colors ${
                isSelected ? item.activeClass : INACTIVE_OS_CLASS
              }`}
            >
              <span>{item.tabLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-6 rounded-2xl border border-white/10 bg-black/40 p-6 text-left sm:flex-row">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-white">{currentOs.title}</h4>
          <p className="text-xs text-gray-400">{currentOs.specs}</p>
        </div>

        <a
          href={currentOs.downloadUrl}
          className="flex shrink-0 items-center gap-2.5 rounded-xl bg-cyan-500 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-cyan-500/20 transition-colors hover:scale-105 hover:bg-cyan-400"
        >
          <Download className="h-4 w-4" /> DESCARGAR AHORA
        </a>
      </div>

      <SecurityChecksumDrawer
        showChecksum={showChecksum}
        onToggle={() => setShowChecksum((prev) => !prev)}
      />
    </div>
  );
};

/* ------------------------------------------
   FAQ SECTION
   ------------------------------------------ */
interface FaqItemRowProps {
  readonly item: FaqItem;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

const FaqItemRow = ({ item, isOpen, onToggle }: Readonly<FaqItemRowProps>) => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
    <button
      aria-label={`Pregunta: ${item.q}`}
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-white transition-colors hover:bg-white/5 md:text-base"
    >
      <span>{item.q}</span>
      <ChevronRight
        className={`h-5 w-5 text-cyan-400 transition-transform duration-300 ${
          isOpen ? 'rotate-90' : ''
        }`}
      />
    </button>

    {isOpen && (
      <div className="border-t border-white/5 bg-black/20 p-5 pt-0 text-xs leading-relaxed text-gray-300 md:text-sm">
        {item.a}
      </div>
    )}
  </div>
);

const FaqSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq((current) => (current === idx ? null : idx));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2 text-center">
        <span className="text-xs font-black uppercase tracking-widest text-purple-400">
          Preguntas Frecuentes
        </span>
        <h3 className="text-2xl font-black text-white md:text-3xl">Todo lo que necesitas saber</h3>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => (
          <FaqItemRow
            key={item.q}
            item={item}
            isOpen={openFaq === idx}
            onToggle={() => toggleFaq(idx)}
          />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------
   OPTION 5: NUEVO LAUNCHER CRYSTALTIDESSMP
   ------------------------------------------ */
const OptionLauncherShowcase = () => {
  return (
    <div className="animate-fade-in space-y-16">
      <HeroSection />
      <LauncherShowcasePreview />
      <BenchmarkSection />
      <InstallerSection />
      <FaqSection />
    </div>
  );
};

export default OptionLauncherShowcase;
