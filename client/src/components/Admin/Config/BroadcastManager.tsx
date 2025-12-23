import { useState, useEffect } from 'react';
import { FaBullhorn, FaSave, FaInfoCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
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
        <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <FaBullhorn /> {t('admin.settings.broadcast.title', 'Alertas Globales')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* 1. Toggle Active */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                        <span style={{ fontWeight: 'bold' }}>Estado de la Alerta</span>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                            {config.active ? 'Visible en toda la web' : 'Oculta para los usuarios'}
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
                    <label className="admin-label">Mensaje del Anuncio</label>
                    <input 
                        className="admin-input" 
                        value={config.message}
                        onChange={(e) => setConfig({...config, message: e.target.value})}
                        placeholder="Ej: Mantenimiento programado para el Sábado a las 20:00"
                    />
                </div>

                {/* 3. Type Selector */}
                <div>
                    <label className="admin-label">Tipo de Alerta</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {(['info', 'alert', 'error'] as const).map(type => (
                            <div 
                                key={type}
                                onClick={() => setConfig({...config, type})}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    borderRadius: '6px',
                                    border: config.type === type ? `2px solid ${getTypeColor(type)}` : '1px solid #333',
                                    background: config.type === type ? `${getTypeColor(type)}22` : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {type === 'info' && <FaInfoCircle color="#3b82f6" />}
                                {type === 'alert' && <FaExclamationTriangle color="#facc15" />}
                                {type === 'error' && <FaTimesCircle color="#ef4444" />}
                                <span style={{ textTransform: 'capitalize', color: '#ccc' }}>{type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div style={{ 
                    padding: '1rem', 
                    border: '1px dashed #444', 
                    borderRadius: '8px', 
                    marginTop: '0.5rem'
                }}>
                    <label style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Vista Previa</label>
                    
                    {config.active ? (
                        <div style={{
                            background: getTypeColor(config.type),
                            color: '#000',
                            padding: '0.8rem',
                            borderRadius: '4px',
                            fontWeight: '600',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                             {config.message || '(Mensaje vacío)'}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '0.5rem' }}>
                            (La alerta está desactivada)
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        className="btn-primary" 
                        onClick={handleSave}
                        disabled={saving === 'broadcast_config'}
                        style={{ padding: '0.8rem 2rem' }}
                    >
                        {saving === 'broadcast_config' ? 'Guardando...' : <><FaSave /> Guardar Configuración</>}
                    </button>
                </div>
                
            </div>
        </div>
    );
}
