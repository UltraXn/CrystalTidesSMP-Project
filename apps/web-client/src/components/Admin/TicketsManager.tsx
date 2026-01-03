import { useState, useEffect, useCallback } from "react"
import { FaSearch, FaPlus, FaTrash } from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import { useTranslation } from 'react-i18next'
import { supabase } from "../../services/supabaseClient"
import { getAuthHeaders } from "../../services/adminAuth"

// New Components
import { Ticket, Message, AlertData } from "./Tickets/types"
import { CustomAlert, CustomConfirm } from "./Tickets/Shared"
import TicketTable from "./Tickets/TicketTable"
import CreateTicketModal from "./Tickets/CreateTicketModal"
import TicketDetailModal from "./Tickets/TicketDetailModal"

interface TicketsManagerProps {
    mockTickets?: Ticket[];
    mockMessages?: Record<number, Message[]>;
}

export default function TicketsManager({ mockTickets, mockMessages }: TicketsManagerProps = {}) {
    const { t } = useTranslation()
    const { user } = useAuth() as { user: { id: string } | null }
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([])
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
    const [alert, setAlert] = useState<AlertData | null>(null)

    const API_URL = import.meta.env.VITE_API_URL

    const fetchTickets = useCallback(async () => {
        if (mockTickets) {
            setTickets(mockTickets)
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession();
            const headers: HeadersInit = getAuthHeaders(session?.access_token || null);

            const res = await fetch(`${API_URL}/tickets`, { headers })
            if (res.status === 429) {
                console.warn("Rate limited fetching tickets. Retrying automatically in 5s.")
                setTimeout(fetchTickets, 5000)
                return
            }
            if (!res.ok) throw new Error("Error fetching tickets")
            const data = await res.json()
            if (data.success && Array.isArray(data.data)) {
                setTickets(data.data)
            } else if (Array.isArray(data)) {
                setTickets(data)
            } else {
                setTickets([])
            }
        } catch (error) {
            console.error("Failed to load tickets", error)
            setAlert({ message: t('admin.alerts.error_title', 'Error') + ": " + (error instanceof Error ? error.message : "Unknown Error"), type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [mockTickets, API_URL, t])

    useEffect(() => {
        fetchTickets()
    }, [fetchTickets])

    const toggleSelectTicket = (id: number) => {
        setSelectedTicketIds(prev => 
            prev.includes(id) ? prev.filter(ticketId => ticketId !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedTicketIds.length === tickets.length) {
            setSelectedTicketIds([])
        } else {
            setSelectedTicketIds(tickets.map(t => t.id))
        }
    }

    const handleBulkDelete = async () => {
        if (selectedTicketIds.length === 0) return;
        
        try {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            await Promise.all(selectedTicketIds.map(id => 
                fetch(`${API_URL}/tickets/${id}`, {
                    method: 'DELETE',
                    headers
                })
            ));

            setAlert({ message: t('admin.tickets.bulk_delete_success', 'Tickets eliminados'), type: 'success' })
            setSelectedTicketIds([])
            fetchTickets()
        } catch (error) {
            console.error(error)
            setAlert({ message: t('admin.alerts.error_title', 'Error'), type: 'error' })
        } finally {
            setLoading(false)
            setConfirmBulkDelete(false)
        }
    }

    return (
        <div className="admin-card" style={{ 
            background: 'rgba(10, 10, 15, 0.6)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            borderRadius: '24px',
            padding: '2rem'
        }}>
            {/* CARD HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', flex: '1 1 auto' }}>
                    <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                    <input 
                        type="text" 
                        placeholder={t('admin.tickets.search_placeholder', 'Buscar tickets...')} 
                        style={{ 
                            width: '100%', 
                            padding: '1rem 1rem 1rem 3rem', 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '12px', 
                            color: '#fff',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }} 
                        className="admin-input-premium"
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {selectedTicketIds.length > 0 && (
                        <button
                            className="hover-lift"
                            onClick={() => setConfirmBulkDelete(true)}
                            style={{ 
                                fontSize: '0.9rem', 
                                padding: '0.8rem 1.5rem', 
                                display: 'flex', 
                                gap: '0.5rem', 
                                alignItems: 'center', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <FaTrash size={14} /> {t('admin.tickets.delete_selected', 'Eliminar')} ({selectedTicketIds.length})
                        </button>
                    )}
                    <button
                        className="modal-btn-primary hover-lift"
                        onClick={() => setShowCreateModal(true)}
                        style={{ 
                            fontSize: '0.95rem', 
                            padding: '0.8rem 1.5rem', 
                            display: 'flex', 
                            gap: '0.5rem', 
                            alignItems: 'center',
                            borderRadius: '12px'
                        }}
                    >
                        <FaPlus size={14} /> {t('admin.tickets.new_ticket', 'Nuevo Ticket')}
                    </button>
                </div>
            </div>

            {/* TICKETS TABLE */}
            <div className="admin-table-container" style={{ 
                overflow: 'hidden', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.2)'
            }}>
                <TicketTable 
                    tickets={tickets} 
                    loading={loading} 
                    selectedTicketIds={selectedTicketIds} 
                    toggleSelectAll={toggleSelectAll} 
                    toggleSelectTicket={toggleSelectTicket}
                    onViewTicket={setSelectedTicket}
                />
            </div>

            {/* MODALS */}
            {showCreateModal && (
                <CreateTicketModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchTickets}
                    user={user}
                />
            )}

            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    refreshTickets={fetchTickets}
                    mockMessages={mockMessages?.[selectedTicket.id]}
                    user={user}
                />
            )}

            {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            
            {confirmBulkDelete && (
                <CustomConfirm 
                    message={t('admin.tickets.bulk_delete_confirm', '¿Estás seguro de eliminar los tickets seleccionados?')}
                    onConfirm={handleBulkDelete}
                    onCancel={() => setConfirmBulkDelete(false)}
                />
            )}
        </div>
    )
}
