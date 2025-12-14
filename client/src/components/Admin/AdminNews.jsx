import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash, FaImage, FaSearch, FaExclamationTriangle } from "react-icons/fa"
import { useTranslation } from "react-i18next"

export default function AdminNews({ user }) {
    const { t } = useTranslation()
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentPost, setCurrentPost] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null) // ID of news to delete

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

    const confirmDelete = (id) => {
        setDeleteConfirm(id)
    }

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const username = user?.user_metadata?.full_name || user?.email || 'Admin';
            await fetch(`${API_URL}/news/${deleteConfirm}?userId=${user?.id}&username=${encodeURIComponent(username)}`, { method: 'DELETE' })
            setNews(news.filter(n => n.id !== deleteConfirm))
            setDeleteConfirm(null)
        } catch (error) {
            console.error("Error eliminando noticia:", error)
            alert(t('admin.news.error_delete'))
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()

        try {
            let res
            const headers = { 'Content-Type': 'application/json' }
            const username = user?.user_metadata?.full_name || user?.email || 'Admin';

            if (currentPost.id) {
                // UPDATE
                res = await fetch(`${API_URL}/news/${currentPost.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ ...currentPost, username, user_id: user?.id })
                })
            } else {
                // CREATE
                const postData = {
                    ...currentPost,
                    author_id: user?.id,
                    username // Send username for logs
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
            alert(t('admin.news.error_save'))
        }
    }

    if (loading) return <div className="admin-card">{t('admin.news.loading')}</div>

    if (isEditing) {
        return (
            <div className="admin-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem" }}>{currentPost.id ? t('admin.news.edit_title') : t('admin.news.create_title')}</h3>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>{t('admin.news.cancel')}</button>
                </div>

                <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="form-group">
                        <label className="form-label">{t('admin.news.form.title')}</label>
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
                            <label className="form-label">{t('admin.news.form.category')}</label>
                            <select
                                className="form-input"
                                value={currentPost.category}
                                onChange={e => setCurrentPost({ ...currentPost, category: e.target.value })}
                            >
                                <option value="General">General</option>
                                <option value="Evento">Evento</option>
                                <option value="Update">Update</option>
                                <option value="Sistema">Sistema</option>
                                <option value="Comunidad">Comunidad</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('admin.news.form.status')}</label>
                            <select
                                className="form-input"
                                value={currentPost.status}
                                onChange={e => setCurrentPost({ ...currentPost, status: e.target.value })}
                            >
                                <option value="Draft">{t('admin.news.form.draft')}</option>
                                <option value="Published">{t('admin.news.form.published')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('admin.news.form.image')}</label>
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
                        <label className="form-label">{t('admin.news.form.content')}</label>
                        <textarea
                            className="form-textarea"
                            rows="10"
                            value={currentPost.content}
                            onChange={e => setCurrentPost({ ...currentPost, content: e.target.value })}
                        ></textarea>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button type="submit" className="btn-primary">
                            {currentPost.id ? t('admin.news.form.save') : t('admin.news.form.publish')}
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
                    <input type="text" placeholder={t('admin.news.search_ph')} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                </div>
                <button className="btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaPlus size={12} /> {t('admin.news.write_btn')}
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.news.table.title')}</th>
                            <th>{t('admin.news.table.category')}</th>
                            <th>{t('admin.news.table.status')}</th>
                            <th>{t('admin.news.table.date')}</th>
                            <th style={{ textAlign: "right" }}>{t('admin.news.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#666" }}>{t('admin.news.no_news')}</td></tr>
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
                                        {post.status === "Published" ? t('admin.news.form.published') : t('admin.news.form.draft')}
                                    </span>
                                </td>
                                <td style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                                    {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <button
                                        onClick={() => handleEdit(post)}
                                        style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", marginRight: "1rem" }}
                                        title={t('admin.news.edit_title')}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(post.id)}
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0, 
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setDeleteConfirm(null)}>
                    <div style={{
                        background: '#1e1e24',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid #ef4444',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '2rem'
                        }}>
                            <FaExclamationTriangle />
                        </div>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>{t('admin.news.delete_modal.title')}</h3>
                        <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                            {t('admin.news.delete_modal.desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                className="btn-secondary" 
                                onClick={() => setDeleteConfirm(null)}
                                style={{ flex: 1 }}
                            >
                                {t('admin.news.delete_modal.cancel')}
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={executeDelete}
                                style={{ 
                                    flex: 1, 
                                    background: '#ef4444', 
                                    borderColor: '#ef4444', 
                                    color: '#fff' 
                                }}
                            >
                                {t('admin.news.delete_modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
