import React, { useState, useRef, useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

import { useTranslation } from 'react-i18next'; // Added import

export default function NotificationCenter() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'success': return <CheckCircle2 style={{ color: '#4CAF50' }} />;
            case 'warning': return <AlertTriangle style={{ color: '#FFC107' }} />;
            default: return <Info style={{ color: '#2196F3' }} />;
        }
    };

    return (
        <div className="notification-center" ref={containerRef} style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t('admin.notifications.label', 'Notificaciones')}
                style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'white', 
                    fontSize: '1.2rem', 
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0.5rem',
                    transition: 'transform 0.2s'
                }}
                className={isOpen ? 'active' : ''}
            >
                <Bell />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'var(--accent)',
                        color: 'black',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: '-50px', // Align roughly with right edge
                            width: '320px',
                            background: '#1a1a1a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            zIndex: 1000,
                            marginTop: '10px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header */}
                        <div style={{ 
                            padding: '1rem', 
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.2)'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>{t('admin.notifications.title', 'Notificaciones')}</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllRead}
                                    style={{ 
                                        background: 'transparent', 
                                        border: 'none', 
                                        color: 'var(--accent)', 
                                        fontSize: '0.8rem', 
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    {t('admin.notifications.mark_all_read', 'Marcar leídas')}
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                                    {t('admin.notifications.empty', 'No tienes notificaciones.')}
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <motion.div
                                        key={n.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            background: n.read ? 'transparent' : 'rgba(var(--accent-rgb), 0.05)',
                                            position: 'relative',
                                            display: 'flex',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.2rem', marginTop: '3px' }}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between' }}>
                                                {n.title}
                                                <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'normal' }}>{n.time}</span>
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', lineHeight: '1.4' }}>{n.message}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => deleteNotification(n.id, e)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#666',
                                                cursor: 'pointer',
                                                padding: '2px',
                                                alignSelf: 'flex-start'
                                            }}
                                            title={t('admin.notifications.dismiss', 'Descartar')}
                                        >
                                            <X />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
