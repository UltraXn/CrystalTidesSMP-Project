import React from 'react';
import { useTranslation } from 'react-i18next';

interface GachaControlsProps {
    spinQuantity: number;
    setSpinQuantity: (val: number) => void;
    isOpening: boolean;
    selectedTier: any;
    killuBalance: number;
    rollGacha: () => void;
    formatCost: (num: number) => string;
}

export const GachaControls: React.FC<GachaControlsProps> = ({
    spinQuantity,
    setSpinQuantity,
    isOpening,
    selectedTier,
    killuBalance,
    rollGacha,
    formatCost
}) => {
    const { t } = useTranslation();
    return (
        <div className="slot-controls">
            <div className="control-panel">
                <div className="panel-screen cost-screen">
                    <span className="screen-label">{t('gacha.cost')}</span>
                    <span className="screen-value">{formatCost(selectedTier.cost * spinQuantity)} KC</span>
                </div>

                <div className="panel-screen quantity-screen">
                    <span className="screen-label">{t('gacha.quantity')}</span>
                    <div className="quantity-controls">
                        <button 
                            className="qty-btn" 
                            onClick={() => setSpinQuantity(Math.max(1, spinQuantity - 1))}
                            disabled={isOpening}
                        >-</button>
                        <input 
                            type="number" 
                            className="qty-input"
                            value={spinQuantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) setSpinQuantity(Math.min(100, Math.max(1, val)));
                            }}
                            disabled={isOpening}
                        />
                        <button 
                            className="qty-btn" 
                            onClick={() => setSpinQuantity(Math.min(100, spinQuantity + 1))}
                            disabled={isOpening}
                        >+</button>
                    </div>
                </div>

                <div className="panel-screen balance-screen">
                    <span className="screen-label">{t('gacha.balance')}</span>
                    <span className="screen-value">{formatCost(killuBalance)} KC</span>
                </div>
                
                <button 
                    className={`spin-btn ${isOpening ? 'disabled' : ''}`} 
                    onClick={rollGacha}
                    disabled={isOpening}
                >
                    {isOpening ? (
                        <span className="loading-dots">{t('gacha.spinning')}</span>
                    ) : (
                        <>{t('gacha.spin')}</>
                    )}
                </button>
            </div>
        </div>
    );
};
