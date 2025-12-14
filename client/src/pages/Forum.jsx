import { FaComments, FaBullhorn, FaTools, FaCoffee, FaUser, FaClock, FaFire, FaPoll } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useState, useEffect } from "react"
import { useTranslation } from 'react-i18next'

const initialCategories = [
    {
        id: 1,
        slug: "announcements",
        translationKey: "announcements",
        icon: <FaBullhorn />,
        topics: 0,
        posts: 0,
        lastPost: { user: "Staff", date: "-" }
    },
    {
        id: 2,
        slug: "general",
        translationKey: "general",
        icon: <FaComments />,
        topics: 0,
        posts: 0,
        lastPost: { user: "-", date: "-" }
    },
    {
        id: 3,
        slug: "support",
        translationKey: "support",
        icon: <FaTools />,
        topics: 0,
        posts: 0,
        lastPost: { user: "-", date: "-" }
    },
    {
        id: 4,
        slug: "off-topic",
        translationKey: "offtopic",
        icon: <FaCoffee />,
        topics: 0,
        posts: 0,
        lastPost: { user: "-", date: "-" }
    }
]

export default function Forum() {
    const { t } = useTranslation()
    const [categories, setCategories] = useState(initialCategories)
    const [activePoll, setActivePoll] = useState(null)
    const API_URL = import.meta.env.VITE_API_URL

    const [latestNews, setLatestNews] = useState(null)

    useEffect(() => {
        if (!API_URL) return

        // 1. Fetch Real Active Poll
        fetch(`${API_URL}/polls/active`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.message) { 
                    setActivePoll(data)
                }
            })
            .catch(err => console.error("Error loading poll:", err))

        // 2. Fetch Forum Stats
        fetch(`${API_URL}/forum/stats`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(prev => prev.map(cat => {
                        const stat = data.find(s => s.id === cat.id)
                        if (stat) {
                            return {
                                ...cat,
                                topics: stat.topics,
                                posts: stat.posts,
                                lastPost: stat.lastPost
                            }
                        }
                        return cat
                    }))
                }
            })
            .catch(err => console.error("Error loading forum stats:", err))

        // 3. Fetch Latest News (For the new banner)
        fetch(`${API_URL}/news`)
            .then(res => res.json())
            .then(data => {
                const published = Array.isArray(data) ? data.filter(n => n.status === 'Published') : []
                if (published.length > 0) {
                     setLatestNews(published[0]) // Get the most recent one
                }
            })
            .catch(err => console.error("Error loading news:", err))

    }, [])

    return (
        <div className="section" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
            <h2>{t('forum_page.title')}</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                {t('forum_page.subtitle')}
            </p>

            {/* Featured Section: Poll OR News */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto 4rem' }}>
                
                {/* Active Poll Column */}
                <div>
                    <div className="section-subtitle" style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPoll color="var(--accent)" /> <span>{t('forum_page.official_poll_section')}</span>
                    </div>
                    {activePoll ? (
                         <div className="poll-card" style={{ border: '1px solid var(--accent)', boxShadow: '0 0 15px rgba(109,165,192,0.1)', height: '100%' }}>
                            <div style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                                <span><FaPoll style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('forum_page.active_voting')}</span>
                                <span style={{ color: '#ff4500', display: 'flex', alignItems: 'center', gap: '5px' }}><FaFire /> {t('forum_page.hot')}</span>
                            </div>
                            <h3 className="poll-question" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#fff' }}>
                                {activePoll.question}
                            </h3>

                            <div className="poll-options">
                                {activePoll.options.slice(0, 3).map((opt) => (
                                    <div key={opt.id} className="poll-option" style={{ marginBottom: '0.5rem' }}>
                                        <div className="poll-bar-track" style={{ height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                                            <div className="poll-bar-fill" style={{ width: `${opt.percent}%`, height: '100%', background: 'var(--accent)', opacity: 0.3, position: 'absolute', top: 0, left: 0 }}></div>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.8rem' }}>
                                                <span className="poll-label" style={{ fontWeight: 500, color: '#fff', zIndex: 1, fontSize: '0.9rem' }}>{opt.label}</span>
                                                <span className="poll-percent" style={{ fontWeight: 'bold', color: 'var(--accent)', zIndex: 1, fontSize: '0.9rem' }}>{opt.percent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <Link to="/forum/topic/active-poll" className="btn-small" style={{ fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'underline' }}>{t('forum_page.view_full')}</Link>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#888', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                            <FaPoll size={30} style={{ opacity: 0.3 }} />
                            <p>{t('forum_page.no_active_poll')}</p>
                        </div>
                    )}
                </div>

                {/* News Column */}
                <div>
                     <div className="section-subtitle" style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaBullhorn color="#f59e0b" /> <span>{t('forum_page.news_section')}</span>
                    </div>
                    {latestNews ? (
                        <Link to={`/forum/thread/news/${latestNews.id}`} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
                            <div className="news-card-featured" style={{ 
                                background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${latestNews.image})`, 
                                backgroundSize: 'cover', 
                                backgroundPosition: 'center',
                                border: '1px solid rgba(245, 158, 11, 0.3)', 
                                borderRadius: '12px', 
                                padding: '1.5rem',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                minHeight: '200px',
                                transition: 'transform 0.3s'
                            }}>
                                <span style={{ background: '#f59e0b', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content', marginBottom: '0.5rem' }}>{t('forum_page.new_badge')}</span>
                                <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{latestNews.title}</h3>
                                <p style={{ color: '#ddd', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {latestNews.content ? latestNews.content.substring(0, 100) : ""}...
                                </p>
                            </div>
                        </Link>
                    ) : (
                         <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#888', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                            <FaBullhorn size={30} style={{ opacity: 0.3 }} />
                            <p style={{ margin: 0 }}>{t('forum_page.loading_news')}</p> 
                            {/* Actually we should check if loading finished and list is empty to say 'No news'. For MVP: 'Cargando' is safe default or 'No noticias' if we knew for sure. */}
                            {/* Let's be smart: initialCategories has 0 topics. We can check category 1. */}
                            <Link to="/forum/1" className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>{t('forum_page.view_all_news')}</Link>
                        </div>
                    )}
                </div>

            </div>

            <div className="forum-categories">
                {categories.map((cat) => (
                    <Link to={`/forum/${cat.slug}`} key={cat.id} className="forum-category-card" style={{ textDecoration: 'none', color: 'inherit' }}>
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
