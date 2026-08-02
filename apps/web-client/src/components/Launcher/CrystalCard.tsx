import React from "react";

interface CrystalCardProps {
  children: React.ReactNode;
  enableHoverEffect?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CrystalCard: React.FC<CrystalCardProps> = ({
  children,
  enableHoverEffect = true,
  className = "",
  style,
}) => {
  const hoverClass = enableHoverEffect ? "glass-card-hover" : "";
  return (
    <div
      className={`glass-card ${hoverClass} ${className}`}
      style={{ borderRadius: 18, ...style }}
    >
      {children}
    </div>
  );
};
