import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { FaUser, FaComments, FaEye, FaClock, FaPen, FaThumbtack } from "react-icons/fa"
import Loader from "@/components/UI/Loader"
import { useTranslation } from 'react-i18next'

const categorySlugs = {
    "announcements": 1,
    "general": 2,
    "support": 3,
    "off-topic": 4
}
// Mapping from slug to translation key now, instead of hardcoded strings
const categoryTranslationKeys = {
    "announcements": "announcements",
    "general": "general",
    "support": "support",
    "off-topic": "offtopic"
}

export default function ForumCategory() {
    const { id: slug } = useParams()
    const { t } = useTranslation()
    const [threads, setThreads] = useState([])
    const [loading, setLoading] = useState(true)

    // Fallback if slug not found
    const categoryId = categorySlugs[slug] || slug
    const translationKey = categoryTranslationKeys[slug]
    const categoryTitle = translationKey ? t(`forum_page.categories.${translationKey}.title`) : t('forum_page.categories.general.title') // Fallback
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        setLoading(true)
        if (!categoryId) {
            setLoading(false)
            return
        }

        if (String(categoryId) === "1") {
            // Fetch real news for "Anuncios"
            fetch(`${API_URL}/news`)
                .then(res => res.json())
                .then(data => {
                    const mappedNews = Array.isArray(data) ? data.filter(n => n.status === 'Published').map(n => ({
                        id: n.id,
                        title: n.title,
                        author: "Staff",
                        replies: n.replies || 0,
                        views: n.views || 0,
                        lastActivity: new Date(n.created_at).toLocaleDateString(),
                        pinned: true,
                        tag: n.category
                    })) : []
                    setThreads(mappedNews)
                    setLoading(false)
                })
                .catch(err => {
                    console.error("Error loading forum news:", err)
                    setLoading(false)
                })
        } else {
            // Fetch real user threads
            fetch(`${API_URL}/forum/category/${categoryId}`)
                .then(res => res.json())
                .then(data => {
                     const mappedThreads = Array.isArray(data) ? data.map(t => ({
                         id: t.id,
                         title: t.title,
                         author: t.author_name || "Anónimo",
                         replies: t.reply_count || 0,
                         views: t.views || 0,
                         lastActivity: new Date(t.created_at).toLocaleDateString(),
                         pinned: t.pinned || false,
                         tag: null // No tags in users threads for now
                     })) : []
                     setThreads(mappedThreads)
                     setLoading(false)
                })
                .catch(err => {
                    console.error(err)
                    setLoading(false)
                })
        }
    }, [categoryId, slug])

    return (
        <div className="section" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
            <div className="forum-header" style={{ maxWidth: '900px', margin: '0 auto 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Link to="/forum" style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', textDecoration: 'none' }}>&larr; {t('forum_category.back_link')}</Link>
                    <h2 style={{ fontSize: '2rem', margin: 0 }}>{categoryTitle}</h2>
                </div>

                {String(categoryId) !== "1" && (
                    <Link to="/forum/create" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration:'none' }}>
                        <FaPen /> {t('forum_category.new_thread')}
                    </Link>
                )}
            </div>

            <div className="threads-list" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                        <Loader text={t('forum_category.loading')} />
                    </div>
                ) : threads.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-alt)', borderRadius: '12px', border: '1px dashed #444' }}>
                        <p style={{ color: 'var(--muted)' }}>{t('forum_category.no_threads')}</p>
                        {String(categoryId) !== '1' && <Link to="/forum/create" style={{ color: 'var(--accent)', marginTop: '0.5rem', display: 'inline-block' }}>{t('forum_category.be_first')}</Link>}
                    </div>
                ) : (
                    <div className="threads-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {threads.map(thread => (
                            <Link to={`/forum/thread/${String(categoryId) === "1" ? 'news' : 'topic'}/${thread.id}`} key={thread.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="thread-card" style={{
                                    background: 'var(--bg-alt)',
                                    padding: '1.2rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}>
                                    <div className="thread-icon" style={{
                                        minWidth: '40px',
                                        color: thread.pinned ? 'var(--accent)' : 'var(--muted)',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}>
                                        {thread.pinned ? <FaThumbtack style={{ transform: 'rotate(45deg)' }} /> : <FaComments />}
                                    </div>

                                    <div className="thread-info" style={{ flexGrow: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                            {thread.tag && (
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    background: 'var(--accent)',
                                                    color: '#000',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold'
                                                }}>{thread.tag}</span>
                                            )}
                                            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600, color: '#fff' }}>{thread.title}</h3>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', gap: '1rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaUser size={10} /> {thread.author}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaClock size={10} /> {thread.lastActivity}</span>
                                        </div>
                                    </div>

                                    <div className="thread-stats" style={{ display: 'flex', gap: '1.5rem', color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '50px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#ccc' }}>{thread.replies}</span>
                                            <span style={{ fontSize: '0.7rem' }}>{t('forum_category.replies')}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '50px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#ccc' }}>{thread.views}</span>
                                            <span style={{ fontSize: '0.7rem' }}>{t('forum_category.views')}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
