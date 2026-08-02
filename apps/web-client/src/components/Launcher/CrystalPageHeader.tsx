import React from "react";

interface CrystalPageHeaderProps {
  eyebrow: string;
  title: string;
  trailing?: React.ReactNode;
  className?: string;
}

export const CrystalPageHeader: React.FC<CrystalPageHeaderProps> = ({
  eyebrow,
  title,
  trailing,
  className = "",
}) => {
  return (
    <div
      className={`crystal-page-header ${className}`}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span
          style={{
            color: "var(--accent)",
            fontSize: 12,
            fontWeight: "bold",
            letterSpacing: "2px",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </span>
        <h1
          style={{
            color: "var(--text)",
            fontSize: 32,
            fontWeight: "bold",
            margin: 0,
            textAlign: "left",
          }}
        >
          {title}
        </h1>
      </div>
      {trailing && <div>{trailing}</div>}
    </div>
  );
};
