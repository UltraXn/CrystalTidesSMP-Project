import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PremiumAlertProps {
    isOpen: boolean;
    title?: string;
    message: string;
    onClose: () => void;
    variant?: 'error' | 'success' | 'warning' | 'info';
}

export default function PremiumAlert({
    isOpen,
    title,
    message,
    onClose,
    variant = 'info'
}: PremiumAlertProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const themes = {
        error: {
            primary: '#ef4444',
            glow: 'rgba(239, 68, 68, 0.2)',
            icon: AlertCircle,
            defaultTitle: t('admin.alerts.error_title', 'Error')
        },
        success: {
            primary: '#10b981',
            glow: 'rgba(16, 185, 129, 0.2)',
            icon: CheckCircle2,
            defaultTitle: t('admin.alerts.success_title', 'Éxito')
        },
        warning: {
            primary: '#facc15',
            glow: 'rgba(250, 204, 21, 0.2)',
            icon: AlertTriangle,
            defaultTitle: t('admin.alerts.warning_title', 'Atención')
        },
        info: {
            primary: '#3b82f6',
            glow: 'rgba(59, 130, 246, 0.2)',
            icon: Info,
            defaultTitle: t('admin.alerts.info_title', 'Información')
        }
    };

    const currentTheme = themes[variant];
    const Icon = currentTheme.icon;

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
                        {/* Close button X */}
                        <button 
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.3)',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                            className="hover-scale"
                        >
                            <X size={18} />
                        </button>

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
                                    <Icon size={40} color={currentTheme.primary} />
                                </div>
                            </div>

                            <h3 style={{ 
                                marginBottom: '1rem', 
                                color: '#fff', 
                                fontSize: '1.6rem', 
                                fontWeight: 900,
                                letterSpacing: '-0.5px'
                            }}>
                                {title || currentTheme.defaultTitle}
                            </h3>

                            <p style={{ 
                                color: 'rgba(255,255,255,0.6)', 
                                marginBottom: '2.5rem', 
                                lineHeight: '1.6',
                                fontSize: '1rem' 
                            }}>
                                {message}
                            </p>

                            <button 
                                onClick={onClose} 
                                className="hover-lift" 
                                style={{ 
                                    width: '100%', 
                                    justifyContent: 'center', 
                                    padding: '1rem',
                                    background: currentTheme.primary, 
                                    color: variant === 'warning' ? '#000' : '#fff', 
                                    borderRadius: '16px',
                                    border: 'none',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    boxShadow: `0 8px 20px ${currentTheme.glow}`
                                }}
                            >
                                {t('admin.alerts.accept', 'Aceptar')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
