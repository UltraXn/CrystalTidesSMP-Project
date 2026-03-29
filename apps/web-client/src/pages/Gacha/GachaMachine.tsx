import React from 'react';
import { Star } from 'lucide-react';
import { GachaReward, MappedGachaResult, GachaTier } from './types';


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
    selectedTier
}) => {
    return (
        <div className={`slot-machine-wrapper ${isOpening ? 'is-opening' : ''} tier-${selectedTier.id}`}>
            <div className="slot-machine-frame">
                <div className="slot-machine-lights left">
                    {[...Array(8)].map((_, i) => <div key={i} className={`led ${isOpening ? 'animating' : ''}`}></div>)}
                </div>

                <div className="slot-machine-case">
                    <div className="slot-machine-container">
                        <div className="slot-glass-reflection"></div>
                        <div className="slot-selector">
                            <div className="selector-line top"></div>
                            <div className="selector-line bottom"></div>
                        </div>
                        
                        <div className="slot-reels-container">
                            {reelItemsSet.map((items, reelIdx) => (
                                <React.Fragment key={reelIdx}>
                                    <div className="slot-reel" ref={reelRefs[reelIdx]}>
                                        {items.map((item, i) => (
                                            <div key={i} className={`slot-item rarity-${item.rarity}`}>
                                                <div className="item-icon-wrapper" style={{ 
                                                    color: item.color,
                                                    '--item-glow': `${item.color}80` // 50% opacity color for the glow
                                                } as React.CSSProperties}>
                                                    {(() => {
                                                        const xpImg = '/images/xp_bottle.webp';
                                                        const coinImages: Record<string, string> = {
                                                            bronze: '/images/killucoins/coin_cobre.webp',
                                                            silver: '/images/killucoins/coin_plata.webp',
                                                            gold: '/images/killucoins/coin_oro.webp',
                                                            emerald: '/images/killucoins/coin_esmeralda.webp',
                                                            diamond: '/images/killucoins/coin_diamante.webp',
                                                            iridium: '/images/killucoins/coin_iridium.webp'
                                                        };

                                                        const getFailsafeImg = (name: string) => {
                                                            const n = name.toLowerCase();
                                                            if (n.includes('xp')) return xpImg;
                                                            if (n.includes('killucoins') || n.includes(' kc')) {
                                                                if (n.includes('250.000')) return coinImages.diamond;
                                                                if (n.includes('2.500.000')) return coinImages.iridium;
                                                                if (n.includes('25.000')) return coinImages.emerald;
                                                                if (n.includes('2.500')) return coinImages.gold;
                                                                if (n.includes('250')) return coinImages.silver;
                                                                return coinImages.bronze;
                                                            }
                                                            if (n.includes('estrella nether')) return '/images/items/Nether_Star.gif';
                                                            if (n.includes('mending')) return '/images/items/enchanted_book.gif';
                                                            if (n.includes('silencio')) return '/images/items/Silence_Armor_Trim_Smithing_Template_JE1_BE1.png';
                                                            if (n.includes('heavy core')) return '/images/items/Heavy_Core_JE1_BE1.png';
                                                            if (n.includes('sniffer')) return '/images/items/Sniffer_Egg_(item)_JE1_BE1.png';
                                                            if (n.includes('pigstep')) return '/images/items/Music_Disc_Pigstep_JE1_BE1.png';
                                                            if (n.includes('wither')) return '/images/items/Wither_Skeleton_Skull_(S)_JE2.png';
                                                            if (n.includes('notch')) return '/images/items/Enchanted_Golden_Apple_JE2_BE2.gif';
                                                            if (n.includes('escudo')) return '/images/items/Shield_JE2_BE1.webp';
                                                            if (n.includes('mejora netherite')) return '/images/items/Netherite_Upgrade_Smithing_Template_JE1_BE1.png';
                                                            if (n.includes('zanahoria oro')) return '/images/items/Golden_Carrot_JE4_BE2.png';
                                                            if (n.includes('carbón')) return '/images/items/Coal_JE4_BE3.png';
                                                            if (n.includes('cobre')) return '/images/items/Raw_Copper_JE3_BE2.png';
                                                            return null;
                                                        };

                                                        const activeImg = item.image_url || getFailsafeImg(item.name);

                                                        if (activeImg) {
                                                            return (
                                                                <img 
                                                                    src={activeImg} 
                                                                    alt={item.name}
                                                                    className="slot-item-sprite"
                                                                />
                                                            );
                                                        }

                                                        const Icon = RARITY_ICONS[item.rarity] || Star;
                                                        return <Icon size={32} />;
                                                    })()}
                                                </div>
                                                <span className="item-name">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {reelIdx < 2 && <div className="reel-divider"></div>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="slot-machine-lights right">
                    {[...Array(8)].map((_, i) => <div key={i} className={`led ${isOpening ? 'animating' : ''}`}></div>)}
                </div>
            </div>
        </div>
    );
};
