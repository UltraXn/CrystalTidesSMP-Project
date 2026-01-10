import { useState, useEffect } from 'react';
import { Megaphone, Save, Info, AlertTriangle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BroadcastConfig {
    message: string;
    type: 'info' | 'alert' | 'error';
    active: boolean;
}

interface BroadcastManagerProps {
    settings: {
        broadcast_config?: string | BroadcastConfig;
    };
    onUpdate: (key: string, value: string) => void;
    saving: string | null;
}

export default function BroadcastManager({ settings, onUpdate, saving }: BroadcastManagerProps) {
    const { t } = useTranslation();
    
    // Internal state for the form
    const [config, setConfig] = useState<BroadcastConfig>({
        message: '',
        type: 'info', // info, alert, error
        active: false
    });

    const broadcastConfig = settings?.broadcast_config;

    // Load initial settings
    useEffect(() => {
        if (broadcastConfig) {
            try {
                // const data = await res.json(); // Unused
                const parsed = typeof broadcastConfig === 'string' 
                    ? JSON.parse(broadcastConfig) 
                    : broadcastConfig;
                
                // Sync state with props asynchronously to avoid effect warning
                setTimeout(() => {
                    setConfig(prev => {
                       if (JSON.stringify(prev) !== JSON.stringify(parsed)) return parsed;
                       return prev;
                    });
                }, 0);
            } catch (e) {
                console.error("Error parsing broadcast config", e);
            }
        }
    }, [broadcastConfig]);

    const handleSave = () => {
        // Save as JSON string
        onUpdate('broadcast_config', JSON.stringify(config));
    };

    const getTypeColor = (type: BroadcastConfig['type']) => {
        switch(type) {
            case 'alert': return '#facc15'; // Yellow
            case 'error': return '#ef4444'; // Red
            default: return '#3b82f6'; // Blue
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="admin-card" style={{ 
                margin: 0, 
                padding: '2rem',
                background: 'rgba(10, 10, 15, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div>
                        <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.75rem', fontSize: '1.2rem', fontWeight: '800' }}>
                           <Megaphone style={{ color: 'var(--accent)' }} /> {t('admin.settings.broadcast.title')}
                        </h3>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* 1. Toggle Active - Premium Card */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        background: config.active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.03)', 
                        padding: '1.5rem', 
                        borderRadius: '16px',
                        border: config.active ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.3s'
                    }}>
                        <div>
                            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: config.active ? '#4ade80' : 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>
                                {config.active ? t('admin.settings.broadcast.active') : t('admin.settings.broadcast.inactive')}
                            </span>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                {config.active ? 'La alerta es visible en toda la web.' : 'La alerta está oculta para los usuarios.'}
                            </p>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={config.active}
                                onChange={(e) => setConfig({...config, active: e.target.checked})}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {/* 2. Message Input */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>
                            {t('admin.settings.broadcast.message_label')}
                        </label>
                        <input 
                            className="admin-input-premium" 
                            value={config.message}
                            onChange={(e) => setConfig({...config, message: e.target.value})}
                            placeholder={t('admin.settings.broadcast.placeholder', 'Ej: Mantenimiento programado para el Sábado a las 20:00')}
                            style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                        />
                    </div>

                    {/* 3. Type Selector */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>
                            {t('admin.settings.broadcast.type_label')}
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                            {(['info', 'alert', 'error'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setConfig({...config, type})}
                                    className="hover-lift"
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: config.type === type ? `1px solid ${getTypeColor(type)}` : '1px solid rgba(255,255,255,0.05)',
                                        background: config.type === type ? `${getTypeColor(type)}15` : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s',
                                        color: config.type === type ? '#fff' : 'rgba(255,255,255,0.5)',
                                        fontWeight: config.type === type ? '700' : 'normal'
                                    }}
                                >
                                    {type === 'info' && <Info color={config.type === type ? '#3b82f6' : 'inherit'} />}
                                    {type === 'alert' && <AlertTriangle color={config.type === type ? '#facc15' : 'inherit'} />}
                                    {type === 'error' && <XCircle color={config.type === type ? '#ef4444' : 'inherit'} />}
                                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div style={{ 
                        padding: '1.5rem', 
                        border: '1px dashed rgba(255,255,255,0.1)', 
                        borderRadius: '16px', 
                        marginTop: '1rem',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block', letterSpacing: '1px', fontWeight: 'bold' }}>{t('admin.settings.broadcast.preview')}</label>
                        
                        {config.active ? (
                            <div style={{
                                background: getTypeColor(config.type),
                                color: '#000',
                                padding: '1rem',
                                borderRadius: '8px',
                                fontWeight: '700',
                                textAlign: 'center',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}>
                                 {config.type === 'info' && <Info />}
                                 {config.type === 'alert' && <AlertTriangle />}
                                 {config.type === 'error' && <XCircle />}
                                 {config.message || t('admin.settings.broadcast.empty_msg')}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '1rem' }}>
                                ( {t('admin.settings.broadcast.disabled_msg', 'La alerta está desactivada')} )
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', marginTop: '1.5rem' }}>
                        <button 
                            className="modal-btn-primary hover-lift" 
                            onClick={handleSave}
                            disabled={saving === 'broadcast_config'}
                            style={{ 
                                width: '100%', 
                                padding: '1rem', 
                                borderRadius: '16px', 
                                fontWeight: '800', 
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {saving === 'broadcast_config' ? (
                                <><span className="spinner-border spinner-border-sm" style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span> Guardando...</>
                            ) : (
                                <><Save /> {t('admin.settings.broadcast.save_btn', 'GUARDAR CONFIGURACIÓN')}</>
                            )}
                        </button>
                    </div>
                    
                </div>
            </div>
             <style>{`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
