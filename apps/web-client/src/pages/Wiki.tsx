import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Book, Search, ChevronRight, Clock, Tag } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { getWikiArticles, getWikiArticle, WikiArticle } from "../services/wikiService"
import Loader from "../components/UI/Loader"

export default function Wiki() {
    const { slug } = useParams()
    const { t } = useTranslation()
    
    const [articles, setArticles] = useState<WikiArticle[]>([])
    const [currentArticle, setCurrentArticle] = useState<WikiArticle | null>(null)
    const [loading, setLoading] = useState(true)
    const [articleLoading, setArticleLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const data = await getWikiArticles()
                setArticles(data)
            } catch (error: unknown) {
                console.error("Error loading wiki articles:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchArticles()
    }, [])

    useEffect(() => {
        const fetchDetail = async () => {
            if (!slug) {
                setCurrentArticle(null)
                return
            }
            setArticleLoading(true)
            try {
                const data = await getWikiArticle(slug)
                setCurrentArticle(data)
            } catch (error: unknown) {
                console.error("Error loading article detail:", error)
                setCurrentArticle(null)
            } finally {
                setArticleLoading(false)
            }
        }
        fetchDetail()
    }, [slug])

    const filteredArticles = articles.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Grouping for sidebar
    const categories = Array.from(new Set(articles.map(a => a.category)))

    return (
        <div className="wiki-container flex min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto gap-8">
            <style>{`
                .wiki-container {
                    color: #fff;
                }
                .wiki-sidebar {
                    width: 320px;
                    flex-shrink: 0;
                    position: sticky;
                    top: 100px;
                    height: calc(100vh - 140px);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .wiki-main {
                    flex: 1;
                    min-width: 0;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 3rem;
                    backdrop-filter: blur(10px);
                }
                .wiki-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.8rem 1.2rem;
                    border-radius: 10px;
                    text-decoration: none;
                    color: #aaa;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                    font-size: 0.9rem;
                }
                .wiki-nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                }
                .wiki-nav-item.active {
                    background: var(--accent-dim, rgba(22, 140, 128, 0.1));
                    border-color: var(--accent, #168C80);
                    color: #fff;
                }
                .search-box {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 0.8rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }
                .search-box input {
                    background: none;
                    border: none;
                    color: #fff;
                    outline: none;
                    width: 100%;
                    font-size: 0.9rem;
                }
                .article-content {
                    line-height: 1.8;
                    color: #ccc;
                }
                .article-content h1, .article-content h2, .article-content h3 {
                    color: #fff;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                }
                .article-content a {
                    color: var(--accent, #168C80);
                    text-decoration: none;
                }
                .article-content a:hover {
                    text-decoration: underline;
                }
                .article-content code {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 0.9em;
                }
                .article-content blockquote {
                    border-left: 4px solid var(--accent, #168C80);
                    padding-left: 1.5rem;
                    margin-left: 0;
                    font-style: italic;
                    color: #aaa;
                }
                
                @media (max-width: 1024px) {
                    .wiki-container {
                        flex-direction: column;
                    }
                    .wiki-sidebar {
                        width: 100%;
                        position: relative;
                        top: 0;
                        height: auto;
                    }
                }
            `}</style>

            {/* Sidebar */}
            <aside className="wiki-sidebar">
                <div className="search-box">
                    <Search className="text-white/30" size={16} />
                    <input 
                        type="text" 
                        placeholder={t('wiki.search_placeholder', 'Buscar en la guía...')} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-y-auto pr-2 space-y-6">
                    {loading ? (
                        <Loader text="" />
                    ) : categories.map(cat => (
                        <div key={cat}>
                            <h4 className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/30 mb-3 px-2">
                                <Tag size={10} /> {cat}
                            </h4>
                            <div className="space-y-1">
                                {filteredArticles.filter(a => a.category === cat).map(article => (
                                    <Link 
                                        key={article.id} 
                                        to={`/wiki/${article.slug}`}
                                        className={`wiki-nav-item ${slug === article.slug ? 'active' : ''}`}
                                    >
                                        <ChevronRight size={14} className={slug === article.slug ? 'text-accent' : 'opacity-0'} />
                                        {article.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="wiki-main">
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
                    ) : currentArticle ? (
                        <motion.article 
                            key={currentArticle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
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
                        </motion.article>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center py-20"
                        >
                            <Book size={64} className="text-white/5 mb-6" />
                            <h2 className="text-2xl font-bold mb-2">{t('wiki.welcome_title', 'Biblioteca de CrystalTides')}</h2>
                            <p className="text-white/40 max-w-md">
                                {t('wiki.welcome_desc', 'Selecciona un artículo de la izquierda para comenzar a explorar los secretos de estas tierras.')}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
