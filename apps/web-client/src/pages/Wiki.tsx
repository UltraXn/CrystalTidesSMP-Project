import { useState, useEffect, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { m as motion, AnimatePresence } from "framer-motion"
import { 
    ChevronLeft, ChevronRight, Clock, Tag, 
    BookOpen, Flame, Skull, Heart, 
    Search, ArrowRight, Book, MapPin, Sparkles
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { getWikiArticles, getWikiArticle, WikiArticle } from "../services/wikiService"
import Loader from "../components/UI/Loader"
import { useSEO } from "../hooks/useSEO"
import WikiTreeSidebar from "../components/Wiki/WikiTreeSidebar"
import WikiBoss3DCard from "../components/Wiki/WikiBoss3DCard"
import { FALLBACK_ARTICLES } from "../data/fallbackArticles"
import "../styles/pages/wiki.css"

export default function Wiki() {
    const { slug } = useParams()
    const { t } = useTranslation()

    useSEO({
        title: slug ? `Wiki - ${slug.replace(/-/g, ' ').toUpperCase()}` : 'Guía de Juego, Bestiario y Comandos (Wiki)',
        description: 'Manual completo del jugador para CrystalTides SMP 1.21+. Tutoriales, Bestiario con Tarjetas 3D Interactivas, protecciones y economía.',
        keywords: 'wiki minecraft, bestiario minecraft, comandos smp, guia minecraft, protecciones minecraft, economia minecraft',
        canonical: `https://crystaltidessmp.net/wiki${slug ? `/${slug}` : ''}`
    });

    const [articles, setArticles] = useState<WikiArticle[]>([])
    const [currentArticle, setCurrentArticle] = useState<WikiArticle | null>(null)
    const [loading, setLoading] = useState(true)
    const [articleLoading, setArticleLoading] = useState(false)
    const [portalSearch, setPortalSearch] = useState("")

    useEffect(() => {
        let ignore = false
        const fetchArticles = async () => {
            try {
                const data = await getWikiArticles()
                if (!ignore) {
                    if (data && data.length > 0) {
                        const cleanedData = data.map(remote => ({
                            ...remote,
                            title: remote.title.replace(/^[•#\d\s.-]+/, '').trim()
                        }));
                        const merged: WikiArticle[] = FALLBACK_ARTICLES.map(f => ({
                            ...f,
                            title: f.title.replace(/^[•#\d\s.-]+/, '').trim()
                        }));
                        cleanedData.forEach(remote => {
                            const matchIndex = merged.findIndex(m => 
                                m.slug === remote.slug || 
                                m.title.toLowerCase().trim() === remote.title.toLowerCase().trim() ||
                                (m.slug.includes('wither') && remote.slug.includes('wither'))
                            );
                            if (matchIndex !== -1) {
                                merged[matchIndex] = {
                                    ...merged[matchIndex],
                                    ...remote,
                                    model_3d_url: remote.model_3d_url || merged[matchIndex].model_3d_url,
                                    model_3d_url_phase_2: remote.model_3d_url_phase_2 || merged[matchIndex].model_3d_url_phase_2,
                                    texture_url: remote.texture_url || merged[matchIndex].texture_url,
                                    boss_phases: remote.boss_phases || merged[matchIndex].boss_phases,
                                    boss_phase_1_attacks: remote.boss_phase_1_attacks || merged[matchIndex].boss_phase_1_attacks,
                                    boss_phase_2_attacks: remote.boss_phase_2_attacks || merged[matchIndex].boss_phase_2_attacks,
                                };
                            } else {
                                merged.push(remote);
                            }
                        });
                        setArticles(merged);
                    } else {
                        setArticles(FALLBACK_ARTICLES);
                    }
                }
            } catch {
                if (!ignore) setArticles(FALLBACK_ARTICLES)
            } finally {
                setLoading(false)
            }
        }
        fetchArticles()
        return () => { ignore = true }
    }, [])

    useEffect(() => {
        let ignore = false;
        const fetchDetail = async () => {
            if (!slug) {
                if (!ignore) setCurrentArticle(null)
                return
            }
            setArticleLoading(true)
            const localMatch = FALLBACK_ARTICLES.find(a => a.slug === slug || a.slug === slug.replace(/_/g, '-'));
            try {
                const data = await getWikiArticle(slug)
                if (!ignore) {
                    if (data) {
                        setCurrentArticle({
                            ...localMatch,
                            ...data,
                            model_3d_url: data?.model_3d_url || localMatch?.model_3d_url,
                            model_3d_url_phase_2: data?.model_3d_url_phase_2 || localMatch?.model_3d_url_phase_2,
                            texture_url: data?.texture_url || localMatch?.texture_url,
                            boss_phases: data?.boss_phases || localMatch?.boss_phases,
                            boss_phase_1_attacks: data?.boss_phase_1_attacks || localMatch?.boss_phase_1_attacks,
                            boss_phase_2_attacks: data?.boss_phase_2_attacks || localMatch?.boss_phase_2_attacks,
                        } as WikiArticle);
                    } else if (localMatch) {
                        setCurrentArticle(localMatch);
                    }
                }
            } catch {
                if (!ignore) setCurrentArticle(localMatch || null)
            } finally {
                setArticleLoading(false)
            }
        }
        fetchDetail()
        return () => {
            ignore = true;
        }
    }, [slug])

    // Compute Previous and Next articles for browsing
    const { prevArticle, nextArticle } = useMemo(() => {
        if (!slug || articles.length === 0) return { prevArticle: null, nextArticle: null }
        const currentIndex = articles.findIndex(a => a.slug === slug || a.slug === slug.replace(/_/g, '-'))
        if (currentIndex === -1) return { prevArticle: null, nextArticle: null }

        const prev = currentIndex > 0 ? articles[currentIndex - 1] : articles[articles.length - 1]
        const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : articles[0]
        return { prevArticle: prev, nextArticle: next }
    }, [articles, slug])

    // Filter articles for portal view
    const portalArticles = useMemo(() => {
        if (!portalSearch.trim()) return articles
        const q = portalSearch.toLowerCase()
        return articles.filter(a => 
            a.title.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            (a.boss_mod_name || '').toLowerCase().includes(q) ||
            (a.content || '').toLowerCase().includes(q)
        )
    }, [articles, portalSearch])

    const bossesCount = articles.filter(a => a.category === 'bosses').length
    const hostilesCount = articles.filter(a => a.category === 'mobs_hostiles').length
    const crittersCount = articles.filter(a => a.category === 'mobs_pacificos').length
    const guidesCount = articles.filter(a => a.category === 'guias_generales' || a.category === 'comandos').length

    const isMobArticle = currentArticle && (
        !!currentArticle.model_3d_url ||
        currentArticle.category === 'bosses' ||
        currentArticle.category === 'mobs_hostiles' ||
        currentArticle.category === 'mobs_pacificos'
    )

    return (
        <div className="wiki-container min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-437.5 mx-auto flex flex-col lg:flex-row gap-8 items-start">
            {/* 1. Iconic Left Navigation Tree Sidebar (Always Available) */}
            <WikiTreeSidebar articles={articles} />

            {/* 2. Main Wiki Content Area (Full Width Space) */}
            <div className="flex-1 min-w-0 w-full space-y-6">
                {loading ? (
                    <div className="flex justify-center items-center py-32 bg-neutral-900/80 rounded-3xl border border-neutral-800 shadow-xl">
                        <Loader text={t('wiki.loading_catalog', 'Abriendo los tomos de la Wiki...')} />
                    </div>
                ) : !slug ? (
                    /* ------------------------------------------------------------- */
                    /* A. WIKI MAIN PORTAL / DIRECTORY (When at /wiki)               */
                    /* ------------------------------------------------------------- */
                    <div className="space-y-8">
                        {/* Portal Hero Banner (Clean Neutral Dark) */}
                        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-8 sm:p-12 shadow-xl backdrop-blur-xl">
                            <div className="relative z-10 space-y-4 max-w-4xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider">
                                    <BookOpen size={14} />
                                    <span>Enciclopedia Oficial 1.21+</span>
                                </div>
                                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                                    Bienvenido a la Wiki de CrystalTides
                                </h1>
                                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-normal">
                                    El compendio definitivo para aventureros de CrystalTides SMP. Consulta información técnica, modelos 3D de criaturas con sus animaciones, estadísticas de combate, comandos esenciales y guías de economía.
                                </p>
                            </div>
                        </div>

                        {/* Portal Hub Quick Category Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                                <div className="flex justify-between items-center text-red-400">
                                    <Flame size={20} />
                                    <span className="text-xs font-mono font-bold">{bossesCount} Jefes</span>
                                </div>
                                <h3 className="text-sm font-bold text-white">Jefes Imperiales</h3>
                                <p className="text-xs text-neutral-400">Bosses míticos con múltiples fases y botines épicos.</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                                <div className="flex justify-between items-center text-purple-400">
                                    <Skull size={20} />
                                    <span className="text-xs font-mono font-bold">{hostilesCount} Mobs</span>
                                </div>
                                <h3 className="text-sm font-bold text-white">Hostiles Míticos</h3>
                                <p className="text-xs text-neutral-400">Depredadores y constructos que patrullan el mundo.</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                                <div className="flex justify-between items-center text-emerald-400">
                                    <Heart size={20} />
                                    <span className="text-xs font-mono font-bold">{crittersCount} Especies</span>
                                </div>
                                <h3 className="text-sm font-bold text-white">Fauna & Compañeros</h3>
                                <p className="text-xs text-neutral-400">Criaturas pacíficas y mascotas domesticables.</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                                <div className="flex justify-between items-center text-blue-400">
                                    <Book size={20} />
                                    <span className="text-xs font-mono font-bold">{guidesCount} Guías</span>
                                </div>
                                <h3 className="text-sm font-bold text-white">Guías & Servidor</h3>
                                <p className="text-xs text-neutral-400">Comandos esenciales y sistema de KilluCoins.</p>
                            </div>
                        </div>

                        {/* Portal Index Table / Directory */}
                        <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 md:p-8 shadow-xl space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-800">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">
                                        Índice Maestro de Artículos
                                    </h2>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                        Selecciona cualquier entidad o guía de la lista o desde la barra lateral izquierda.
                                    </p>
                                </div>
                                <div className="relative w-full sm:w-80">
                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por título o mod..."
                                        value={portalSearch}
                                        onChange={e => setPortalSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="divide-y divide-neutral-800/80">
                                {portalArticles.map(art => {
                                    const is3D = !!art.model_3d_url

                                    return (
                                        <Link
                                            key={art.id}
                                            to={`/wiki/${art.slug}`}
                                            className="group flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-3 rounded-xl hover:bg-neutral-800/60 transition-colors gap-2"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 shrink-0 group-hover:text-white transition-colors">
                                                    {art.category === 'bosses' ? <Flame size={16} className="text-red-400" /> :
                                                     art.category === 'mobs_hostiles' ? <Skull size={16} className="text-purple-400" /> :
                                                     art.category === 'mobs_pacificos' ? <Heart size={16} className="text-emerald-400" /> :
                                                     <BookOpen size={16} className="text-blue-400" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-neutral-200 transition-colors flex items-center gap-2">
                                                        <span>{art.title}</span>
                                                        {is3D && (
                                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono font-semibold border border-neutral-700">
                                                                3D
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                                                        <span className="capitalize">{art.category.replace(/_/g, ' ')}</span>
                                                        {art.boss_mod_name && <span>• {art.boss_mod_name}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400 shrink-0">
                                                {art.boss_hp && (
                                                    <span className="text-neutral-300 font-mono">{art.boss_hp}</span>
                                                )}
                                                {art.boss_kc_reward ? (
                                                    <span className="text-amber-400 font-mono font-bold">+{art.boss_kc_reward} KC</span>
                                                ) : null}
                                                <ArrowRight size={14} className="text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ------------------------------------------------------------- */
                    /* B. WIKI ARTICLE DEEP-DIVE (When at /wiki/:slug)               */
                    /* ------------------------------------------------------------- */
                    <div className="space-y-6">
                        {/* Top Breadcrumb & Next/Prev Entity Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800 shadow-md">
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <Link to="/wiki" className="hover:text-white transition-colors font-medium">
                                    Wiki
                                </Link>
                                <ChevronRight size={12} />
                                <span className="capitalize text-neutral-300 font-medium">
                                    {currentArticle?.category?.replace(/_/g, ' ') || 'General'}
                                </span>
                                <ChevronRight size={12} />
                                <span className="text-white font-bold truncate max-w-65">
                                    {currentArticle?.title}
                                </span>
                            </div>

                            {/* Previous & Next Article Switchers */}
                            <div className="flex items-center gap-2 text-xs font-semibold self-end sm:self-auto">
                                {prevArticle && (
                                    <Link
                                        to={`/wiki/${prevArticle.slug}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
                                        title={prevArticle.title}
                                    >
                                        <ChevronLeft size={13} />
                                        <span className="truncate max-w-32.5">{prevArticle.title.split('(')[0].trim()}</span>
                                    </Link>
                                )}
                                {nextArticle && (
                                    <Link
                                        to={`/wiki/${nextArticle.slug}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
                                        title={nextArticle.title}
                                    >
                                        <span className="truncate max-w-32.5">{nextArticle.title.split('(')[0].trim()}</span>
                                        <ChevronRight size={13} />
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Main Article Display (Full Width Space) */}
                        <AnimatePresence mode="wait">
                            {articleLoading ? (
                                <div className="flex justify-center items-center py-32 bg-neutral-900/80 rounded-3xl border border-neutral-800 shadow-xl">
                                    <Loader text={t('wiki.loading_article', 'Abriendo artículo e invocando modelo...')} />
                                </div>
                            ) : currentArticle ? (
                                <motion.div
                                    key={currentArticle.slug}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {isMobArticle ? (
                                        /* 🐉 Full 3D Interactive Boss & Mob Card (Clean Dark Design) */
                                        <div className="space-y-6">
                                            <WikiBoss3DCard 
                                                category={currentArticle.category}
                                                modelPath={currentArticle.model_3d_url}
                                                textureUrl={currentArticle.texture_url}
                                                modelPathPhase2={currentArticle.model_3d_url_phase_2}
                                                bossName={currentArticle.title}
                                                subtitle={currentArticle.boss_subtitle || currentArticle.category || 'Entidad Modificada'}
                                                hp={currentArticle.boss_hp || '100 HP'}
                                                hpPhase2={currentArticle.boss_hp_phase_2}
                                                damage={currentArticle.boss_damage || 'Ataque Estándar'}
                                                damagePhase2={currentArticle.boss_damage_phase_2}
                                                armor={currentArticle.boss_armor || 'Sin Armadura'}
                                                speed={currentArticle.boss_speed || 'Velocidad Normal'}
                                                location={currentArticle.boss_location || 'Overworld / Estructura'}
                                                spawnMethod={currentArticle.boss_spawn_method || 'Generación Natural'}
                                                description={currentArticle.content || currentArticle.description}
                                                drops={currentArticle.boss_drops || []}
                                                kcReward={currentArticle.boss_kc_reward || 0}
                                                phases={currentArticle.boss_phases}
                                                phase1Attacks={currentArticle.boss_phase_1_attacks}
                                                phase2Attacks={currentArticle.boss_phase_2_attacks}
                                                cardTheme={currentArticle.card_theme}
                                                threatLabel={currentArticle.threat_label}
                                                hpLabel={currentArticle.hp_label}
                                                damageLabel={currentArticle.damage_label}
                                                speedLabel={currentArticle.speed_label}
                                                locationLabel={currentArticle.location_label}
                                                dropsLabel={currentArticle.drops_label}
                                                bountyLabel={currentArticle.bounty_label}
                                            />

                                            {/* Lore & Extra Guides below the 3D showcase in wide layout */}
                                            <div className="bg-neutral-900 p-6 md:p-8 rounded-2xl border border-neutral-800 shadow-xl space-y-4">
                                                <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
                                                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                        <BookOpen size={16} className="text-neutral-400" />
                                                        <span>Guía de Combate & Hábitat Detallado</span>
                                                    </h3>
                                                    {currentArticle.boss_mod_name && (
                                                        <span className="text-xs font-medium text-neutral-400 bg-neutral-950 px-2.5 py-0.5 rounded border border-neutral-800">
                                                            {currentArticle.boss_mod_name}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    {currentArticle.boss_location && (
                                                        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                                                                <MapPin size={13} className="text-neutral-400" /> Ubicación & Biomas
                                                            </div>
                                                            <div className="text-neutral-300 font-medium">
                                                                {currentArticle.boss_location}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {currentArticle.boss_spawn_method && (
                                                        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                                                                <Sparkles size={13} className="text-neutral-400" /> Invocación / Aparición
                                                            </div>
                                                            <div className="text-neutral-300 font-medium">
                                                                {currentArticle.boss_spawn_method}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* 📚 Standard Server Guide Article (Clean Minimalist Dark) */
                                        <div className="bg-neutral-900 p-8 md:p-10 rounded-2xl border border-neutral-800 shadow-xl space-y-6">
                                            <header className="border-b border-neutral-800 pb-5 space-y-3">
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                                                    <span className="flex items-center gap-1.5 font-bold text-neutral-200 bg-neutral-800 px-2.5 py-0.5 rounded border border-neutral-700 capitalize">
                                                        <Tag size={11} />
                                                        {currentArticle.category.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-neutral-500 ml-auto text-[11px]">
                                                        <Clock size={11} /> {currentArticle.updated_at ? new Date(currentArticle.updated_at).toLocaleDateString() : 'Oficial'}
                                                    </span>
                                                </div>

                                                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                                    {currentArticle.title}
                                                </h1>
                                            </header>

                                            <div className="article-content prose prose-invert max-w-none text-neutral-300 leading-relaxed text-sm sm:text-base">
                                                <ReactMarkdown>
                                                    {currentArticle.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}
