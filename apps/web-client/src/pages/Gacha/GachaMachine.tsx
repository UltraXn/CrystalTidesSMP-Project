import React from 'react';
import { Star } from 'lucide-react';
import {
  GachaReward,
  MappedGachaResult,
  GachaTier,
  TIER_CLASS_MAP,
  RARITY_CLASS_MAP,
} from './types';
import { isLossReward, resolveRewardImage } from './gachaDisplayUtils';

interface GachaMachineProps {
  reelItemsSet: (GachaReward | MappedGachaResult)[][];
  reelRefs: React.RefObject<HTMLDivElement | null>[];
  isOpening: boolean;
  RARITY_ICONS: Record<string, React.ElementType>;
  selectedTier: GachaTier;
}

const LED_KEYS = ['led-0', 'led-1', 'led-2', 'led-3', 'led-4', 'led-5', 'led-6', 'led-7'] as const;
const REEL_COLUMN_KEYS = ['reel-left', 'reel-mid', 'reel-right'] as const;

export const GachaMachine: React.FC<Readonly<GachaMachineProps>> = ({
  reelItemsSet,
  reelRefs,
  isOpening,
  RARITY_ICONS,
  selectedTier,
}) => {
  const tierClass = TIER_CLASS_MAP[selectedTier.id] || 'tier-1';

  return (
    <section
      id="gacha_machine_card"
      aria-label={`Máquina tragamonedas ${selectedTier.name}`}
      className={`slot-machine-wrapper ${isOpening ? 'is-opening' : ''} ${tierClass}`}
      style={{ '--tier-color': selectedTier.color } as React.CSSProperties}
    >
      <div className="slot-machine-frame">
        <div className="slot-machine-lights left" aria-hidden="true">
          {LED_KEYS.map((k) => (
            <div key={`led-left-${k}`} className={`led ${isOpening ? 'animating' : ''}`} />
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
              {reelItemsSet.map((items, reelIdx) => {
                const reelKey = REEL_COLUMN_KEYS[reelIdx] || `reel-col-${reelIdx}`;
                return (
                  <React.Fragment key={reelKey}>
                    <div className="slot-reel" ref={reelRefs[reelIdx]}>
                      {items.map((item) => {
                        const loss = isLossReward(item);
                        const activeImg =
                          resolveRewardImage(item.name, item.image_url) ||
                          (loss ? '/images/items/Barrier_(held)_JE2_BE2.png' : null);
                        const Icon = RARITY_ICONS[item.rarity] || Star;
                        const rarityClass = RARITY_CLASS_MAP[item.rarity] || 'rarity-common';
                        return (
                          <div
                            key={item.id}
                            className={['slot-item', rarityClass, loss ? 'is-loss' : '']
                              .filter(Boolean)
                              .join(' ')}
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
                                <img src={activeImg} alt={item.name} className="slot-item-sprite" />
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
                );
              })}
            </div>
          </div>
        </div>

        <div className="slot-machine-lights right">
          {LED_KEYS.map((k) => (
            <div key={`led-right-${k}`} className={`led ${isOpening ? 'animating' : ''}`} />
          ))}
        </div>
      </div>
    </section>
  );
};
