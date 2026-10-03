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

export const GachaControls: React.FC<Readonly<GachaControlsProps>> = ({
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
      <output
        aria-live="polite"
        className="gacha-balance-pill mb-4 block flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 shadow-lg backdrop-blur-md"
      >
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
          <img
            src="/images/killucoin.png"
            alt=""
            aria-hidden="true"
            className="h-5 w-5 animate-pulse object-contain [image-rendering:pixelated]"
          />
          <span>{t('gacha.balance_label', 'Saldo Disponible')}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-sm font-extrabold tabular-nums text-amber-300">
          <span>{killuBalance.toLocaleString()}</span>
          <span className="text-[10px] font-black text-amber-400/80">KC</span>
          <Sparkles size={12} aria-hidden="true" className="text-amber-400" />
        </div>
      </output>

      <div className="flex w-full gap-3">
        <button
          type="button"
          id="gacha_spin1"
          aria-busy={isOpening}
          aria-label={
            isOpening ? t('gacha.spinning') : `${t('gacha.spin')} x1 (${formatCost(cost1)} KC)`
          }
          className={`spin-btn flex-1 ${isOpening || !canAfford1 ? 'disabled' : ''}`}
          onClick={() => rollGacha(1)}
          disabled={isOpening || !canAfford1}
        >
          <span id="gacha_spin1_txt">
            {isOpening ? t('gacha.spinning') : `${t('gacha.spin')} x1 (${formatCost(cost1)} KC)`}
          </span>
        </button>
        <button
          type="button"
          id="gacha_spin10"
          aria-busy={isOpening}
          aria-label={
            isOpening ? t('gacha.spinning') : `${t('gacha.spin')} x10 (${formatCost(cost10)} KC)`
          }
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
