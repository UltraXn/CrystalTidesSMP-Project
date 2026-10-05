import React from 'react';
import { GachaTier, TIER_CLASS_MAP } from './types';
import { GachaBalanceBadge } from './GachaBalanceBadge';
import { GachaSpinButton } from './GachaSpinButton';

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
  const cost1 = hasFreeRoll ? 0 : selectedTier.cost;
  const cost10 = hasFreeRoll ? selectedTier.cost * 9 : selectedTier.cost * 10;

  const canAfford1 = killuBalance >= cost1 || selectedTier.id === 'ultra';
  const canAfford10 = killuBalance >= cost10 || selectedTier.id === 'ultra';

  return (
    <div className={`slot-controls ${TIER_CLASS_MAP[selectedTier.id] ?? ''}`} id="gacha_controls">
      <GachaBalanceBadge killuBalance={killuBalance} />

      <div className="flex w-full gap-3">
        <GachaSpinButton
          id="gacha_spin1"
          isOpening={isOpening}
          canAfford={canAfford1}
          multiplier={1}
          cost={cost1}
          formatCost={formatCost}
          onClick={() => rollGacha(1)}
        />
        <GachaSpinButton
          id="gacha_spin10"
          isOpening={isOpening}
          canAfford={canAfford10}
          multiplier={10}
          cost={cost10}
          formatCost={formatCost}
          onClick={() => rollGacha(10)}
          className="spin-btn-10"
        />
      </div>
    </div>
  );
};
