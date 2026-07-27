import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const WindowTitleBar: React.FC = () => {
  const handleMinimize = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    } catch {}
  };

  const handleClose = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch {}
  };

  const handleStartDrag = (e: React.MouseEvent) => {
    if (e.button === 0) {
      getCurrentWindow().startDragging().catch(() => {});
    }
  };

  return (
    <div
      className="titlebar-drag-region"
      data-tauri-drag-region
      onMouseDown={handleStartDrag}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 32,
        backgroundColor: "rgba(6, 7, 11, 0.6)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        zIndex: 9999,
        userSelect: "none",
      }}
    >
      <div className="titlebar-drag-region" data-tauri-drag-region style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "none" }}>
        <img src="/logo.png" className="titlebar-drag-region" data-tauri-drag-region style={{ width: 16, height: 16, objectFit: "contain" }} alt="Logo" />
        <span className="titlebar-drag-region" data-tauri-drag-region style={{ fontSize: 11, fontWeight: 600, color: "rgba(255, 255, 255, 0.7)", letterSpacing: "0.03em" }}>
          CTLauncher Uninstaller
        </span>
      </div>

      <div className="titlebar-no-drag" style={{ display: "flex", alignItems: "center", gap: 4 }} onMouseDown={(e) => e.stopPropagation()}>
        <button
          onClick={handleMinimize}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            width: 28,
            height: 24,
            borderRadius: 4,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
        >
          ⎯
        </button>
        <button
          onClick={handleClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            width: 28,
            height: 24,
            borderRadius: 4,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
