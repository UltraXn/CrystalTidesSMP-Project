import { FaComments, FaBullhorn, FaTools, FaCoffee, FaUser, FaClock, FaFire, FaPoll } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useState, useEffect } from "react"
import { activePoll } from "@/data/pollData"
import { useTranslation } from 'react-i18next'

const initialCategories = [
    {
        id: 1,
        translationKey: "announcements",
        icon: <FaBullhorn />,
        topics: 0,
        posts: 0,
        lastPost: { user: "Staff", date: "Reciente" }
    },
    {
        id: 2,
        translationKey: "general",
        icon: <FaComments />,
        topics: 84,
        posts: 320,
        lastPost: { user: "Steve123", date: "Hace 5 minutos" }
    },
    {
        id: 3,
        translationKey: "support",
        icon: <FaTools />,
        topics: 22,
        posts: 98,
        lastPost: { user: "CreeperBoy", date: "Hace 1 día" }
    },
    {
        id: 4,
        translationKey: "offtopic",
        icon: <FaCoffee />,
        topics: 45,
        posts: 1230,
        lastPost: { user: "GamerGirl", date: "Hace 10 minutos" }
    }
]

export default function Forum() {
    const { t } = useTranslation()
    const [categories, setCategories] = useState(initialCategories)
    const featuredPoll = activePoll
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        if (!API_URL) return

        // Actualizar contador de noticias
        fetch(`${API_URL}/news`)
            .then(res => res.json())
            .then(data => {
                const publishedCount = Array.isArray(data) ? data.filter(n => n.status === 'Published').length : 0

                setCategories(prev => prev.map(cat => {
                    if (cat.id === 1) {
                        return {
                            ...cat,
                            topics: publishedCount,
                            posts: publishedCount, // Por ahora 1 post por tema
                            lastPost: { user: "Staff", date: "Hoy" } // Podríamos tomar la fecha real de data[0]
                        }
                    }
                    return cat
                }))
            })
            .catch(err => console.error("Error updates forum stats:", err))
    }, [])

    return (
        <div className="section" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
            <h2>{t('forum_page.title')}</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                {t('forum_page.subtitle')}
            </p>

            {/* Featured Active Poll */}
            <div className="forum-featured-poll" style={{ maxWidth: '900px', margin: '0 auto 3rem auto' }}>
                <div className="section-subtitle" style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <FaFire color="#ff4500" /> <span style={{ color: 'var(--text)' }}>{t('forum_page.hot_topic')}</span> <span className="status-badge-active">{t('forum_page.active')}</span>
                </div>

                <div className="poll-card" style={{ border: '1px solid var(--accent)', boxShadow: '0 0 15px rgba(109,165,192,0.1)' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                        <span><FaPoll style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('forum_page.official_poll')}</span>
                        <span style={{ color: '#ff4500', display: 'flex', alignItems: 'center', gap: '5px' }}><FaFire /> {t('forum_page.hot_label')}</span>
                    </div>
                    <h3 className="poll-question" style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#fff' }}>
                        {featuredPoll.question}
                    </h3>

                    <div className="poll-options">
                        {featuredPoll.options.map((opt) => (
                            <div key={opt.id} className="poll-option" style={{ marginBottom: '0.8rem', cursor: 'pointer' }}>
                                <div className="poll-bar-track" style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                                    <div className="poll-bar-fill" style={{ width: `${opt.percent}%`, height: '100%', background: 'var(--accent)', opacity: 0.3, position: 'absolute', top: 0, left: 0 }}></div>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
                                        <span className="poll-label" style={{ fontWeight: 500, color: '#fff', zIndex: 1 }}>{opt.label}</span>
                                        <span className="poll-percent" style={{ fontWeight: 'bold', color: 'var(--accent)', zIndex: 1 }}>{opt.percent}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                        <span>{t('suggestions.total_votes')}: <strong>{featuredPoll.totalVotes}</strong></span>
                        <span>{t('suggestions.closes_in')}: <strong style={{ color: '#ff9900' }}>{featuredPoll.closesIn}</strong></span>
                    </div>
                </div>
            </div>

            <div className="forum-categories">
                {categories.map((cat) => (
                    <Link to={`/forum/${cat.id}`} key={cat.id} className="forum-category-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="cat-icon-wrapper">
                            {cat.icon}
                        </div>
                        <div className="cat-info">
                            <h3>{t(`forum_page.categories.${cat.translationKey}.title`)}</h3>
                            <p>{t(`forum_page.categories.${cat.translationKey}.desc`)}</p>
                        </div>
                        <div className="cat-stats">
                            <div className="stat-item">
                                <span>{cat.topics}</span>
                                <small>{t('forum_page.stats.topics')}</small>
                            </div>
                            <div className="stat-item">
                                <span>{cat.posts}</span>
                                <small>{t('forum_page.stats.posts')}</small>
                            </div>
                        </div>
                        <div className="cat-last-post">
                            <div className="last-post-user">
                                <FaUser size={12} style={{ marginRight: '5px' }} /> {cat.lastPost.user}
                            </div>
                            <div className="last-post-date">
                                <FaClock size={12} style={{ marginRight: '5px' }} /> {cat.lastPost.date}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
