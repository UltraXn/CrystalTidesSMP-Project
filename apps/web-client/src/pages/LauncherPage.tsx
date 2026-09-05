import { useState } from "react"
import { LauncherShowcaseSection } from "../components/Launcher/LauncherShowcaseSection"
import { DesignSystemShowcase } from "../components/Launcher/DesignSystemShowcase"
import { ScreenShowcaseSection } from "../components/Launcher/ScreenShowcaseSection"
import { ArchitectureInfographic } from "../components/Launcher/ArchitectureInfographic"
import { useSEO } from "../hooks/useSEO"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
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
    Cpu
} from "lucide-react"

export default function LauncherPage() {
    const { t } = useTranslation()
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [copiedHash, setCopiedHash] = useState<string | null>(null)

    useSEO({
        title: t('launcher.seo_title', 'Cliente Oficial • CrystalTides Launcher | Rendimiento Extremo'),
        description: t('launcher.seo_desc', 'Descarga el nuevo cliente oficial de CrystalTides SMP (Tauri 2.0 + Rust). Arranque instantáneo en 0.6s, <40MB de RAM y sincronización de mods en tiempo real.'),
        keywords: 'CrystalTides Launcher, Minecraft Client, Tauri Minecraft Launcher, Modded SMP 1.21.1, Rust Minecraft Launcher',
        canonical: 'https://crystaltidessmp.net/launcher'
    })

    const hashes = {
        windows: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        mac: "a8f5f167f44f4964e6c998dee827110cdeep68f9b940026e6e232924157d6205",
        linux: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
    }

    const copyHash = (hash: string) => {
        navigator.clipboard.writeText(hash)
        setCopiedHash(hash)
        setTimeout(() => setCopiedHash(null), 2000)
    }

    const faqs = [
        {
            q: "¿Es seguro el cliente? ¿Pide mi contraseña de Microsoft?",
            a: "100% seguro. CrystalTides Client utiliza el flujo oficial Microsoft OAuth 2.0 con PKCE en una ventana nativa segura. Tus credenciales nunca tocan nuestros servidores ni se guardan en texto plano en tu equipo."
        },
        {
            q: "¿Cómo logra consumir menos de 40MB de memoria RAM?",
            a: "A diferencia de la mayoría de launchers que empaquetan un navegador Chromium completo (Electron) consumiendo 400MB-800MB solo en abrirse, nuestro cliente está programado nativamente en Rust con Tauri 2.0 y utiliza el motor WebKit/WebView2 nativo de tu sistema operativo."
        },
        {
            q: "¿Puedo añadir mis propios mods de terceros?",
            a: "¡Sí! El cliente cuenta con un gestor completo de mods donde puedes activar, desactivar o arrastrar tus propios mods (.jar), shaders o resource packs personalizados a cada perfil."
        },
        {
            q: "¿Qué es la sincronización Delta SHA-256?",
            a: "Cada vez que actualizamos los mods oficiales del servidor, el launcher no vuelve a descargar el modpack completo. Compara los hashes criptográficos de tus archivos locales y descarga únicamente los parches o mods nuevos en segundos."
        },
        {
            q: "¿Requiere tener Java preinstalado en mi PC?",
            a: "No es obligatorio. Si no tienes una versión de Java compatible instalada, el launcher detecta y descarga automáticamente el entorno OpenJDK adecuado (Java 21 para Minecraft 1.21+) de forma aislada y optimizada."
        }
    ]

    return (
        <div className="min-h-screen bg-[#050206] text-white selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
            {/* Top Glow & Ambient Accents */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-200 h-125 bg-linear-to-b from-teal-500/10 via-purple-600/5 to-transparent blur-[140px] rounded-full" />
                <div className="absolute top-1/3 -left-40 w-112.5 h-112.5 bg-purple-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-10 -right-40 w-125 h-125 bg-teal-600/10 blur-[140px] rounded-full" />
            </div>

            {/* Top Navigation Breadcrumb */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/5 hover:border-teal-500/30"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Volver a CrystalTides Home</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <a
                            href="https://discord.com/invite/TDmwYNnvyT"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-[#5865F2] hover:text-white transition-all py-1.5 px-3 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2] border border-[#5865F2]/30 hover:border-[#5865F2]"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            <span>Comunidad Discord</span>
                        </a>

                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-slate-300 font-mono font-medium">v2.4.0 Estable</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. HERO SECTION CINEMATOGRÁFICO */}
            <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-teal-500/10">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>CLIENTE OFICIAL TAURI 2.0 • RUST CORE</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
                    El Launcher Definitivo para <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-400 via-purple-300 to-teal-300">
                        Minecraft Modded
                    </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                    Arranque instantáneo en <strong className="text-white font-bold">0.6 segundos</strong>, consumo menor a <strong className="text-white font-bold">40MB de RAM</strong> y sincronización delta de mods en tiempo real.
                </p>

                {/* Performance Pill Metrics */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono">
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                        <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                        <span>RAM: <strong className="text-white font-bold">&lt; 38.4 MB</strong></span>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                        <Activity className="w-3.5 h-3.5 text-teal-400" />
                        <span>Inicio: <strong className="text-white font-bold">0.6s</strong></span>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                        <Cpu className="w-3.5 h-3.5 text-teal-400" />
                        <span>FPS Boost: <strong className="text-white font-bold">+140% FPS</strong></span>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-teal-400" />
                        <span>Sync: <strong className="text-white font-bold">SHA-256 Delta</strong></span>
                    </div>
                </div>

                {/* Hero CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <a
                        href="#downloads"
                        className="px-8 py-3.5 rounded-xl bg-linear-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-teal-500/25 hover:scale-105 transition-all flex items-center gap-2.5 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>DESCARGAR PARA TU PC</span>
                    </a>
                    <a
                        href="#sandbox"
                        className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <span>Explorar Simulador Web &darr;</span>
                    </a>
                </div>
            </header>

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
            <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="p-6 sm:p-8 rounded-3xl bg-[#09050d] border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Monitor className="w-5 h-5 text-teal-400" />
                        <h3 className="text-xl font-bold text-white">Requisitos del Sistema</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                        <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                            <div className="font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-400" />
                                Windows
                            </div>
                            <div className="text-slate-400 space-y-1">
                                <div>OS: Windows 10 / 11 (64-bit)</div>
                                <div>RAM Mínima: 4 GB (8 GB recomendado)</div>
                                <div>Almacenamiento: 250 MB libres</div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                            <div className="font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                macOS
                            </div>
                            <div className="text-slate-400 space-y-1">
                                <div>OS: macOS 11.0 (Big Sur) o superior</div>
                                <div>Arquitectura: Apple Silicon (M1/M2/M3/M4) & Intel</div>
                                <div>Almacenamiento: 250 MB libres</div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                            <div className="font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                Linux
                            </div>
                            <div className="text-slate-400 space-y-1">
                                <div>Distros: Ubuntu 20.04+, Debian 11+, Arch, Fedora</div>
                                <div>Formato: AppImage universal / paquete .deb</div>
                                <div>Librerías: webkit2gtk-4.1 / glibc 2.31+</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. SECCIÓN DE DESCARGAS MULTI-SO CON HASHES SHA-256 */}
            <section id="downloads" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                        <Download className="w-4 h-4" /> DESCARGA DIRECTA MULTI-PLATAFORMA
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white">Descarga Oficial Verificada</h2>
                    <p className="text-slate-400 text-xs sm:text-sm">
                        Instaladores oficiales firmados digitalmente. Sin publicidad ni software secundario.
                    </p>
                </div>

                {/* OS Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Windows */}
                    <div className="p-6 rounded-2xl bg-[#0c0714] border border-white/10 hover:border-teal-500/40 transition-all shadow-xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="text-sm font-bold text-white flex items-center justify-between">
                                <span>Windows 10 / 11</span>
                                <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded">.msi / .exe</span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Instalador nativo x64 compatible con WebView2. Incluye auto-actualizador silencioso.
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <button
                                type="button"
                                onClick={() => copyHash(hashes.windows)}
                                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center justify-between cursor-pointer"
                            >
                                <span className="truncate">SHA-256: {hashes.windows.slice(0, 16)}...</span>
                                {copiedHash === hashes.windows ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            </button>

                            <button
                                type="button"
                                className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Descargar Windows (.msi)</span>
                            </button>
                        </div>
                    </div>

                    {/* macOS */}
                    <div className="p-6 rounded-2xl bg-[#0c0714] border border-white/10 hover:border-purple-500/40 transition-all shadow-xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="text-sm font-bold text-white flex items-center justify-between">
                                <span>macOS Universal</span>
                                <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">.dmg</span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Binario Universal compilado para Apple Silicon (M1/M2/M3/M4) y procesadores Intel.
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <button
                                type="button"
                                onClick={() => copyHash(hashes.mac)}
                                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center justify-between cursor-pointer"
                            >
                                <span className="truncate">SHA-256: {hashes.mac.slice(0, 16)}...</span>
                                {copiedHash === hashes.mac ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            </button>

                            <button
                                type="button"
                                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Descargar macOS (.dmg)</span>
                            </button>
                        </div>
                    </div>

                    {/* Linux */}
                    <div className="p-6 rounded-2xl bg-[#0c0714] border border-white/10 hover:border-amber-500/40 transition-all shadow-xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="text-sm font-bold text-white flex items-center justify-between">
                                <span>Linux Universal</span>
                                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded">.AppImage / .deb</span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Paquete independiente compatible con Ubuntu, Debian, Arch Linux, Fedora y Flatpak.
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <button
                                type="button"
                                onClick={() => copyHash(hashes.linux)}
                                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center justify-between cursor-pointer"
                            >
                                <span className="truncate">SHA-256: {hashes.linux.slice(0, 16)}...</span>
                                {copiedHash === hashes.linux ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            </button>

                            <button
                                type="button"
                                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Descargar Linux (.AppImage)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. PREGUNTAS FRECUENTES (FAQ ACCORDION) */}
            <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-400">
                        <HelpCircle className="w-4 h-4" /> Preguntas Frecuentes
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">¿Tienes dudas sobre el cliente?</h2>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaq === idx
                        return (
                            <div 
                                key={idx}
                                className="rounded-xl border border-white/10 bg-[#0a0610]/80 overflow-hidden transition-colors"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-white/2 transition-colors"
                                >
                                    <span className="text-sm sm:text-base font-bold text-white">
                                        {faq.q}
                                    </span>
                                    <ChevronDown 
                                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                                            isOpen ? "rotate-180 text-teal-400" : ""
                                        }`} 
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* 9. BANNER FINAL CTA */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8 text-center">
                <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-r from-teal-950/40 via-purple-950/30 to-teal-950/40 border border-teal-500/20 shadow-2xl space-y-6">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                        ¿Listo para experimentar Minecraft a máxima velocidad?
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
                        Descarga el instalador oficial, inicia sesión con un clic y únete a la comunidad de CrystalTides SMP.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href="#downloads"
                            className="px-8 py-3.5 bg-linear-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide rounded-xl shadow-lg shadow-teal-500/20 hover:scale-105 transition-all cursor-pointer"
                        >
                            DESCARGAR AHORA
                        </a>
                        <Link
                            to="/wiki"
                            className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-xl transition-colors"
                        >
                            Ver Guía de Instalación
                        </Link>
                        <a
                            href="https://discord.com/invite/TDmwYNnvyT"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#5865F2]/15 hover:bg-[#5865F2] border border-[#5865F2]/40 hover:border-[#5865F2] text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-[#5865F2]/25 cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            <span>Comunidad Discord</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
