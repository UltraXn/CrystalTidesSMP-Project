import { useState } from "react"
import { Gavel, Loader2 } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { supabase } from "../../../services/supabaseClient"
import { getAuthHeaders } from "../../../services/adminAuth"
import { Ticket, AlertData } from "./types"
import { CustomAlert } from "./Shared"

interface BanUserModalProps {
    ticket?: Ticket;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BanUserModal({ onClose, onSuccess }: BanUserModalProps) {
    const { t } = useTranslation()
    const [nickname, setNickname] = useState('') 
    const [reason, setReason] = useState('')
    const [duration, setDuration] = useState('temp') 
    const [timeValue, setTimeValue] = useState('7')
    const [timeUnit, setTimeUnit] = useState('d') 
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState<AlertData | null>(null)

    const handleBan = async (e: React.FormEvent) => {
        e.preventDefault()
        if(!nickname) {
            setAlert({ message: t('admin.tickets.ban_modal.error_nick', 'Debes ingresar un nickname'), type: 'error' })
            return
        }
        
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            await fetch(`${import.meta.env.VITE_API_URL}/tickets/ban`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ 
                    username: nickname, 
                    reason: duration === 'perm' ? `[PERMANENTE] ${reason}` : `[TEMP: ${timeValue}${timeUnit}] ${reason}`
                })
            })
            
            onSuccess()
        } catch (err) {
            console.error(err)
            setAlert({ message: t('admin.alerts.error_title', 'Error') + ": " + (err instanceof Error ? err.message : String(err)), type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" style={{backdropFilter: 'blur(5px)'}}>
            <div className="admin-card modal-content" style={{width: '450px', border: '1px solid #ef4444', boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'}}>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.5rem', borderBottom:'1px solid #333', paddingBottom:'1rem'}}>
                    <Gavel color="#ef4444" size={20} />
                    <h3 style={{margin:0, color:'#fff'}}>{t('admin.tickets.ban_modal.title', 'Banear Usuario Importuno')}</h3>
                </div>

                <form onSubmit={handleBan}>
                    <div style={{marginBottom:'1rem'}}>
                        <label className="admin-label">{t('admin.tickets.ban_modal.nickname', 'Nickname (Exacto)')}</label>
                        <input 
                            className="admin-input" 
                            value={nickname} 
                            onChange={e => setNickname(e.target.value)} 
                            placeholder={t('admin.tickets.ban_modal.nick_ph', 'Ej: Notch')}
                            autoFocus
                        />
                         <div style={{fontSize: '0.75rem', color: '#666', marginTop: '0.3rem'}}>
                            {t('admin.tickets.ban_modal.nick_hint', 'Asegúrate de copiarlo bien del chat.')}
                        </div>
                    </div>

                    <div style={{marginBottom:'1rem'}}>
                        <label className="admin-label">{t('admin.tickets.ban_modal.type', 'Tipo de Sanción')}</label>
                        <div style={{display:'flex', gap:'1rem'}}>
                            <button 
                                type="button" 
                                className={`admin-tab-btn ${duration === 'temp' ? 'active' : ''}`}
                                onClick={() => setDuration('temp')}
                                style={{flex:1, textAlign:'center', borderColor: duration === 'temp' ? 'var(--accent)' : '#333'}}
                            >
                                {t('admin.tickets.ban_modal.temp', 'Temporal')}
                            </button>
                            <button 
                                type="button" 
                                className={`admin-tab-btn ${duration === 'perm' ? 'active' : ''}`}
                                onClick={() => setDuration('perm')}
                                style={{flex:1, textAlign:'center', borderColor: duration === 'perm' ? '#ef4444' : '#333', color: duration === 'perm' ? '#ef4444' : '#aaa'}}
                            >
                                {t('admin.tickets.ban_modal.perm', 'Permanente')}
                            </button>
                        </div>
                    </div>

                    {duration === 'temp' && (
                        <div style={{marginBottom:'1rem', display:'flex', gap:'0.5rem'}}>
                            <div style={{flex:1}}>
                                <label className="admin-label">{t('admin.tickets.ban_modal.amount', 'Cantidad')}</label>
                                <input type="number" className="admin-input" value={timeValue} onChange={e => setTimeValue(e.target.value)} min="1" />
                            </div>
                            <div style={{flex:1}}>
                                <label className="admin-label">{t('admin.tickets.ban_modal.unit', 'Unidad')}</label>
                                <select 
                                    className="admin-input" 
                                    style={{ backgroundColor: '#1a1b20', color: 'white', cursor: 'pointer' }}
                                    value={timeUnit} 
                                    onChange={e => setTimeUnit(e.target.value)}
                                >
                                    <option value="m">{t('admin.tickets.units.m', 'Minutos')}</option>
                                    <option value="h">{t('admin.tickets.units.h', 'Horas')}</option>
                                    <option value="d">{t('admin.tickets.units.d', 'Días')}</option>
                                    <option value="mo">{t('admin.tickets.units.mo', 'Meses')}</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div style={{marginBottom:'1.5rem'}}>
                        <label className="admin-label">{t('admin.tickets.ban_modal.reason', 'Razón')}</label>
                        <textarea 
                            className="admin-input" 
                            rows={3} 
                            value={reason} 
                            onChange={e => setReason(e.target.value)} 
                            placeholder={t('admin.tickets.ban_modal.reason_ph', 'Ej: Insultos graves al staff...')}
                        />
                    </div>

                    <div style={{display:'flex', justifyContent:'flex-end', gap:'1rem', borderTop:'1px solid #333', paddingTop:'1rem'}}>
                        <button type="button" onClick={onClose} className="btn-secondary">{t('admin.tickets.create_modal.cancel', 'Cancelar')}</button>
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={loading}
                            style={{background: '#ef4444', border: 'none', color: '#fff'}}
                        >
                            {loading ? <Loader2 className="animate-spin"/> : <><Gavel /> {t('admin.tickets.ban_modal.submit', 'Aplicar Martillo')}</>}
                        </button>
                    </div>
                </form>
            </div>
            {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    )
}
