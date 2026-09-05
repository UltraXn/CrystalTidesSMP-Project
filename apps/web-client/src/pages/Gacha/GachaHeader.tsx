import { AlertTriangle, CheckCircle, RefreshCcw, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GachaTier } from './types';

interface GachaHeaderProps {
    canAccessDev: boolean;
    isDevMode: boolean;
    setIsDevMode: (val: boolean) => void;
    testForceResult: 'random' | 'win' | 'loss';
    setTestForceResult: (val: 'random' | 'win' | 'loss') => void;
    forceDeduction: boolean;
    setForceDeduction: (val: boolean) => void;
    addFunds: (amount: number) => void;
    devBarRef: React.RefObject<HTMLDivElement | null>;
    GACHA_TIERS: GachaTier[];
    selectedTier: GachaTier;
    setSelectedTier: (tier: GachaTier) => void;
    isOpening: boolean;
}

export const GachaHeader: React.FC<GachaHeaderProps> = ({
    canAccessDev,
    isDevMode,
    setIsDevMode,
    testForceResult,
    setTestForceResult,
    forceDeduction,
    setForceDeduction,
    addFunds,
    devBarRef,
    GACHA_TIERS,
    selectedTier,
    setSelectedTier,
    isOpening,
}) => {
    const { t } = useTranslation();

    return (
        <header className="gacha-header" id="gacha_header">
            <h1 id="gacha_title">{t('gacha.hero_title')}</h1>
            <p id="gacha_sub">{t('gacha.hero_subtitle')}</p>
            {canAccessDev && (
                <div className="admin-toggle-wrapper">
                    <button type="button"
                        aria-pressed={isDevMode}
                        aria-label={isDevMode ? t('gacha.admin.disable') : t('gacha.admin.enable')}
                        className={`admin-mode-toggle ${isDevMode ? 'active' : ''}`}
                        onClick={() => setIsDevMode(!isDevMode)}
                    >
                        <AlertTriangle size={14} aria-hidden="true" className="warn-icon" />
                        <span className="toggle-label">{isDevMode ? t('gacha.admin.disable') : t('gacha.admin.enable')}</span>
                    </button>
                </div>
            )}

            {canAccessDev && isDevMode && (
                <div className="dev-test-bar glass-morphism" ref={devBarRef}>
                    <div className="dev-section result-mode">
                        <span className="dev-label">RESULTADO FORZADO:</span>
                        <div className="dev-btn-group">
                            {(['random', 'win', 'loss'] as const).map((mode) => (
                                <button aria-label={`Modo forzado: ${mode}`} aria-pressed={testForceResult === mode} type="button"
                                    key={mode}
                                    className={`dev-btn ${testForceResult === mode ? 'active' : ''} ${mode}`}
                                    onClick={() => setTestForceResult(mode)}
                                >
                                    {mode === 'win' && <CheckCircle size={12} aria-hidden="true" />}
                                    {mode === 'loss' && <XCircle size={12} aria-hidden="true" />}
                                    {mode === 'random' && <RefreshCcw size={12} aria-hidden="true" />}
                                    <span>{mode.toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="dev-separator"></div>
                    <div className="dev-section consumption-mode">
                        <span className="dev-label">CONSUMO REAL:</span>
                        <button aria-label="Alternar consumo real de saldo" aria-pressed={forceDeduction} type="button"
                            className={`dev-toggle-btn ${forceDeduction ? 'active' : ''}`}
                            onClick={() => setForceDeduction(!forceDeduction)}
                        >
                            <div className="toggle-track">
                                <div className="toggle-thumb"></div>
                            </div>
                            <span>{forceDeduction ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>
                    <div className="dev-separator"></div>
                    <div className="dev-section add-coins">
                        <span className="dev-label">INYECTAR SALDO:</span>
                        <div className="dev-btn-group">
                            <button type="button"
                                className="dev-btn add-btn"
                                onClick={() => addFunds(500000)}
                            >
                                <span className="tabular-nums">+500k KC</span>
                            </button>
                            <button type="button"
                                className="dev-btn add-btn"
                                onClick={() => addFunds(5000000)}
                            >
                                <span className="tabular-nums">+5M KC</span>
                            </button>
                        </div>
                    </div>
                    <div className="dev-separator"></div>
                    <div className="dev-section quick-tiers">
                        <span className="dev-label">PROBAR MÁQUINA:</span>
                        <div className="dev-btn-group">
                            {GACHA_TIERS.map((tier) => (
                                <button aria-label={`Seleccionar máquina ${tier.name}`} aria-pressed={selectedTier.id === tier.id} type="button"
                                    key={tier.id}
                                    className={`dev-tier-btn ${selectedTier.id === tier.id ? 'active' : ''}`}
                                    onClick={() => {
                                        if (isOpening) return;
                                        setSelectedTier(tier);
                                        addFunds(tier.cost || 5000000);
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
