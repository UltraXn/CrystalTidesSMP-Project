import React from 'react';
import { Star } from 'lucide-react';
import { GachaReward, MappedGachaResult, GachaTier } from './types';
import { isLossReward, resolveRewardImage } from './gachaDisplayUtils';

interface GachaMachineProps {
    reelItemsSet: (GachaReward | MappedGachaResult)[][];
    reelRefs: React.RefObject<HTMLDivElement | null>[];
    isOpening: boolean;
    RARITY_ICONS: Record<string, React.ElementType>;
    selectedTier: GachaTier;
}

export const GachaMachine: React.FC<GachaMachineProps> = ({
    reelItemsSet,
    reelRefs,
    isOpening,
    RARITY_ICONS,
    selectedTier,
}) => {
    return (
        <div
            id="gacha_machine_card"
            role="region"
            aria-label={`Máquina tragamonedas ${selectedTier.name}`}
            className={`slot-machine-wrapper ${isOpening ? 'is-opening' : ''} tier-${selectedTier.id}`}
            style={{ '--tier-color': selectedTier.color } as React.CSSProperties}
        >
            <div className="slot-machine-frame">
                <div className="slot-machine-lights left" aria-hidden="true">
                    {[...Array(8)].map((_, i) => (
                        <div key={`item-${i}`} className={`led ${isOpening ? 'animating' : ''}`} />
                    ))}
                </div>

                <div className="slot-machine-case">
                    <div className="slot-machine-container">
                        <div className="slot-glass-reflection" />
                        <div className="slot-selector">
                            <div className="selector-line top" />
                            <div className="selector-line bottom" />
                        </div>

                        <div className="slot-reels-container">
                            {reelItemsSet.map((items, reelIdx) => (
                                <React.Fragment key={reelIdx}>
                                    <div className="slot-reel" ref={reelRefs[reelIdx]}>
                                        {items.map((item, i) => {
                                            const loss = isLossReward(item);
                                            const activeImg =
                                                resolveRewardImage(item.name, item.image_url) ||
                                                (loss
                                                    ? '/images/items/Barrier_(held)_JE2_BE2.png'
                                                    : null);
                                            const Icon = RARITY_ICONS[item.rarity] || Star;
                                            return (
                                                // react-doctor-disable-next-line no-array-index-as-key -- slot reel items repeat by design (no unique id per instance); position-stable list
                                                <div
                                                    key={`item-${i}`}
                                                    className={`slot-item rarity-${item.rarity}${loss ? ' is-loss' : ''}`}
                                                >
                                                    <div
                                                        className="item-icon-wrapper"
                                                        style={
                                                            {
                                                                color: item.color,
                                                                '--item-glow': `${item.color}80`,
                                                            } as React.CSSProperties
                                                        }
                                                    >
                                                        {activeImg ? (
                                                            <img
                                                                src={activeImg}
                                                                alt={item.name}
                                                                className="slot-item-sprite"
                                                            />
                                                        ) : (
                                                            <Icon size={32} />
                                                        )}
                                                    </div>
                                                    <span className="item-name">{item.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {reelIdx < 2 && <div className="reel-divider" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="slot-machine-lights right">
                    {[...Array(8)].map((_, i) => (
                        <div key={`item-${i}`} className={`led ${isOpening ? 'animating' : ''}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};
