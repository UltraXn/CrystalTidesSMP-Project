import React from 'react';
import { Lock } from 'lucide-react';
import { GACHA_TIERS, formatCost } from './gachaConstants';

interface GachaTierSelectorProps {
    unlockedTiers: string[];
    selectedTierId: string;
    onTierSelect: (tier: typeof GACHA_TIERS[0]) => void;
    isOpening: boolean;
    freeRolls: Record<string, boolean>;
}

const GachaTierSelector: React.FC<GachaTierSelectorProps> = ({
    unlockedTiers,
    selectedTierId,
    onTierSelect,
    isOpening,
    freeRolls
}) => {
    return (
        <div className="tier-selector">
            {GACHA_TIERS.map((tier) => {
                const isLocked = !unlockedTiers.includes(tier.id);
                return (
                    <button
                        key={tier.id}
                        className={`tier-btn tier-btn-${tier.id} ${selectedTierId === tier.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                        onClick={() => !isOpening && !isLocked && onTierSelect(tier)}
                        style={{ '--tier-color': tier.color } as React.CSSProperties}
                    >
                        <img src={tier.icon} alt={tier.name} className="tier-icon" />
                        <div className="tier-info">
                            <span className="tier-name">{tier.name}</span>
                            <span className="tier-cost">
                                {freeRolls[tier.id] ? (
                                    <span className="free-roll-badge">TIRADA GRATIS!</span>
                                ) : tier.id === 'ultra' ? (
                                    <span className="event-only-badge">EVENTO</span>
                                ) : (
                                    <>
                                        {formatCost(tier.cost)} 
                                        <span>KilluCoins</span>
                                    </>
                                )}
                            </span>
                        </div>
                        {isLocked && <Lock className="lock-icon" />}
                    </button>
                );
            })}
        </div>
    );
};

export default GachaTierSelector;
