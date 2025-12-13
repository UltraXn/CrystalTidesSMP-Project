import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash, FaImage, FaSearch } from "react-icons/fa"

export default function AdminNews({ user }) {
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentPost, setCurrentPost] = useState(null)

    const API_URL = import.meta.env.VITE_API_URL

    // Cargar noticias al montar
    useEffect(() => {
        fetchNews()
    }, [])

    const fetchNews = async () => {
        try {
            const res = await fetch(`${API_URL}/news`)
            const data = await res.json()
            setNews(data)
        } catch (error) {
            console.error("Error cargando noticias:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (post) => {
        setCurrentPost(post)
        setIsEditing(true)
    }

    const handleNew = () => {
        setCurrentPost({ title: "", category: "General", content: "", status: "Draft" })
        setIsEditing(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que quieres borrar esta noticia?")) {
            try {
                await fetch(`${API_URL}/news/${id}`, { method: 'DELETE' })
                setNews(news.filter(n => n.id !== id))
            } catch (error) {
                console.error("Error eliminando noticia:", error)
                alert("Error al eliminar")
            }
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()

        try {
            let res
            const headers = { 'Content-Type': 'application/json' }

            if (currentPost.id) {
                // UPDATE
                res = await fetch(`${API_URL}/news/${currentPost.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(currentPost)
                })
            } else {
                // CREATE
                const postData = {
                    ...currentPost,
                    author_id: user?.id
                }
                res = await fetch(`${API_URL}/news`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(postData)
                })
            }

            if (!res.ok) throw new Error('Error al guardar')

            await fetchNews() // Recargar lista
            setIsEditing(false)
        } catch (error) {
            console.error("Error guardando noticia:", error)
            alert("Error al guardar la noticia")
        }
    }

    if (loading) return <div className="admin-card">Cargando noticias...</div>

    if (isEditing) {
        return (
            <div className="admin-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem" }}>{currentPost.id ? "Editar Noticia" : "Nueva Noticia"}</h3>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                </div>

                <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="form-group">
                        <label className="form-label">Título</label>
                        <input
                            type="text"
                            className="form-input"
                            value={currentPost.title}
                            onChange={e => setCurrentPost({ ...currentPost, title: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <select
                                className="form-input"
                                value={currentPost.category}
                                onChange={e => setCurrentPost({ ...currentPost, category: e.target.value })}
                            >
                                <option>General</option>
                                <option>Evento</option>
                                <option>Update</option>
                                <option>Sistema</option>
                                <option>Comunidad</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estado</label>
                            <select
                                className="form-input"
                                value={currentPost.status}
                                onChange={e => setCurrentPost({ ...currentPost, status: e.target.value })}
                            >
                                <option value="Draft">Borrador</option>
                                <option value="Published">Publicado</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Imagen de Portada (URL)</label>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <div style={{ background: "#333", width: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                                <FaImage color="#888" />
                            </div>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="https://..."
                                value={currentPost.image || ""}
                                onChange={e => setCurrentPost({ ...currentPost, image: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contenido</label>
                        <textarea
                            className="form-textarea"
                            rows="10"
                            value={currentPost.content}
                            onChange={e => setCurrentPost({ ...currentPost, content: e.target.value })}
                        ></textarea>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button type="submit" className="btn-primary">
                            {currentPost.id ? "Guardar Cambios" : "Publicar Noticia"}
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input type="text" placeholder="Buscar noticia..." style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                </div>
                <button className="btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaPlus size={12} /> Redactar Noticia
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Categoría</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th style={{ textAlign: "right" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#666" }}>No hay noticias aún.</td></tr>
                        ) : news.map(post => (
                            <tr key={post.id}>
                                <td style={{ fontWeight: "500", color: "#fff" }}>{post.title}</td>
                                <td><span className="badge">{post.category}</span></td>
                                <td>
                                    <span style={{
                                        color: post.status === "Published" ? "#4ade80" : "#fbbf24",
                                        background: post.status === "Published" ? "rgba(74, 222, 128, 0.1)" : "rgba(251, 191, 36, 0.1)",
                                        padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem"
                                    }}>
                                        {post.status === "Published" ? "Publicado" : "Borrador"}
                                    </span>
                                </td>
                                <td style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                                    {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <button
                                        onClick={() => handleEdit(post)}
                                        style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", marginRight: "1rem" }}
                                        title="Editar"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                                        title="Eliminar"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
