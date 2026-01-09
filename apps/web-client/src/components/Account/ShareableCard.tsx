import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import { FaDownload, FaTimes } from 'react-icons/fa';


interface ShareableCardProps {
    achievement: {
        title: string;
        description: string;
        icon: React.ReactNode;
        image_url?: string; // Add this
        color?: string; // Add this too for potential dynamic coloring
        unlocked: boolean;
    };
    username: string;
    onClose: () => void;
}

const ShareableCard: React.FC<ShareableCardProps> = ({ achievement, username, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);
    const { t } = useTranslation();

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                backgroundColor: '#0a0a0a', // Dark theme bg
                scale: 2 // High res
            });
            const link = document.createElement('a');
            link.download = `crystaltides-achievement-${username}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to generate image", err);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ position: 'relative', width: '90%', maxWidth: '600px' }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    <FaTimes />
                </button>

                {/* The Exportable Area */}
                <div ref={cardRef} style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', gap: '2rem',
                    fontFamily: 'sans-serif'
                }}>
                    {/* Left: Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <img 
                            src={`https://mc-heads.net/body/${username}/right`} 
                            alt={username} 
                            style={{ height: '180px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}
                        />
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>{username}</span>
                    </div>

                    {/* Right: Achievement Content */}
                    <div style={{ flex: 1 }}>
                        <h4 style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('account.achievement_unlocked', 'LOGRO DESBLOQUEADO')}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                             <div style={{ 
                                fontSize: '3rem', 
                                background: 'rgba(255,255,255,0.05)', 
                                padding: '15px', 
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.1)',
                                width: '80px',
                                height: '80px',
                                flexShrink: 0
                             }}>
                                {achievement.image_url ? (
                                    <img 
                                        src={achievement.image_url} 
                                        alt={achievement.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                                    />
                                ) : (
                                    achievement.icon
                                )}
                             </div>
                             <div>
                                 <h2 style={{ color: '#fff', margin: 0, fontSize: '2rem', fontWeight: 800 }}>{achievement.title}</h2>
                             </div>
                        </div>
                        <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.5' }}>{achievement.description}</p>
                        
                        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src="/images/ui/logo.png" alt="CrystalTides" style={{ height: '24px', opacity: 0.8 }} /> 
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>mc.crystaltidesSMP.net</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: '2rem', display: 'flex', justifySelf: 'center', justifyContent: 'center' }}>
                    <button 
                        onClick={handleDownload}
                        disabled={generating}
                        className="btn-primary"
                        style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}
                    >
                        {generating ? t('common.generating', 'Generando...') : <><FaDownload /> {t('account.download_image', 'Descargar Imagen')}</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareableCard;
