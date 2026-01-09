import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { FaTimes, FaSpinner, FaPaperPlane, FaLock } from "react-icons/fa"
import { useTranslation } from 'react-i18next'
import { supabase } from "../../../services/supabaseClient"
import { getAuthHeaders } from "../../../services/adminAuth"
import { Ticket, Message, AlertData, ConfirmData } from "./types"
import { PriorityBadge, StatusBadge, CustomAlert, CustomConfirm } from "./Shared"
import BanUserModal from "./BanUserModal"

interface TicketDetailModalProps {
    ticket: Ticket;
    onClose: () => void;
    refreshTickets: () => void;
    mockMessages?: Message[];
    user: { id: string } | null;
}

export default function TicketDetailModal({ ticket, onClose, refreshTickets, mockMessages, user }: TicketDetailModalProps) {
    const { t } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [showBanModal, setShowBanModal] = useState(false)
    const [alert, setAlert] = useState<AlertData | null>(null)
    const [confirmAction, setConfirmAction] = useState<ConfirmData | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    
    const API_URL = import.meta.env.VITE_API_URL

    const fetchMessages = useCallback(async () => {
        if (mockMessages) {
            setMessages(mockMessages)
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' })
            }, 100)
            return
        }
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers: HeadersInit = getAuthHeaders(session?.access_token || null);

            const res = await fetch(`${API_URL}/tickets/${ticket.id}/messages`, { headers })
            if (res.ok) {
                const data = await res.json()
                if (data.success && Array.isArray(data.data)) {
                    setMessages(data.data)
                } else if (Array.isArray(data)) {
                    setMessages(data)
                } else {
                    setMessages([])
                }
                setTimeout(() => {
                    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            }
        } catch (error) {
            console.error("Error fetching messages:", error)
        }
    }, [ticket.id, mockMessages, API_URL])

    useEffect(() => {
        if (ticket) {
            fetchMessages()

            // Real-time Subscription
            const channel = supabase
                .channel(`ticket_chat_admin_${ticket.id}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'ticket_messages',
                    filter: `ticket_id=eq.${ticket.id}`
                }, (payload: { new: Message }) => {
                    setMessages(prev => {
                        if (prev.some(m => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new as Message];
                    });
                    setTimeout(() => {
                         if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [ticket, fetchMessages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !user) return

        setSending(true)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const res = await fetch(`${API_URL}/tickets/${ticket.id}/messages`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    user_id: user.id,
                    message: newMessage,
                    is_staff: true
                })
            })
            if (res.ok) {
                setNewMessage('')
                fetchMessages()
            }
        } catch (error) {
            console.error("Error sending message:", error)
        } finally {
            setSending(false)
        }
    }

    const handleAction = async (action: string) => {
        if (action === 'ban') {
            setShowBanModal(true)
            return
        }

        if (action === 'delete') {
            setConfirmAction({
                message: t('admin.tickets.detail.delete_confirm', '¿Estás seguro de eliminar este ticket?'),
                onConfirm: () => handleAction('force_delete')
            })
            return
        }

        let method = 'PATCH'
        let body: Record<string, string> | undefined = {}
        let url = `${API_URL}/tickets/${ticket.id}/status`

        if (action === 'resolve') body = { status: 'resolved' }
        if (action === 'close') body = { status: 'closed' }
        if (action === 'open') body = { status: 'open' }
        if (action === 'delete' || action === 'force_delete') {
            method = 'DELETE'
            url = `${API_URL}/tickets/${ticket.id}`
            body = undefined
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const res = await fetch(url, {
                method: method,
                headers,
                body: body ? JSON.stringify(body) : undefined
            })

            if (res.ok) {
                refreshTickets()
                onClose()
            } else {
                setAlert({ message: t('admin.alerts.error_title', 'Error'), type: 'error' })
            }
        } catch (error) {
            setAlert({ message: t('admin.alerts.error_title', 'Error') + ": " + (error instanceof Error ? error.message : String(error)), type: 'error' })
        }
    }

    return createPortal(
        <div className="modal-overlay">
            {showBanModal && (
                <BanUserModal 
                    ticket={ticket} 
                    onClose={() => setShowBanModal(false)}
                    onSuccess={() => { 
                        setShowBanModal(false)
                        refreshTickets()
                        setAlert({ message: t('admin.tickets.ban_modal.success', 'Usuario baneado correctamente'), type: 'success' }) 
                    }}
                />
            )}
            
            {!showBanModal && (
                <div className="modal-content" style={{ maxHeight: '85vh', height: '85vh' }}>
                
                    {/* Header Modal */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#222', borderTopLeftRadius: 'var(--radius)', borderTopRightRadius: 'var(--radius)' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>{ticket.subject}</h2>
                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                <span style={{color: '#888', fontFamily:'monospace'}}>#{ticket.id}</span>
                                <PriorityBadge priority={ticket.priority} />
                                <StatusBadge status={ticket.status} />
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '0.5rem' }}>
                            <FaTimes size={22} />
                        </button>
                    </div>

                    {/* Chat Body (Scrollable) */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#181818' }}>
                        
                        {/* Mensaje original del usuario (Descripción) */}
                        <div className="msg-bubble user">
                            <div className="msg-header">{t('admin.tickets.detail.original_desc', 'Descripción Original')}</div>
                            <div style={{whiteSpace: 'pre-wrap'}}>{ticket.description || t('admin.tickets.detail.no_desc', 'Sin descripción')}</div>
                        </div>

                        <div style={{height: '1px', background: '#333', margin: '1rem 0'}}></div>

                        {messages.length === 0 && (
                            <div style={{textAlign: 'center', color: '#555', padding: '2rem'}}>{t('admin.tickets.detail.no_history', 'No hay historial de chat')}</div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={msg.id || idx} className={`msg-bubble ${msg.is_staff ? 'staff' : 'user'}`}>
                                <div className="msg-header">{msg.is_staff ? t('admin.tickets.staff_label', 'STAFF') : t('admin.tickets.table.user', 'USUARIO').toUpperCase()} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                <div>{msg.message}</div>
                            </div>
                        ))}
                        
                        {/* Referencia invisible para el scroll */}
                        <div ref={scrollRef}></div>
                    </div>

                    {/* Footer Actions & Reply */}
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #333', background: '#222', borderBottomLeftRadius: 'var(--radius)', borderBottomRightRadius: 'var(--radius)' }}>
                        
                        {ticket.status !== 'closed' ? (
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <input 
                                    className="admin-input" 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)} 
                                    placeholder={t('admin.tickets.detail.reply_placeholder', 'Escribe una respuesta...')}
                                    style={{flex: 1, marginBottom: 0}}
                                />
                                <button type="submit" className="btn-primary" disabled={sending} style={{padding: '0 1.5rem'}}>
                                    {sending ? <FaSpinner className="spin"/> : <FaPaperPlane />}
                                </button>
                            </form>
                        ) : (
                            <div style={{padding: '1rem', background: '#2a1a1a', color: '#888', textAlign: 'center', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #442222'}}>
                                <FaLock style={{marginRight: '0.5rem', width: '0.8rem'}}/> {t('admin.tickets.detail.closed_msg', 'Este ticket ha sido cerrado y no se pueden enviar más mensajes.')}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button onClick={() => handleAction('ban')} className="btn-action ban">{t('admin.tickets.actions.ban', 'Banear')}</button>
                            {ticket.status !== 'resolved' && ticket.status !== 'closed' && <button onClick={() => handleAction('resolve')} className="btn-action resolve">{t('admin.tickets.actions.resolve', 'Resolver')}</button>}
                            {ticket.status !== 'closed' ? 
                                <button onClick={() => handleAction('close')} className="btn-action close">{t('admin.tickets.actions.close', 'Cerrar')}</button> :
                                <button onClick={() => handleAction('open')} className="btn-action" style={{background:'#555'}}>{t('admin.tickets.actions.reopen', 'Reabrir')}</button>
                            }
                            <button onClick={() => handleAction('delete')} className="btn-action delete" style={{marginLeft: 'auto'}}>{t('admin.tickets.actions.delete', 'Eliminar')}</button>
                        </div>
                    </div>
                </div>
            )}
            {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            {confirmAction && (
                <CustomConfirm 
                    message={confirmAction.message} 
                    onConfirm={() => { setConfirmAction(null); confirmAction.onConfirm(); }} 
                    onCancel={() => setConfirmAction(null)} 
                />
            )}
        </div>,
        document.body
    )
}
