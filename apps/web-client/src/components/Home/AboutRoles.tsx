import { useState, Suspense, lazy } from "react"
import { m as motion, AnimatePresence } from "framer-motion"
import { Crown, Trophy, Code2, Gamepad2, ArrowUpRight, AlertCircle, ScrollText } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const AboutRolesRadar = lazy(() => import("./AboutRolesRadar"))

import {
    PRESTIGE_TIERS,
    roles
} from "./aboutRolesData"
export default function AboutRoles() {
    const { t } = useTranslation()
    const [activeRoleId, setActiveRoleId] = useState<string>("constructor")
    const [activeDetailTab, setActiveDetailTab] = useState<"titles" | "prestige">("titles")

    const currentRole = roles.find(r => r.id === activeRoleId) || roles[0]

    // Construct Radar dataset based on selected role highlights
    const radarData = [
        { subject: t('about.roles.radar.builder', 'Constructor'), A: currentRole.id === 'constructor' ? 100 : 45 },
        { subject: t('about.roles.radar.fighter', 'Luchador'), A: currentRole.id === 'luchador' ? 100 : 50 },
        { subject: t('about.roles.radar.merchant', 'Mercader'), A: currentRole.id === 'mercader' ? 100 : 40 },
        { subject: t('about.roles.radar.constancy', 'Constancia'), A: currentRole.id === 'constancia' ? 100 : 55 },
        { subject: t('about.roles.radar.explorer', 'Explorador'), A: currentRole.id === 'explorador' ? 100 : 48 },
    ]

    return (
        <div className="w-full max-w-400 mx-auto px-4 lg:px-8 py-8 space-y-10">
            {/* Encabezado Principal y Filosofía del Servidor */}
            <div className="text-center max-w-5xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-(--accent) shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" /> {t('about.roles.badge', 'Sistema Custom de Mecánicas Creado a Medida')}
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                    {t('about.roles.title', 'Elige tu Camino en CrystalTides')}
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
                    {t('about.roles.subtitle', 'El servidor tiene el objetivo principal de ser divertido y pasársela genial jugando, ya sea de manera relajada (chill) con amigos o tryhardeando para subir en los rankings. Tu progreso en el juego te permite desbloquear títulos cosméticos y ascender de prestigio.')}
                </p>
            </div>

            {/* Banner Explicativo: 3 Pasos de la Experiencia */}
            <div className="p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl grid grid-cols-1 md:grid-cols-3 gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-left w-full mx-auto">
                <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 shrink-0">
                        <Gamepad2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                            {t('about.roles.step1_title', '1. Juega como Quieras')}
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {t('about.roles.step1_desc', 'Construye, combate, comercia o explora libremente. No hay restricciones de estilo de juego.')}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 shrink-0">
                        <Crown className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                            {t('about.roles.step2_title', '2. Títulos por Progresión')}
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {t('about.roles.step2_desc', 'Al acumular bloques, kills, KilluCoins o días de racha desbloqueas títulos progresivos.')}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400 shrink-0">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                            {t('about.roles.step3_title', '3. Prestigio & Top #1')}
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {t('about.roles.step3_desc', 'Avanza en los 5 niveles de Prestigio mundial y compite por el puesto supremo de la rama.')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid de Selector de Ramas + Detalles */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left w-full mx-auto">  
                {/* Selector de 5 Ramas (Columna Izquierda) */}
                <div role="tablist" aria-label={t('about.roles.branches_list', 'Ramas de progresión')} className="lg:col-span-3 flex flex-col gap-3 my-auto">
                    {roles.map((role) => {
                        const isActive = role.id === activeRoleId
                        return (
                            <button type="button"
                                key={role.id}
                                id={`role-tab-${role.id}`}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`role-panel-${role.id}`}
                                onClick={() => setActiveRoleId(role.id)}
                                className={`relative p-4 rounded-2xl border transition-colors duration-300 text-left cursor-pointer flex items-center justify-between group overflow-hidden backdrop-blur-md ${
                                    isActive 
                                    ? "bg-white/5 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]" 
                                    : "bg-white/3 border-white/5 hover:border-white/15 hover:bg-white/5"
                                }`}
                            >
                                {isActive && (
                                    <div 
                                        className="absolute -inset-10 opacity-25 blur-xl pointer-events-none rounded-full"
                                        style={{ background: `radial-gradient(circle, ${role.colorHex} 0%, transparent 70%)` }}
                                    />
                                )}

                                <div className="flex items-center gap-4 relative z-10">
                                    <div 
                                        className="w-12 h-12 rounded-xl border flex items-center justify-center p-2 shrink-0 transition-colors duration-300 shadow-md"
                                        style={{ 
                                            borderColor: isActive ? `${role.colorHex}80` : "rgba(255,255,255,0.08)",
                                            backgroundColor: isActive ? `${role.colorHex}25` : "rgba(0,0,0,0.5)",
                                        }}
                                    >
                                        <img 
                                            src={role.iconUrl} 
                                            alt={role.title} 
                                            className="w-7 h-7 object-contain drop-shadow-md"
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-black text-white group-hover:text-white transition-colors tracking-tight">
                                            {t(`about.roles.branch.${role.id}.title`, role.title)}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium">
                                            {t(`about.roles.branch.${role.id}.subtitle`, role.subtitle)}
                                        </p>
                                    </div>
                                </div>

                                <div 
                                    className={`w-3 h-3 rounded-full border transition-colors shrink-0 ${
                                        isActive ? "scale-110 shadow-sm" : "opacity-30 border-white/20 bg-transparent"
                                    }`}
                                    style={{ 
                                        backgroundColor: isActive ? role.colorHex : "transparent",
                                        borderColor: isActive ? role.colorHex : "transparent",
                                    }}
                                />
                            </button>
                        )
                    })}
                </div>

                {/* Panel de Detalle Dinámico de la Rama Seleccionada (Columna Derecha) */}
                {/* Contenedor Derecha: Dividido en Tarjeta Principal (Detalles + Radar + Títulos) y Tarjeta de Reglas (Derecha) */}
                <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                    {/* Tarjeta Principal (Izquierda en el sub-grid) */}
                    <div className="xl:col-span-7 flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentRole.id}
                                id={`role-panel-${currentRole.id}`}
                                role="tabpanel"
                                aria-labelledby={`role-tab-${currentRole.id}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 md:p-7 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col justify-between h-full"
                            >
                                <div 
                                    className="absolute top-0 right-0 w-96 h-96 opacity-10 blur-3xl pointer-events-none rounded-full"
                                    style={{ background: currentRole.colorHex }}
                                />

                                <div className="space-y-6 relative z-10">
                                    {/* Header de la Rama Seleccionada */}
                                    <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="p-2.5 rounded-2xl border flex items-center justify-center shrink-0"
                                                style={{ 
                                                    borderColor: `${currentRole.colorHex}50`,
                                                    backgroundColor: `${currentRole.colorHex}15`
                                                }}
                                            >
                                                <img src={currentRole.iconUrl} alt={currentRole.title} className="w-8 h-8 object-contain" />
                                            </div>
                                            <div>
                                                <span 
                                                    className="text-[10px] font-black uppercase tracking-widest block mb-0.5"
                                                    style={{ color: currentRole.colorHex }}
                                                >
                                                    {t('about.roles.custom_branch', 'Rama de Progresión Custom')}
                                                </span>
                                                <h3 className="text-xl font-black text-white">
                                                    {t(`about.roles.branch.${currentRole.id}.title`, currentRole.title)}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-300 leading-relaxed">
                                            {t(`about.roles.branch.${currentRole.id}.desc`, currentRole.description)}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/3 border border-white/5 text-xs">
                                                <span className="text-gray-400 font-medium">{t('about.roles.metric_label', 'Métrica:')}</span>
                                                <span className="font-extrabold text-white">{t(`about.roles.branch.${currentRole.id}.metric`, currentRole.benchmarkMetric)}</span>
                                            </div>

                                            <div className="flex items-start gap-1.5 px-3 py-1.5 rounded-xl bg-white/3 border border-white/5 text-[11px] text-gray-300 leading-relaxed">
                                                <span className="text-amber-400 font-bold shrink-0">💡</span>
                                                <span>{t(`about.roles.branch.${currentRole.id}.formula`, currentRole.formulaDesc)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dedicated Radar Container */}
                                    <div className="bg-white/3 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center h-48 relative shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 absolute top-2.5 left-3">
                                            {t('about.roles.radar_view', 'Vista de Radar')}
                                        </span>
                                        <div className="w-full h-40 min-w-0">
                                            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-gray-500 tracking-wider">{t('about.roles.loading_radar', 'Cargando radar...')}</div>}>
                                                <AboutRolesRadar data={radarData} colorHex={currentRole.colorHex} />
                                            </Suspense>
                                        </div>
                                    </div>

                                    {/* PESTAÑAS: Títulos y Prestigio */}
                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        {/* Selector de Pestañas */}
                                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                                            <div className="flex items-center gap-1.5 p-1 bg-white/3 border border-white/5 rounded-xl">
                                                <button type="button"
                                                    onClick={() => setActiveDetailTab("titles")}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                        activeDetailTab === "titles"
                                                        ? "bg-white/15 text-white shadow-sm"
                                                        : "text-gray-400 hover:text-white"
                                                    }`}
                                                >
                                                    <Crown className="w-3.5 h-3.5 text-amber-400" /> {t('about.roles.titles_tab', 'Títulos (1-5)')}
                                                </button>
                                                <button type="button"
                                                    onClick={() => setActiveDetailTab("prestige")}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                        activeDetailTab === "prestige"
                                                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/40"
                                                        : "text-gray-400 hover:text-white"
                                                    }`}
                                                >
                                                    <Trophy className="w-3.5 h-3.5 text-purple-400" /> {t('about.roles.prestige_tab', 'Prestigios')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Contenido Dinámico de las Pestañas */}
                                        <AnimatePresence mode="wait">
                                            {/* Pestaña 1: Títulos por Progresión */}
                                            {activeDetailTab === "titles" && (
                                                <motion.div
                                                    key="tab-titles"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="grid grid-cols-1 sm:grid-cols-5 gap-2"
                                                >
                                                    {currentRole.ranks.map((rank) => {
                                                        const isTop = rank.levelNum === 5;
                                                        return (
                                                            <div 
                                                                key={rank.levelNum}
                                                                className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center gap-2 transition-colors hover:scale-[1.02] ${
                                                                    isTop 
                                                                    ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                                                                    : "bg-white/3 border-white/5 hover:border-white/15 hover:bg-white/5"
                                                                }`}
                                                            >
                                                                <div>
                                                                    <span 
                                                                        className={`block text-[9px] font-black uppercase tracking-wider mb-0.5 ${isTop ? "text-amber-400" : "text-gray-400"}`}
                                                                    >
                                                                        {isTop ? t('about.roles.top', '⭐ TOP') : t('about.roles.level', 'NIVEL {{level}}', { level: rank.levelNum })}
                                                                    </span>
                                                                    <span className="font-extrabold text-xs text-white leading-snug block">
                                                                        {t(`about.roles.branch.${currentRole.id}.rank.${rank.levelNum}.name`, rank.rankName)}
                                                                    </span>
                                                                </div>
                                                                {rank.item && (
                                                                    <img 
                                                                        src={rank.item} 
                                                                        alt={rank.rankName} 
                                                                        className="w-7 h-7 object-contain drop-shadow-md my-0.5" 
                                                                    />
                                                                )}
                                                                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${isTop ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-black/40 text-gray-400 border border-white/5"}`}>
                                                                    {t(`about.roles.branch.${currentRole.id}.rank.${rank.levelNum}.req`, rank.reqText)}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </motion.div>
                                            )}

                                            {/* Pestaña 2: Niveles de Prestigio */}
                                            {activeDetailTab === "prestige" && (
                                                <motion.div
                                                    key="tab-prestige"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-3"
                                                >
                                                    <p className="text-xs text-gray-400 leading-relaxed">
                                                        {t('about.roles.prestige_desc', 'Los Niveles de Prestigio recompensan la constancia de los jugadores que maxean sus estadísticas de maestría en CrystalTides.')}
                                                    </p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                                                        {PRESTIGE_TIERS.map((tier) => (
                                                            <div 
                                                                key={tier.level}
                                                                className="p-3 rounded-2xl border border-white/5 bg-white/3 flex flex-col justify-between text-left gap-1.5 transition-colors hover:bg-white/5 hover:border-white/15"
                                                            >
                                                                <span className="font-black text-xs block" style={{ color: tier.color }}>
                                                                    {t(`about.roles.prestige.tier${tier.level}.badge`, tier.badge)}
                                                                </span>
                                                                <span className="text-[11px] font-extrabold text-white block">
                                                                    {t(`about.roles.prestige.tier${tier.level}.name`, tier.name)}
                                                                </span>
                                                                <span className="text-[9.5px] text-gray-400 font-medium block">
                                                                    📍 {t(`about.roles.prestige.tier${tier.level}.req`, tier.req)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Barra Inferior Integrada con Acceso a Account */}
                                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/3 p-4 rounded-2xl">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-black text-white uppercase tracking-wider">{t('about.roles.track_progress', 'Mide tu Progresión en Tiempo Real')}</h5>
                                            <p className="text-[11px] text-gray-400">{t('about.roles.track_desc', 'Vincula tu cuenta de Minecraft para actualizar tus insignias.')}</p>
                                        </div>
                                    </div>
                                    <Link 
                                        to="/account?tab=overview"
                                        className="px-5 py-2.5 rounded-xl font-black text-xs text-black uppercase tracking-wider transition-colors hover:scale-105 shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
                                        style={{ backgroundColor: currentRole.colorHex }}
                                    >
                                        {t('about.roles.view_status', 'Ver Mi Estado')} <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Tarjeta de Reglas (Derecha en el sub-grid) */}
                    <div className="xl:col-span-5 flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentRole.id}-rules`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 md:p-7 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col justify-between h-full"
                            >
                                <div 
                                    className="absolute top-0 right-0 w-80 h-80 opacity-10 blur-3xl pointer-events-none rounded-full"
                                    style={{ background: currentRole.colorHex }}
                                />

                                <div className="space-y-5 relative z-10">
                                    {/* Header de la Tarjeta de Reglas */}
                                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                        <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                                            <ScrollText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-white uppercase tracking-tight">
                                                {t('about.roles.rules.header', 'Normativa y Reglas de la Maestría')}
                                            </h4>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {t('about.roles.rules.sub', 'Requisitos para disputar el puesto Top #1')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Header del Top 1 Supremo */}
                                    <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 space-y-3 shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
                                                <Crown className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-widest block">
                                                    {t('about.roles.rules.top_honor', 'Título de Honor Top #1')}
                                                </span>
                                                <h5 className="text-sm font-black text-white">
                                                    {t(`about.roles.branch.${currentRole.id}.topTitle`, currentRole.rules.topTitle)}
                                                </h5>
                                            </div>
                                        </div>
                                        <div className="text-[10.5px] font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 text-left leading-relaxed">
                                            📍 {t(`about.roles.branch.${currentRole.id}.topReq`, currentRole.rules.topRequirement)}
                                        </div>
                                    </div>

                                    {/* Reglas Oficiales de la Maestría */}
                                    <div className="space-y-2.5">
                                        <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" /> {t('about.roles.rules.specific_rules', 'Reglas Específicas')}
                                        </h5>
                                        <ul className="space-y-2">
                                            {currentRole.rules.rulesList.map((rule, idx) => (
                                                <li key={rule} className="p-3 rounded-xl bg-white/3 border border-white/5 text-xs text-gray-300 flex items-start gap-2.5 leading-relaxed hover:border-white/10 transition-colors">
                                                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <span>{t(`about.roles.branch.${currentRole.id}.rule.${idx}`, rule)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Reglas del Rango Máximo (genéricas, synced from Account.tsx) */}
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex flex-col gap-2">
                                        <div className="font-bold flex items-center gap-1.5 text-amber-400 text-sm">
                                            🏆 {t('about.roles.rules.max_rank_title', 'Reglas del Rango Máximo')}
                                        </div>
                                        <div className="flex flex-col gap-1.5 text-[11.5px]">
                                            <div>
                                                • <strong>{t('about.roles.rules.req_label', 'Requisito Rango Máximo:')}</strong> {t('about.roles.rules.max_rank_req', 'Debes ser el jugador con más puntos/estadística de la categoría en la que estás destacando.')}
                                            </div>
                                            <div>
                                                • <strong>{t('about.roles.rules.limit_label', 'Límite de 1 Rango Activo:')}</strong> {t('about.roles.rules.limit_active', 'Solo puedes poseer 1 título máximo simultáneo al mismo tiempo.')}
                                            </div>
                                            <div>
                                                • <strong>{t('about.roles.rules.transfer_label', 'Transferencia Directa:')}</strong> {t('about.roles.rules.transfer', 'Se transfiere si otro jugador supera tu puntaje. El Duelo 1v1 es exclusivo del Señor de la Guerra.')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
