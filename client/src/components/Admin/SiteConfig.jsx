import { useState, useEffect } from 'react'
import { FaTree, FaGhost, FaWater, FaSnowflake, FaSave, FaCheck, FaExclamationTriangle, FaBullhorn } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import ConfirmationModal from '../UI/ConfirmationModal'
import { useTranslation } from 'react-i18next'

const API_URL = import.meta.env.VITE_API_URL

export default function SiteConfig() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [settings, setSettings] = useState({
        theme: 'default',
        maintenance_mode: 'false',
        announcement: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(null)
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
    const [maintenanceTarget, setMaintenanceTarget] = useState(false)
 // key being saved

    // Fetch initial settings
    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                setSettings(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("Error loading settings:", err)
                setLoading(false)
            })
    }, [])

    const handleUpdate = async (key, value) => {
        setSaving(key)
        try {
            const username = user?.user_metadata?.full_name || user?.email || 'Admin';
            
            const res = await fetch(`${API_URL}/settings/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    value: String(value),
                    username, 
                    userId: user?.id 
                })
            })

            if(res.ok) {
                const newValue = String(value)
                setSettings(prev => ({ ...prev, [key]: newValue }))
                
                // Dispatch event for App.jsx to react immediately
                if(key === 'theme') {
                    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newValue }));
                }
                if(key === 'announcement') {
                    window.dispatchEvent(new CustomEvent('announcementChanged', { detail: newValue }));
                }
                if(key === 'maintenance_mode') {
                    window.dispatchEvent(new CustomEvent('maintenanceChanged', { detail: newValue }));
                }
            } else {
                alert(t('admin.settings.error_save'))
            }
        } catch(err) {
            console.error(err)
        } finally {
            setSaving(null)
        }
    }

    if (loading) return <div>{t('admin.settings.loading')}</div>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. SELECCIÓN DE TEMA (MODO NAVIDAD / HALLOWEEN) */}
            <div className="admin-card">
                <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaWater /> {t('admin.settings.theme.title')}
                </h3>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                    {t('admin.settings.theme.desc')}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    {/* DEFAULT */}
                    <ThemeCard 
                        active={settings.theme === 'default'} 
                        onClick={() => handleUpdate('theme', 'default')}
                        icon={<FaWater size={40} color="#00bcd4" />}
                        title={t('admin.settings.theme.default')}
                        color="#00bcd4"
                        loading={saving === 'theme'}
                    />

                    {/* HALLOWEEN */}
                    <ThemeCard 
                        active={settings.theme === 'halloween'} 
                        onClick={() => handleUpdate('theme', 'halloween')}
                        icon={<FaGhost size={40} color="#ff7518" />}
                        title={t('admin.settings.theme.halloween')}
                        color="#ff7518"
                        loading={saving === 'theme'}
                    />

                    {/* NAVIDAD */}
                    <ThemeCard 
                        active={settings.theme === 'christmas'} 
                        onClick={() => handleUpdate('theme', 'christmas')}
                        icon={<FaTree size={40} color="#ef4444" />}
                        title={t('admin.settings.theme.christmas')}
                        color="#ef4444"
                        loading={saving === 'theme'}
                    />
                </div>
            </div>

            {/* 2. ANUNCIOS GLOBALES */}
            <div className="admin-card">
                <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaBullhorn /> {t('admin.settings.announcement.title')}
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                        className="admin-input" 
                        placeholder={t('admin.settings.announcement.placeholder')} 
                        value={settings.announcement || ''}
                        onChange={(e) => setSettings(prev => ({...prev, announcement: e.target.value}))}
                    />
                    <button 
                        className="btn-primary" 
                        onClick={() => handleUpdate('announcement', settings.announcement)}
                        disabled={saving === 'announcement'}
                    >
                        {saving === 'announcement' ? '...' : <FaSave />} {t('admin.settings.announcement.save')}
                    </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                    {t('admin.settings.announcement.desc')}
                </p>
            </div>

            {/* 3. ZONA DE PELIGRO / MANTENIMIENTO */}
            <div className="admin-card" style={{ border: '1px solid #ef4444' }}>
                <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem', color: '#ef4444' }}>
                    <FaExclamationTriangle /> {t('admin.settings.danger.title')}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                        <h4 style={{ margin: 0, color: '#fff' }}>{t('admin.settings.danger.maintenance_title')}</h4>
                        <p style={{ margin: '0.5rem 0 0', color: '#aaa', fontSize: '0.9rem' }}>
                            {t('admin.settings.danger.maintenance_desc')}
                        </p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={settings.maintenance_mode === 'true'} 
                            onChange={() => {}} // Controlled manually via onClick
                            onClick={(e) => {
                                e.preventDefault();
                                const nextState = !(settings.maintenance_mode === 'true');
                                setMaintenanceTarget(nextState);
                                setShowMaintenanceModal(true);
                            }}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            <ConfirmationModal 
                isOpen={showMaintenanceModal}
                onClose={() => setShowMaintenanceModal(false)}
                onConfirm={() => {
                    handleUpdate('maintenance_mode', String(maintenanceTarget));
                    setShowMaintenanceModal(false);
                }}
                title={maintenanceTarget ? t('admin.settings.maintenance_modal.title_on') : t('admin.settings.maintenance_modal.title_off')}
                message={maintenanceTarget 
                    ? t('admin.settings.maintenance_modal.msg_on') 
                    : t('admin.settings.maintenance_modal.msg_off')}
                confirmText={maintenanceTarget ? t('admin.settings.maintenance_modal.confirm_on') : t('admin.settings.maintenance_modal.confirm_off')}
                cancelText={t('admin.settings.maintenance_modal.cancel')}
                isDanger={maintenanceTarget}
            />
        </div>
    )
}

function ThemeCard({ active, onClick, icon, title, color, loading }) {
    return (
        <div 
            onClick={onClick}
            style={{ 
                background: active ? `linear-gradient(135deg, ${color}22, transparent)` : 'rgba(255,255,255,0.03)', 
                border: active ? `2px solid ${color}` : '1px solid #333',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading && !active ? 0.5 : 1,
                position: 'relative',
                overflow: 'hidden'
            }}
            className="theme-card"
        >
            {active && <div style={{ position: 'absolute', top: 10, right: 10, color: color }}><FaCheck /></div>}
            <div style={{ marginBottom: '1rem', transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s' }}>
                {icon}
            </div>
            <h4 style={{ color: active ? '#fff' : '#888', margin: 0 }}>{title}</h4>
        </div>
    )
}
