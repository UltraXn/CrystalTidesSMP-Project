import React from 'react';
import type { GachaTier, GachaReward, MappedGachaResult } from './types';
import type { GachaSpinSync } from '../../components/Gacha/gachaSpinSync';
import Gacha3DShowcase from '../../components/Gacha/Gacha3DShowcase';
import { GachaMachine } from './GachaMachine';
import { GachaControls } from './GachaControls';
import { formatCost, RARITY_ICONS } from './gachaGameUtils';

interface GachaHeroStageProps {
  selectedTier: GachaTier;
  isOpening: boolean;
  isCelebrating: boolean;
  spinSync: GachaSpinSync | null;
  reelItemsSet: (GachaReward | MappedGachaResult)[][];
  reelRefs: React.RefObject<HTMLDivElement | null>[];
  killuBalance: number;
  hasFreeRollForTier: boolean;
  handleAddFunds: (amount: number) => void;
  handleOpen: (qty: number) => void;
}

export const GachaHeroStage: React.FC<Readonly<GachaHeroStageProps>> = ({
  selectedTier,
  isOpening,
  isCelebrating,
  spinSync,
  reelItemsSet,
  reelRefs,
  killuBalance,
  hasFreeRollForTier,
  handleAddFunds,
  handleOpen,
}) => {
  return (
    <>
      <div className="gacha-decoration-left-placeholder">
        <Gacha3DShowcase
          tierId={selectedTier.id}
          tierColor={selectedTier.color}
          isOpening={isOpening}
          isCelebrating={isCelebrating}
          spinSync={spinSync}
          reelItemsSet={reelItemsSet}
        />
      </div>

      <div id="gacha_machine_area" className="gacha-game-layout">
        <GachaMachine
          reelItemsSet={reelItemsSet}
          reelRefs={reelRefs as unknown as React.RefObject<HTMLDivElement>[]}
          isOpening={isOpening}
          RARITY_ICONS={RARITY_ICONS}
          selectedTier={selectedTier}
        />

        <div className="gacha-balance-area">
          <button
            type="button"
            className="gacha-balance-chip clickable"
            id="gacha_nav_currency"
            onClick={() => handleAddFunds(5_000_000)}
            title="Click para añadir +5,000,000 KC (Modo Prueba)"
          >
            <img
              src="/images/killucoins/coin_oro.webp"
              alt="KilluCoins"
              className="currency-icon"
            />
            <span id="gacha_nav_currency_txt">{formatCost(killuBalance)} KC</span>
          </button>
        </div>

        <GachaControls
          isOpening={isOpening}
          selectedTier={selectedTier}
          killuBalance={killuBalance}
          rollGacha={handleOpen}
          formatCost={formatCost}
          hasFreeRoll={hasFreeRollForTier}
        />
      </div>
    </>
  );
};
