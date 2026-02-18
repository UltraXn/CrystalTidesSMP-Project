import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Ticket as TicketIcon, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import SectionDivider from '../components/Layout/SectionDivider'
import TicketForm from '../components/Support/TicketForm'
import { CreateTicketFormValues } from '../schemas/ticket'
import Loader from '../components/UI/Loader'
import { fetchTickets, createTicket } from '../services/ticketService'

// Sub-components
import SupportHero from '../components/Support/SupportHero'
import TicketList from '../components/Support/TicketList'
import TicketEmptyState from '../components/Support/TicketEmptyState'
import SupportLoginPrompt from '../components/Support/SupportLoginPrompt'

export default function Support() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [showCreateModal, setShowCreateModal] = useState(false)

    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['tickets', user?.id],
        queryFn: fetchTickets,
        enabled: !!user
    })

    const createMutation = useMutation({
        mutationFn: createTicket,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets', user?.id] })
            setShowCreateModal(false)
        },
        onError: (error) => {
            console.error('Error creating ticket:', error)
            alert(t('support.error_create', 'Error creating ticket. Please try again.'))
        }
    })

    const handleCreateTicket = async (data: CreateTicketFormValues) => {
        createMutation.mutate({
            title: data.title,
            description: data.description,
            category: data.category || 'general',
            priority: data.priority || 'medium'
        })
    }

    if (isLoading) return <Loader fullScreen text={t('common.loading')} />

    return (
        <div className="support-page" style={{ marginBottom: '4rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <SupportHero 
                isLoggedIn={!!user} 
                onOpenCreateModal={() => setShowCreateModal(true)} 
            />

            <SectionDivider />

            <div className="container">
                <div className="breadcrumbs" style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>{t('navbar.home')}</Link>
                    <ChevronRight size={10} />
                    <span style={{ color: 'var(--accent)' }}>{t('navbar.support')}</span>
                </div>

                {!user && <SupportLoginPrompt />}

                {user && (
                    <div className="tickets-section" style={{ padding: '2rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
                                <div style={{ width: '3rem', height: '3rem', background: 'var(--accent-soft)', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TicketIcon size={20} style={{ color: 'var(--accent)' }} />
                                </div>
                                {t('support.your_tickets')}
                            </h2>
                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', fontSize: '0.9rem', color: 'var(--muted)' }}>
                                {tickets.length} {t('support.total')}
                            </div>
                        </div>

                        {tickets.length === 0 ? (
                            <TicketEmptyState onOpenCreateModal={() => setShowCreateModal(true)} />
                        ) : (
                            <TicketList tickets={tickets} />
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showCreateModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay" 
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1.5rem'
                        }}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <TicketForm 
                            onClose={() => setShowCreateModal(false)} 
                            onSubmit={handleCreateTicket} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
