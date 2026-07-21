import React from "react";
import { getRankBadgePath, getRankDisplayName } from "../utils/rankUtils";

interface RoleBadgeProps {
  role?: string;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = "md",
  style,
}) => {
  const badgePath = getRankBadgePath(role);
  const displayName = getRankDisplayName(role);

  const heightMap = {
    sm: 13,
    md: 16,
    lg: 22,
  };

  const imgHeight = heightMap[size];

  return (
    <img
      src={badgePath}
      alt={displayName}
      title={`Rango: ${displayName}`}
      style={{
        height: imgHeight,
        width: "auto",
        objectFit: "contain",
        imageRendering: "pixelated",
        display: "inline-block",
        verticalAlign: "middle",
        maxHeight: "100%",
        ...style,
      }}
      onError={(e) => {
        e.currentTarget.src = "/ranks/user.png";
      }}
    />
  );
};
