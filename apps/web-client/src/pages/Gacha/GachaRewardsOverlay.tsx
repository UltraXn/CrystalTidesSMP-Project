import React from 'react';
import { Star, Check, Trophy, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GachaReward, MappedGachaResult, GachaTier, RARITY_CLASS_MAP } from './types';
import { isLossReward, resolveRewardImage, getGachaFailsafeImage } from './gachaDisplayUtils';

interface GachaRewardsOverlayProps {
  showBulkRewards: boolean;
  bulkRewards: (GachaReward | MappedGachaResult)[] | null;
  selectedTier: GachaTier;
  setShowBulkRewards: (val: boolean) => void;
}

export const GachaRewardsOverlay: React.FC<Readonly<GachaRewardsOverlayProps>> = ({
  showBulkRewards,
  bulkRewards,
  selectedTier,
  setShowBulkRewards,
}) => {
  const { t } = useTranslation();
  if (!showBulkRewards || !bulkRewards) return null;

  const isSingle = bulkRewards.length === 1;

  const getFailsafeImg = (name: string) => getGachaFailsafeImage(name);

  if (isSingle) {
    const item = bulkRewards[0];

    return (
      <dialog
        open
        aria-labelledby="gacha-reward-title"
        aria-live="polite"
        className="reward-overlay"
      >
        <div className="reward-card">
          <span className={`reward-rarity ${RARITY_CLASS_MAP[item.rarity] || 'rarity-common'}`}>
            {item.rarity.toUpperCase()}
          </span>
          <div className={`reward-icon ${RARITY_CLASS_MAP[item.rarity] || 'rarity-common'}`}>
            {(() => {
              const loss = isLossReward(item);
              const activeImg = loss
                ? null
                : (resolveRewardImage(item.name, item.image_url) ?? getFailsafeImg(item.name));
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
                      filter: `drop-shadow(0 0 15px ${item.color || '#fff'}80)`,
                    }}
                  />
                );
              }

              if (loss) {
                return (
                  <Sparkles size={100} color="#94a3b8" strokeWidth={1.25} aria-hidden="true" />
                );
              }

              return <Trophy size={100} color="#ffd700" strokeWidth={1} aria-hidden="true" />;
            })()}
          </div>
          <h3 id="gacha-reward-title">{item.name}</h3>
          <p>
            {isLossReward(item)
              ? '¡Vuelve a intentarlo en la próxima tirada!'
              : '¡Has desbloqueado un nuevo objeto!'}
          </p>
          <button
            type="button"
            aria-label="Aceptar y reclamar recompensa"
            className="reward-close-btn accept-btn"
            onClick={() => setShowBulkRewards(false)}
          >
            <Check size={20} aria-hidden="true" />
            <span>ACEPTAR</span>
          </button>
        </div>
      </dialog>
    );
  }

  return (
    <dialog open aria-labelledby="gacha-reward-title" aria-live="polite" className="reward-overlay">
      <div className="reward-card bulk-reward-card">
        <div className="reward-glow" style={{ background: selectedTier.color }}></div>
        <div className="reward-header">
          <Star
            size={24}
            color={selectedTier.color}
            fill={selectedTier.color}
            aria-hidden="true"
            className="header-icon"
          />
          <h2 id="gacha-reward-title">
            {t('gacha.results_title')} ({bulkRewards.length})
          </h2>
        </div>

        <div className="bulk-rewards-list custom-scrollbar">
          {bulkRewards.length === 0 ? (
            <p className="no-rewards">{t('gacha.no_rewards')}</p>
          ) : (
            bulkRewards.map((r, index) => (
              <div
                key={
                  r.id ??
                  `reward-${r.name}-${r.rarity}-${'amount' in r && typeof r.amount === 'number' ? r.amount : ''}`
                }
                className={`bulk-item-row ${RARITY_CLASS_MAP[r.rarity] ?? 'rarity-common'}`}
                style={{ '--delay': `${index * 0.05}s` } as React.CSSProperties}
              >
                <div className="bulk-item-icon">
                  {(() => {
                    const loss = isLossReward(r);
                    const activeImg = loss
                      ? null
                      : (resolveRewardImage(r.name, r.image_url) ?? getFailsafeImg(r.name));

                    if (activeImg) {
                      const isKillucoin =
                        r.name.toLowerCase().includes('killucoins') ||
                        r.name.toLowerCase().includes(' kc');
                      return (
                        <img
                          src={activeImg}
                          alt={r.name}
                          className={isKillucoin ? 'bulk-coin-img' : 'reward-item-img-bulk'}
                          style={
                            {
                              width: '28px',
                              height: '28px',
                              objectFit: 'contain',
                              imageRendering: 'pixelated',
                              filter: isKillucoin
                                ? `drop-shadow(0 0 10px ${r.color || '#fff'})`
                                : `drop-shadow(0 0 8px ${r.color}80)`,
                              '--item-glow': `${r.color}80`,
                            } as React.CSSProperties
                          }
                        />
                      );
                    }

                    if (loss) {
                      return (
                        <Sparkles size={24} color="#94a3b8" strokeWidth={1.5} aria-hidden="true" />
                      );
                    }

                    return <Trophy size={24} color="#94a3b8" aria-hidden="true" />;
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
          <button
            type="button"
            aria-label="Aceptar y reclamar recompensas"
            className="reward-close-btn accept-btn"
            onClick={() => setShowBulkRewards(false)}
          >
            <Check size={20} aria-hidden="true" />
            <span>ACEPTAR</span>
          </button>
        </div>
      </div>
    </dialog>
  );
};
