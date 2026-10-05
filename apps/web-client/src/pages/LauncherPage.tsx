import { useState, useCallback } from 'react';
import { LauncherShowcaseSection } from '../components/Launcher/LauncherShowcaseSection';
import { DesignSystemShowcase } from '../components/Launcher/DesignSystemShowcase';
import { ScreenShowcaseSection } from '../components/Launcher/ScreenShowcaseSection';
import { ArchitectureInfographic } from '../components/Launcher/ArchitectureInfographic';
import { useSEO } from '../hooks/useSEO';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  ChevronDown,
  Sparkles,
  ArrowLeft,
  HelpCircle,
  Monitor,
  Layers,
  Download,
  Check,
  Copy,
  HardDrive,
  Activity,
  Cpu,
} from 'lucide-react';

const CONSTANTS = {
  DISCORD_URL: 'https://discord.com/invite/TDmwYNnvyT',
  CANONICAL_URL: 'https://crystaltidessmp.net/launcher',
  DEFAULT_SEO_TITLE: 'Cliente Oficial • CrystalTides Launcher | Rendimiento Extremo',
  DEFAULT_SEO_DESC:
    'Descarga el nuevo cliente oficial de CrystalTides SMP (Tauri 2.0 + Rust). Arranque instantáneo en 0.6s, <40MB de RAM y sincronización de mods en tiempo real.',
  SEO_KEYWORDS:
    'CrystalTides Launcher, Minecraft Client, Tauri Minecraft Launcher, Modded SMP 1.21.1, Rust Minecraft Launcher',
} as const;

interface PlatformDownloadInfo {
  id: 'windows' | 'mac' | 'linux';
  title: string;
  badge: string;
  badgeClass: string;
  description: string;
  hash: string;
  downloadLabel: string;
  borderHoverClass: string;
  checkIconClass: string;
  buttonClass: string;
}

const PLATFORM_DOWNLOADS: readonly PlatformDownloadInfo[] = [
  {
    id: 'windows',
    title: 'Windows 10 / 11',
    badge: '.msi / .exe',
    badgeClass: 'bg-teal-500/10 text-teal-300',
    description:
      'Instalador nativo x64 compatible con WebView2. Incluye auto-actualizador silencioso.',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    downloadLabel: 'Descargar Windows (.msi)',
    borderHoverClass: 'hover:border-teal-500/40',
    checkIconClass: 'text-teal-400',
    buttonClass:
      'bg-linear-to-r flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl from-teal-400 to-teal-500 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-teal-500/20 transition-colors hover:from-teal-300 hover:to-teal-400',
  },
  {
    id: 'mac',
    title: 'macOS Universal',
    badge: '.dmg',
    badgeClass: 'bg-purple-500/10 text-purple-300',
    description:
      'Binario Universal compilado para Apple Silicon (M1/M2/M3/M4) y procesadores Intel.',
    hash: 'a8f5f167f44f4964e6c998dee827110cdeep68f9b940026e6e232924157d6205',
    downloadLabel: 'Descargar macOS (.dmg)',
    borderHoverClass: 'hover:border-purple-500/40',
    checkIconClass: 'text-purple-400',
    buttonClass:
      'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/15',
  },
  {
    id: 'linux',
    title: 'Linux Universal',
    badge: '.AppImage / .deb',
    badgeClass: 'bg-amber-500/10 text-amber-300',
    description:
      'Paquete independiente compatible con Ubuntu, Debian, Arch Linux, Fedora y Flatpak.',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    downloadLabel: 'Descargar Linux (.AppImage)',
    borderHoverClass: 'hover:border-amber-500/40',
    checkIconClass: 'text-amber-400',
    buttonClass:
      'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/15',
  },
];

interface FaqItem {
  id: string;
  q: string;
  a: string;
}

const FAQS: readonly FaqItem[] = [
  {
    id: 'faq-security',
    q: '¿Es seguro el cliente? ¿Pide mi contraseña de Microsoft?',
    a: '100% seguro. CrystalTides Client utiliza el flujo oficial Microsoft OAuth 2.0 con PKCE en una ventana nativa segura. Tus credenciales nunca tocan nuestros servidores ni se guardan en texto plano en tu equipo.',
  },
  {
    id: 'faq-memory',
    q: '¿Cómo logra consumir menos de 40MB de memoria RAM?',
    a: 'A diferencia de la mayoría de launchers que empaquetan un navegador Chromium completo (Electron) consumiendo 400MB-800MB solo en abrirse, nuestro cliente está programado nativamente en Rust con Tauri 2.0 y utiliza el motor WebKit/WebView2 nativo de tu sistema operativo.',
  },
  {
    id: 'faq-mods',
    q: '¿Puedo añadir mis propios mods de terceros?',
    a: '¡Sí! El cliente cuenta con un gestor completo de mods donde puedes activar, desactivar o arrastrar tus propios mods (.jar), shaders o resource packs personalizados a cada perfil.',
  },
  {
    id: 'faq-delta',
    q: '¿Qué es la sincronización Delta SHA-256?',
    a: 'Cada vez que actualizamos los mods oficiales del servidor, el launcher no vuelve a descargar el modpack completo. Compara los hashes criptográficos de tus archivos locales y descarga únicamente los parches o mods nuevos en segundos.',
  },
  {
    id: 'faq-java',
    q: '¿Requiere tener Java preinstalado en mi PC?',
    a: 'No es obligatorio. Si no tienes una versión de Java compatible instalada, el launcher detecta y descarga automáticamente el entorno OpenJDK adecuado (Java 21 para Minecraft 1.21+) de forma aislada y optimizada.',
  },
];

function DiscordIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function NavigationBreadcrumb() {
  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-4 pt-24 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-teal-500/30 hover:text-teal-400"
        >
          <ArrowLeft className="size-3.5" />
          <span>Volver a CrystalTides Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href={CONSTANTS.DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#5865F2]/30 bg-[#5865F2]/10 px-3 py-1.5 text-xs font-bold text-[#5865F2] transition-colors hover:border-[#5865F2] hover:bg-[#5865F2] hover:text-white"
          >
            <DiscordIcon className="size-3.5" />
            <span>Comunidad Discord</span>
          </a>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <span className="size-2 animate-ping rounded-full bg-emerald-400" />
            <span className="font-mono font-medium text-slate-300">v2.4.0 Estable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMetrics() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-slate-300">
        <HardDrive className="size-3.5 text-teal-400" />
        <span>
          RAM: <strong className="font-bold text-white">&lt; 38.4 MB</strong>
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-slate-300">
        <Activity className="size-3.5 text-teal-400" />
        <span>
          Inicio: <strong className="font-bold text-white">0.6s</strong>
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-slate-300">
        <Cpu className="size-3.5 text-teal-400" />
        <span>
          FPS Boost: <strong className="font-bold text-white">+140% FPS</strong>
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-slate-300">
        <Layers className="size-3.5 text-teal-400" />
        <span>
          Sync: <strong className="font-bold text-white">SHA-256 Delta</strong>
        </span>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <header className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 pb-14 pt-8 text-center sm:px-6 lg:px-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300 shadow-lg shadow-teal-500/10">
        <Sparkles className="size-3.5 text-teal-400" />
        <span>CLIENTE OFICIAL TAURI 2.0 • RUST CORE</span>
      </div>

      <h1 className="mx-auto max-w-4xl text-4xl/tight font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
        El Launcher Definitivo para <br />
        <span className="bg-linear-to-r from-teal-400 via-purple-300 to-teal-300 bg-clip-text text-transparent">
          Minecraft Modded
        </span>
      </h1>

      <p className="mx-auto max-w-2xl text-sm/relaxed text-slate-300 sm:text-base md:text-lg">
        Arranque instantáneo en <strong className="font-bold text-white">0.6 segundos</strong>,
        consumo menor a <strong className="font-bold text-white">40MB de RAM</strong> y
        sincronización delta de mods en tiempo real.
      </p>

      <HeroMetrics />

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <a
          href="#downloads"
          className="bg-linear-to-r flex cursor-pointer items-center gap-2.5 rounded-xl from-teal-400 to-teal-500 px-8 py-3.5 text-sm font-black tracking-wide text-slate-950 shadow-xl shadow-teal-500/25 transition-colors hover:scale-105 hover:from-teal-300 hover:to-teal-400"
        >
          <Download className="size-4" />
          <span>DESCARGAR PARA TU PC</span>
        </a>
        <a
          href="#sandbox"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          <span>Explorar Simulador Web &darr;</span>
        </a>
      </div>
    </header>
  );
}

function SystemRequirementsSection() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-[#09050d] p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Monitor className="size-5 text-teal-400" />
          <h3 className="text-xl font-bold text-white">Requisitos del Sistema</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3 sm:text-sm">
          <div className="bg-white/2 space-y-2 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="size-2 rounded-full bg-teal-400" />
              <span>Windows</span>
            </div>
            <div className="space-y-1 text-slate-400">
              <div>OS: Windows 10 / 11 (64-bit)</div>
              <div>RAM Mínima: 4 GB (8 GB recomendado)</div>
              <div>Almacenamiento: 250 MB libres</div>
            </div>
          </div>

          <div className="bg-white/2 space-y-2 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="size-2 rounded-full bg-purple-400" />
              <span>macOS</span>
            </div>
            <div className="space-y-1 text-slate-400">
              <div>OS: macOS 11.0 (Big Sur) o superior</div>
              <div>Arquitectura: Apple Silicon (M1/M2/M3/M4) & Intel</div>
              <div>Almacenamiento: 250 MB libres</div>
            </div>
          </div>

          <div className="bg-white/2 space-y-2 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="size-2 rounded-full bg-amber-400" />
              <span>Linux</span>
            </div>
            <div className="space-y-1 text-slate-400">
              <div>Distros: Ubuntu 20.04+, Debian 11+, Arch, Fedora</div>
              <div>Formato: AppImage universal / paquete .deb</div>
              <div>Librerías: webkit2gtk-4.1 / glibc 2.31+</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface PlatformCardProps {
  platform: PlatformDownloadInfo;
  isCopied: boolean;
  onCopyHash: (hash: string) => void;
}

function PlatformCard({ platform, isCopied, onCopyHash }: Readonly<PlatformCardProps>) {
  return (
    <div
      className={`flex flex-col justify-between space-y-4 rounded-2xl border border-white/10 bg-[#0c0714] p-6 shadow-xl transition-colors ${platform.borderHoverClass}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-bold text-white">
          <span>{platform.title}</span>
          <span className={`rounded-sm px-2 py-0.5 font-mono text-[10px] ${platform.badgeClass}`}>
            {platform.badge}
          </span>
        </div>
        <p className="text-xs text-slate-400">{platform.description}</p>
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => onCopyHash(platform.hash)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 font-mono text-[11px] text-slate-300 hover:bg-white/10"
        >
          <span className="truncate">SHA-256: {platform.hash.slice(0, 16)}...</span>
          {isCopied ? (
            <Check className={`size-3.5 ${platform.checkIconClass}`} />
          ) : (
            <Copy className="size-3.5 text-slate-500" />
          )}
        </button>

        <button type="button" className={platform.buttonClass}>
          <Download className="size-3.5" />
          <span>{platform.downloadLabel}</span>
        </button>
      </div>
    </div>
  );
}

interface DownloadSectionProps {
  copiedHash: string | null;
  onCopyHash: (hash: string) => void;
}

function DownloadSection({ copiedHash, onCopyHash }: Readonly<DownloadSectionProps>) {
  return (
    <section
      id="downloads"
      className="relative z-10 mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
          <Download className="size-4" /> DESCARGA DIRECTA MULTI-PLATAFORMA
        </div>
        <h2 className="text-3xl font-black text-white sm:text-4xl">Descarga Oficial Verificada</h2>
        <p className="text-xs text-slate-400 sm:text-sm">
          Instaladores oficiales firmados digitalmente. Sin publicidad ni software secundario.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLATFORM_DOWNLOADS.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            isCopied={copiedHash === platform.hash}
            onCopyHash={onCopyHash}
          />
        ))}
      </div>
    </section>
  );
}

interface FaqAccordionItemProps {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqAccordionItem({ faq, isOpen, onToggle }: Readonly<FaqAccordionItemProps>) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0610]/80 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="hover:bg-white/2 flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left transition-colors sm:p-5"
      >
        <span className="text-sm font-bold text-white sm:text-base">{faq.q}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-400' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-white/5 px-4 pb-5 pt-3 text-xs/relaxed text-slate-300 sm:px-5 sm:text-sm">
          {faq.a}
        </div>
      )}
    </div>
  );
}

function FaqSection({
  openFaq,
  onToggleFaq,
}: Readonly<{
  openFaq: number | null;
  onToggleFaq: (idx: number) => void;
}>) {
  return (
    <section className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-400">
          <HelpCircle className="size-4" /> Preguntas Frecuentes
        </div>
        <h2 className="text-2xl font-black text-white sm:text-3xl">
          ¿Tienes dudas sobre el cliente?
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => (
          <FaqAccordionItem
            key={faq.id}
            faq={faq}
            isOpen={openFaq === idx}
            onToggle={() => onToggleFaq(idx)}
          />
        ))}
      </div>
    </section>
  );
}

function FinalBannerCta() {
  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-8 text-center sm:px-6 lg:px-8">
      <div className="bg-linear-to-r space-y-6 rounded-3xl border border-teal-500/20 from-teal-950/40 via-purple-950/30 to-teal-950/40 p-8 shadow-2xl sm:p-12">
        <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">
          ¿Listo para experimentar Minecraft a máxima velocidad?
        </h3>
        <p className="mx-auto max-w-xl text-sm text-slate-300 sm:text-base">
          Descarga el instalador oficial, inicia sesión con un clic y únete a la comunidad de
          CrystalTides SMP.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#downloads"
            className="bg-linear-to-r cursor-pointer rounded-xl from-teal-400 to-teal-500 px-8 py-3.5 text-sm font-black tracking-wide text-slate-950 shadow-lg shadow-teal-500/20 transition-colors hover:scale-105 hover:from-teal-300 hover:to-teal-400"
          >
            DESCARGAR AHORA
          </a>
          <Link
            to="/wiki"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Ver Guía de Instalación
          </Link>
          <a
            href={CONSTANTS.DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/15 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:border-[#5865F2] hover:bg-[#5865F2] hover:shadow-[#5865F2]/25"
          >
            <DiscordIcon className="size-4" />
            <span>Comunidad Discord</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LauncherPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useSEO({
    title: t('launcher.seo_title', CONSTANTS.DEFAULT_SEO_TITLE),
    description: t('launcher.seo_desc', CONSTANTS.DEFAULT_SEO_DESC),
    keywords: CONSTANTS.SEO_KEYWORDS,
    canonical: CONSTANTS.CANONICAL_URL,
  });

  const handleCopyHash = useCallback((hash: string) => {
    void navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  }, []);

  const handleToggleFaq = useCallback((idx: number) => {
    setOpenFaq((current) => (current === idx ? null : idx));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050206] text-white selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Glow & Ambient Accents */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="w-200 h-125 bg-linear-to-b absolute -top-40 left-1/2 -translate-x-1/2 rounded-full from-teal-500/10 via-purple-600/5 to-transparent blur-[140px]" />
        <div className="size-112.5 absolute -left-40 top-1/3 rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="size-125 absolute -right-40 bottom-10 rounded-full bg-teal-600/10 blur-[140px]" />
      </div>

      {/* Top Navigation Breadcrumb */}
      <NavigationBreadcrumb />

      {/* 1. HERO SECTION CINEMATOGRÁFICO */}
      <HeroSection />

      {/* 2. SANDBOX INTERACTIVO EN VIVO */}
      <div id="sandbox" className="relative z-10">
        <LauncherShowcaseSection />
      </div>

      {/* 3. SISTEMA DE DISEÑO & ANATOMÍA VISUAL */}
      <DesignSystemShowcase />

      {/* 4. DESGLOSE DE PANTALLAS WIREFRAME UI/UX */}
      <ScreenShowcaseSection />

      {/* 5. INFOGRAFÍA ARQUITECTURA EN RUST & RENDIMIENTO */}
      <ArchitectureInfographic />

      {/* 6. MATRIZ DE REQUISITOS DEL SISTEMA */}
      <SystemRequirementsSection />

      {/* 7. SECCIÓN DE DESCARGAS MULTI-SO CON HASHES SHA-256 */}
      <DownloadSection copiedHash={copiedHash} onCopyHash={handleCopyHash} />

      {/* 8. PREGUNTAS FRECUENTES (FAQ ACCORDION) */}
      <FaqSection openFaq={openFaq} onToggleFaq={handleToggleFaq} />

      {/* 9. BANNER FINAL CTA */}
      <FinalBannerCta />
    </div>
  );
}
