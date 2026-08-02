import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { GachaTier } from './types';

interface GachaControlsProps {
    isOpening: boolean;
    selectedTier: GachaTier;
    killuBalance: number;
    rollGacha: (qty: number) => void;
    formatCost: (num: number) => string;
    hasFreeRoll?: boolean;
}

export const GachaControls: React.FC<GachaControlsProps> = ({
    isOpening,
    selectedTier,
    killuBalance,
    rollGacha,
    formatCost,
    hasFreeRoll = false,
}) => {
    const { t } = useTranslation();

    const cost1 = hasFreeRoll ? 0 : selectedTier.cost;
    const cost10 = hasFreeRoll ? selectedTier.cost * 9 : selectedTier.cost * 10;

    const canAfford1 = killuBalance >= cost1 || selectedTier.id === 'ultra';
    const canAfford10 = killuBalance >= cost10 || selectedTier.id === 'ultra';

    return (
        <div className={`slot-controls tier-${selectedTier.id}`} id="gacha_controls">
            {/* KilluCoins Available Balance Badge */}
            <div className="gacha-balance-pill border border-amber-500/30 bg-amber-500/10 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center justify-between gap-3 mb-4 w-full shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-xs tracking-wider">
                    <img src="/images/killucoin.png" alt="KC" className="w-5 h-5 object-contain [image-rendering:pixelated] animate-pulse" />
                    <span>{t('gacha.balance_label', 'Saldo Disponible')}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-extrabold text-amber-300 text-sm">
                    <span>{killuBalance.toLocaleString()}</span>
                    <span className="text-[10px] text-amber-400/80 font-black">KC</span>
                    <Sparkles size={12} className="text-amber-400" />
                </div>
            </div>

            <div className="flex gap-3 w-full">
                <button type="button"
                    id="gacha_spin1"
                    className={`spin-btn flex-1 ${isOpening || !canAfford1 ? 'disabled' : ''}`}
                    onClick={() => rollGacha(1)}
                    disabled={isOpening || !canAfford1}
                >
                    <span id="gacha_spin1_txt">
                        {isOpening ? t('gacha.spinning') : `${t('gacha.spin')} x1 (${formatCost(cost1)} KC)`}
                    </span>
                </button>
                <button type="button"
                    id="gacha_spin10"
                    className={`spin-btn spin-btn-10 flex-1 ${isOpening || !canAfford10 ? 'disabled' : ''}`}
                    onClick={() => rollGacha(10)}
                    disabled={isOpening || !canAfford10}
                >
                    <span id="gacha_spin10_txt">
                        {isOpening ? t('gacha.spinning') : `${t('gacha.spin')} x10 (${formatCost(cost10)} KC)`}
                    </span>
                </button>
            </div>
        </div>
    );
};
