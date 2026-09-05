import React from "react";

interface LauncherTitleBarProps {
  connectionStatus?: "online" | "offline" | "reconnecting";
  onToggleConnection?: () => void;
  onStartDrag?: (e: React.MouseEvent) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export const LauncherTitleBar: React.FC<LauncherTitleBarProps> = ({
  connectionStatus = "online",
  onToggleConnection,
  onStartDrag,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <header
      data-tauri-drag-region
      onMouseDown={onStartDrag}
      style={{
        height: 44,
        minHeight: 44,
        backgroundColor: "#07080A",
        borderBottom: "1px solid #1A1F2B",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        fontSize: 12,
        color: "#99A3BD",
        zIndex: 10,
        userSelect: "none",
      }}
    >
      {/* Left Branding & Status Badge */}
      <div data-tauri-drag-region style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src="/logo.png"
            alt="Crystal Client Mascot"
            style={{
              width: 17,
              height: 17,
              objectFit: "contain",
              opacity: 0.85,
              filter: "drop-shadow(0 0 6px rgba(45, 212, 191, 0.25))",
            }}
          />
          <span style={{ fontWeight: 700, color: "#FAFCFF", letterSpacing: "-0.01em", fontSize: 13 }}>
            Crystal Client
          </span>
        </div>
        <span style={{ color: "#262E42" }}>|</span>
        <span style={{ fontSize: 11.5, color: "#99A3BD" }}>Build 0.9.2</span>
        <span style={{ color: "#262E42" }}>|</span>
        {/* Connection Status & Offline Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleConnection}
          title={connectionStatus === "online" ? "Cambiar a Modo Desconexión (Offline)" : "Cambiar a Modo En Línea (Online)"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "3px 8px",
            borderRadius: 8,
            backgroundColor: connectionStatus === "online" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${connectionStatus === "online" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.35)"}`,
            color: "#FAFCFF",
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = connectionStatus === "online" ? "rgba(16, 185, 129, 0.18)" : "rgba(239, 68, 68, 0.22)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = connectionStatus === "online" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.12)";
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor:
                connectionStatus === "online"
                  ? "#10B981"
                  : connectionStatus === "reconnecting"
                  ? "#F59E0B"
                  : "#EF4444",
              boxShadow:
                connectionStatus === "online"
                  ? "0 0 8px rgba(16, 185, 129, 0.9)"
                  : connectionStatus === "reconnecting"
                  ? "0 0 8px rgba(245, 158, 11, 0.9)"
                  : "0 0 8px rgba(239, 68, 68, 0.9)",
            }}
          />
          <span>
            {connectionStatus === "online" ? "• Ver Offline" : "• Conectar"}
          </span>
        </button>
      </div>

      {/* Right: Window Control Buttons */}
      <div
        className="titlebar-no-drag"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ display: "flex", alignItems: "center", gap: 14, zIndex: 20 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "rgba(255, 255, 255, 0.6)" }} onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onMinimize}
            aria-label="Minimize"
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 4, display: "flex", transition: "color 150ms ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="12" x2="20" y2="12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMaximize}
            aria-label="Maximize"
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 4, display: "flex", transition: "color 150ms ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 4, display: "flex", transition: "color 150ms ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
