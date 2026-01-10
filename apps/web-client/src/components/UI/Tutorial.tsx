import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, Keyboard, User, Bell, Check, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Tutorial() {
    const { t, i18n } = useTranslation();
    const { user, loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // Only show if user is NOT logged in and NOT loading
        if (!loading && !user) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user, loading]);

    const handleClose = () => {
        setIsOpen(false);
        // We don't save to localStorage anymore as per request to show EVERY time for guests
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const handleRegister = () => {
        setIsOpen(false);
        navigate('/register');
    };

    const STEPS = [
        {
            title: t('tutorial.step1_title'),
            content: t('tutorial.step1_content'),
            icon: <img src="/images/ui/logo.png" alt="Logo" style={{ width: '80px', marginBottom: '1rem' }} />,
            action: t('tutorial.step1_action')
        },
        {
            title: t('tutorial.step2_title'),
            content: t('tutorial.step2_content'),
            icon: <Keyboard size={50} color="var(--accent)" />,
            action: t('tutorial.step2_action')
        },
        {
            title: t('tutorial.step3_title'),
            content: t('tutorial.step3_content'),
            icon: <User size={50} color="#3b82f6" />,
            action: t('tutorial.step3_action')
        },
        {
            title: t('tutorial.step4_title'),
            content: t('tutorial.step4_content'),
            icon: <Bell size={50} color="#facc15" />,
            action: t('tutorial.step4_action')
        },
        {
            title: t('tutorial.step5_title'),
            content: t('tutorial.step5_content'),
            icon: <Check size={50} color="#4ade80" />,
            action: t('tutorial.step5_action')
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
                        {/* Language Toggles */}
                        <div style={{
                            position: 'absolute',
                            top: '15px', left: '15px',
                            display: 'flex',
                            gap: '10px'
                        }}>
                            <button 
                                onClick={() => changeLanguage('es')}
                                style={{
                                    background: i18n.language === 'es' ? 'var(--accent)' : 'transparent',
                                    color: i18n.language === 'es' ? '#000' : '#666',
                                    border: '1px solid var(--accent)',
                                    borderRadius: '5px',
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                ES
                            </button>
                            <button 
                                onClick={() => changeLanguage('en')}
                                style={{
                                    background: i18n.language === 'en' ? 'var(--accent)' : 'transparent',
                                    color: i18n.language === 'en' ? '#000' : '#666',
                                    border: '1px solid var(--accent)',
                                    borderRadius: '5px',
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                EN
                            </button>
                        </div>

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
                            <X />
                        </button>

                        {/* Progress Dots */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem', marginTop: '1rem' }}>
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

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                {step > 0 && (
                                    <button 
                                        className="btn-secondary"
                                        onClick={prevStep}
                                        style={{
                                            padding: '0.8rem',
                                            fontSize: '0.95rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            color: '#fff',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            flex: 1,
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        <ArrowLeft size={10} /> {t('tutorial.back')}
                                    </button>
                                )}
                                
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
                                        padding: '0.8rem',
                                        fontSize: '0.95rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.8rem',
                                        flex: 2,
                                        borderRadius: '8px',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    {STEPS[step].action} <ArrowRight size={12} />
                                </button>
                            </div>

                             {/* Register Link Button (Always visible or just on last step? "botón que lleve a register" implying an alternative or final call to action) */}
                             {/* Only showing prominently on the last step or as a secondary option always? Let's put it on the last step as a strong CTA */}
                             
                             {step === STEPS.length - 1 && (
                                <button
                                    onClick={handleRegister}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--accent)',
                                        color: 'var(--accent)',
                                        padding: '0.8rem',
                                        borderRadius: 'var(--radius)',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        marginTop: '0.5rem'
                                    }}
                                >
                                    <UserPlus /> {t('navbar.register') || "Registrarse"}
                                </button>
                             )}
                        </div>

                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
