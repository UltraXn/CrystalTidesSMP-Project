import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaTimes, FaKeyboard, FaUser, FaBell, FaCheck } from 'react-icons/fa';

export default function Tutorial() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('crystaltides_tutorial_seen');
        if (!hasSeenTutorial) {
            // Delay slightly to let page load
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('crystaltides_tutorial_seen', 'true');
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
    };

    const STEPS = [
        {
            title: "¡Bienvenido a CrystalTides!",
            content: "Descubre la nueva experiencia web de tu servidor favorito. Hemos renovado todo para ti.",
            icon: <img src="/logo.png" alt="Logo" style={{ width: '80px', marginBottom: '1rem' }} />,
            action: "Comenzar Tour"
        },
        {
            title: "Navegación Rápida",
            content: "Usa nuestra nueva Paleta de Comandos presionando Ctrl + K (o Cmd + K) para ir a cualquier lugar al instante.",
            icon: <FaKeyboard size={50} color="var(--accent)" />,
            action: "Siguiente"
        },
        {
            title: "Tus Logros",
            content: "Visita tu perfil para ver tus estadísticas, skins y las medallas que has ganado jugando.",
            icon: <FaUser size={50} color="#3b82f6" />,
            action: "Siguiente"
        },
        {
            title: "Mantente Informado",
            content: "El nuevo Centro de Notificaciones te avisará de eventos, recompensas y noticias importantes.",
            icon: <FaBell size={50} color="#facc15" />,
            action: "Entendido"
        },
        {
            title: "¡Todo Listo!",
            content: "Explora la web, únete al servidor y diviértete. ¡Nos vemos en CrystalTides!",
            icon: <FaCheck size={50} color="#4ade80" />,
            action: "Finalizar"
        }
    ];

    if(!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)'
                }}>
                    <Motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background: '#1a1a2e',
                            border: '1px solid var(--accent)',
                            borderRadius: '20px',
                            width: '450px',
                            maxWidth: '90%',
                            padding: '2.5rem',
                            textAlign: 'center',
                            position: 'relative',
                            boxShadow: '0 0 50px rgba(0,255,255,0.2)'
                        }}
                    >
                        {/* Close Button */}
                        <button 
                            onClick={handleClose}
                            style={{
                                position: 'absolute',
                                top: '15px', right: '15px',
                                background: 'transparent',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            <FaTimes />
                        </button>

                        {/* Progress Dots */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
                            {STEPS.map((_, i) => (
                                <div 
                                    key={i}
                                    style={{
                                        width: '10px', height: '10px',
                                        borderRadius: '50%',
                                        background: i === step ? 'var(--accent)' : '#333',
                                        transition: 'background 0.3s'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Content */}
                        <AnimatePresence mode="wait">
                            <Motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div style={{ marginBottom: '1.5rem', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {STEPS[step].icon}
                                </div>
                                <h2 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.8rem' }}>
                                    {STEPS[step].title}
                                </h2>
                                <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '2.5rem', minHeight: '60px' }}>
                                    {STEPS[step].content}
                                </p>
                            </Motion.div>
                        </AnimatePresence>

                        {/* Action Button */}
                        <button 
                            className="btn-primary"
                            onClick={() => {
                                if (step < STEPS.length - 1) {
                                    nextStep();
                                } else {
                                    handleClose();
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.8rem'
                            }}
                        >
                            {STEPS[step].action} <FaArrowRight size={14} />
                        </button>

                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
