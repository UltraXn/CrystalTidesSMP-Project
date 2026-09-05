import React from "react";

type CrystalButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type CrystalButtonSize = "sm" | "md" | "lg";

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

export const CrystalButton: React.FC<CrystalButtonProps> = ({
  text,
  onPressed,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled = false,
  style,
}) => {
  const isButtonDisabled = disabled || isLoading || !onPressed;
  
  return (
    <button type="button"
      onClick={() => {
        if (!isButtonDisabled) onPressed?.();
      }}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      className={`btn btn-${variant} btn-${size} ${className}`}
      style={{
        opacity: isButtonDisabled ? 0.5 : 1,
        cursor: isButtonDisabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {isLoading && (
        <span className="loader-spinner" style={{ marginRight: 8 }} aria-hidden="true">
          ⏳
        </span>
      )}
      {!isLoading && icon && <span style={{ marginRight: 8 }} aria-hidden="true">{icon}</span>}
      <span>{text}</span>
    </button>
  );
};
