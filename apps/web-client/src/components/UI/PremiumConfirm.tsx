import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PremiumConfirmProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export default function PremiumConfirm({
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    variant = 'danger'
}: PremiumConfirmProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const colors = {
        danger: {
            primary: '#ef4444',
            glow: 'rgba(239, 68, 68, 0.2)',
            text: '#fff'
        },
        warning: {
            primary: '#facc15',
            glow: 'rgba(250, 204, 21, 0.2)',
            text: '#000'
        },
        info: {
            primary: '#3b82f6',
            glow: 'rgba(59, 130, 246, 0.2)',
            text: '#fff'
        }
    };

    const currentTheme = colors[variant];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" style={{ zIndex: 1000000, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.8)' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="admin-card"
                        style={{ 
                            width: '420px', 
                            maxWidth: '90%', 
                            textAlign: 'center', 
                            padding: '2.5rem', 
                            background: '#0a0a0a',
                            border: `1px solid ${currentTheme.primary}40`, 
                            boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${currentTheme.glow}`,
                            borderRadius: '28px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background Decoration */}
                        <div style={{ 
                            position: 'absolute', 
                            top: '-50px', 
                            left: '-50px', 
                            width: '150px', 
                            height: '150px', 
                            background: currentTheme.glow, 
                            filter: 'blur(50px)', 
                            borderRadius: '50%',
                            zIndex: 0
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ 
                                marginBottom: '1.5rem', 
                                display: 'flex', 
                                justifyContent: 'center' 
                            }}>
                                <div style={{
                                    padding: '1.2rem',
                                    borderRadius: '20px',
                                    background: `${currentTheme.primary}15`,
                                    border: `1px solid ${currentTheme.primary}30`
                                }}>
                                    <AlertTriangle size={40} color={currentTheme.primary} />
                                </div>
                            </div>

                            <h3 style={{ 
                                marginBottom: '1rem', 
                                color: '#fff', 
                                fontSize: '1.6rem', 
                                fontWeight: 900,
                                letterSpacing: '-0.5px'
                            }}>
                                {title || t('admin.alerts.confirm_title', 'Confirmar Acción')}
                            </h3>

                            <p style={{ 
                                color: 'rgba(255,255,255,0.6)', 
                                marginBottom: '2.5rem', 
                                lineHeight: '1.6',
                                fontSize: '1rem' 
                            }}>
                                {message}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={onCancel} 
                                    className="hover-lift"
                                    style={{ 
                                        flex: 1, 
                                        justifyContent: 'center',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        color: '#aaa',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {cancelLabel || t('common.cancel', 'Cancelar')}
                                </button>
                                <button 
                                    onClick={onConfirm} 
                                    className="hover-lift" 
                                    style={{ 
                                        flex: 1, 
                                        justifyContent: 'center', 
                                        padding: '1rem',
                                        background: currentTheme.primary, 
                                        color: currentTheme.text, 
                                        borderRadius: '16px',
                                        border: 'none',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        boxShadow: `0 8px 20px ${currentTheme.primary}40`
                                    }}
                                >
                                    {confirmLabel || t('common.confirm', 'Confirmar')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
