import { useState, useEffect } from 'react';
import { FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface BroadcastConfig {
    active: boolean;
    type: 'alert' | 'error' | 'info';
    message: string;
}

export default function BroadcastAlert() {
    const [config, setConfig] = useState<BroadcastConfig | null>(null);
    const [visible, setVisible] = useState(true);

    const fetchConfig = () => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                if(data.broadcast_config) {
                    try {
                        const parsed = typeof data.broadcast_config === 'string' 
                            ? JSON.parse(data.broadcast_config) 
                            : data.broadcast_config;
                        setConfig(parsed);
                    } catch (e) { console.error(e); }
                }
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchConfig();

        // Listen for real-time updates from Admin Panel
        const handleUpdate = (e: CustomEvent) => {
            try {
                const parsed = JSON.parse(e.detail);
                setConfig(parsed);
                setVisible(true); // Re-show if updated
            } catch (err) { console.error(err); }
        };

        window.addEventListener('broadcastChanged', handleUpdate as EventListener);
        return () => window.removeEventListener('broadcastChanged', handleUpdate as EventListener);
    }, []);

    if (!config || !config.active || !visible) return null;

    const getStyles = () => {
        switch(config.type) {
            case 'alert':
                return { bg: '#facc15', color: '#000', icon: <FaExclamationTriangle /> };
            case 'error':
                return { bg: '#ef4444', color: '#fff', icon: <FaTimesCircle /> };
            default: // info
                return { bg: '#3b82f6', color: '#fff', icon: <FaInfoCircle /> };
        }
    };

    const style = getStyles();

    return (
        <div style={{
            background: style.bg,
            color: style.color,
            padding: '0.6rem 1rem',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '0.95rem',
            position: 'relative',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
            {style.icon}
            <span>{config.message}</span>
            <button 
                onClick={() => setVisible(false)}
                style={{
                    position: 'absolute',
                    right: '1rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.8
                }}
            >
                <FaTimes />
            </button>
        </div>
    );
}
