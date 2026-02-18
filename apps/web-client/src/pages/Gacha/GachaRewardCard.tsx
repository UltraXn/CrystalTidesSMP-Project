import React from 'react';
import { Star, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reward, RARITY_ICONS } from './gachaConstants';

interface GachaRewardCardProps {
    reward: Reward | null;
    selectedTierId: string;
    onClose: () => void;
    innerRef: React.RefObject<HTMLDivElement | null>;
}

const GachaRewardCard: React.FC<GachaRewardCardProps> = ({ reward, selectedTierId, onClose, innerRef }) => {
    const { t } = useTranslation();

    if (!reward) return null;

    const Icon = RARITY_ICONS[reward.rarity] || Star;

    return (
        <div className="reward-overlay" ref={innerRef} style={{ display: 'none' }}>
            <div className={`reward-card rarity-${reward.rarity} tier-reward-${selectedTierId}`}>
                <div className="reward-shine"></div>
                <div className="reward-rarity">{reward.rarity.toUpperCase()}</div>
                <div className="reward-icon">
                    <Icon />
                </div>
                <h3>{reward.name}</h3>
                <p>{t('gacha.reward_delivered')}</p>
                <button className="reward-close-btn" onClick={onClose}>
                    {t('gacha.claim_btn')} <Check size={18} />
                </button>
            </div>
        </div>
    );
};

export default GachaRewardCard;
