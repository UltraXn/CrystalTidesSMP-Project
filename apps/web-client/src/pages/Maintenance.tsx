import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
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
                    <Wrench size={80} />
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
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> Únete a Discord
                    </a>
                </div>
                
                <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#555' }}>
                    ¿Eres administrador? <Link to="/login" style={{ color: 'var(--accent)' }}>Iniciar Sesión</Link>
                </div>
            </motion.div>
        </div>
    )
}
