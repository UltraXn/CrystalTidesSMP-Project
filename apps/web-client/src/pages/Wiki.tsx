import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { m as motion, AnimatePresence } from "framer-motion"
import { Book, Search, ChevronRight, Clock, Tag, BookOpen, Skull } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { getWikiArticles, getWikiArticle, WikiArticle, WIKI_CATEGORIES } from "../services/wikiService"
import Loader from "../components/UI/Loader"
import { useSEO } from "../hooks/useSEO"
import WikiBoss3DCard from "../components/Wiki/WikiBoss3DCard"
import "../styles/pages/wiki.css"

// Fallback canonical articles if API data is loading or empty
const FALLBACK_ARTICLES: WikiArticle[] = [
    // 📚 Guías del Servidor
    {
        id: 101,
        slug: 'comandos-y-protecciones',
        title: 'Comandos Básicos y Protecciones de Terreno',
        category: '📚 Guías del Servidor',
        content: `## Bienvenid@ a CrystalTides SMP 1.21+

Para proteger tus construcciones y cofres frente a explosiones y otros jugadores, utiliza los siguientes comandos esenciales:

- \`/claim\` - Reclamar la parcela actual de 16x16 bloques.
- \`/trust <jugador>\` - Otorgar permisos de construcción a un amigo.
- \`/untrust <jugador>\` - Revocar permisos de un jugador.
- \`/sethome <nombre>\` - Guardar un punto de teletransporte personal.
- \`/home <nombre>\` - Teletransportarte a tu hogar guardado.

### Reglas de Convivencia
1. No utilizar hacks ni clientes modificados no autorizados.
2. Respetar el comercio y las subastas en el Mercado Bursátil.`,
        author_id: 'system',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
    },
    {
        id: 102,
        slug: 'economia-kc',
        title: 'Guía del Sistema Económico y KilluCoins (KC)',
        category: '📚 Guías del Servidor',
        content: `## Guía de Economía Bursátil y KilluCoins (KC)

Las **KilluCoins (KC)** son la moneda oficial del servidor. Puedes obtener saldo de las siguientes formas:

- **Caza de Jefes & Mobs**: Elimina entidades en mazmorras para recibir KC al instante.
- **Sugerencias Aprobadas**: Envía propuestas en la pestaña \`/suggestions\` para recibir +100 KC inmediatos y +500 KC al ser aprobadas por la IA.
- **Comercio en la Bolsa**: Vende minerales y recursos en el Mercado Dinámico.`,
        author_id: 'system',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
    },

    // 🐉 Bestiario & Criaturas 3D
    {
        id: 201,
        slug: 'ignis',
        title: '#001 • Ignis (Jefe Imperial del Fuego)',
        category: '🐉 Bestiario & Criaturas 3D',
        description: 'Jefe supremo de Cataclysm invocado con Burning Ashes en el Altar Imperial del Nether.',
        model_3d_url: '/models/cataclysm/ignis.gltf',
        boss_hp: '2,400 HP',
        boss_damage: '45 (Ignora Armadura)',
        boss_location: 'Altar Imperial del Nether',
        boss_drops: ['Ignitium Ingot (100%)', 'Incinerator (25%)', 'Music Disc - Ignis (10%)'],
        content: 'Entidad imperial del fuego que invoca columnas de lava y escudos térmicos impenetrales.',
        author_id: 'system',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
    },
    {
        id: 202,
        slug: 'netherite-monstrosity',
        title: '#002 • Netherite Monstrosity',
        category: '🐉 Bestiario & Criaturas 3D',
        description: 'Bestia colosal forjada en netherite líquido que habita en la Soul Forge.',
        model_3d_url: '/models/cataclysm/netherite_monstrosity.gltf',
        boss_hp: '1,800 HP',
        boss_damage: '60 (Ondas Sísmicas)',
        boss_location: 'Soul Forge (Nether)',
        boss_drops: ['Infernal Forge (100%)', 'Monstrous Horn (50%)', 'Monstrous Core (100%)'],
        content: 'Monstruosidad gigante que destruye el terreno generando terremotos con su martillo infernal.',
        author_id: 'system',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
    },
    {
        id: 203,
        slug: 'leviathan',
        title: '#003 • Leviathan (Leviatán Abisal)',
        category: '🐉 Bestiario & Criaturas 3D',
        description: 'Terror oceánico sumergido en las ruinas abisales de la Sunken City.',
        model_3d_url: '/models/cataclysm/leviathan.gltf',
        boss_hp: '1,500 HP',
        boss_damage: '40 (Mordida Marina)',
        boss_location: 'Sunken City (Océano Profundo)',
        boss_drops: ['Tidal Claws (100%)', 'Abyssal Egg (15%)'],
        content: 'Depredador marino supremo que manipula corrientes de agua y presión oceánica.',
        author_id: 'system',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
    },
    {
        id: 204,
        slug: 'forgotten-wither',
        title: '#004 • The Forgotten Wither',
        category: '🐉 Bestiario & Criaturas 3D',
        description: 'Jefe Supremo del Nether e invocación de las Mazmorras Olvidadas.',
        model_3d_url: '/models/toro_wither.gltf',
        boss_hp: '1,500 HP (Fase II: 3,000 HP)',
        boss_damage: '35 (Decaimiento Oscuro)',
        boss_location: 'Ruinas Olvidadas (Nether)',
        boss_drops: ['Cráneo de Tormenta Olvidada (100%)', 'Estrella de las Sombras (100%)', 'Lingote de Netherita Ancestral (50%)'],
        content: 'Wither ancestral reanimado con tres cráneos oscuros y cargas sísmicas.',
        author_id: 'system',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
    }
];

export default function Wiki() {
    const { slug } = useParams()
    const { t } = useTranslation()

    useSEO({
        title: 'Guía de Juego, Bestiario y Comandos (Wiki)',
        description: 'Manual completo del jugador para CrystalTides SMP 1.21+. Tutoriales, Bestiario con Tarjetas 3D Interactivas, protecciones y economía.',
        keywords: 'wiki minecraft, bestiario minecraft, comandos smp, guia minecraft, protecciones minecraft, economia minecraft',
        canonical: 'https://crystaltidessmp.net/wiki'
    });

    const [articles, setArticles] = useState<WikiArticle[]>([])
    const [currentArticle, setCurrentArticle] = useState<WikiArticle | null>(null)
    const [loading, setLoading] = useState(true)
    const [articleLoading, setArticleLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        let ignore = false
        const fetchArticles = async () => {
            try {
                const data = await getWikiArticles()
                if (!ignore && data && data.length > 0) {
                    setArticles(data)
                } else if (!ignore) {
                    setArticles(FALLBACK_ARTICLES)
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
            try {
                const data = await getWikiArticle(slug)
                if (!ignore) setCurrentArticle(data)
            } catch {
                const localMatch = FALLBACK_ARTICLES.find(a => a.slug === slug);
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

    const filteredArticles = articles.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.boss_mod_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const categoryOrder = ['bosses', 'mobs_hostiles', 'mobs_pacificos', 'aquaculture', 'mercaderes', 'guias_generales', 'guias_items', 'comandos'];
    const rawCategories = Array.from(new Set(articles.map(a => a.category)));
    const categories = rawCategories.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    return (
        <div className="wiki-container flex min-h-screen pt-20 pb-6 px-4 md:px-8 max-w-400 mx-auto gap-8">
            {/* Unified Wiki Sidebar containing both Guides & Pokédex Bestiary Entries */}
            <aside className="wiki-sidebar">
                <div className="search-box">
                    <Search className="text-white/30" size={16} />
                    <input aria-label="Input field" 
                        type="text" 
                        placeholder={t('wiki.search_placeholder', 'Buscar por título, mod o guía...')} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-y-auto pr-2 space-y-6">
                    {loading ? (
                        <Loader text="" />
                    ) : categories.map(cat => {
                        const catInfo = WIKI_CATEGORIES.find(c => c.id === cat);
                        const catLabel = catInfo ? `${catInfo.icon} ${catInfo.name}` : cat.replace(/_/g, ' ').toUpperCase();

                        return (
                            <div key={cat}>
                                <h4 className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 font-black mb-3 px-2">
                                    {cat.includes('boss') || cat.includes('hostile') ? <Skull size={14} className="text-red-400" /> : <BookOpen size={14} className="text-accent" />}
                                    {catLabel}
                                </h4>
                                <div className="space-y-1">
                                    {filteredArticles.reduce<React.ReactNode[]>((acc, article) => {
                                        if (article.category === cat) {
                                            acc.push(
                                                <Link 
                                                    key={article.id} 
                                                    to={`/wiki/${article.slug}`}
                                                    className={`wiki-nav-item ${slug === article.slug ? 'active' : ''}`}
                                                >
                                                    <ChevronRight size={14} className={slug === article.slug ? 'text-accent' : 'opacity-0'} />
                                                    {article.title}
                                                </Link>
                                            );
                                        }
                                        return acc;
                                    }, [])}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Main Article Content Display Screen */}
            <main className="wiki-main flex-1">
                <AnimatePresence mode="wait">
                    {articleLoading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center items-center h-full"
                        >
                            <Loader text={t('wiki.loading_article', 'Abriendo tomo...')} />
                        </motion.div>
                    ) : null}

                    {!loading && currentArticle ? (
                        <motion.article 
                            key={currentArticle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Check if current article is a Bestiary Entry or has 3D model */}
                            {(currentArticle.model_3d_url ||
                              currentArticle.category?.toLowerCase().includes('boss') ||
                              currentArticle.category?.toLowerCase().includes('cataclysm') ||
                              currentArticle.category?.toLowerCase().includes('mowzie') ||
                              currentArticle.category?.toLowerCase().includes('qliphoth') ||
                              currentArticle.category?.toLowerCase().includes('deeper') ||
                              currentArticle.category?.toLowerCase().includes('mythology') ||
                              currentArticle.category?.toLowerCase().includes('aquatic') ||
                              currentArticle.category?.toLowerCase().includes('artifacts') ||
                              currentArticle.category?.toLowerCase().includes('supplementaries') ||
                              currentArticle.category?.toLowerCase().includes('ribbits') ||
                              currentArticle.category?.toLowerCase().includes('critters') ||
                              currentArticle.category?.toLowerCase().includes('piglin') ||
                              currentArticle.category?.toLowerCase().includes('variants') ||
                              currentArticle.title?.toLowerCase().includes('#')) ? (
                                /* 🐉 Mob Article: Renders category-aware 3D Card directly */
                                <WikiBoss3DCard 
                                    category={currentArticle.category}
                                    modelPath={currentArticle.model_3d_url}
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
                            ) : (
                                /* 📚 Standard Guide Article: Renders clean Markdown text */
                                <>
                                    <header className="mb-12 border-b border-white/10 pb-8">
                                        <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(currentArticle.updated_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1 capitalize"><Tag size={12} /> {currentArticle.category}</span>
                                        </div>
                                        <h1 className="text-4xl font-black mb-4 bg-linear-to-r from-white to-white/50 bg-clip-text text-transparent">
                                            {currentArticle.title}
                                        </h1>
                                    </header>

                                    <div className="article-content">
                                        <ReactMarkdown>
                                            {currentArticle.content}
                                        </ReactMarkdown>
                                    </div>
                                </>
                            )}
                        </motion.article>
                    ) : null}

                    {!loading && !currentArticle ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center py-20"
                        >
                            <Book size={64} className="text-white/5 mb-6" />
                            <h2 className="text-2xl font-bold mb-2">{t('wiki.welcome_title', 'Biblioteca de CrystalTides')}</h2>
                            <p className="text-white/40 max-w-md">
                                {t('wiki.welcome_desc', 'Selecciona una Guía o una Entidad del Bestiario de la izquierda para comenzar a explorar.')}
                            </p>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </main>
        </div>
    )
}
