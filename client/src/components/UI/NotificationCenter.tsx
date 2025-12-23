import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, type: 'info', title: 'Bienvenido', message: 'Gracias por unirte a CrystalTides.', time: 'Hace 2m', read: false },
        { id: 2, type: 'success', title: 'Recompensa', message: 'Has recibido tu kit de inicio.', time: 'Hace 1h', read: true },
        { id: 3, type: 'warning', title: 'Mantenimiento', message: 'El servidor reiniciará a las 04:00 AM.', time: 'Hace 5h', read: true },
    ]);
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
            case 'success': return <FaCheckCircle style={{ color: '#4CAF50' }} />;
            case 'warning': return <FaExclamationTriangle style={{ color: '#FFC107' }} />;
            default: return <FaInfoCircle style={{ color: '#2196F3' }} />;
        }
    };

    return (
        <div className="notification-center" ref={containerRef} style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
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
                <FaBell />
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
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Notificaciones</h3>
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
                                    Marcar leídas
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                                    No tienes notificaciones.
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
                                            title="Descartar"
                                        >
                                            <FaTimes />
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
