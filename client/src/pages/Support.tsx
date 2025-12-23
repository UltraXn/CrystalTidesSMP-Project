import { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { FaPlus, FaTicketAlt, FaCommentAlt } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface Ticket {
    id: string;
    user_id: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
}

export default function Support() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)

    // New Ticket Form State
    const [newTicket, setNewTicket] = useState({ subject: '', category: 'General', priority: 'normal', message: '' })

    const fetchTickets = useCallback(async () => {
        if (!user) return
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            setTickets(data || [])
        } catch (error) {
            console.error('Error loading tickets:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) fetchTickets()
    }, [user, fetchTickets])

    const handleCreateTicket = async (e: React.FormEvent) => {
        if (!user) return
        e.preventDefault()
        try {
            // 1. Create Ticket
            const { data: ticketData, error: ticketError } = await supabase
                .from('tickets')
                .insert([{
                    user_id: user.id,
                    subject: newTicket.subject,
                    category: newTicket.category,
                    priority: newTicket.priority,
                    status: 'open'
                }])
                .select()
                .single()

            if (ticketError) throw ticketError
            
            // 2. Create Initial Message
            const { error: msgError } = await supabase
                .from('ticket_messages')
                .insert([{
                    ticket_id: ticketData.id,
                    user_id: user.id,
                    message: newTicket.message,
                    is_staff: false
                }])
            
            if (msgError) throw msgError

            setShowCreateModal(false)
            setNewTicket({ subject: '', category: 'General', priority: 'normal', message: '' })
            fetchTickets()
            // Optional: navigate to the new ticket detail view
            
        } catch (error) {
            console.error('Error creating ticket:', error)
            alert('Error creating ticket. Please try again.')
        }
    }

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'open': return '#2ecc71';
            case 'closed': return '#95a5a6';
            case 'answered': return '#f39c12';
            default: return '#3498db';
        }
    }

    return (
        <div className="container" style={{paddingTop: '6rem', minHeight: '80vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div>
                    <h1 className="gradient-text">{t('support.title')}</h1>
                    <p style={{color: 'var(--muted)'}}>{t('support.subtitle')}</p>
                </div>
                <button 
                    className="cta-button" 
                    onClick={() => setShowCreateModal(true)}
                    style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                >
                    <FaPlus /> {t('support.create_ticket')}
                </button>
            </div>

            {/* Tickets List */}
            {loading ? (
                <div style={{textAlign: 'center', padding: '3rem'}}>Loading...</div>
            ) : tickets.length === 0 ? (
                <div className="empty-state" style={{textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '1rem'}}>
                    <FaTicketAlt style={{fontSize: '3rem', color: 'var(--muted)', marginBottom: '1rem'}} />
                    <h3>{t('support.no_tickets')}</h3>
                    <p>{t('support.create_first')}</p>
                </div>
            ) : (
                <div className="tickets-grid" style={{display: 'grid', gap: '1rem'}}>
                    {tickets.map(ticket => (
                        <motion.div 
                            key={ticket.id}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            className="ticket-card"
                            style={{
                                background: 'var(--card-bg)', 
                                padding: '1.5rem', 
                                borderRadius: '1rem',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/support/${ticket.id}`)}
                        >
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                <div style={{
                                    width: '10px', height: '10px', 
                                    borderRadius: '50%', 
                                    background: getStatusColor(ticket.status)
                                }}></div>
                                <div>
                                    <h3 style={{fontSize: '1.2rem', marginBottom: '0.2rem'}}>{ticket.subject}</h3>
                                    <span style={{fontSize: '0.85rem', color: 'var(--muted)'}}>
                                        #{ticket.id.slice(0, 8)} • {new Date(ticket.created_at).toLocaleDateString()} • {ticket.category}
                                    </span>
                                </div>
                            </div>
                            <div style={{display: 'flex', gap: '2rem', alignItems: 'center'}}>
                                <span className={`badge ${ticket.priority === 'high' ? 'priority-high' : ''}`} 
                                      style={{
                                        padding: '0.3rem 0.8rem', 
                                        borderRadius: '2rem', 
                                        background: ticket.priority === 'high' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)',
                                        color: ticket.priority === 'high' ? '#e74c3c' : '#3498db',
                                        fontSize: '0.8rem'
                                      }}>
                                    {ticket.priority.toUpperCase()}
                                </span>
                                <FaCommentAlt style={{color: 'var(--muted)'}} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <motion.div 
                            initial={{scale: 0.9, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0.9, opacity: 0}}
                            className="modal-content"
                            style={{
                                background: '#1a1a2e', padding: '2rem', borderRadius: '1rem',
                                width: '100%', maxWidth: '500px', border: '1px solid var(--border)'
                            }}
                        >
                            <h2 style={{marginBottom: '1.5rem'}}>{t('support.new_ticket_title')}</h2>
                            <form onSubmit={handleCreateTicket} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '0.5rem'}}>{t('support.category')}</label>
                                    <select 
                                        value={newTicket.category} 
                                        onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                                        style={{width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: '#0f0f1a', border: '1px solid #333', color: 'white'}}
                                    >
                                        <option value="General">General</option>
                                        <option value="Bug Report">🐛 Bug Report</option>
                                        <option value="Player Report">🚫 Player Report</option>
                                        <option value="Billing">💰 Billing/Store</option>
                                        <option value="Unban Request">🔓 Unban Request</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '0.5rem'}}>{t('support.subject')}</label>
                                    <input 
                                        type="text" 
                                        placeholder={t('support.subject_placeholder')}
                                        value={newTicket.subject}
                                        onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                                        required
                                        style={{width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: '#0f0f1a', border: '1px solid #333', color: 'white'}}
                                    />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '0.5rem'}}>{t('support.message')}</label>
                                    <textarea 
                                        rows={5}
                                        placeholder={t('support.message_placeholder')}
                                        value={newTicket.message}
                                        onChange={e => setNewTicket({...newTicket, message: e.target.value})}
                                        required
                                        style={{width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: '#0f0f1a', border: '1px solid #333', color: 'white'}}
                                    ></textarea>
                                </div>
                                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="secondary-button" style={{flex: 1, padding: '0.8rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid #555', color: '#ccc', cursor: 'pointer'}}>
                                        {t('common.cancel')}
                                    </button>
                                    <button type="submit" className="cta-button" style={{flex: 1}}>
                                        {t('common.submit')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
