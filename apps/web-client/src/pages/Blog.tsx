import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, ArrowRight, Tag } from "lucide-react"
import { Link } from "react-router-dom"
import Section from "../components/Layout/Section"
import { useTranslation } from 'react-i18next'
import { m as motion, AnimatePresence } from "framer-motion"
import { Skeleton } from 'boneyard-js/react'
import { useSEO } from "../hooks/useSEO"

interface Article {
    id: string | number;
    title: string;
    image?: string;
    category: string;
    created_at: string;
    content?: string;
    excerpt?: string;
    status?: string;
    slug?: string;
    title_en?: string;
    content_en?: string;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    emoji: string;
    rotate: number;
}

// Like Button Component with Magic Particles
const LikeButton = ({ articleId }: { articleId: string | number }) => {
    const [likes, setLikes] = useState(() => {
        const saved = localStorage.getItem(`like_v1_${articleId}`)
        return saved ? parseInt(saved, 10) : Math.floor(Math.random() * 40) + 15
    })
    const [isLiked, setIsLiked] = useState(() => {
        return localStorage.getItem(`is_liked_v1_${articleId}`) === 'true'
    })
    const [particles, setParticles] = useState<Particle[]>([])

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        const newLiked = !isLiked
        setIsLiked(newLiked)
        const newLikesCount = newLiked ? likes + 1 : likes - 1
        setLikes(newLikesCount)
        localStorage.setItem(`is_liked_v1_${articleId}`, String(newLiked))
        localStorage.setItem(`like_v1_${articleId}`, String(newLikesCount))

        if (newLiked) {
            const newParticles: Particle[] = []
            const emojis = ['💎', '✨', '💙', '👑']
            for (let i = 0; i < 6; i++) {
                newParticles.push({
                    id: Date.now() + i,
                    x: (Math.random() - 0.5) * 80,
                    y: -(Math.random() * 60 + 30),
                    emoji: emojis[Math.floor(Math.random() * emojis.length)],
                    rotate: (Math.random() - 0.5) * 90
                })
            }
            setParticles(newParticles)
            setTimeout(() => setParticles([]), 800)
        }
    }

    return (
        <div className="relative inline-block">
            <button aria-label="Action" type="button" 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black transition-colors ${isLiked ? 'bg-(--accent)/25 text-(--accent) border-(--accent)/40 scale-105 shadow-lg shadow-(--accent)/10' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
            >
                <span className="text-sm leading-none">{isLiked ? '💙' : '🤍'}</span>
                <span>{likes}</span>
            </button>
            
            {/* Particles */}
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.span
                        key={p.id}
                        initial={{ opacity: 1, scale: 0.6, x: 0, y: 0 }}
                        animate={{ 
                            opacity: 0, 
                            scale: [1, 1.3, 0.7],
                            x: p.x, 
                            y: p.y,
                            rotate: p.rotate
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute pointer-events-none text-sm z-50 left-1/2 top-0 -ml-2"
                    >
                        {p.emoji}
                    </motion.span>
                ))}
            </AnimatePresence>
        </div>
    )
}

// Featured News Card - Spans 2 Columns
const FeaturedNewsCard = ({ article }: { article: Article }) => {
    const { t, i18n } = useTranslation()
    const isEn = i18n.language === 'en'

    const title = (isEn && article.title_en) ? article.title_en : article.title
    const content = (isEn && article.content_en) ? article.content_en : (article.content || article.excerpt || t('blog.empty'))

    return (
        <div className="group bg-black/40 backdrop-blur-xl border border-white/10 rounded-4xl overflow-hidden flex flex-col h-full transition-colors duration-500 hover:bg-white/5 hover:border-(--accent)/30 hover:shadow-2xl hover:shadow-(--accent)/10">
            <div className="relative aspect-video w-full overflow-hidden bg-white/5 flex items-center justify-center">
                {article.image ? (
                    <img src={article.image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                    <div className="text-9xl opacity-10 group-hover:opacity-20 transition-opacity">
                        {article.category === 'Evento' ? '🐉' : article.category === 'Sistema' ? '⚙️' : '⚔️'}
                    </div>
                )}
                <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-(--accent)">
                    <Tag size={12} /> {article.category}
                </div>
            </div>
            
            <div className="p-8 md:p-10 flex flex-col gap-6 grow">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <Calendar size={12} /> {new Date(article.created_at).toLocaleDateString()}
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-white group-hover:text-(--accent) transition-colors leading-tight tracking-tighter">
                    {title}
                </h3>
                
                <p className="text-gray-400 text-base leading-relaxed grow font-medium line-clamp-3">
                    {content}
                </p>
                
                <div className="flex items-center justify-between mt-4">
                    <Link 
                        to={`/forum/thread/news/${article.slug || article.id}`} 
                        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-(--accent) group/link transition-colors hover:translate-x-2"
                    >
                        {t('blog.read_more')} 
                        <ArrowRight className="transition-transform group-hover/link:translate-x-1" />
                    </Link>

                    <LikeButton articleId={article.id} />
                </div>
            </div>
        </div>
    )
}

// Compact News Card for Right Column
const CompactNewsCard = ({ article }: { article: Article }) => {
    const { t, i18n } = useTranslation()
    const isEn = i18n.language === 'en'

    const title = (isEn && article.title_en) ? article.title_en : article.title

    return (
        <div className="group bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col sm:flex-row gap-6 p-6 transition-colors duration-500 hover:bg-white/5 hover:border-(--accent)/30 hover:shadow-xl hover:shadow-(--accent)/5">
            <div className="relative w-full sm:w-32 h-32 shrink-0 overflow-hidden rounded-2xl bg-white/5 flex items-center justify-center">
                {article.image ? (
                    <img src={article.image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                        {article.category === 'Evento' ? '🐉' : article.category === 'Sistema' ? '⚙️' : '⚔️'}
                    </div>
                )}
            </div>
            
            <div className="flex flex-col justify-between grow gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                            <Calendar size={10} /> {new Date(article.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-(--accent)">
                            {article.category}
                        </span>
                    </div>
                    
                    <h4 className="text-lg font-black text-white group-hover:text-(--accent) transition-colors leading-snug">
                        {title}
                    </h4>
                </div>
                
                <div className="flex items-center justify-between">
                    <Link 
                        to={`/forum/thread/news/${article.slug || article.id}`} 
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-(--accent) group/link transition-colors hover:translate-x-1"
                    >
                        {t('blog.read_more')} 
                        <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
                    </Link>

                    <LikeButton articleId={article.id} />
                </div>
            </div>
        </div>
    )
}

const DEFAULT_FALLBACK_NEWS: Article[] = [
    {
        id: "fallback-1",
        title: "Lanzamiento Oficial de CrystalTides SMP 1.21.1",
        category: "Anuncio",
        created_at: new Date().toISOString(),
        content: "Bienvenido a CrystalTides SMP. Explora un mundo místico repleto de bossing, biomas abisales, mecánicas personalizadas y una comunidad vibrante.",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
        status: "Published",
        slug: "lanzamiento-oficial-crystaltides-smp"
    },
    {
        id: "fallback-2",
        title: "Nuevo Sistema de Misiones y Recompensas Gacha",
        category: "Sistema",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        content: "Completa misiones diarias en el juego con /misiones para ganar KilluCoins (KC) y desbloquear ítems cosméticos en el altar.",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
        status: "Published",
        slug: "sistema-misiones-gacha"
    },
    {
        id: "fallback-3",
        title: "Gran Torneo de Pesca Abisal & Jefes de la Semana",
        category: "Evento",
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        content: "Únete este fin de semana al evento comunitario de pesca y derrota a los jefes marinos para ganar trofeos exclusivos.",
        image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
        status: "Published",
        slug: "torneo-pesca-abisal"
    }
];

export default function Blog() {
    const { t } = useTranslation()
    const [selectedCategory, setSelectedCategory] = useState('Todos')

    useSEO({
        title: 'Noticias y Notas de Parche 1.21+',
        description: 'Entérate de las últimas novedades, parches, eventos y actualizaciones del servidor CrystalTides SMP 1.21+.',
        keywords: 'noticias minecraft, parches smp, actualizaciones servidor minecraft, eventos minecraft',
        canonical: 'https://crystaltidessmp.net/news'
    });

    const API_URL = import.meta.env.VITE_API_URL || '/api'

    const { data: news = DEFAULT_FALLBACK_NEWS, isLoading: loading } = useQuery<Article[]>({
        queryKey: ['blogPublishedNews'],
        queryFn: async () => {
            try {
                const res = await fetch(`${API_URL}/news`)
                if (!res.ok) return DEFAULT_FALLBACK_NEWS;
                const data = await res.json()
                const published = Array.isArray(data) ? data.filter(n => n.status === 'Published') : []
                return published.length > 0 ? published : DEFAULT_FALLBACK_NEWS;
            } catch {
                return DEFAULT_FALLBACK_NEWS;
            }
        },
        staleTime: 60_000,
    })

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(news.map(n => n.category))
        return ['Todos', ...Array.from(cats)]
    }, [news])

    // Filtered news (limit to 4 for editorial layout: 1 featured + 3 compact)
    const filteredNews = useMemo(() => {
        const filtered = selectedCategory === 'Todos' 
            ? news 
            : news.filter(n => n.category === selectedCategory)
        return filtered.slice(0, 4)
    }, [news, selectedCategory])

    const featuredArticle = filteredNews[0]
    const otherArticles = filteredNews.slice(1)

    return (
        <Section title={t('blog.title')}>
            <Section>
                {/* Category Filters */}
                {!loading && categories.length > 1 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map(cat => (
                            <button aria-label="Action" type="button"
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`relative px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${selectedCategory === cat ? 'text-black' : 'text-gray-400 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10'}`}
                            >
                                <span className="relative z-10">{cat}</span>
                                {selectedCategory === cat && (
                                    <motion.div
                                        layoutId="activeBlogCategory"
                                        className="absolute inset-0 bg-(--accent) rounded-full"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                <Skeleton
                    name="blog-news-grid"
                    loading={loading}
                    fallback={
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-87.5">
                            {/* Featured Skeleton Card */}
                            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between h-95 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-20 h-6 rounded-full bg-white/10" />
                                    <div className="w-28 h-4 rounded bg-white/5" />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="w-3/4 h-8 rounded-lg bg-white/10" />
                                    <div className="w-1/2 h-5 rounded-lg bg-white/5" />
                                </div>
                            </div>

                            {/* Compact Skeleton Cards */}
                            <div className="flex flex-col gap-6">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-43.75 animate-pulse">
                                        <div className="w-16 h-5 rounded-full bg-white/10" />
                                        <div className="w-4/5 h-6 rounded bg-white/10" />
                                        <div className="w-24 h-4 rounded bg-white/5" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                    animate="shimmer"
                    color="#1a1a2e"
                    darkColor="#0f0f1a"
                >
                    {filteredNews.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-87.5">
                            {/* Featured Column */}
                            {featuredArticle && (
                                <div className="lg:col-span-2">
                                    <FeaturedNewsCard article={featuredArticle} />
                                </div>
                            )}
                            
                            {/* Compact Column */}
                            {otherArticles.length > 0 ? (
                                <div className="flex flex-col gap-6">
                                    {otherArticles.map(article => (
                                        <CompactNewsCard key={article.id} article={article} />
                                    ))}
                                </div>
                            ) : (
                                featuredArticle && (
                                    <div className="flex items-center justify-center p-8 bg-black/20 border border-white/5 rounded-4xl text-center italic text-gray-500 text-sm">
                                        No hay más artículos en esta categoría
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center gap-6 bg-white/2 border border-white/5 rounded-3xl backdrop-blur-xl">
                            <Tag size={48} className="text-white/10" />
                            <div className="text-center">
                                <h3 className="text-white font-black text-xl mb-2">{t('blog.no_news')}</h3>
                                <p className="text-gray-500 font-medium">{t('blog.stay_tuned')}</p>
                            </div>
                        </div>
                    )}
                </Skeleton>

                <div className="text-center mt-16">
                    <Link to="/forum/announcements" className="inline-flex items-center px-10 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm transition-colors hover:bg-(--accent) hover:scale-105 active:scale-95 shadow-xl shadow-black/50">
                        {t('blog.view_all')}
                    </Link>
                </div>
            </Section>
        </Section>
    )
}
