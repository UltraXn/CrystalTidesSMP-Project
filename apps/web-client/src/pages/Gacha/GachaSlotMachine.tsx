import React from 'react';
import { Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reward, RARITY_ICONS } from './gachaConstants';

interface GachaSlotMachineProps {
    reelItemsSet: Reward[][];
    reelRefs: React.RefObject<HTMLDivElement>[];
    isOpening: boolean;
    cooldown: boolean;
    onOpen: () => void;
}

const GachaSlotMachine: React.FC<GachaSlotMachineProps> = ({
    reelItemsSet,
    reelRefs,
    isOpening,
    cooldown,
    onOpen
}) => {
    const { t } = useTranslation();

    return (
        <div className="slot-machine-wrapper">
            <div className="slot-machine-case">
                <div className="slot-machine-lights left">
                    {[...Array(8)].map((_, i) => <div key={i} className={`led ${isOpening ? 'animating' : ''}`}></div>)}
                </div>
                <div className="slot-machine-container">
                    <div className="slot-glass-reflection"></div>
                    <div className="slot-selector"></div>
                    <div className="slot-reels-container">
                        {reelItemsSet.map((items, reelIdx) => (
                            <div key={reelIdx} className="slot-reel" ref={reelRefs[reelIdx]}>
                                {items.map((item, i) => (
                                    <div key={i} className={`slot-item rarity-${item.rarity}`}>
                                        <div className="item-icon-wrapper" style={{ color: item.color }}>
                                            {(() => {
                                                const Icon = RARITY_ICONS[item.rarity];
                                                return <Icon />;
                                            })()}
                                        </div>
                                        <span className="item-name">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="slot-machine-lights right">
                    {[...Array(8)].map((_, i) => <div key={i} className={`led ${isOpening ? 'animating' : ''}`}></div>)}
                </div>
            </div>

            <div className="slot-controls">
                <div className="lever-base">
                    <button 
                        className={`spin-btn ${isOpening || cooldown ? 'disabled' : ''}`}
                        onClick={onOpen}
                        disabled={isOpening || cooldown}
                    >
                        {isOpening ? (
                            <span className="loading-dots">{t('gacha.opening')}</span>
                        ) : cooldown ? (
                            t('gacha.btn_cooldown')
                        ) : (
                            <><Coins size={18} /> {t('gacha.btn_roll')}</>
                        )}
                    </button>
                </div>
                {cooldown && !isOpening && (
                    <div className="cooldown-notice">
                        <Coins size={16} /> {t('gacha.vuelve_mañana')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GachaSlotMachine;
