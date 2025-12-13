import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'

export default function SuccessModal({ isOpen, onClose, title, message, buttonText = "Aceptar", onAction }) {
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
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{
                        background: 'linear-gradient(145deg, #1a1a20, #0d0d10)',
                        padding: '2.5rem',
                        borderRadius: '20px',
                        maxWidth: '450px',
                        width: '90%',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(109, 165, 192, 0.1)'
                    }}
                >
                    <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'inline-block' }}>
                        <img
                            src="/images/ui/logo.webp"
                            alt="CrystalTides"
                            style={{ width: '80px', height: 'auto', filter: 'drop-shadow(0 0 10px rgba(109, 165, 192, 0.5))' }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '-5px',
                            right: '-5px',
                            background: '#0F969C',
                            borderRadius: '50%',
                            padding: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}>
                            <FaCheckCircle color="white" size={16} />
                        </div>
                    </div>

                    <h2 style={{
                        fontSize: '1.8rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(to right, #fff, #6DA5C0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800'
                    }}>
                        {title}
                    </h2>

                    <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '2rem', fontSize: '1.05rem' }}>
                        {message}
                    </p>

                    <button
                        onClick={onAction || onClose}
                        className="btn-submit"
                        style={{ margin: 0 }}
                    >
                        {buttonText}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
