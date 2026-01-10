import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'info', isVisible, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 size={20} />;
            case 'error': return <AlertCircle size={20} />;
            default: return <Info size={20} />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return { bg: 'rgba(16, 185, 129, 0.9)', border: '#10B981', text: '#fff' };
            case 'error': return { bg: 'rgba(239, 68, 68, 0.9)', border: '#EF4444', text: '#fff' };
            default: return { bg: 'rgba(59, 130, 246, 0.9)', border: '#3B82F6', text: '#fff' };
        }
    };

    const colors = getColors();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    transition={{ duration: 0.3, type: 'spring' }}
                    style={{
                        position: 'fixed',
                        top: '100px', // Below navbar
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10000,
                        background: '#1a1a2e', 
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 4px 20px -2px ${colors.bg}`,
                        borderRadius: '12px',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: '300px',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <div style={{ color: colors.border }}>
                        {getIcon()}
                    </div>
                    <p style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 500, flex: 1 }}>
                        {message}
                    </p>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#aaa',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
