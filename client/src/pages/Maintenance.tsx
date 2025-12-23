// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { FaTools, FaDiscord } from 'react-icons/fa'
import { Link } from 'react-router-dom' // For admin login link if needed

export default function Maintenance() {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            color: 'var(--text)',
            textAlign: 'center',
            padding: '2rem',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background Effects */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(12, 112, 117, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    style={{ fontSize: '5rem', color: 'var(--accent)', marginBottom: '1rem' }}
                >
                    <FaTools />
                </motion.div>
                
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    En Mantenimiento
                </h1>
                
                <p style={{ fontSize: '1.2rem', color: 'var(--muted)', maxWidth: '600px', marginBottom: '2rem' }}>
                    Estamos realizando mejoras importantes en el sitio. 
                    Volveremos a estar en línea muy pronto. ¡Gracias por tu paciencia!
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <a href="https://discord.com/invite/TDmwYNnvyT" target="_blank" rel="noopener noreferrer" 
                       style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           gap: '0.5rem', 
                           background: '#5865F2', 
                           color: 'white', 
                           padding: '0.8rem 1.5rem', 
                           borderRadius: '8px', 
                           textDecoration: 'none',
                           fontWeight: 'bold'
                       }}
                    >
                        <FaDiscord /> Únete a Discord
                    </a>
                </div>
                
                <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#555' }}>
                    ¿Eres administrador? <Link to="/login" style={{ color: 'var(--accent)' }}>Iniciar Sesión</Link>
                </div>
            </motion.div>
        </div>
    )
}
