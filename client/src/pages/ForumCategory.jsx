import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { FaUser, FaComments, FaEye, FaClock, FaPen, FaThumbtack } from "react-icons/fa"
import Loader from "@/components/UI/Loader"

const mockThreads = {
    2: [ // Discusión General (Mantenemos mock por ahora)
        { id: 201, title: "¿Cuál es vuestra granja favorita?", author: "FarmerJoe", replies: 34, views: 210, lastActivity: "Hace 10 min", pinned: false },
        { id: 202, title: "Busco equipo para la dungeon", author: "PvP_Master", replies: 5, views: 50, lastActivity: "Hace 2 horas", pinned: false },
        { id: 203, title: "Opinión sobre la economía actual", author: "MerchantKing", replies: 89, views: 1500, lastActivity: "Hace 5 horas", pinned: false },
    ]
}

const categoryNames = {
    1: "Anuncios y Noticias",
    2: "Discusión General",
    3: "Soporte y Ayuda",
    4: "Off-Topic"
}

export default function ForumCategory() {
    const { id } = useParams()
    const [threads, setThreads] = useState([])
    const [loading, setLoading] = useState(true)

    const categoryTitle = categoryNames[id] || "Categoría Desconocida"
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        setLoading(true)
        if (id === "1") {
            // Fetch real news for "Anuncios"
            fetch(`${API_URL}/news`)
                .then(res => res.json())
                .then(data => {
                    const mappedNews = Array.isArray(data) ? data.filter(n => n.status === 'Published').map(n => ({
                        id: n.id,
                        title: n.title,
                        author: "Staff",
                        replies: 0,
                        views: n.views || 0, // Dato real de la DB
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
            // Use mock for others
            setThreads(mockThreads[id] || [])
            setLoading(false)
        }
    }, [id])

    return (
        <div className="section" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
            <div className="forum-header" style={{ maxWidth: '900px', margin: '0 auto 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Link to="/forum" style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', textDecoration: 'none' }}>&larr; Volver al Foro</Link>
                    <h2 style={{ fontSize: '2rem', margin: 0 }}>{categoryTitle}</h2>
                </div>

                {id !== "1" && (
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPen /> Nuevo Tema
                    </button>
                )}
            </div>

            <div className="threads-list" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                        <Loader text="Cargando temas..." />
                    </div>
                ) : threads.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-alt)', borderRadius: '12px', border: '1px dashed #444' }}>
                        <p style={{ color: 'var(--muted)' }}>No hay temas en esta categoría aún.</p>
                    </div>
                ) : (
                    <div className="threads-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {threads.map(thread => (
                            <Link to={id === "1" ? `/forum/thread/${thread.id}` : "#"} key={thread.id} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                            <span style={{ fontSize: '0.7rem' }}>Resp.</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '50px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#ccc' }}>{thread.views}</span>
                                            <span style={{ fontSize: '0.7rem' }}>Vistas</span>
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
