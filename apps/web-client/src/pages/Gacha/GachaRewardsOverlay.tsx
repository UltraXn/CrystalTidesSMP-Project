import React from 'react';
import { Star, Check, Trophy, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GachaReward, MappedGachaResult, GachaTier } from './types';

interface GachaRewardsOverlayProps {
    showBulkRewards: boolean;
    bulkRewards: (GachaReward | MappedGachaResult)[] | null;
    selectedTier: GachaTier;
    setShowBulkRewards: (val: boolean) => void;
}

export const GachaRewardsOverlay: React.FC<GachaRewardsOverlayProps> = ({
    showBulkRewards,
    bulkRewards,
    selectedTier,
    setShowBulkRewards
}) => {
    const { t } = useTranslation();
    if (!showBulkRewards || !bulkRewards) return null;

    const isSingle = bulkRewards.length === 1;

    const xpImg = '/images/items/xp_bottle.webp';
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
        // Skip fallback for loss if we want to use the icon/image provided
        // The component handles it based on reward.image_url or fallback icon
        // This function now only provides images for specific non-loss items if image_url is not present
        if (n.includes('xp')) return xpImg;
        if (n.includes('killucoins') || n.includes(' kc')) {
            if (n.includes('250.000')) return coinImages.diamond;
            if (n.includes('2.500.000')) return coinImages.iridium;
            if (n.includes('25.000')) return coinImages.emerald;
            if (n.includes('2.500')) return coinImages.gold;
            if (n.includes('250')) return coinImages.silver;
            return coinImages.bronze;
        }
        if (n.includes('capa') || n.includes('elytra')) return '/images/items/Elytra_JE2_BE2.png';
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
        return null;
    };

    if (isSingle) {
        const item = bulkRewards[0];

        return (
            <div className="reward-overlay">
                <div className="reward-card">
                    <span className={`reward-rarity rarity-${item.rarity}`}>{item.rarity.toUpperCase()}</span>
                    <div className={`reward-icon rarity-${item.rarity}`}>
                        {(() => {
                            const activeImg = item.image_url || getFailsafeImg(item.name);
                            if (activeImg) {
                                return (
                                    <img 
                                        src={activeImg} 
                                        alt={item.name} 
                                        style={{ 
                                            width: '120px', 
                                            height: '120px', 
                                            objectFit: 'contain', 
                                            imageRendering: 'pixelated',
                                            filter: `drop-shadow(0 0 15px ${item.color || '#fff'}80)`
                                        }} 
                                    />
                                );
                            }

                            if (item.name.includes('PRÓXIMA') || item.name.includes('TRY AGAIN')) {
                                return <AlertCircle size={100} color="#666" strokeWidth={1} />;
                            }

                            return <Trophy size={100} color="#ffd700" strokeWidth={1} />;
                        })()}
                    </div>
                    <h3>{item.name}</h3>
                    <p>{(item.name.includes('PRÓXIMA') || item.name.includes('TRY AGAIN')) 
                        ? '¡Vuelve a intentarlo en la próxima tirada!' 
                        : '¡Has desbloqueado un nuevo objeto!'}</p>
                    <button className="reward-close-btn accept-btn" onClick={() => setShowBulkRewards(false)}>
                        <Check size={20} />
                        <span>ACEPTAR</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="reward-overlay">
            <div className="reward-card bulk-reward-card">
                <div className="reward-glow" style={{ background: selectedTier.color }}></div>
                <div className="reward-header">
                    <Star size={24} color={selectedTier.color} fill={selectedTier.color} className="header-icon" />
                    <h2>{t('gacha.results_title')} ({bulkRewards.length})</h2>
                </div>
                
                <div className="bulk-rewards-list custom-scrollbar">
                    {bulkRewards.length === 0 ? (
                        <p className="no-rewards">{t('gacha.no_rewards')}</p>
                    ) : (
                        bulkRewards.map((r, i) => (
                            <div key={i} className={`bulk-item-row rarity-${r.rarity}`} style={{ "--delay": `${i * 0.05}s` } as React.CSSProperties}>
                                 <div className="bulk-item-icon">
                                    {(() => {
                                        const activeImg = r.image_url || getFailsafeImg(r.name);

                                        if (activeImg) {
                                            const isKillucoin = r.name.toLowerCase().includes('killucoins') || r.name.toLowerCase().includes(' kc');
                                            return (
                                                <img 
                                                    src={activeImg} 
                                                    alt={r.name} 
                                                    className={isKillucoin ? "bulk-coin-img" : "reward-item-img-bulk"} 
                                                    style={{ 
                                                        width: '28px', 
                                                        height: '28px', 
                                                        objectFit: 'contain',
                                                        imageRendering: 'pixelated',
                                                        filter: isKillucoin ? `drop-shadow(0 0 10px ${r.color || '#fff'})` : `drop-shadow(0 0 8px ${r.color}80)`,
                                                        '--item-glow': `${r.color}80`
                                                    } as React.CSSProperties} 
                                                />
                                            );
                                        }

                                        if (r.name.includes('PRÓXIMA') || r.name.includes('TRY AGAIN')) {
                                            return <AlertCircle size={24} color="#666" strokeWidth={2} />;
                                        }

                                        return <Trophy size={24} color="#94a3b8" />;
                                    })()}
                                </div>
                                <div className="bulk-item-info">
                                    <span className="bulk-item-name">{r.name}</span>
                                    <span className="bulk-item-rarity">{r.rarity.toUpperCase()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="reward-footer">
                    <button className="reward-close-btn accept-btn" onClick={() => setShowBulkRewards(false)}>
                        <Check size={20} />
                        <span>ACEPTAR</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
