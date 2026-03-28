import { Star, AlertTriangle, CheckCircle, RefreshCcw, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GachaHeaderProps {
    canAccessDev: boolean;
    isDevMode: boolean;
    setIsDevMode: (val: boolean) => void;
    testForceResult: 'random' | 'win' | 'loss';
    setTestForceResult: (val: 'random' | 'win' | 'loss') => void;
    isRealConsumption: boolean;
    setIsRealConsumption: (val: boolean) => void;
    setKilluBalance: React.Dispatch<React.SetStateAction<number>>;
    devBarRef: React.RefObject<HTMLDivElement | null>;
    GACHA_TIERS: any[];
    selectedTier: any;
    setSelectedTier: (tier: any) => void;
    isOpening: boolean;
}

export const GachaHeader: React.FC<GachaHeaderProps> = ({
    canAccessDev,
    isDevMode,
    setIsDevMode,
    testForceResult,
    setTestForceResult,
    isRealConsumption,
    setIsRealConsumption,
    setKilluBalance,
    devBarRef,
    GACHA_TIERS,
    selectedTier,
    setSelectedTier,
    isOpening
}) => {
    const { t } = useTranslation();

    return (
        <header className="gacha-header">
            <span className="gacha-badge"><Star size={14} /> CRYSTAL SLOT</span>
            <h1>{t('gacha.hero_title')}</h1>
            <p>{t('gacha.hero_subtitle')}</p>
            {/* Admin Toggle */}
            {canAccessDev && (
                <div className="admin-toggle-wrapper">
                    <button 
                        className={`admin-mode-toggle ${isDevMode ? 'active' : ''}`}
                        onClick={() => setIsDevMode(!isDevMode)}
                    >
                        <AlertTriangle size={14} className="warn-icon" />
                        <span className="toggle-label">{isDevMode ? t('gacha.admin.disable') : t('gacha.admin.enable')}</span>
                    </button>
                </div>
            )}

            {/* Developer Test Bar */}
            {canAccessDev && isDevMode && (
                <div className="dev-test-bar glass-morphism" ref={devBarRef}>
                    <div className="dev-section result-mode">
                        <span className="dev-label">RESULTADO FORZADO:</span>
                        <div className="dev-btn-group">
                            {(['random', 'win', 'loss'] as const).map(mode => (
                                <button 
                                    key={mode}
                                    className={`dev-btn ${testForceResult === mode ? 'active' : ''} ${mode}`}
                                    onClick={() => setTestForceResult(mode)}
                                >
                                    {mode === 'win' && <CheckCircle size={12} />}
                                    {mode === 'loss' && <XCircle size={12} />}
                                    {mode === 'random' && <RefreshCcw size={12} />}
                                    <span>{mode.toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="dev-separator"></div>
                    <div className="dev-section consumption-mode">
                        <span className="dev-label">CONSUMO REAL:</span>
                        <button 
                            className={`dev-toggle-btn ${isRealConsumption ? 'active' : ''}`}
                            onClick={() => setIsRealConsumption(!isRealConsumption)}
                        >
                            <div className="toggle-track">
                                <div className="toggle-thumb"></div>
                            </div>
                            <span>{isRealConsumption ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>
                    <div className="dev-separator"></div>
                    <div className="dev-section quick-tiers">
                        <span className="dev-label">PROBAR MÁQUINA:</span>
                        <div className="dev-btn-group">
                            {GACHA_TIERS.map(tier => (
                                <button 
                                    key={tier.id}
                                    className={`dev-tier-btn ${selectedTier.id === tier.id ? 'active' : ''}`}
                                    onClick={() => {
                                        if (isOpening) return;
                                        setSelectedTier(tier);
                                        setKilluBalance(prev => prev + (tier.cost || 0));
                                    }}
                                    style={{ '--tier-color': tier.color } as React.CSSProperties}
                                >
                                    <div className="btn-stack">
                                        <span className="tier-name">{tier.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </header>
    );
};
