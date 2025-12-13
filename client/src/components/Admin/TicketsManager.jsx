import { useState, useEffect, useRef } from "react"
import { FaSearch, FaPlus, FaTimes, FaSpinner, FaCircle, FaPaperPlane, FaGavel, FaCheckCircle, FaLock } from "react-icons/fa"
import { useAuth } from "@/context/AuthContext"

const API_URL = import.meta.env.VITE_API_URL

export default function TicketsManager() {
    const { user } = useAuth()
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null) // New: For Detail Modal

    // Create Ticket State
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchTickets = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_URL}/tickets`)
            if (!res.ok) throw new Error("Error fetching tickets")
            const data = await res.json()
            setTickets(data)
        } catch (error) {
            console.error("Failed to load tickets", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    const handleCreateTicket = async (e) => {
        e.preventDefault()
        if (!newTicket.subject) return alert("El asunto es obligatorio")

        try {
            setIsSubmitting(true)
            const res = await fetch(`${API_URL}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    subject: newTicket.subject,
                    description: newTicket.description,
                    priority: newTicket.priority
                })
            })

            if (!res.ok) throw new Error("Error creating ticket")

            await fetchTickets()
            setShowCreateModal(false)
            setNewTicket({ subject: '', description: '', priority: 'medium' })
        } catch (error) {
            alert("Error creando ticket: " + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="admin-card">
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '300px', flex: '1 1 auto' }}>
                    <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input type="text" placeholder="Buscar tickets..." style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.9rem' }}>Filtrar</button>
                    <button
                        className="btn-secondary"
                        onClick={() => setShowCreateModal(true)}
                        style={{ fontSize: '0.9rem', background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaPlus size={12} /> Nuevo Ticket
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="admin-table-container">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <FaSpinner className="spin" size={24} /> Cargando tickets...
                    </div>
                ) : tickets.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        No hay tickets registrados.
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Asunto</th>
                                <th>Prioridad</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(t => (
                                <tr key={t.id} onClick={() => setSelectedTicket(t)} style={{ cursor: 'pointer' }}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>#{t.id}</td>
                                    <td style={{ color: '#aaa', fontSize: '0.8rem' }}>{t.user_id.substring(0, 8)}...</td>
                                    <td style={{ fontWeight: '500' }}>{t.subject}</td>
                                    <td><PriorityBadge priority={t.priority} /></td>
                                    <td><StatusBadge status={t.status} /></td>
                                    <td style={{ color: '#888', fontSize: '0.85rem' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedTicket(t); }}
                                            style={{ color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="admin-card modal-content" style={{ width: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>Crear Nuevo Ticket</h3>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="admin-form">
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Asunto</label>
                            <input className="admin-input" value={newTicket.subject} onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })} autoFocus />

                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción</label>
                            <textarea className="admin-input" rows="4" value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} />

                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Prioridad</label>
                            <select className="admin-input" value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}>
                                <option value="low">Baja</option>
                                <option value="medium">Media</option>
                                <option value="high">Alta</option>
                                <option value="urgent">Urgente</option>
                            </select>

                            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '1rem', width: '100%' }}>
                                {isSubmitting ? 'Creando...' : 'Crear Ticket'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL (Chat & Actions) */}
            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    refreshTickets={fetchTickets}
                />
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; alignItems: center; justifyContent: center; }
                .modal-content { max-width: 95%; max-height: 90vh; }
                .admin-input { width: 100%; padding: 0.8rem; background: #222; border: 1px solid #444; border-radius: 4px; color: #fff; margin-bottom: 0.5rem; }
                
                .btn-action { display: flex; alignItems: center; gap: 0.5rem; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; color: #fff; font-weight: bold; }
                .btn-action.ban { background: #ef4444; }
                .btn-action.resolve { background: #10b981; }
                .btn-action.close { background: #6b7280; }
                
                .msg-bubble { padding: 0.8rem; border-radius: 8px; max-width: 80%; }
                .msg-bubble.user { background: #333; align-self: flex-start; }
                .msg-bubble.staff { background: var(--accent); color: #000; align-self: flex-end; margin-left: auto; }
                .msg-header { font-size: 0.7rem; opacity: 0.7; margin-bottom: 0.2rem; }
            `}</style>
        </div>
    )
}

function TicketDetailModal({ ticket, onClose, refreshTickets }) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)

    // Load messages
    useEffect(() => {
        const loadMessages = async () => {
            const res = await fetch(`${API_URL}/tickets/${ticket.id}/messages`)
            if (res.ok) setMessages(await res.json())
        }
        loadMessages()
    }, [ticket.id])

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        setSending(true)
        try {
            const res = await fetch(`${API_URL}/tickets/${ticket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, message: newMessage, is_staff: true })
            })
            if (res.ok) {
                const addedMsg = await res.json()
                setMessages([...messages, addedMsg])
                setNewMessage('')
            }
        } finally {
            setSending(false)
        }
    }

    const handleAction = async (action) => {
        if (action === 'ban') {
            const username = prompt("Ingresa el nombre de Usuario de Minecraft a banear:")
            if (!username) return
            const reason = prompt("Razón del baneo:", "Incumplimiento de normas")

            await fetch(`${API_URL}/tickets/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, reason })
            })
            alert(`Comando de ban enviado para ${username}`)
            return
        }

        // Status update
        let newStatus = ticket.status
        if (action === 'resolve') newStatus = 'resolved'
        if (action === 'close') newStatus = 'closed'

        await fetch(`${API_URL}/tickets/${ticket.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
        refreshTickets()
        onClose()
    }

    return (
        <div className="modal-overlay">
            <div className="admin-card modal-content" style={{ display: 'flex', flexDirection: 'column', height: '80vh', width: '800px' }}>

                {/* Header */}
                <div style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ marginBottom: '0.2rem' }}>{ticket.subject} <span style={{ fontSize: '0.8rem', color: '#666' }}>#{ticket.id}</span></h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <PriorityBadge priority={ticket.priority} />
                            <StatusBadge status={ticket.status} />
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><FaTimes size={20} /></button>
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                    {/* Description as first message */}
                    <div className="msg-bubble user">
                        <div className="msg-header">Usuario Inicial</div>
                        <div>{ticket.description || "Sin descripción"}</div>
                    </div>

                    {messages.map(msg => (
                        <div key={msg.id} className={`msg-bubble ${msg.is_staff ? 'staff' : 'user'}`}>
                            <div className="msg-header">{msg.is_staff ? 'Staff' : 'Usuario'} - {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div>{msg.message}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Reply Box */}
                {ticket.status !== 'closed' && (
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Escribe una respuesta..."
                            className="admin-input"
                            style={{ flex: 1, marginBottom: 0 }}
                        />
                        <button type="submit" className="btn-primary" disabled={sending}><FaPaperPlane /></button>
                    </form>
                )}

                {/* Action Bar */}
                <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleAction('ban')} className="btn-action ban"><FaGavel /> Banear</button>
                    <button onClick={() => handleAction('resolve')} className="btn-action resolve"><FaCheckCircle /> Resolver</button>
                    <button onClick={() => handleAction('close')} className="btn-action close"><FaLock /> Cerrar</button>
                </div>
            </div>
        </div>
    )
}

function PriorityBadge({ priority }) {
    const colors = { low: '#4ade80', medium: '#facc15', high: '#fb923c', urgent: '#ef4444' }
    return <span style={{ color: colors[priority] || colors.medium, fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'capitalize' }}>{priority}</span>
}

function StatusBadge({ status }) {
    let color = '#aaa';
    if (status === 'open') color = '#3b82f6';
    if (status === 'pending') color = '#facc15';
    if (status === 'resolved') color = '#4ade80';
    if (status === 'closed') color = '#666';
    return (
        <span className="status-chip" style={{ background: `${color}20`, color: color, border: `1px solid ${color}40`, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
            {status}
        </span>
    )
}
