import { useState, useEffect } from "react";
import { Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "../../UI/Loader";
import { supabase } from "../../../services/supabaseClient";
import { getAuthHeaders } from "../../../services/adminAuth";
import { Registration } from "./types";

interface RegistrationsModalProps {
    eventId: number;
    onClose: () => void;
    API_URL: string;
    mockRegistrations?: Registration[];
}

export default function RegistrationsModal({ eventId, onClose, API_URL, mockRegistrations }: RegistrationsModalProps) {
    const { t } = useTranslation();
    const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations || []);
    const [loading, setLoading] = useState(!mockRegistrations);
    
    useEffect(() => {
        const fetchReg = async () => {
            if (mockRegistrations) return;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch(`${API_URL}/events/${eventId}/registrations`, {
                    headers: getAuthHeaders(session?.access_token || null)
                });
                if (res.ok) {
                    const data = await res.json();
                    setRegistrations(data);
                }
            } catch (e) { console.error(e) } 
            finally { setLoading(false) }
        }
        fetchReg();
    }, [eventId, API_URL, mockRegistrations]);

    return (
        <div className="sync-modal-overlay" onClick={onClose}>
            <div className="sync-modal-content poll-modal-content" style={{ maxWidth: '550px', maxHeight: '85vh', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
                <div className="modal-accent-line"></div>
                
                <div className="poll-form-header" style={{ padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>
                        <Users style={{ color: 'var(--accent)' }} />
                        {t('admin.events.registrations.title')} ({registrations.length})
                    </h3>
                    <button onClick={onClose} className="btn-close-mini">
                        <X />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
                    {loading ? (
                        <div style={{ padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                            <Loader style={{ height: 'auto', minHeight: '60px' }} />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('admin.events.registrations.loading')}</span>
                        </div>
                    ) : (
                        registrations.length === 0 ? (
                            <div className="poll-empty-state" style={{ padding: '3rem 1rem', marginTop: 0 }}>
                                <Users size={40} style={{ color: 'rgba(255,255,255,0.05)' }} />
                                <p style={{ color: 'rgba(255,255,255,0.2)', fontWeight: '800' }}>{t('admin.events.registrations.empty')}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {registrations.map(reg => (
                                    <div key={reg.id} className="registration-item">
                                        <div className="reg-avatar-ring">
                                            <div className="reg-avatar-content">
                                                {reg.profiles?.avatar_url ? (
                                                    <img src={reg.profiles.avatar_url} style={{width:'100%', height:'100%', objectFit: 'cover'}} alt="avatar"/>
                                                ) : (
                                                    <div style={{color:'rgba(255,255,255,0.2)', fontSize:'1rem', fontWeight: '900'}}>CT</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="reg-info">
                                            <div className="reg-name">{reg.profiles?.username || t('admin.events.registrations.unknown_user')}</div>
                                            <div className="reg-date">{new Date(reg.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}></div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="modal-btn-primary" style={{ height: '44px', padding: '0 2rem' }}>
                        {t('admin.events.close_btn', 'Cerrar')}
                    </button>
                </div>
            </div>
        </div>
    )
}
