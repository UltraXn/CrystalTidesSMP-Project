import { motion } from 'framer-motion'
import { Ticket as TicketIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface TicketEmptyStateProps {
    onOpenCreateModal: () => void;
}

export default function TicketEmptyState({ onOpenCreateModal }: TicketEmptyStateProps) {
    const { t } = useTranslation()
    const { user } = useAuth()
    const navigate = useNavigate()

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-state" 
            style={{
                textAlign: 'center', 
                padding: '6rem 2rem', 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
                borderRadius: '2rem',
                border: '1px dashed rgba(255,255,255,0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
        >
            <div style={{ 
                width: '100px', height: '100px', background: 'var(--accent-soft)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', margin: '0 auto 2rem' 
            }}>
                <TicketIcon size={48} style={{ color: 'var(--accent)', opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{t('support.no_tickets')}</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>{t('support.create_first')}</p>
            <button 
                className="nav-btn primary" 
                onClick={() => user ? onOpenCreateModal() : navigate('/login')} 
                style={{ padding: '1rem 3rem', borderRadius: '12px', fontSize: '1.1rem' }}
            >
                {t('support.create_first_btn')}
            </button>
        </motion.div>
    )
}
