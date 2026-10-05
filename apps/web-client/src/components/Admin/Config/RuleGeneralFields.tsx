import React from 'react';
import { useTranslation } from 'react-i18next';
import { Rule } from '../../../hooks/useAdminData';

const CATEGORY_OPTIONS = [
  'General',
  'Comportamiento',
  'Chat',
  'PvP',
  'Construcción',
  'Clientes',
  'Staff',
  'Cuenta',
];

interface RuleGeneralFieldsProps {
  formData: Partial<Rule>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Rule>>>;
}

export function RuleGeneralFields({ formData, setFormData }: Readonly<RuleGeneralFieldsProps>) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <div>
        <label htmlFor="rule-category" className="admin-label-premium">
          {t('admin.settings.rules.category_label')}
        </label>
        <select
          id="rule-category"
          className="admin-select-premium"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="rule-sort-order" className="admin-label-premium">
          {t('admin.settings.rules.order_label', 'Orden (Prioridad)')}
        </label>
        <input
          id="rule-sort-order"
          type="number"
          className="admin-input-premium"
          value={formData.sort_order}
          onChange={(e) =>
            setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })
          }
        />
      </div>
      <div>
        <label htmlFor="rule-color-picker" className="admin-label-premium">
          {t('admin.settings.rules.color_label', 'Color Representativo')}
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            id="rule-color-picker"
            type="color"
            value={formData.color || '#6366f1'}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            style={{
              width: '48px',
              height: '48px',
              padding: '0',
              border: 'none',
              borderRadius: '10px',
              background: 'none',
              cursor: 'pointer',
            }}
          />
          <input
            aria-label={t('admin.settings.rules.color_hex', 'Código hexadecimal del color')}
            type="text"
            className="admin-input-premium"
            value={formData.color || '#6366f1'}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="#HEX"
            style={{ flex: 1, fontFamily: 'monospace' }}
          />
        </div>
      </div>
    </div>
  );
}
