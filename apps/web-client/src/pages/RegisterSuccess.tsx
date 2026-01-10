import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RegisterSuccess() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)',
            padding: '2rem'
        }}>
            <div className="admin-card" style={{ 
                maxWidth: '500px', 
                textAlign: 'center', 
                padding: '3rem',
                border: '1px solid var(--accent)',
                boxShadow: '0 0 30px rgba(0,255,255,0.1)'
            }}>
                <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: 'rgba(0,255,255,0.1)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <Send size={35} color="var(--accent)" />
                </div>

                <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>{t('register.success_title', '¡Registro Exitoso!')}</h1>
                
                <p style={{ color: '#ccc', marginBottom: '2rem', lineHeight: '1.6' }}>
                    {t('register.success_msg', 'Tu cuenta ha sido creada. Por favor, revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate('/login')}
                        style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                    >
                        {t('register.go_to_login', 'Ir a Iniciar Sesión')}
                    </button>
                    
                    <button 
                        className="btn-secondary" 
                        onClick={() => navigate('/')}
                        style={{ width: '100%', justifyContent: 'center', padding: '1rem', background: 'transparent', border: '1px solid #333' }}
                    >
                        {t('register.back_home', 'Volver al Inicio')}
                    </button>
                </div>
            </div>
        </div>
    );
}
