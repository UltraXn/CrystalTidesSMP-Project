import { FaExclamationCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"
import { useTranslation } from 'react-i18next'
import React from 'react'

interface CustomAlertProps {
    message: string;
    type?: 'error' | 'success' | 'warning';
    onClose: () => void;
}

export function CustomAlert({ message, type = 'error', onClose }: CustomAlertProps) {
    const { t } = useTranslation()
    const colors: Record<string, string> = { error: '#ef4444', success: '#10b981', warning: '#facc15' }
    const Icon = type === 'error' ? FaExclamationCircle : (type === 'success' ? FaCheckCircle : FaExclamationTriangle)
    
    const titles: Record<string, string> = {
        error: t('admin.alerts.error_title', 'Error'),
        success: t('admin.alerts.success_title', 'Éxito'),
        warning: t('admin.alerts.warning_title', 'Advertencia')
    }

    return (
        <div className="modal-overlay" style={{ zIndex: 100000 }}>
            <div className="admin-card modal-content" style={{ width: '400px', maxWidth: '90%', textAlign: 'center', padding: '2rem', border: `1px solid ${colors[type]}`, boxShadow: `0 0 30px ${colors[type]}20` }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <Icon size={48} color={colors[type]} />
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.5rem' }}>
                    {titles[type] || t('admin.alerts.warning_title')}
                </h3>
                <p style={{ color: '#ccc', marginBottom: '2rem', lineHeight: '1.6' }}>{message}</p>
                <button 
                    onClick={onClose} 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', background: colors[type], color: '#000', fontWeight: 'bold' }}
                >
                    {t('admin.alerts.accept', 'Aceptar')}
                </button>
            </div>
        </div>
    )
}

interface CustomConfirmProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function CustomConfirm({ message, onConfirm, onCancel }: CustomConfirmProps) {
    const { t } = useTranslation()
    return (
        <div className="modal-overlay" style={{ zIndex: 100000 }}>
            <div className="admin-card modal-content" style={{ width: '400px', maxWidth: '90%', textAlign: 'center', padding: '2rem', border: `1px solid #facc15`, boxShadow: `0 0 30px rgba(250, 204, 21, 0.2)` }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <FaExclamationTriangle size={48} color="#facc15" />
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.5rem' }}>
                    {t('admin.alerts.confirm_title', 'Confirmar Acción')}
                </h3>
                <p style={{ color: '#ccc', marginBottom: '2rem', lineHeight: '1.6' }}>{message}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                     <button 
                        onClick={onCancel} 
                        className="btn-secondary" 
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        {t('admin.tickets.create_modal.cancel', 'Cancelar')}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="btn-primary" 
                        style={{ flex: 1, justifyContent: 'center', background: '#ef4444', color: '#fff', fontWeight: 'bold' }}
                    >
                        {t('admin.tickets.actions.delete', 'Eliminar')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export function PriorityBadge({ priority }: { priority: string }) {
    const { t } = useTranslation()
    const colors: Record<string, string> = { low: '#4ade80', medium: '#facc15', high: '#fb923c', urgent: '#ef4444' }
    const labels: Record<string, string> = {
        low: t('admin.tickets.priority.low', 'Baja'),
        medium: t('admin.tickets.priority.medium', 'Media'),
        high: t('admin.tickets.priority.high', 'Alta'),
        urgent: t('admin.tickets.priority.urgent', 'Urgente')
    }
    return <span style={{ color: colors[priority] || colors.medium, fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'capitalize' }}>{labels[priority] || priority}</span>
}

export function StatusBadge({ status }: { status: string }) {
    const { t } = useTranslation()
    let color = '#aaa';
    if (status === 'open') color = '#3b82f6';
    if (status === 'pending') color = '#facc15';
    if (status === 'resolved') color = '#4ade80';
    if (status === 'closed') color = '#666';

    const labels: Record<string, string> = {
        open: t('admin.tickets.status.open', 'Abierto'),
        pending: t('admin.tickets.status.pending', 'Pendiente'),
        resolved: t('admin.tickets.status.resolved', 'Resuelto'),
        closed: t('admin.tickets.status.closed', 'Cerrado')
    }

    return (
        <span className="status-chip" style={{ background: `${color}20`, color: color, border: `1px solid ${color}40`, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
            {labels[status] || status}
        </span>
    )
}
