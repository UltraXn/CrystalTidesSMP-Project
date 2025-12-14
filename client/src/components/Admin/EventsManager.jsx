import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash, FaHammer, FaDiceD20, FaMapMarkedAlt, FaRunning, FaCheckCircle, FaHourglassStart, FaFlagCheckered, FaExclamationTriangle } from "react-icons/fa"
import { useTranslation } from "react-i18next"

export default function EventsManager({ user }) {
    const { t } = useTranslation()
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentEvent, setCurrentEvent] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null) // ID of event to delete

    // Icon mapping for display and selection
    const iconMap = {
        'hammer': <FaHammer />,
        'dice': <FaDiceD20 />,
        'map': <FaMapMarkedAlt />,
        'running': <FaRunning />
    }
    
    // Moved statusMap inside to use t() but we can also use dynamic access in render
    // However, statusMap is used for both label and color/icon.
    const statusMap = {
        'active': { label: t('admin.events.form.statuses.active'), icon: <FaCheckCircle />, color: '#4ade80' },
        'soon': { label: t('admin.events.form.statuses.soon'), icon: <FaHourglassStart />, color: '#fbbf24' },
        'finished': { label: t('admin.events.form.statuses.finished'), icon: <FaFlagCheckered />, color: '#ef4444' }
    }

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_URL}/events`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setEvents(data)
            }
        } catch (error) {
            console.error("Error cargando eventos:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (event) => {
        setCurrentEvent(event)
        setIsEditing(true)
    }

    const handleNew = () => {
        setCurrentEvent({ title: "", description: "", type: "hammer", status: "soon", image_url: "" })
        setIsEditing(true)
    }

    const confirmDelete = (id) => {
        setDeleteConfirm(id)
    }

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await fetch(`${API_URL}/events/${deleteConfirm}`, { method: 'DELETE' })
            setEvents(events.filter(e => e.id !== deleteConfirm))
            setDeleteConfirm(null)
        } catch (error) {
            console.error("Error eliminando evento:", error)
            alert(t('admin.events.error_delete'))
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            let res
            const headers = { 'Content-Type': 'application/json' }

            if (currentEvent.id) {
                // UPDATE
                res = await fetch(`${API_URL}/events/${currentEvent.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(currentEvent)
                })
            } else {
                // CREATE
                res = await fetch(`${API_URL}/events`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(currentEvent)
                })
            }

            if (!res.ok) throw new Error('Error al guardar')

            await fetchEvents()
            setIsEditing(false)
        } catch (error) {
            console.error("Error guardando evento:", error)
            alert(t('admin.events.error_save'))
        }
    }

    if (loading) return <div className="admin-card">{t('admin.events.loading')}</div>

    if (isEditing) {
        return (
            <div className="admin-card">
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem" }}>{currentEvent.id ? t('admin.events.edit_title') : t('admin.events.create_title')}</h3>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>{t('admin.events.cancel')}</button>
                </div>

                <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="form-group">
                        <label className="form-label">{t('admin.events.form.title')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={currentEvent.title}
                            onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('admin.events.form.desc')}</label>
                         <textarea
                            className="form-textarea"
                            rows="4"
                            value={currentEvent.description}
                            onChange={e => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                         <div className="form-group">
                            <label className="form-label">{t('admin.events.form.type')}</label>
                            <select
                                className="form-input"
                                value={currentEvent.type}
                                onChange={e => setCurrentEvent({ ...currentEvent, type: e.target.value })}
                            >
                                <option value="hammer">{t('admin.events.form.types.hammer')}</option>
                                <option value="dice">{t('admin.events.form.types.dice')}</option>
                                <option value="map">{t('admin.events.form.types.map')}</option>
                                <option value="running">{t('admin.events.form.types.running')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('admin.events.form.status')}</label>
                            <select
                                className="form-input"
                                value={currentEvent.status}
                                onChange={e => setCurrentEvent({ ...currentEvent, status: e.target.value })}
                            >
                                <option value="soon">{t('admin.events.form.statuses.soon')}</option>
                                <option value="active">{t('admin.events.form.statuses.active')}</option>
                                <option value="finished">{t('admin.events.form.statuses.finished')}</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button type="submit" className="btn-primary">
                            {currentEvent.id ? t('admin.events.form.save') : t('admin.events.form.create')}
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="admin-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>{t('admin.events.title')}</h3>
                <button className="btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaPlus size={12} /> {t('admin.events.create_title')}
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.events.table.icon')}</th>
                            <th>{t('admin.events.table.event')}</th>
                            <th>{t('admin.events.table.status')}</th>
                            <th style={{ textAlign: "right" }}>{t('admin.events.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                             <tr><td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "#666" }}>{t('admin.events.no_events')}</td></tr>
                        ) : events.map(event => (
                            <tr key={event.id}>
                                <td style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
                                    {iconMap[event.type] || <FaHammer />}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 'bold' }}>{event.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{event.description?.substring(0, 50)}...</div>
                                </td>
                                <td>
                                     <span style={{
                                        color: statusMap[event.status]?.color || '#fff',
                                        background: `${statusMap[event.status]?.color}20`,
                                        padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem",
                                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                                    }}>
                                        {statusMap[event.status]?.icon} {statusMap[event.status]?.label || event.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <button
                                        onClick={() => handleEdit(event)}
                                        style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", marginRight: "1rem" }}
                                        title={t('admin.events.edit_title')}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(event.id)}
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
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>{t('admin.events.delete_modal.title')}</h3>
                        <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                            {t('admin.events.delete_modal.desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                className="btn-secondary" 
                                onClick={() => setDeleteConfirm(null)}
                                style={{ flex: 1 }}
                            >
                                {t('admin.events.delete_modal.cancel')}
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
                                {t('admin.events.delete_modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
