import { useTranslation } from 'react-i18next';

interface GachaSpinButtonProps {
  id: string;
  isOpening: boolean;
  canAfford: boolean;
  multiplier: 1 | 10;
  cost: number;
  formatCost: (num: number) => string;
  onClick: () => void;
  className?: string;
}

export function GachaSpinButton({
  id,
  isOpening,
  canAfford,
  multiplier,
  cost,
  formatCost,
  onClick,
  className = '',
}: Readonly<GachaSpinButtonProps>) {
  const { t } = useTranslation();
  const isDisabled = isOpening || !canAfford;
  const label = isOpening
    ? t('gacha.spinning')
    : `${t('gacha.spin')} x${multiplier} (${formatCost(cost)} KC)`;

  return (
    <button
      type="button"
      id={id}
      aria-busy={isOpening}
      aria-label={label}
      className={`spin-btn flex-1 ${isDisabled ? 'disabled' : ''} ${className}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      <span id={`${id}_txt`}>{label}</span>
    </button>
  );
}
