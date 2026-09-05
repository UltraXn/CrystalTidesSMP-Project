import React, { useState, useEffect } from "react"
import { m as motion, AnimatePresence } from "framer-motion"
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
    Layers
} from "lucide-react"
import { MainLayout } from "./MainLayout"
import { AuthProvider } from "./mockLauncherState"
import "../../styles/launcher.css"

export const LauncherShowcaseSection: React.FC = () => {
    // Benchmark State
    const [benchmarkMetric, setBenchmarkMetric] = useState<"ram" | "startup" | "fps">("ram")

    // OS Detection & Selector State
    const [activeOs, setActiveOs] = useState<"windows" | "mac" | "linux">("windows")
    const [showChecksum, setShowChecksum] = useState(false)
    const [copiedHash, setCopiedHash] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [simKey, setSimKey] = useState(0)

    // Detect user OS on mount
    useEffect(() => {
        if (typeof window !== "undefined" && window.navigator) {
            const userAgent = window.navigator.userAgent.toLowerCase()
            if (userAgent.includes("mac")) {
                setActiveOs("mac")
            } else if (userAgent.includes("linux")) {
                setActiveOs("linux")
            } else {
                setActiveOs("windows")
            }
        }
    }, [])

    const hashes = {
        windows: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        mac: "a8f5f167f44f4964e6c998dee827110cdeep68f9b940026e6e232924157d6205",
        linux: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedHash(true)
        setTimeout(() => setCopiedHash(false), 2000)
    }

    const resetSimulation = () => {
        setSimKey(prev => prev + 1)
    }

    return (
        <section id="launcher" className="w-full relative py-12 px-4 sm:px-6 lg:px-8 space-y-12">
            {/* 1. HEADER & INTRODUCCIÓN */}
            <div className="text-center max-w-4xl mx-auto space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>CLIENTE OFICIAL TAURI 2.0 • RUST + REACT</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    Si corre en tu navegador... <br />
                    <span className="text-teal-400 font-extrabold">
                        ¡imagina cómo vuela en tu PC!
                    </span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                    El Launcher de <strong className="text-white font-semibold">CrystalTides</strong> está construido sobre arquitectura nativa ultraligera. Pruébalo en vivo ahora mismo en este sandbox: explora perfiles, mods, estadísticas y configuración sin instalar nada.
                </p>

                {/* Especificaciones Clave */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800">
                        <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                        <span>RAM Nativa: <strong className="text-white">&lt;40 MB</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800">
                        <Activity className="w-3.5 h-3.5 text-teal-400" />
                        <span>Arranque: <strong className="text-white">0.6s</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800">
                        <Cpu className="w-3.5 h-3.5 text-teal-400" />
                        <span>Rendimiento: <strong className="text-white">+140% FPS</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800">
                        <Layers className="w-3.5 h-3.5 text-teal-400" />
                        <span>Sincronización: <strong className="text-white">SHA-256 Instantánea</strong></span>
                    </div>
                </div>
            </div>

            {/* 2. VENTANA DE ESCRITORIO DEL LAUNCHER (SIN BORDES REDONDEADOS - RECTO Y PROFESIONAL) */}
            <div className={`relative w-full transition-all duration-300 ease-out z-20 ${
                isFullscreen 
                    ? "fixed inset-0 z-50 bg-black/95 p-2 sm:p-4 flex flex-col justify-center items-center" 
                    : "max-w-6xl mx-auto"
            }`}>
                <div className="w-full border border-slate-700/80 bg-[#0B0F17] shadow-2xl overflow-hidden flex flex-col">
                    {/* Contenedor del Launcher en Vivo (utiliza su propia WindowTitleBar auténtica) */}
                    <div 
                        className="w-full relative bg-[#070A0F] overflow-hidden text-left" 
                        style={{ height: isFullscreen ? "calc(100vh - 60px)" : "720px" }}
                    >
                        <AuthProvider key={simKey}>
                            <MainLayout />
                        </AuthProvider>
                    </div>

                    {/* Barra Inferior con Información y Controles del Sandbox */}
                    <div className="px-4 py-2.5 bg-[#0D111A] border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-teal-300 font-mono text-[11px] flex items-center gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                SIMULADOR EN VIVO
                            </span>
                            <span className="hidden sm:inline">Navega por Mods, Perfiles, Ajustes y Logs.</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={resetSimulation}
                                title="Reiniciar datos de prueba"
                                className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/50 flex items-center gap-1.5 text-xs"
                            >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reiniciar</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                                className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/50 flex items-center gap-1.5 text-xs"
                            >
                                {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                                <span>{isFullscreen ? "Reducir" : "Pantalla Completa"}</span>
                            </button>
                            <a 
                                href="#downloads" 
                                className="text-teal-400 hover:text-teal-300 font-semibold hover:underline shrink-0 ml-1"
                            >
                                Descargar para PC &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. COMPARATIVA TÉCNICA Y BENCHMARK */}
            <div className="p-6 sm:p-8 border border-slate-800 bg-slate-950/70 space-y-6 max-w-5xl mx-auto shadow-xl relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" /> Comparativa de Rendimiento
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            Consumo Real de Recursos
                        </h3>
                        <p className="text-slate-400 text-xs sm:text-sm">
                            Medición de impacto en memoria y tiempos de respuesta frente a launchers clásicos.
                        </p>
                    </div>

                    {/* Selector de Métricas */}
                    <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setBenchmarkMetric("ram")}
                            className={`px-3 py-1.5 transition-colors cursor-pointer ${
                                benchmarkMetric === "ram" 
                                    ? "bg-slate-800 text-teal-400 border border-slate-700" 
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Uso de RAM (MB)
                        </button>
                        <button
                            type="button"
                            onClick={() => setBenchmarkMetric("startup")}
                            className={`px-3 py-1.5 transition-colors cursor-pointer ${
                                benchmarkMetric === "startup" 
                                    ? "bg-slate-800 text-teal-400 border border-slate-700" 
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Arranque (Seg)
                        </button>
                        <button
                            type="button"
                            onClick={() => setBenchmarkMetric("fps")}
                            className={`px-3 py-1.5 transition-colors cursor-pointer ${
                                benchmarkMetric === "fps" 
                                    ? "bg-slate-800 text-teal-400 border border-slate-700" 
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Ganancia FPS (%)
                        </button>
                    </div>
                </div>

                {/* Barras Visuales de Comparación */}
                <div className="space-y-4 pt-1">
                    {/* Bar 1: CrystalTides Launcher */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-teal-400">
                                CrystalTides Launcher (Tauri 2.0 + Rust)
                            </span>
                            <span className="text-teal-300 font-mono font-bold">
                                {benchmarkMetric === "ram" && "38.4 MB"}
                                {benchmarkMetric === "startup" && "0.6s"}
                                {benchmarkMetric === "fps" && "+140% FPS"}
                            </span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 border border-slate-800 p-0.5">
                            <div 
                                className="h-full bg-teal-500 transition-all duration-500"
                                style={{ width: benchmarkMetric === "ram" ? "10%" : benchmarkMetric === "startup" ? "8%" : "95%" }}
                            />
                        </div>
                    </div>

                    {/* Bar 2: Official Mojang Launcher */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-400">
                            <span>Launcher Oficial de Mojang (Java/Chromium)</span>
                            <span className="font-mono text-slate-400">
                                {benchmarkMetric === "ram" && "480 MB"}
                                {benchmarkMetric === "startup" && "8.2s"}
                                {benchmarkMetric === "fps" && "0% (Base)"}
                            </span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 border border-slate-800 p-0.5">
                            <div 
                                className="h-full bg-slate-700 transition-all duration-500"
                                style={{ width: benchmarkMetric === "ram" ? "90%" : benchmarkMetric === "startup" ? "85%" : "20%" }}
                            />
                        </div>
                    </div>

                    {/* Bar 3: Third Party Clients */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-400">
                            <span>Otros Clientes de Terceros</span>
                            <span className="font-mono text-slate-400">
                                {benchmarkMetric === "ram" && "320 MB"}
                                {benchmarkMetric === "startup" && "4.5s"}
                                {benchmarkMetric === "fps" && "+45%"}
                            </span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 border border-slate-800 p-0.5">
                            <div 
                                className="h-full bg-slate-800 transition-all duration-500"
                                style={{ width: benchmarkMetric === "ram" ? "65%" : benchmarkMetric === "startup" ? "50%" : "50%" }}
                            />
                        </div>
                    </div>
                </div>

                {/* 3 Pilares Técnicos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                    <div className="p-4 bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                            <Cpu className="w-4 h-4 text-teal-400" />
                            <span>Sin Chromium Embebido</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Al aprovechar el motor web nativo del sistema operativo a través de Rust, se eliminan cientos de megabytes innecesarios de memoria.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                            <Terminal className="w-4 h-4 text-teal-400" />
                            <span>Delta Sync de Mods</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            El cliente calcula hashes SHA-256 de tus carpetas de juego para descargar exclusivamente los archivos modificados o faltantes.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-teal-400" />
                            <span>Microsoft OAuth 2.0 PKCE</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Autenticación criptográfica oficial directa con Microsoft sin almacenar credenciales en servidores de terceros.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. SECCIÓN DE DESCARGA */}
            <div id="downloads" className="p-6 sm:p-8 border border-slate-800 bg-[#0A0E17] text-center space-y-6 max-w-5xl mx-auto shadow-xl relative z-10">
                <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 px-3 py-1 bg-slate-900 border border-slate-800 inline-block">
                        Instaladores Oficiales
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Descarga CrystalTides Launcher
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                        Disponible para Windows, macOS y distribuciones Linux.
                    </p>
                </div>

                {/* Selector de Sistema Operativo */}
                <div className="flex flex-wrap justify-center gap-2">
                    <button 
                        type="button"
                        onClick={() => setActiveOs("windows")}
                        className={`px-5 py-2 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer border ${
                            activeOs === "windows"
                                ? "bg-slate-800 text-teal-300 border-slate-600"
                                : "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800"
                        }`}
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Windows (10 / 11)</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => setActiveOs("mac")}
                        className={`px-5 py-2 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer border ${
                            activeOs === "mac"
                                ? "bg-slate-800 text-teal-300 border-slate-600"
                                : "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800"
                        }`}
                    >
                        <span>macOS (Apple Silicon & Intel)</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => setActiveOs("linux")}
                        className={`px-5 py-2 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer border ${
                            activeOs === "linux"
                                ? "bg-slate-800 text-teal-300 border-slate-600"
                                : "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800"
                        }`}
                    >
                        <span>Linux (AppImage)</span>
                    </button>
                </div>

                {/* Tarjeta de Descarga Activa */}
                <div className="p-5 bg-slate-900/70 border border-slate-800 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-bold text-white">
                            {activeOs === "windows" && "Instalador para Windows 64-bit"}
                            {activeOs === "mac" && "Universal DMG para macOS"}
                            {activeOs === "linux" && "Portable AppImage para Linux"}
                        </h4>
                        <p className="text-xs text-slate-400">
                            {activeOs === "windows" && "Versión 2.4.0 • Formato .msi • 18.5 MB"}
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
                        className="w-full sm:w-auto px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                    >
                        <Download className="w-4 h-4" /> DESCARGAR
                    </a>
                </div>

                {/* Hashes y Verificación */}
                <div className="space-y-2 pt-1">
                    <button 
                        type="button"
                        onClick={() => setShowChecksum(!showChecksum)}
                        className="text-xs text-slate-400 hover:text-teal-300 font-mono underline cursor-pointer transition-colors"
                    >
                        {showChecksum ? "Ocultar Hashes SHA-256" : "Ver Hashes SHA-256 de Verificación"}
                    </button>

                    <AnimatePresence>
                        {showChecksum && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: "auto" }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 text-left max-w-xl mx-auto space-y-1.5 overflow-hidden"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-teal-400 font-bold uppercase">{activeOs} SHA-256:</span>
                                    <button 
                                        type="button"
                                        onClick={() => copyToClipboard(hashes[activeOs])}
                                        className="text-xs text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer"
                                    >
                                        {copiedHash ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedHash ? "Copiado" : "Copiar"}</span>
                                    </button>
                                </div>
                                <p className="break-all text-slate-400 bg-black/40 p-2 border border-slate-800">
                                    {hashes[activeOs]}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium pt-1">
                        <ShieldCheck className="w-4 h-4 text-teal-400" />
                        <span>Firmado digitalmente • Sin publicidad ni telemetría invasiva</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LauncherShowcaseSection
