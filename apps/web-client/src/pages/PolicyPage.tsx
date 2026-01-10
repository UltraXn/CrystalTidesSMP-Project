import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Section from '../components/Layout/Section';
import Loader from '../components/UI/Loader';
import { getPolicy, Policy } from '../services/policyService';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Shield, FileText, Clock, Headset, ArrowLeft } from 'lucide-react';

export default function PolicyPage() {
    const { slug } = useParams<{ slug: string }>();
    const { t, i18n } = useTranslation();
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                if (!slug) return;
                setLoading(true);
                const data = await getPolicy(slug);
                setPolicy(data);
                setError(false);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [slug]);

    if (loading) return (
        <Section>
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader />
            </div>
        </Section>
    );

    if (error || !policy) return (
        <Section>
            <div style={{ minHeight: '60vh', textAlign: 'center', padding: '5rem' }}>
                <Shield size={64} color="var(--accent-dim)" style={{ opacity: 0.3, marginBottom: '2rem' }} />
                <h2>{t('policies.not_found', 'Política no encontrada')}</h2>
                <p style={{ color: 'var(--muted)' }}>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
                <Link to="/" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} /> {t('common.back_home', 'Volver al Inicio')}
                </Link>
            </div>
        </Section>
    );

    const Icon = policy.slug === 'privacy' ? Shield : FileText;

    const displayTitle = (i18n.language === 'en' && policy.title_en) ? policy.title_en : policy.title;
    const displayContent = (i18n.language === 'en' && policy.content_en) ? policy.content_en : policy.content;

    return (
        <Section className="policy-page">
            <Link 
                to="/" 
                className="hover-lift"
                style={{
                    position: 'fixed',
                    top: '2rem',
                    left: '2rem',
                    zIndex: 100,
                    background: 'rgba(10, 10, 15, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    padding: '0.8rem 1.2rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
            >
                <ArrowLeft size={18} /> {t('common.back', 'Volver')}
            </Link>

            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `radial-gradient(circle at 15% 50%, rgba(var(--accent-rgb), 0.08) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(88, 28, 135, 0.1) 0%, transparent 25%)`,
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="policy-container custom-scrollbar" style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
                
                <header style={{ 
                    textAlign: 'center', 
                    padding: '4rem 1rem', 
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
                    borderRadius: '32px',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255,255,255,0.02)'
                }}>
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.2), rgba(88, 28, 135, 0.2))', 
                        borderRadius: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Icon size={32} />
                    </div>
                    
                    <h1 style={{ 
                        fontSize: '3.5rem', 
                        fontWeight: 300, 
                        letterSpacing: '-1px', 
                        marginBottom: '1rem',
                        textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        background: 'linear-gradient(to right, #fff, #aaa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        paddingBottom: '0.2em' /* Fix clipping */
                    }}>
                        {displayTitle}
                    </h1>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                        <button 
                            onClick={() => i18n.changeLanguage('es')}
                            style={{
                                background: i18n.language === 'es' ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                                color: i18n.language === 'es' ? '#000' : '#fff',
                                border: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                opacity: i18n.language === 'es' ? 1 : 0.6
                            }}
                        >
                            ES
                        </button>
                        <button 
                            onClick={() => i18n.changeLanguage('en')}
                            style={{
                                background: i18n.language === 'en' ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                                color: i18n.language === 'en' ? '#000' : '#fff',
                                border: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                opacity: i18n.language === 'en' ? 1 : 0.6
                            }}
                        >
                            EN
                        </button>
                    </div>

                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        background: 'rgba(0,0,0,0.3)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '50px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: '#aaa',
                        fontSize: '0.9rem'
                    }}>
                        <Clock size={12} color="var(--accent)" />
                        <span style={{ fontWeight: 500, letterSpacing: '0.5px' }}>
                            {t('policies.last_update', 'Última actualización')}: <span style={{ color: '#fff' }}>{new Date(policy.updated_at).toLocaleDateString()}</span>
                        </span>
                    </div>
                </header>

                <div className="policy-content" style={{ 
                    position: 'relative',
                    background: 'rgba(10, 10, 15, 0.6)', 
                    backdropFilter: 'blur(20px)',
                    padding: '4rem', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    lineHeight: '1.8',
                    fontSize: '1.15rem',
                    color: '#e0e0e0'
                }}>
                    {/* Decorative elements */}
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.5), transparent)' }}></div>

                    <ReactMarkdown components={{
                        h1: ({ ...props }) => <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1.5rem', marginTop: '3rem' }} {...props} />,
                        h2: ({ ...props }) => <h2 style={{ color: '#fff', fontSize: '1.8rem', marginTop: '3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }} {...props} />,
                        h3: ({ ...props }) => <h3 style={{ color: 'var(--accent)', fontSize: '1.4rem', marginTop: '2rem', marginBottom: '1.5rem' }} {...props} />,
                        p: ({ ...props }) => <p style={{ marginBottom: '1.5rem', color: '#ccc', lineHeight: '1.8' }} {...props} />,
                        ul: ({ ...props }) => <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }} {...props} />,
                        li: ({ ...props }) => <li style={{ marginBottom: '0.8rem', paddingLeft: '0.5rem' }} {...props} />,
                        strong: ({ ...props }) => <strong style={{ color: '#fff', fontWeight: 700 }} {...props} />,
                        a: ({ ...props }) => <a style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px solid rgba(var(--accent-rgb), 0.3)', transition: 'all 0.2s' }} {...props} />,
                        blockquote: ({ ...props }) => <blockquote style={{ borderLeft: '4px solid var(--accent)', paddingLeft: '1.5rem', color: '#aaa', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0 12px 12px 0', margin: '2rem 0' }} {...props} />
                    }}>
                        {displayContent}
                    </ReactMarkdown>
                </div>

                <div style={{ marginTop: '4rem', textAlign: 'center', color: '#666', fontSize: '0.85rem', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem 3rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>{t('policies.contact_support_msg', '¿Tienes dudas sobre nuestras políticas?')}</span>
                         <Link 
                            to="/support" 
                            className="hover-lift"
                            style={{ 
                                background: 'linear-gradient(135deg, var(--accent), #2563eb)',
                                color: '#fff', 
                                padding: '0.8rem 1.5rem', 
                                borderRadius: '12px', 
                                textDecoration: 'none', 
                                fontWeight: '700', 
                                fontSize: '0.95rem',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)'
                            }}
                        >
                            <Headset size={18} /> {t('policies.contact_support_btn', 'Contactar Soporte')}
                        </Link>
                    </div>
                    <p style={{ margin: '1rem 0 0', opacity: 0.5 }}>© {new Date().getFullYear()} CrystalTides SMP.</p>
                </div>
            </div>
            <style>{`
                .policy-content li::marker { color: var(--accent); }
                .policy-content a:hover { border-bottom-color: var(--accent); color: #fff; }
                @media (max-width: 768px) {
                    .policy-content { padding: 2rem !important; font-size: 1rem !important; }
                    header h1 { font-size: 2.5rem !important; }
                }
            `}</style>
        </Section>
    );
}
