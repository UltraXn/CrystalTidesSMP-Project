import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import type { GachaTier } from './types';
import { TIER_BTN_CLASS_MAP } from './types';
import type { GachaStatusResponse } from './gachaDisplayUtils';
import { CONSTANTS, EVENT_ONLY_TIERS, formatCost } from './gachaGameUtils';

interface GachaTierSelectorProps {
  tiers: GachaTier[];
  selectedTier: GachaTier;
  setSelectedTier: (tier: GachaTier) => void;
  isOpening: boolean;
  userIsAdmin: boolean;
  unlockedTiers: string[];
  tierStatus: GachaStatusResponse['tiers'];
}

export const GachaTierSelector: React.FC<Readonly<GachaTierSelectorProps>> = ({
  tiers,
  selectedTier,
  setSelectedTier,
  isOpening,
  userIsAdmin,
  unlockedTiers,
  tierStatus,
}) => {
  const { t } = useTranslation();
  const unlockedSet = React.useMemo(() => new Set(unlockedTiers), [unlockedTiers]);

  const renderTierCost = (tier: GachaTier, hasFreeRoll: boolean) => {
    if (hasFreeRoll) {
      return <span className="free-roll-badge">{t('gacha.free_roll')}</span>;
    }
    if (tier.id === CONSTANTS.TIER_ULTRA) {
      return <span className="event-only-badge">{t('gacha.event_only')}</span>;
    }
    return <>{formatCost(tier.cost)}</>;
  };

  return (
    <div className="tier-selector">
      {tiers.map((tier) => {
        const isLocked = EVENT_ONLY_TIERS.has(tier.id) && !userIsAdmin && !unlockedSet.has(tier.id);
        const hasFreeRoll = tierStatus[tier.id]?.hasFreeRoll ?? false;
        return (
          <button
            type="button"
            key={tier.id}
            className={`tier-btn ${TIER_BTN_CLASS_MAP[tier.id] || 'tier-btn-1'} ${selectedTier.id === tier.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
            onClick={() => !isOpening && !isLocked && setSelectedTier(tier)}
            style={{ '--tier-color': tier.color } as React.CSSProperties}
          >
            <img src={tier.icon} alt={tier.name} className="tier-icon" />
            <div className="tier-info">
              <span className="tier-name">{tier.name}</span>
              <div className="tier-value">{renderTierCost(tier, hasFreeRoll)}</div>
            </div>
            {isLocked && <Lock className="lock-icon" size={14} />}
          </button>
        );
      })}
    </div>
  );
};
