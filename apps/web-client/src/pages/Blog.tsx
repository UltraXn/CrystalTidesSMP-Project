import { useState, useEffect } from "react"
import { Calendar, ArrowRight, Tag } from "lucide-react"
import { Link } from "react-router-dom"
import Section from "../components/Layout/Section"
import { useTranslation } from 'react-i18next'

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

interface NewsCardProps {
    article: Article;
}

const NewsCard = ({ article }: NewsCardProps) => {
    const { t, i18n } = useTranslation()
    const isEn = i18n.language === 'en'

    const title = (isEn && article.title_en) ? article.title_en : article.title
    const content = (isEn && article.content_en) ? article.content_en : (article.content || article.excerpt || t('blog.empty'))

    return (
        <div className="group bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col transition-all duration-500 hover:bg-white/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-(--accent)/10 hover:border-(--accent)/30">
            <div className="relative h-48 w-full overflow-hidden bg-white/5 flex items-center justify-center">
                {article.image ? (
                    <img src={article.image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                        {article.category === 'Evento' ? '🐉' : article.category === 'Sistema' ? '⚙️' : '⚔️'}
                    </div>
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-(--accent)">
                    <Tag size={10} /> {article.category}
                </div>
            </div>
            
            <div className="p-6 flex flex-col gap-4 grow">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <Calendar /> {new Date(article.created_at).toLocaleDateString()}
                </div>
                
                <h3 className="text-xl font-black text-white group-hover:text-(--accent) transition-colors leading-tight">
                    {title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed grow font-medium line-clamp-3">
                    {content.substring(0, 100) + '...'}
                </p>
                
                <Link 
                    to={`/forum/thread/news/${article.slug || article.id}`} 
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-(--accent) group/link transition-all hover:translate-x-2"
                >
                    {t('blog.read_more')} 
                    <ArrowRight className="transition-transform group-hover/link:translate-x-1" />
                </Link>
            </div>
        </div>
    )
}

export default function Blog() {
    const { t } = useTranslation()
    const [news, setNews] = useState<Article[]>([])
    const API_URL = import.meta.env.VITE_API_URL

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!API_URL) return

        fetch(`${API_URL}/news`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filtramos publicadas y tomamos las primeras 3
                    const published = data.filter(n => n.status === 'Published').slice(0, 3)
                    setNews(published)
                }
            })
            .catch(err => console.error("Error cargando noticias home:", err))
            .finally(() => setLoading(false))
    }, [API_URL])

    return (
        <Section title={t('blog.title')}>
            <Section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[200px]">
                    {loading ? (
                         <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                             <div className="w-10 h-10 border-4 border-white/10 border-t-(--accent) rounded-full animate-spin"></div>
                             <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('blog.loading')}</p>
                         </div>
                    ) : news.length > 0 ? (
                        news.map(article => (
                            <NewsCard key={article.id} article={article} />
                        ))
                    ) : (
                         <div className="col-span-full py-20 flex flex-col items-center justify-center gap-6 bg-white/2 border border-white/5 rounded-3xl backdrop-blur-xl">
                            <Tag size={48} className="text-white/10" />
                            <div className="text-center">
                                <h3 className="text-white font-black text-xl mb-2">{t('blog.no_news')}</h3>
                                <p className="text-gray-500 font-medium">{t('blog.stay_tuned')}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-12">
                    <Link to="/forum/announcements" className="inline-flex items-center px-10 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm transition-all hover:bg-(--accent) hover:scale-105 active:scale-95 shadow-xl">
                        {t('blog.view_all')}
                    </Link>
                </div>
            </Section>
        </Section>
    )
}
