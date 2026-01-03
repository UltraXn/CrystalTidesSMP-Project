import { useState } from "react"
import { FaTicketAlt, FaTimes, FaPaperPlane } from "react-icons/fa"
import { useTranslation } from 'react-i18next'
import { supabase } from "../../../services/supabaseClient"
import { getAuthHeaders } from "../../../services/adminAuth"
import Loader from "../../UI/Loader"
import { AlertData } from "./types"
import { CustomAlert } from "./Shared"


interface CreateTicketModalProps {
    onClose: () => void;
    onSuccess: () => void;
    user: { id: string } | null;
}

export default function CreateTicketModal({ onClose, onSuccess, user }: CreateTicketModalProps) {
    const { t } = useTranslation()
    const [newTicket, setNewTicket] = useState<{
        subject: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
    }>({ subject: '', description: '', priority: 'medium' })
    const [alert, setAlert] = useState<AlertData | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const API_URL = import.meta.env.VITE_API_URL

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTicket.subject) {
            setAlert({ message: t('admin.tickets.create_modal.error_subject', 'Falta el asunto'), type: 'error' })
            return
        }

        if (!user) return;

        try {
            setIsSubmitting(true)
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const res = await fetch(`${API_URL}/tickets`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    user_id: user.id,
                    subject: newTicket.subject,
                    description: newTicket.description,
                    priority: newTicket.priority
                })
            })

            if (!res.ok) throw new Error("Error creating ticket")

            onSuccess()
            onClose()
        } catch (error) {
            setAlert({ message: t('admin.tickets.create_modal.error_create', 'Error al crear') + ": " + (error instanceof Error ? error.message : String(error)), type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.7)' }}>
             <div className="admin-card modal-content" style={{ 
                width: '500px', 
                maxWidth: '90%', 
                border: '1px solid rgba(255,255,255,0.1)', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                background: '#111',
                borderRadius: '24px',
                padding: '0'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    padding: '1.5rem', 
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', color: '#fff' }}>
                        <FaTicketAlt style={{ color: 'var(--accent)' }} /> {t('admin.tickets.create_modal.title', 'Nuevo Ticket')}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="hover-rotate"
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleCreateTicket} style={{ padding: '2rem' }}>
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>{t('admin.tickets.create_modal.subject', 'Asunto')}</label>
                        <input 
                            className="admin-input-premium" 
                            value={newTicket.subject} 
                            onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })} 
                            autoFocus 
                            placeholder={t('admin.tickets.subject_ph', 'Ej: Problema con rango')} 
                            style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                        />
                    </div>

                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>{t('admin.tickets.create_modal.description', 'Descripción')}</label>
                        <textarea 
                            className="admin-input-premium" 
                            rows={5} 
                            value={newTicket.description}  
                            onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} 
                            placeholder={t('admin.tickets.create_modal.desc_placeholder', 'Detalla el problema...')}
                            style={{ width: '100%', padding: '1rem', fontSize: '0.95rem', borderRadius: '12px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{marginBottom: '2rem'}}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>{t('admin.tickets.table.priority', 'Prioridad')}</label>
                        <div style={{ position: 'relative' }}>
                            <select 
                                    className="admin-input-premium" 
                                    style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '12px', cursor: 'pointer', appearance: 'none' }}
                                    value={newTicket.priority} 
                                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                                >
                                    <option value="low">🟢 {t('admin.tickets.priority.low', 'Baja')}</option>
                                    <option value="medium">🟡 {t('admin.tickets.priority.medium', 'Media')}</option>
                                    <option value="high">🟠 {t('admin.tickets.priority.high', 'Alta')}</option>
                                    <option value="urgent">🔴 {t('admin.tickets.priority.urgent', 'Urgente')}</option>
                                </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem' }}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="hover-lift"
                            style={{ 
                                padding: '1rem 2rem', 
                                background: 'transparent', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                color: '#ccc', 
                                borderRadius: '12px', 
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {t('admin.tickets.create_modal.cancel', 'Cancelar')}
                        </button>
                        <button 
                            type="submit" 
                            className="modal-btn-primary hover-lift" 
                            disabled={isSubmitting}
                            style={{ padding: '1rem 3rem', borderRadius: '12px' }}
                        >
                            {isSubmitting ? <Loader minimal size={20} /> : <><FaPaperPlane /> {t('admin.tickets.create_modal.submit', 'Crear Ticket')}</>}
                        </button>
                    </div>
                </form>
            </div>
            {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    )
}
