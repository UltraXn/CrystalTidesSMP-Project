import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { FaUser, FaClock, FaCalendarAlt, FaArrowLeft, FaEye, FaReply, FaPaperPlane } from "react-icons/fa"
import Section from "@/components/Layout/Section"
import Loader from "@/components/UI/Loader"
import { useAuth } from "@/context/AuthContext"
import RoleBadge from "@/components/User/RoleBadge"

export default function ForumThread() {
    const { id } = useParams()
    const { user } = useAuth()
    const [thread, setThread] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Estado para comentarios
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        // Cargar noticia
        fetch(`${API_URL}/news/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Noticia no encontrada")
                return res.json()
            })
            .then(data => {
                setThread({
                    id: data.id,
                    title: data.title,
                    content: data.content,
                    author: "Staff",
                    date: new Date(data.created_at).toLocaleDateString(),
                    longDate: new Date(data.created_at).toLocaleString(),
                    image: data.image,
                    tag: data.category,
                    views: data.views || 0
                })
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError("Error al cargar la noticia")
                setLoading(false)
            })

        // Cargar comentarios
        fetch(`${API_URL}/news/${id}/comments`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setComments(data.map(c => ({
                        id: c.id,
                        user: c.user_name,
                        avatar: c.user_avatar,
                        role: c.user_role, // Leer rol
                        date: new Date(c.created_at).toLocaleDateString() + " " + new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        content: c.content
                    })))
                }
            })
            .catch(err => console.error("Error loading comments:", err))

    }, [id])

    const handlePostComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        // Lógica de determinación de Rol (Temporalmente hardcoded por username, idealmente user_metadata)
        let currentRole = user?.user_metadata?.role || 'user'
        const username = user?.user_metadata?.username || user?.email?.split('@')[0] || "Usuario"

        // Overrides especiales (Protección simple frontend, debe reforzarse en backend/RLS)
        if (username.toLowerCase() === 'killu' || username.toLowerCase() === 'ultraxn') {
            currentRole = 'owner'
        }

        const commentData = {
            user_name: username,
            user_avatar: user?.user_metadata?.avatar_url || null,
            content: newComment,
            user_role: currentRole
        }

        try {
            const res = await fetch(`${API_URL}/news/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            })

            if (res.ok) {
                const savedComment = await res.json()
                // Añadir a la lista localmente
                setComments([...comments, {
                    id: savedComment.id,
                    user: savedComment.user_name,
                    avatar: savedComment.user_avatar,
                    role: savedComment.user_role,
                    date: "Justo ahora",
                    content: savedComment.content
                }])
                setNewComment("")
            }
        } catch (error) {
            console.error("Error posting comment:", error)
            alert("Error al publicar comentario")
        }
    }

    if (loading) return (
        <div style={{ minHeight: '80vh', paddingTop: '100px', display: 'flex', justifyContent: 'center' }}>
            <Loader text="Cargando noticia..." />
        </div>
    )

    if (error || !thread) return (
        <div style={{ minHeight: '80vh', paddingTop: '100px', textAlign: 'center', color: '#fff' }}>
            <h2>{error || "Contenido no disponible"}</h2>
            <Link to="/forum" className="btn-secondary" style={{ marginTop: '1rem' }}>Volver al Foro</Link>
        </div>
    )

    return (
        <div className="" style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '4rem', background: '#050505' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>

                {/* Header Navegación */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link to="/forum/1" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}>
                        <FaArrowLeft /> Volver a Noticias
                    </Link>
                </div>

                {/* Contenido del Hilo / Noticia */}
                <article style={{
                    background: 'rgba(30, 30, 40, 0.6)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '3rem'
                }}>

                    {/* Imagen Header si existe */}
                    {thread.image && (
                        <div style={{ width: '100%', height: '300px', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={thread.image} alt={thread.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}

                    <div style={{ padding: '3rem' }}>
                        {/* Meta Header */}
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{
                                    background: 'var(--accent)', color: '#000',
                                    padding: '0.3rem 0.8rem', borderRadius: '4px',
                                    fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'
                                }}>
                                    {thread.tag}
                                </span>
                                <span style={{ color: 'var(--muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCalendarAlt /> {thread.longDate}
                                </span>
                                <span style={{ color: 'var(--muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <FaEye /> {thread.views} Vistas
                                </span>
                            </div>
                            <h1 style={{ fontSize: '2.5rem', color: '#fff', lineHeight: 1.2 }}>{thread.title}</h1>
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaUser color="#ccc" />
                                </div>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{thread.author}</div>
                                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Administrador</div>
                                </div>
                            </div>
                        </div>

                        {/* Cuerpo del Mensaje */}
                        <div className="thread-content" style={{ color: '#e0e0e0', fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                            {thread.content}
                        </div>
                    </div>
                </article>

                {/* Sección de Comentarios */}
                <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ color: '#fff', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaReply /> Comentarios ({comments.length})
                    </h3>

                    {/* Lista de Comentarios */}
                    <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                        {comments.map(comment => (
                            <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                                    {comment.avatar ? (
                                        <img src={comment.avatar} alt={comment.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}><FaUser /></div>
                                    )}
                                </div>
                                <div style={{ flexGrow: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                        <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{comment.user}</span>
                                        <RoleBadge role={comment.role} username={comment.user} />
                                        <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>• {comment.date}</span>
                                    </div>
                                    <p style={{ color: '#ccc', lineHeight: '1.5', margin: 0 }}>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Formulario de Comentario */}
                    {user ? (
                        <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="My Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}><FaUser /></div>
                                )}
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Escribe tu comentario..."
                                    rows="3"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', color: '#fff', resize: 'vertical' }}
                                ></textarea>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                    <button type="submit" className="btn-primary" disabled={!newComment.trim()}>
                                        <FaPaperPlane /> Publicar
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Inicia sesión para unirte a la discusión.</p>
                            <Link to="/login" className="btn-secondary">Iniciar Sesión</Link>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
