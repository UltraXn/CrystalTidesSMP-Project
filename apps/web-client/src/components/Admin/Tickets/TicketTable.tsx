import { FaUsers, FaEye, FaTicketAlt } from "react-icons/fa"
import { useTranslation } from 'react-i18next'
import { Ticket } from "./types"
import { PriorityBadge, StatusBadge } from "./Shared"
import Loader from "../../UI/Loader"

interface TicketTableProps {
    tickets: Ticket[];
    loading: boolean;
    selectedTicketIds: number[];
    toggleSelectAll: () => void;
    toggleSelectTicket: (id: number) => void;
    onViewTicket: (ticket: Ticket) => void;
}

export default function TicketTable({ 
    tickets, 
    loading, 
    selectedTicketIds, 
    toggleSelectAll, 
    toggleSelectTicket, 
    onViewTicket 
}: TicketTableProps) {
    const { t } = useTranslation()

    if (loading) {
       return (
           <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
               <Loader text={t('admin.tickets.searching', 'Buscando tickets...')} minimal size={40} />
           </div>
       )
    }

    if (tickets.length === 0) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                <FaTicketAlt size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '1.1rem' }}>{t('admin.tickets.empty', 'No se encontraron tickets')}</p>
            </div>
        )
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{width: '50px', padding: '1.5rem 1rem', textAlign: 'center'}}>
                            <input 
                                type="checkbox" 
                                checked={tickets.length > 0 && selectedTicketIds.length === tickets.length}
                                onChange={toggleSelectAll}
                                style={{cursor:'pointer', accentColor: 'var(--accent)'}}
                            />
                        </th>
                        <th style={{padding: '1.5rem 1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}}>{t('admin.tickets.table.id', 'ID')}</th>
                        <th style={{padding: '1.5rem 1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}}>{t('admin.tickets.table.user', 'Usuario')}</th>
                        <th style={{padding: '1.5rem 1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}}>{t('admin.tickets.table.subject', 'Asunto')}</th>
                        <th style={{padding: '1.5rem 1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', width: '120px'}}>{t('admin.tickets.table.priority', 'Prioridad')}</th>
                        <th style={{padding: '1.5rem 1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', width: '120px'}}>{t('admin.tickets.table.status', 'Estado')}</th>
                        <th style={{padding: '1.5rem 1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', width: '150px'}}>{t('admin.tickets.table.date', 'Fecha')}</th>
                        <th style={{padding: '1.5rem 1rem', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', width: '80px'}}>{t('admin.tickets.table.action', 'Acción')}</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticketItem => (
                        <tr 
                            key={ticketItem.id} 
                            onClick={() => onViewTicket(ticketItem)} 
                            className="hover-bg-glass"
                            style={{ 
                                cursor: 'pointer', 
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                background: selectedTicketIds.includes(ticketItem.id) ? 'rgba(var(--accent-rgb), 0.05)' : 'transparent',
                                transition: 'background 0.2s'
                            }}
                        >
                            <td onClick={e => e.stopPropagation()} style={{textAlign: 'center', padding: '1rem'}}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedTicketIds.includes(ticketItem.id)}
                                    onChange={() => toggleSelectTicket(ticketItem.id)}
                                    style={{cursor:'pointer', accentColor: 'var(--accent)'}}
                                />
                            </td>
                            <td style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 'bold', padding: '1rem' }}>#{ticketItem.id}</td>
                            <td style={{ color: '#ccc', fontSize: '0.95rem', padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    {ticketItem.profiles?.avatar_url ? (
                                        <img src={ticketItem.profiles.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    ) : (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaUsers size={14} color="#666" />
                                        </div>
                                    )}
                                    <span style={{ fontWeight: '500' }}>{ticketItem.profiles?.username || ticketItem.user_id?.substring(0, 8) || 'Anon'}</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: '600', color: '#fff', padding: '1rem' }}>{ticketItem.subject}</td>
                            <td style={{ padding: '1rem' }}><PriorityBadge priority={ticketItem.priority} /></td>
                            <td style={{ padding: '1rem' }}><StatusBadge status={ticketItem.status} /></td>
                            <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', padding: '1rem' }}>{new Date(ticketItem.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onViewTicket(ticketItem); }}
                                    className="hover-scale"
                                    style={{ 
                                        padding: '0.5rem', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        background: 'rgba(255,255,255,0.05)', 
                                        borderRadius: '8px', 
                                        cursor: 'pointer',
                                        color: 'var(--accent)'
                                    }}
                                    title={t('admin.tickets.view_details_tooltip', 'Ver detalles')}
                                >
                                    <FaEye size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
