import React from 'react';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface GachaUnauthorizedProps {
    userRole: string;
}

export const GachaUnauthorized: React.FC<GachaUnauthorizedProps> = ({ userRole }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="gacha-unauthorized-container">
            <div className="gacha-background-cosmic">
                <div className="cosmic-sphere sphere-1"></div>
                <div className="cosmic-sphere sphere-2"></div>
                <div className="cosmic-sphere sphere-tertiary"></div>
                <div className="cosmic-sphere sphere-accent"></div>
                <div className="cosmic-noise"></div>
            </div>
            
            <div className="unauthorized-card-premium">
                <div className="security-tag">
                    <span className="scan-line"></span>
                    <span className="status-label">{t('gacha.unauthorized.status')}</span>
                    SYSTEM CLEARANCE REQUIRED
                </div>
                
                <div className="lock-section-premium">
                    <div className="lock-halo"></div>
                    <div className="lock-glow-premium"></div>
                    <Lock size={64} className="lock-icon-premium" />
                </div>
                
                <h1 className="cinematic-title">{t('gacha.unauthorized.title')}</h1>
                
                <p className="cinematic-desc">
                    {t('gacha.unauthorized.desc')}
                </p>
                
                <div className="status-badge-premium">
                     <div className="status-dot"></div>
                     CURRENT STATUS: <span className="role-text">{userRole || 'Guest'}</span>
                </div>
                
                <button className="unauthorized-btn-premium" onClick={() => navigate('/')}>
                    <span className="btn-shine"></span>
                    {t('gacha.unauthorized.back')}
                </button>
            </div>
        </div>
    );
};
