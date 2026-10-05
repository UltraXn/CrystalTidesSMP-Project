import React from 'react';
import { useTranslation } from 'react-i18next';
import { Donor } from './DonorFormModal';

const AVAILABLE_RANKS = [
  { id: 'donador', label: 'Donador', img: '/ranks/rank-donador.png' },
  { id: 'fundador', label: 'Fundador', img: '/ranks/rank-fundador.png' },
  { id: 'killu', label: 'Killu', img: '/ranks/rank-killu.png' },
  { id: 'neroferno', label: 'Neroferno', img: '/ranks/rank-neroferno.png' },
  { id: 'developer', label: 'Developer', img: '/ranks/developer.png' },
  { id: 'admin', label: 'Admin', img: '/ranks/admin.png' },
  { id: 'mod', label: 'Moderator', img: '/ranks/moderator.png' },
  { id: 'helper', label: 'Helper', img: '/ranks/helper.png' },
  { id: 'staff', label: 'Staff', img: '/ranks/staff.png' },
];

interface DonorBasicFieldsProps {
  formData: Donor;
  setFormData: React.Dispatch<React.SetStateAction<Donor>>;
}

export function DonorBasicFields({ formData, setFormData }: Readonly<DonorBasicFieldsProps>) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="form-group">
        <label htmlFor="donor-nick" className="admin-label-premium">
          {t('admin.donors.form.nick')}
        </label>
        <input
          id="donor-nick"
          className="admin-input-premium"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('admin.donors.form.nick_ph')}
        />
      </div>

      <div className="form-group">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.03)',
            padding: '1rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <input
            aria-label={t('admin.donors.form.is_premium', 'Es donador premium')}
            type="checkbox"
            id="isPremiumDonor"
            checked={formData.isPremium || false}
            onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <label
            htmlFor="isPremiumDonor"
            style={{
              cursor: 'pointer',
              fontSize: '0.95rem',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {t('admin.donors.form.is_premium')}
          </label>
        </div>
      </div>

      {!formData.isPremium && (
        <div className="form-group">
          <label htmlFor="donor-skin-url" className="admin-label-premium">
            {t('admin.donors.form.skin_url')}
          </label>
          <input
            id="donor-skin-url"
            className="admin-input-premium"
            value={formData.skinUrl}
            onChange={(e) => setFormData({ ...formData, skinUrl: e.target.value })}
            placeholder={t('admin.donors.form.skin_ph')}
          />
          <p
            style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.3)',
              marginTop: '0.5rem',
            }}
          >
            {t('admin.donors.form.skin_hint')}
          </p>
        </div>
      )}

      <div className="form-group">
        <div className="admin-label-premium">{t('admin.donors.form.ranks')}</div>
        <div className="donor-ranks-selector">
          {AVAILABLE_RANKS.map((rank) => {
            const isSelected = formData.ranks.includes(rank.id);
            return (
              <button
                type="button"
                key={rank.id}
                aria-pressed={isSelected}
                onClick={() => {
                  const newRanks = isSelected
                    ? formData.ranks.filter((r) => r !== rank.id)
                    : [...formData.ranks, rank.id];
                  setFormData({ ...formData, ranks: newRanks });
                }}
                className={`rank-select-item ${isSelected ? 'active' : ''}`}
              >
                <img src={rank.img} alt={rank.label} />
                <span>{rank.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
