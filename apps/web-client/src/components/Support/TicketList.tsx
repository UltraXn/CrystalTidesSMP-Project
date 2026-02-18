import { motion } from 'framer-motion'
import { Ticket as TicketIcon, Clock, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Ticket } from '../../services/ticketService'

interface TicketListProps {
    tickets: Ticket[];
}

export default function TicketList({ tickets }: TicketListProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'open': return '#2ecc71';
            case 'closed': return '#95a5a6';
            case 'answered': return '#f39c12';
            default: return '#3498db';
        }
    }

    const getStatusLabel = (status: string) => {
        return t(`admin.tickets.status.${status}`, status.toUpperCase())
    }

    return (
        <div className="tickets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))', gap: '1.5rem' }}>
            {tickets.map((ticket, index) => (
                <motion.div 
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="ticket-card-premium"
                    role="button"
                    tabIndex={0}
                    aria-label={`Ticket: ${ticket.subject}`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            navigate(`/support/${ticket.id}`)
                        }
                    }}
                    style={{
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '2rem', 
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => navigate(`/support/${ticket.id}`)}
                    whileHover={{ y: -5, background: 'rgba(255,255,255,0.04)', borderColor: 'var(--accent)', boxShadow: '0 20px 30px rgba(0,0,0,0.2)' }}
                >
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{
                            width: '4.5rem', height: '4.5rem', 
                            borderRadius: '1.2rem', 
                            background: `${getStatusColor(ticket.status)}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${getStatusColor(ticket.status)}30`
                        }}>
                            <TicketIcon size={28} style={{ color: getStatusColor(ticket.status) }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, color: '#fff' }}>{ticket.subject}</h3>
                                <span style={{ 
                                    fontSize: '0.7rem', 
                                    padding: '0.3rem 0.8rem', 
                                    borderRadius: '50px', 
                                    background: getStatusColor(ticket.status),
                                    color: '#000',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    {getStatusLabel(ticket.status)}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={14} style={{ opacity: 0.5 }} /> {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                    {t(`support.categories.${(ticket.category || 'general').toLowerCase().replace(' ', '_')}`, 
                                        (ticket.category || 'General').charAt(0).toUpperCase() + (ticket.category || 'General').slice(1)
                                    )}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                                <span style={{ fontFamily: 'monospace', opacity: 0.4 }}>#{String(ticket.id).slice(0, 8).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div className="arrow-icon" style={{ 
                            width: '3rem', height: '3rem', 
                            borderRadius: '50%', 
                            background: 'rgba(255,255,255,0.05)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--muted)',
                            transition: 'all 0.3s ease'
                        }}>
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
