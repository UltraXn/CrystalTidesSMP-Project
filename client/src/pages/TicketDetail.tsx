import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { FaPaperPlane, FaArrowLeft, FaShieldAlt } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

interface TicketDetailData {
    id: string;
    subject: string;
    status: string;
    category: string;
    created_at: string;
}

interface TicketMessage {
    id: string;
    user_id: string;
    message: string;
    is_staff: boolean;
    created_at: string;
}

export default function TicketDetail() {
    const { id } = useParams()
    const { user } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    const [ticket, setTicket] = useState<TicketDetailData | null>(null)
    const [messages, setMessages] = useState<TicketMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
            }
        }, 100)
    }, [])

    const fetchTicketData = useCallback(async () => {
        if (!id) return
        try {
            // Fetch Ticket Info
            const { data: ticketData, error: ticketError } = await supabase
                .from('tickets')
                .select('*')
                .eq('id', id)
                .single()
            
            if (ticketError) throw ticketError
            setTicket(ticketData)

            // Fetch Messages
            const { data: msgs, error: msgsError } = await supabase
                .from('ticket_messages')
                .select('*')
                .eq('ticket_id', id)
                .order('created_at', { ascending: true })

            if (msgsError) throw msgsError
            setMessages(msgs || [])
            setLoading(false)
            scrollToBottom()
        } catch (error) {
            console.error('Error fetching details:', error)
            navigate('/support') // Fallback if not authorized or not found
        }
    }, [id, navigate, scrollToBottom])

    useEffect(() => {
        if (id && user) {
            fetchTicketData()
            
            // Subscribe to real-time messages
            const channel = supabase
                .channel(`ticket_chat_${id}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'ticket_messages',
                    filter: `ticket_id=eq.${id}`
                }, (payload: { new: any }) => {
                    setMessages(prev => [...prev, payload.new as TicketMessage])
                    scrollToBottom()
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [id, user, fetchTicketData, scrollToBottom])

    const handleSendMessage = async (e: React.FormEvent) => {
        if (!user || !id) return
        e.preventDefault()
        if (!newMessage.trim()) return

        try {
            await supabase
                .from('ticket_messages')
                .insert([{
                    ticket_id: id,
                    user_id: user.id,
                    message: newMessage,
                    is_staff: false
                }])
            
            setNewMessage('')
            // UI will update via Realtime subscription
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    if (loading) return <div className="container" style={{paddingTop: '6rem'}}>Loading...</div>

    return (
        <div className="container" style={{paddingTop: '6rem', minHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
            
            {/* Header */}
            <div style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <button onClick={() => navigate('/support')} style={{background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer'}}>
                    <FaArrowLeft />
                </button>
                <div>
                    <h2 style={{margin: 0}}>{ticket?.subject} <span style={{fontSize: '0.8rem', opacity: 0.7}}>#{id?.slice(0, 6)}</span></h2>
                    <span className={`badge ${ticket?.status}`} style={{
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.7rem',
                        background: ticket?.status === 'open' ? '#2ecc71' : '#95a5a6',
                        color: '#000',
                        fontWeight: 'bold',
                        marginTop: '0.3rem',
                        display: 'inline-block'
                    }}>
                        {ticket?.status.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-window" style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '1rem',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Messages List */}
                <div style={{flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {messages.map((msg) => {
                        const isMe = user && msg.user_id === user.id
                        // If is_staff is true OR the message is not from me (assuming admin response)
                        // In reality, staff messages might come from bot (user_id specific) or dashboard
                        
                        return (
                            <motion.div 
                                key={msg.id}
                                initial={{opacity: 0, scale: 0.9}}
                                animate={{opacity: 1, scale: 1}}
                                style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    background: isMe ? 'var(--accent)' : '#2c3e50',
                                    color: 'white',
                                    padding: '0.8rem 1.2rem',
                                    borderRadius: isMe ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                                    position: 'relative',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}>
                                    {msg.is_staff && (
                                        <div style={{
                                            position: 'absolute', top: '-10px', left: '-10px',
                                            background: '#e74c3c', color: 'white', 
                                            padding: '0.2rem 0.5rem', borderRadius: '0.5rem',
                                            fontSize: '0.6rem', fontWeight: 'bold',
                                            display: 'flex', alignItems: 'center', gap: '0.2rem'
                                        }}>
                                            <FaShieldAlt /> STAFF
                                        </div>
                                    )}
                                    {msg.message}
                                </div>
                                <span style={{fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.3rem'}}>
                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </motion.div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} style={{
                    padding: '1rem', 
                    background: 'var(--card-bg)', 
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <input 
                        type="text" 
                        placeholder={ticket?.status === 'closed' ? "This ticket is closed." : t('support.type_message')}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        disabled={ticket?.status === 'closed'}
                        style={{
                            flex: 1, padding: '0.8rem', borderRadius: '2rem', 
                            background: '#0f0f1a', border: '1px solid #333', color: 'white'
                        }}
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim() || ticket?.status === 'closed'}
                        className="cta-button"
                        style={{
                            width: '45px', height: '45px', borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 0
                        }}
                    >
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    )
}
