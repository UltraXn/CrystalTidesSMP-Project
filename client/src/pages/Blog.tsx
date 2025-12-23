import { useState, useEffect } from "react"
import { FaCalendarAlt, FaArrowRight, FaTag } from "react-icons/fa"
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
}

interface NewsCardProps {
    article: Article;
}

const NewsCard = ({ article }: NewsCardProps) => {
    const { t } = useTranslation()
    return (
        <div className="news-card">
            <div className="news-image">
                {article.image ? <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                    <div style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.2)' }}>
                        {article.category === 'Evento' ? '🐉' : article.category === 'Sistema' ? '⚙️' : '⚔️'}
                    </div>}
            </div>
            <div className="news-content">
                <div className="news-date">
                    <FaCalendarAlt /> {new Date(article.created_at).toLocaleDateString()}
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <FaTag /> {article.category}
                </div>
                <h3 className="news-title">{article.title}</h3>
                <p className="news-excerpt">
                    {article.content ? article.content.substring(0, 100) + '...' : article.excerpt || t('blog.empty')}
                </p>
                <Link to={`/forum/thread/${article.id}`} className="read-more">
                    {t('blog.read_more')} <FaArrowRight />
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
                <div className="news-grid" style={{ minHeight: '200px' }}>
                    {loading ? (
                         <div style={{ 
                            gridColumn: '1 / -1', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '1rem',
                            padding: '3rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                             <div className="loader" style={{width:'30px', height:'30px', border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div>
                             <p style={{ color: "var(--muted)" }}>{t('blog.loading')}</p>
                         </div>
                    ) : news.length > 0 ? (
                        news.map(article => (
                            <NewsCard key={article.id} article={article} />
                        ))
                    ) : (
                         <div style={{ 
                            gridColumn: '1 / -1', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '1rem',
                            padding: '3rem',
                            background: 'rgba(22, 27, 34, 0.5)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <img src="/images/ui/barrier.png" alt="No News" style={{ width: '64px', opacity: 0.5, marginBottom: '0.5rem' }} 
                                onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const next = target.nextElementSibling as HTMLElement;
                                    if (next) next.style.display = 'block';
                                }} />
                            <FaTag size={40} style={{ display: 'none', color: '#6b7280', marginBottom: '1rem' }} /> {/* Fallback Icon */}
                            
                            <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>{t('blog.no_news')}</h3>
                            <p style={{ color: 'var(--muted)' }}>{t('blog.stay_tuned')}</p>
                        </div>
                    )}
                </div>


                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link to="/forum/1" className="btn-primary">
                        {t('blog.view_all')}
                    </Link>
                </div>
            </Section>
        </Section>
    )
}
