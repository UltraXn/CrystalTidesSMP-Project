import React from 'react';

type CrystalButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type CrystalButtonSize = 'sm' | 'md' | 'lg';

interface CrystalButtonProps {
  text: string;
  onPressed?: () => void;
  variant?: CrystalButtonVariant;
  size?: CrystalButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const VARIANT_CLASS_MAP: Record<CrystalButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZE_CLASS_MAP: Record<CrystalButtonSize, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export const CrystalButton: React.FC<Readonly<CrystalButtonProps>> = ({
  text,
  onPressed,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled = false,
  style,
}) => {
  const isButtonDisabled = disabled || isLoading || !onPressed;

  return (
    <button
      type="button"
      onClick={() => {
        if (!isButtonDisabled) onPressed?.();
      }}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      className={`btn ${VARIANT_CLASS_MAP[variant]} ${SIZE_CLASS_MAP[size]} ${className}`}
      style={{
        opacity: isButtonDisabled ? 0.5 : 1,
        cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {isLoading && (
        <span className="loader-spinner" style={{ marginRight: 8 }} aria-hidden="true">
          ⏳
        </span>
      )}
      {!isLoading && icon && (
        <span style={{ marginRight: 8 }} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{text}</span>
    </button>
  );
};
