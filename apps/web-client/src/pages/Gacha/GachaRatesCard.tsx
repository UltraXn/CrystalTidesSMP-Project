import React from 'react';
import { useTranslation } from 'react-i18next';

export interface RarityRateRow {
  key: string;
  label: string;
  pct: number;
}

interface GachaRatesCardProps {
  rarityRates: RarityRateRow[];
}

export const GachaRatesCard: React.FC<Readonly<GachaRatesCardProps>> = ({ rarityRates }) => {
  const { t } = useTranslation();

  return (
    <div id="gacha_side" className="gacha-side-panel">
      <div id="gacha_rates_card" className="gacha-side-card rates-card">
        <h3>{t('gacha.probability_rates')}</h3>
        <div className="rates-list">
          {rarityRates.map((row) => (
            <div key={row.key} className={`rate-item ${row.key}`}>
              <span className="rarity-dot" />
              <span className="rarity-name">{row.label}</span>
              <span className="rarity-value">{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
