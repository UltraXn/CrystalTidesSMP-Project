 
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export default function ConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirmar", 
    cancelText = "Cancelar", 
    isDanger = false,
    isLoading = false
}: ConfirmationModalProps & { isLoading?: boolean }) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}
                onClick={isLoading ? undefined : onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{
                        background: 'linear-gradient(145deg, #1a1a20, #0d0d10)',
                        padding: '2rem',
                        borderRadius: '20px',
                        maxWidth: '450px',
                        width: '90%',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(109, 165, 192, 0.1)'
                    }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        background: isDanger ? 'rgba(231, 76, 60, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        opacity: isLoading ? 0.5 : 1
                    }}>
                        {isLoading ? (
                            <div className="spinner-border" style={{ width: '30px', height: '30px', border: `3px solid ${isDanger ? '#e74c3c' : '#f1c40f'}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <AlertTriangle size={30} color={isDanger ? '#e74c3c' : '#f1c40f'} />
                        )}
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        marginBottom: '1rem',
                        color: '#fff',
                        fontWeight: '700'
                    }}>
                        {title}
                    </h2>

                    <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '2rem', fontSize: '1rem' }}>
                        {message}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            style={{
                                background: 'transparent',
                                border: '1px solid #444',
                                color: isLoading ? '#666' : '#ccc',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '8px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => !isLoading && (e.currentTarget.style.borderColor = '#666')}
                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => !isLoading && (e.currentTarget.style.borderColor = '#444')}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            style={{
                                background: isDanger ? '#e74c3c' : 'var(--accent)',
                                border: 'none',
                                color: '#fff',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '8px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                opacity: isLoading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isLoading ? 'Procesando...' : confirmText}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
