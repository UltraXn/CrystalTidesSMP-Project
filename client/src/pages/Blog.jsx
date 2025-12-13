import { useState, useEffect } from "react"
import { FaCalendarAlt, FaArrowRight, FaTag } from "react-icons/fa"
import { Link } from "react-router-dom"
import Section from "@/components/Layout/Section"
import { useTranslation } from 'react-i18next'

const NewsCard = ({ article }) => {
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
    const [news, setNews] = useState([])
    const API_URL = import.meta.env.VITE_API_URL

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
    }, [])

    return (
        <Section title={t('blog.title')}>
            <Section>
                <div className="news-grid">
                    {news.length > 0 ? news.map(article => (
                        <NewsCard key={article.id} article={article} />
                    )) : (
                        <p style={{ textAlign: "center", color: "#666", width: "100%" }}>{t('blog.loading')}</p>
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
