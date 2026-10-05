import React, { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  ShieldCheck,
  Cpu,
  Activity,
  Check,
  Copy,
  Maximize2,
  Minimize2,
  Monitor,
  Sparkles,
  RefreshCw,
  HardDrive,
  Terminal,
  Layers,
} from 'lucide-react';
import { MainLayout } from './MainLayout';
import { AuthProvider } from './mockLauncherState';
import '../../styles/launcher.css';

const METRICS = {
  RAM: 'ram',
  STARTUP: 'startup',
  FPS: 'fps',
} as const;

type BenchmarkMetric = (typeof METRICS)[keyof typeof METRICS];

const OS_NAMES = {
  windows: 'windows',
  mac: 'mac',
  linux: 'linux',
} as const;

type SupportedOs = (typeof OS_NAMES)[keyof typeof OS_NAMES];

interface BenchmarkStat {
  value: string;
  width: string;
}

interface BenchmarkDataset {
  crystal: BenchmarkStat;
  mojang: BenchmarkStat;
  thirdParty: BenchmarkStat;
}

interface DownloadInfo {
  title: string;
  details: string;
  filePath: string;
}

const CHECKSUM_HASHES: Record<SupportedOs, string> = {
  [OS_NAMES.windows]: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  [OS_NAMES.mac]: 'a8f5f167f44f4964e6c998dee827110cdeep68f9b940026e6e232924157d6205',
  [OS_NAMES.linux]: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
};

const BENCHMARK_DATA: Record<BenchmarkMetric, BenchmarkDataset> = {
  [METRICS.RAM]: {
    crystal: { value: '38.4 MB', width: '10%' },
    mojang: { value: '480 MB', width: '90%' },
    thirdParty: { value: '320 MB', width: '65%' },
  },
  [METRICS.STARTUP]: {
    crystal: { value: '0.6s', width: '8%' },
    mojang: { value: '8.2s', width: '85%' },
    thirdParty: { value: '4.5s', width: '50%' },
  },
  [METRICS.FPS]: {
    crystal: { value: '+140% FPS', width: '95%' },
    mojang: { value: '0% (Base)', width: '20%' },
    thirdParty: { value: '+45%', width: '45%' },
  },
};

const DOWNLOAD_DATA: Record<SupportedOs, DownloadInfo> = {
  [OS_NAMES.windows]: {
    title: 'Instalador para Windows 64-bit',
    details: 'Versión 2.4.0 • Formato .msi • 18.5 MB',
    filePath: '/downloads/CrystalTides-Launcher-Setup.msi',
  },
  [OS_NAMES.mac]: {
    title: 'Universal DMG para macOS',
    details: 'Versión 2.4.0 • Formato .dmg • 22.1 MB',
    filePath: '/downloads/CrystalTides-Launcher-macOS.dmg',
  },
  [OS_NAMES.linux]: {
    title: 'Portable AppImage para Linux',
    details: 'Versión 2.4.0 • Formato .AppImage • 24.8 MB',
    filePath: '/downloads/CrystalTides-Launcher-Linux.AppImage',
  },
};

const detectOperatingSystem = (): SupportedOs => {
  if (typeof window === 'undefined' || !window.navigator) {
    return OS_NAMES.windows;
  }
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('mac')) {
    return OS_NAMES.mac;
  }
  if (userAgent.includes('linux')) {
    return OS_NAMES.linux;
  }
  return OS_NAMES.windows;
};

// Pure Header Component
const LauncherHeader: React.FC = () => (
  <div className="relative z-10 mx-auto max-w-4xl space-y-4 text-center">
    <div className="inline-flex items-center gap-2 border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400">
      <Sparkles className="size-3.5 text-teal-400" />
      <span>CLIENTE OFICIAL TAURI 2.0 • RUST + REACT</span>
    </div>

    <h2 className="text-3xl/tight font-black tracking-tight text-white sm:text-4xl md:text-5xl">
      Si corre en tu navegador... <br />
      <span className="font-extrabold text-teal-400">¡imagina cómo vuela en tu PC!</span>
    </h2>

    <p className="mx-auto max-w-2xl text-sm/relaxed text-slate-300 sm:text-base md:text-lg">
      El Launcher de <strong className="font-semibold text-white">CrystalTides</strong> está
      construido sobre arquitectura nativa ultraligera. Pruébalo en vivo ahora mismo en este
      sandbox: explora perfiles, mods, estadísticas y configuración sin instalar nada.
    </p>

    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs text-slate-300">
      <div className="flex items-center gap-1.5 border border-slate-800 bg-slate-900/80 px-3 py-1.5">
        <HardDrive className="size-3.5 text-teal-400" />
        <span>
          RAM Nativa: <strong className="text-white">&lt;40 MB</strong>
        </span>
      </div>
      <div className="flex items-center gap-1.5 border border-slate-800 bg-slate-900/80 px-3 py-1.5">
        <Activity className="size-3.5 text-teal-400" />
        <span>
          Arranque: <strong className="text-white">0.6s</strong>
        </span>
      </div>
      <div className="flex items-center gap-1.5 border border-slate-800 bg-slate-900/80 px-3 py-1.5">
        <Cpu className="size-3.5 text-teal-400" />
        <span>
          Rendimiento: <strong className="text-white">+140% FPS</strong>
        </span>
      </div>
      <div className="flex items-center gap-1.5 border border-slate-800 bg-slate-900/80 px-3 py-1.5">
        <Layers className="size-3.5 text-teal-400" />
        <span>
          Sincronización: <strong className="text-white">SHA-256 Instantánea</strong>
        </span>
      </div>
    </div>
  </div>
);

interface SandboxProps {
  isFullscreen: boolean;
  simKey: number;
  onReset: () => void;
  onToggleFullscreen: () => void;
}

// Sandbox Simulator Frame
const LauncherSandbox: React.FC<Readonly<SandboxProps>> = ({
  isFullscreen,
  simKey,
  onReset,
  onToggleFullscreen,
}) => (
  <div
    className={`relative z-20 w-full transition-colors duration-300 ease-out ${
      isFullscreen
        ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-2 sm:p-4'
        : 'mx-auto max-w-6xl'
    }`}
  >
    <div className="flex w-full flex-col overflow-hidden border border-slate-700/80 bg-[#0B0F17] shadow-2xl">
      <div
        className="relative w-full overflow-hidden bg-[#070A0F] text-left"
        style={{ height: isFullscreen ? 'calc(100vh - 60px)' : '720px' }}
      >
        <AuthProvider key={simKey}>
          <MainLayout />
        </AuthProvider>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-[#0D111A] px-4 py-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-medium text-teal-300">
            <span className="size-1.5 animate-pulse rounded-full bg-teal-400" />
            <span>SIMULADOR EN VIVO</span>
          </span>
          <span className="hidden sm:inline">Navega por Mods, Perfiles, Ajustes y Logs.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            title="Reiniciar datos de prueba"
            className="flex cursor-pointer items-center gap-1.5 border border-slate-700/50 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className="size-3" />
            <span>Reiniciar</span>
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="flex cursor-pointer items-center gap-1.5 border border-slate-700/50 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
            <span>{isFullscreen ? 'Reducir' : 'Pantalla Completa'}</span>
          </button>
          <a
            href="#downloads"
            className="ml-1 shrink-0 font-semibold text-teal-400 hover:text-teal-300 hover:underline"
          >
            Descargar para PC &rarr;
          </a>
        </div>
      </div>
    </div>
  </div>
);

interface BenchmarkProps {
  metric: BenchmarkMetric;
  onSelectMetric: (metric: BenchmarkMetric) => void;
}

// Technical Benchmark Comparison
const LauncherBenchmark: React.FC<Readonly<BenchmarkProps>> = ({ metric, onSelectMetric }) => {
  const currentData = BENCHMARK_DATA[metric];

  const getMetricButtonClass = (target: BenchmarkMetric) =>
    `cursor-pointer px-3 py-1.5 transition-colors ${
      metric === target
        ? 'border border-slate-700 bg-slate-800 text-teal-400'
        : 'text-slate-400 hover:text-white'
    }`;

  return (
    <div className="relative z-10 mx-auto max-w-5xl space-y-6 border border-slate-800 bg-slate-950/70 p-6 shadow-xl sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <Activity className="size-3.5" /> Comparativa de Rendimiento
          </span>
          <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Consumo Real de Recursos
          </h3>
          <p className="text-xs text-slate-400 sm:text-sm">
            Medición de impacto en memoria y tiempos de respuesta frente a launchers clásicos.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 border border-slate-800 bg-slate-900 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onSelectMetric(METRICS.RAM)}
            className={getMetricButtonClass(METRICS.RAM)}
          >
            Uso de RAM (MB)
          </button>
          <button
            type="button"
            onClick={() => onSelectMetric(METRICS.STARTUP)}
            className={getMetricButtonClass(METRICS.STARTUP)}
          >
            Arranque (Seg)
          </button>
          <button
            type="button"
            onClick={() => onSelectMetric(METRICS.FPS)}
            className={getMetricButtonClass(METRICS.FPS)}
          >
            Ganancia FPS (%)
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-teal-400">CrystalTides Launcher (Tauri 2.0 + Rust)</span>
            <span className="font-mono font-bold text-teal-300">{currentData.crystal.value}</span>
          </div>
          <div className="h-3 w-full border border-slate-800 bg-slate-900 p-0.5">
            <div
              className="h-full bg-teal-500 transition-[width] duration-500"
              style={{ width: currentData.crystal.width }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Launcher Oficial de Mojang (Java/Chromium)</span>
            <span className="font-mono text-slate-400">{currentData.mojang.value}</span>
          </div>
          <div className="h-3 w-full border border-slate-800 bg-slate-900 p-0.5">
            <div
              className="h-full bg-slate-700 transition-[width] duration-500"
              style={{ width: currentData.mojang.width }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Otros Clientes de Terceros</span>
            <span className="font-mono text-slate-400">{currentData.thirdParty.value}</span>
          </div>
          <div className="h-3 w-full border border-slate-800 bg-slate-900 p-0.5">
            <div
              className="h-full bg-slate-800 transition-[width] duration-500"
              style={{ width: currentData.thirdParty.width }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-slate-800 pt-4 md:grid-cols-3">
        <div className="space-y-1.5 border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <Cpu className="size-4 text-teal-400" />
            <span>Sin Chromium Embebido</span>
          </div>
          <p className="text-xs/relaxed text-slate-300">
            Al aprovechar el motor web nativo del sistema operativo a través de Rust, se eliminan
            cientos de megabytes innecesarios de memoria.
          </p>
        </div>

        <div className="space-y-1.5 border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <Terminal className="size-4 text-teal-400" />
            <span>Delta Sync de Mods</span>
          </div>
          <p className="text-xs/relaxed text-slate-300">
            El cliente calcula hashes SHA-256 de tus carpetas de juego para descargar exclusivamente
            los archivos modificados o faltantes.
          </p>
        </div>

        <div className="space-y-1.5 border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <ShieldCheck className="size-4 text-teal-400" />
            <span>Microsoft OAuth 2.0 PKCE</span>
          </div>
          <p className="text-xs/relaxed text-slate-300">
            Autenticación criptográfica oficial directa con Microsoft sin almacenar credenciales en
            servidores de terceros.
          </p>
        </div>
      </div>
    </div>
  );
};

interface DownloadSectionProps {
  activeOs: SupportedOs;
  showChecksum: boolean;
  copiedHash: boolean;
  onSelectOs: (os: SupportedOs) => void;
  onToggleChecksum: () => void;
  onCopyHash: (hash: string) => void;
}

// Download & Checksum Verification Section
const LauncherDownloadSection: React.FC<Readonly<DownloadSectionProps>> = ({
  activeOs,
  showChecksum,
  copiedHash,
  onSelectOs,
  onToggleChecksum,
  onCopyHash,
}) => {
  const downloadInfo = DOWNLOAD_DATA[activeOs];
  const activeHash = CHECKSUM_HASHES[activeOs];

  const getOsTabClass = (target: SupportedOs) =>
    `flex cursor-pointer items-center gap-2 border px-5 py-2 text-xs font-semibold transition-colors ${
      activeOs === target
        ? 'border-slate-600 bg-slate-800 text-teal-300'
        : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
    }`;

  return (
    <div
      id="downloads"
      className="relative z-10 mx-auto max-w-5xl space-y-6 border border-slate-800 bg-[#0A0E17] p-6 text-center shadow-xl sm:p-8"
    >
      <div className="space-y-2">
        <span className="inline-block border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400">
          Instaladores Oficiales
        </span>
        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Descarga CrystalTides Launcher
        </h3>
        <p className="mx-auto max-w-md text-xs text-slate-400 sm:text-sm">
          Disponible para Windows, macOS y distribuciones Linux.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => onSelectOs(OS_NAMES.windows)}
          className={getOsTabClass(OS_NAMES.windows)}
        >
          <Monitor className="size-3.5" />
          <span>Windows (10 / 11)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectOs(OS_NAMES.mac)}
          className={getOsTabClass(OS_NAMES.mac)}
        >
          <span>macOS (Apple Silicon & Intel)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectOs(OS_NAMES.linux)}
          className={getOsTabClass(OS_NAMES.linux)}
        >
          <span>Linux (AppImage)</span>
        </button>
      </div>

      <div className="mx-auto flex max-w-xl flex-col items-center justify-between gap-4 border border-slate-800 bg-slate-900/70 p-5 text-left sm:flex-row">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white sm:text-base">{downloadInfo.title}</h4>
          <p className="text-xs text-slate-400">{downloadInfo.details}</p>
        </div>

        <a
          href={downloadInfo.filePath}
          className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 bg-teal-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-950 transition-colors hover:bg-teal-400 sm:w-auto"
        >
          <Download className="size-4" /> DESCARGAR
        </a>
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onToggleChecksum}
          className="cursor-pointer font-mono text-xs text-slate-400 underline transition-colors hover:text-teal-300"
        >
          {showChecksum ? 'Ocultar Hashes SHA-256' : 'Ver Hashes SHA-256 de Verificación'}
        </button>

        <AnimatePresence>
          {showChecksum && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto max-w-xl space-y-1.5 overflow-hidden border border-slate-800 bg-slate-950 p-3 text-left font-mono text-[11px] text-slate-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-teal-400">{activeOs} SHA-256:</span>
                <button
                  type="button"
                  onClick={() => onCopyHash(activeHash)}
                  className="flex cursor-pointer items-center gap-1 text-xs text-teal-300 hover:text-white"
                >
                  {copiedHash ? (
                    <Check className="size-3.5 text-teal-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>{copiedHash ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="break-all border border-slate-800 bg-black/40 p-2 text-slate-400">
                {activeHash}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-slate-400">
          <ShieldCheck className="size-4 text-teal-400" />
          <span>Firmado digitalmente • Sin publicidad ni telemetría invasiva</span>
        </div>
      </div>
    </div>
  );
};

export const LauncherShowcaseSection: React.FC = () => {
  const [benchmarkMetric, setBenchmarkMetric] = useState<BenchmarkMetric>(METRICS.RAM);
  const [activeOs, setActiveOs] = useState<SupportedOs>(detectOperatingSystem);
  const [showChecksum, setShowChecksum] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simKey, setSimKey] = useState(0);

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const resetSimulation = () => {
    setSimKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const toggleChecksum = () => {
    setShowChecksum((prev) => !prev);
  };

  return (
    <section id="launcher" className="relative w-full space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <LauncherHeader />
      <LauncherSandbox
        isFullscreen={isFullscreen}
        simKey={simKey}
        onReset={resetSimulation}
        onToggleFullscreen={toggleFullscreen}
      />
      <LauncherBenchmark metric={benchmarkMetric} onSelectMetric={setBenchmarkMetric} />
      <LauncherDownloadSection
        activeOs={activeOs}
        showChecksum={showChecksum}
        copiedHash={copiedHash}
        onSelectOs={setActiveOs}
        onToggleChecksum={toggleChecksum}
        onCopyHash={copyToClipboard}
      />
    </section>
  );
};

export default LauncherShowcaseSection;
