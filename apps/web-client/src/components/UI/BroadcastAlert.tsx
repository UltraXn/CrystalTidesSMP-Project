import { useState, useEffect, useMemo } from 'react';
import { Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSettings } from '../../services/apiService';

interface BroadcastConfig {
    active: boolean;
    type: 'alert' | 'error' | 'info';
    message: string;
}

export default function BroadcastAlert() {
    const [dismissedId, setDismissedId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: fetchSettings,
        staleTime: 30000,
    });

    const config = useMemo<BroadcastConfig | null>(() => {
        if (!settings?.broadcast_config) return null;
        try {
            return typeof settings.broadcast_config === 'string'
                ? JSON.parse(settings.broadcast_config)
                : settings.broadcast_config;
        } catch (e) {
            console.warn("BroadcastAlert: Failed to parse broadcast_config", e);
            return null;
        }
    }, [settings?.broadcast_config]);

    useEffect(() => {
        // Listen for real-time updates from Admin Panel
        const handleUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        };

        window.addEventListener('broadcastChanged', handleUpdate);
        return () => window.removeEventListener('broadcastChanged', handleUpdate);
    }, [queryClient]);

    const currentId = config ? `${config.type}-${config.message}` : null;
    const isVisible = config?.active && dismissedId !== currentId;

    if (!config || !isVisible) return null;

    const getStyles = () => {
        switch(config.type) {
            case 'alert':
                return { bg: '#facc15', color: '#000', icon: <AlertTriangle /> };
            case 'error':
                return { bg: '#ef4444', color: '#fff', icon: <XCircle /> };
            default: // info
                return { bg: '#3b82f6', color: '#fff', icon: <Info /> };
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
                onClick={() => setDismissedId(currentId)}
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
                <X />
            </button>
        </div>
    );
}
