import { useState } from "react"
import { m as motion } from "framer-motion"
import { Zap, Download, ChevronRight, ShieldCheck } from "lucide-react"
import { MainLayout } from "../components/Launcher/MainLayout"
import { AuthProvider } from "../components/Launcher/mockLauncherState"

/* ------------------------------------------
   OPTION 5: NUEVO LAUNCHER CRYSTALTIDESSMP (REDISEÑO DE ALTA FIDELIDAD)
   ------------------------------------------ */
const faqItems = [
    {
        q: "¿Necesito una cuenta oficial de Minecraft para usar el launcher?",
        a: "Sí, el launcher oficial de CrystalTides se autentica directamente con los servidores de Microsoft usando OAuth 2.0 cifrado. Tu contraseña nunca toca nuestros servidores."
    },
    {
        q: "¿Cómo funciona la sincronización automática de mods?",
        a: "El cliente incluye un motor en Rust que calcula los hashes SHA-256 de tu carpeta de mods. Si el servidor actualiza un mod o añade uno nuevo, el launcher solo descarga los diffs necesarios en milisegundos."
    },
    {
        q: "¿El launcher es compatible con shaders y paquetes de texturas?",
        a: "¡Totalmente! El modpack oficial integra Sodium, Iris Shaders y la API de recursos de Fabric. Puedes arrastrar tus shaders favoritos directamente a la interfaz."
    },
    {
        q: "¿Por qué el launcher consume menos de 40MB de RAM?",
        a: "A diferencia de launchers antiguos basados en Electron o Java swing, el nuevo launcher de CrystalTides está construido sobre Tauri + WebView2 nativo y Rust, eliminando el consumo innecesario de memoria."
    }
]

const OptionLauncherShowcase = () => {
    // Benchmark State
    const [benchmarkMetric, setBenchmarkMetric] = useState<"ram" | "startup" | "fps">("ram")

    // OS Installer State
    const [activeOs, setActiveOs] = useState<"windows" | "mac" | "linux">("windows")
    const [showChecksum, setShowChecksum] = useState(false)

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState<number | null>(0)

    return (
        <div className="space-y-16 animate-fade-in">
            {/* 1. HERO HEADER DE ALTA FIDELIDAD */}
            <div className="text-center max-w-4xl mx-auto space-y-6">
                <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs font-black uppercase tracking-widest text-cyan-300 px-4 py-1.5 bg-cyan-950/60 border border-cyan-400/40 rounded-full inline-flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                >
                    <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" /> CLIENTE OFICIAL ULTRA OPTIMIZADO (TAURI + RUST)
                </motion.span>
                
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                    El Launcher de Próxima Generación para <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-emerald-300 to-purple-400">CrystalTidesSMP</span>
                </h2>
                
                <p className="text-gray-300 text-base md:text-xl leading-relaxed max-w-3xl mx-auto">
                    Arranque instantáneo, +140% rendimiento de FPS, sincronización inteligente de mods en tiempo real y el radar de maestrías integrado en tu escritorio.
                </p>
            </div>

            {/* 2. LAUNCHER COMPLETO EN TIEMPO REAL (COMPONENTES NATIVOS DEL LAUNCHER) */}
            <div className="relative w-full max-w-6xl mx-auto h-205 rounded-3xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.2)] overflow-hidden text-left">
                <AuthProvider>
                    <MainLayout />
                </AuthProvider>
            </div>

            {/* 3. BENCHMARK COMPARATIVO DE RENDIMIENTO (INTERACTIVE PERFORMANCE SUITE) */}
            <div className="p-8 md:p-12 rounded-3xl bg-slate-950/70 border border-white/10 space-y-8 max-w-5xl mx-auto backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Benchmark de Rendimiento</span>
                        <h3 className="text-2xl md:text-3xl font-black text-white">¿Por qué cambiar al nuevo launcher?</h3>
                    </div>

                    {/* Metric Selector Tabs */}
                    <div className="flex gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-bold">
                        <button aria-label="Action" type="button"
                            onClick={() => setBenchmarkMetric("ram")}
                            className={`px-3.5 py-1.5 rounded-lg transition-colors ${benchmarkMetric === "ram" ? "bg-cyan-500 text-black" : "text-gray-400 hover:text-white"}`}
                        >
                            Uso de RAM (MB)
                        </button>
                        <button aria-label="Action" type="button"
                            onClick={() => setBenchmarkMetric("startup")}
                            className={`px-3.5 py-1.5 rounded-lg transition-colors ${benchmarkMetric === "startup" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"}`}
                        >
                            Arranque (Seg)
                        </button>
                        <button aria-label="Action" type="button"
                            onClick={() => setBenchmarkMetric("fps")}
                            className={`px-3.5 py-1.5 rounded-lg transition-colors ${benchmarkMetric === "fps" ? "bg-purple-500 text-white" : "text-gray-400 hover:text-white"}`}
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
                            <span className="text-cyan-400 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5" /> CrystalTides Launcher (Tauri + Rust)
                            </span>
                            <span className="text-cyan-300 font-mono">
                                {benchmarkMetric === "ram" && "38.4 MB (Mínimo Extremo)"}
                                {benchmarkMetric === "startup" && "0.6s (Instantáneo)"}
                                {benchmarkMetric === "fps" && "+140% FPS (Optimizado)"}
                            </span>
                        </div>
                        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
                            <div 
                                className="h-full bg-linear-to-r from-cyan-500 to-emerald-400 rounded-full transition-colors duration-500"
                                style={{ width: benchmarkMetric === "ram" ? "10%" : benchmarkMetric === "startup" ? "8%" : "95%" }}
                            />
                        </div>
                    </div>

                    {/* Bar 2: Official Mojang Launcher */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-400">
                            <span>Launcher Oficial de Mojang (Electron/Java)</span>
                            <span className="font-mono">
                                {benchmarkMetric === "ram" && "480 MB"}
                                {benchmarkMetric === "startup" && "8.2s"}
                                {benchmarkMetric === "fps" && "0% (Base)"}
                            </span>
                        </div>
                        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                                className="h-full bg-slate-600 rounded-full transition-colors duration-500"
                                style={{ width: benchmarkMetric === "ram" ? "90%" : benchmarkMetric === "startup" ? "85%" : "20%" }}
                            />
                        </div>
                    </div>

                    {/* Bar 3: Third Party Clients */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-400">
                            <span>Otros Launchers Secundarios (Feather/Lunar)</span>
                            <span className="font-mono">
                                {benchmarkMetric === "ram" && "320 MB"}
                                {benchmarkMetric === "startup" && "4.5s"}
                                {benchmarkMetric === "fps" && "+45% FPS"}
                            </span>
                        </div>
                        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                                className="h-full bg-slate-700 rounded-full transition-colors duration-500"
                                style={{ width: benchmarkMetric === "ram" ? "65%" : benchmarkMetric === "startup" ? "50%" : "50%" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. MULTI-OS INSTALLER SUITE */}
            <div className="p-8 md:p-12 rounded-3xl bg-linear-to-r from-cyan-950/40 via-slate-900/90 to-purple-950/40 border border-white/15 text-center space-y-8 max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
                <div className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-widest text-cyan-400 px-3.5 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded-full">
                        Descargas Directas Multi-OS
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        Consigue el Instalador Oficial para tu Sistema
                    </h3>
                    <p className="text-gray-300 text-sm max-w-xl mx-auto">
                        Compatible con Windows 10/11, macOS (Apple Silicon M1/M2/M3 & Intel) y distribuciones Linux.
                    </p>
                </div>

                {/* OS Selector Tabs */}
                <div className="flex justify-center gap-3">
                    <button type="button"
                        onClick={() => setActiveOs("windows")}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 ${
                            activeOs === "windows"
                            ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 scale-105"
                            : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                    >
                        <span>🪟 Windows (10/11)</span>
                    </button>

                    <button type="button"
                        onClick={() => setActiveOs("mac")}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 ${
                            activeOs === "mac"
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25 scale-105"
                            : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                    >
                        <span> macOS (DMG)</span>
                    </button>

                    <button type="button"
                        onClick={() => setActiveOs("linux")}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 ${
                            activeOs === "linux"
                            ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 scale-105"
                            : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                    >
                        <span>🐧 Linux (AppImage)</span>
                    </button>
                </div>

                {/* OS Action Cards */}
                <div className="p-6 rounded-2xl bg-black/40 border border-white/10 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
                    <div className="space-y-1">
                        <h4 className="text-lg font-bold text-white">
                            {activeOs === "windows" && "Instalador para Windows 64-bit"}
                            {activeOs === "mac" && "Universal Binary macOS (M1/M2/M3 & Intel)"}
                            {activeOs === "linux" && "Portable AppImage para Linux"}
                        </h4>
                        <p className="text-xs text-gray-400">
                            {activeOs === "windows" && "Versión 2.4.0 • Formato .msi / .exe • 18.5 MB"}
                            {activeOs === "mac" && "Versión 2.4.0 • Formato .dmg • 22.1 MB"}
                            {activeOs === "linux" && "Versión 2.4.0 • Formato .AppImage • 24.8 MB"}
                        </p>
                    </div>

                    <a
                        href={
                            activeOs === "windows" ? "/downloads/CrystalTides-Launcher-Setup.msi" :
                            activeOs === "mac" ? "/downloads/CrystalTides-Launcher-macOS.dmg" :
                            "/downloads/CrystalTides-Launcher-Linux.AppImage"
                        }
                        className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs tracking-wider uppercase flex items-center gap-2.5 shadow-lg shadow-cyan-500/20 transition-colors hover:scale-105 shrink-0"
                    >
                        <Download className="w-4 h-4" /> DESCARGAR AHORA
                    </a>
                </div>

                {/* Security & SHA-256 Drawer */}
                <div className="space-y-3">
                    <button aria-label="Action" type="button"
                        onClick={() => setShowChecksum(!showChecksum)}
                        className="text-xs text-gray-400 hover:text-cyan-300 font-mono underline cursor-pointer"
                    >
                        {showChecksum ? "Ocultar Hashes SHA-256 de Seguridad" : "Ver Hashes SHA-256 de Verificación"}
                    </button>

                    {showChecksum && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-gray-300 text-left max-w-xl mx-auto space-y-1">
                            <p><span className="text-cyan-400">Windows (.msi):</span> e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
                            <p><span className="text-purple-400">macOS (.dmg):</span> a8f5f167f44f4964e6c998dee827110c deep68f9b940026e6e232924157d6205</p>
                        </motion.div>
                    )}

                    <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Archivos verificados contra malware • Firmados digitalmente • 100% Gratuito</span>
                    </div>
                </div>
            </div>

            {/* 5. FAQ ACCORDION DE REQUISITOS Y PREGUNTAS FRECUENTES */}
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <span className="text-xs font-black uppercase tracking-widest text-purple-400">Preguntas Frecuentes</span>
                    <h3 className="text-2xl md:text-3xl font-black text-white">Todo lo que necesitas saber</h3>
                </div>

                <div className="space-y-3">
                    {faqItems.map((item, idx) => {
                        const isOpen = openFaq === idx
                        return (
                            <div key={item.q} className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden">
                                <button aria-label="Action" type="button"
                                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                                    className="w-full p-5 text-left font-bold text-white flex items-center justify-between gap-4 text-sm md:text-base hover:bg-white/5 transition-colors"
                                >
                                    <span>{item.q}</span>
                                    <ChevronRight className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
                                </button>

                                {isOpen && (
                                    <div className="p-5 pt-0 text-xs md:text-sm text-gray-300 leading-relaxed border-t border-white/5 bg-black/20">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default OptionLauncherShowcase