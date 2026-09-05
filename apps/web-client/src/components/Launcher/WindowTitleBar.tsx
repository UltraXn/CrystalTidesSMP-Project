import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const handleMinimize = async () => {
  try {
    const win = getCurrentWindow();
    await win.minimize();
  } catch (err) {
    console.error("Failed to minimize window:", err);
  }
};

const handleClose = async () => {
  try {
    const win = getCurrentWindow();
    await win.close();
  } catch (err) {
    console.error("Failed to close window:", err);
  }
};

const handleStartDrag = (e: React.MouseEvent) => {
  if (e.button === 0) {
    getCurrentWindow().startDragging().catch(() => {});
  }
};

export const WindowTitleBar: React.FC = () => {
  return (
    <div
      className="titlebar-drag-region"
      data-tauri-drag-region
      onMouseDown={handleStartDrag}
      role="presentation"
      style={{
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(10, 12, 18, 0.95)",
        borderBottom: "1.5px solid var(--border-low)",
        userSelect: "none",
        paddingLeft: 16,
        paddingRight: 8,
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        zIndex: 9999,
        borderRadius: 0,
      }}
    >
      {/* Title / Logo */}
      <div
        className="titlebar-drag-region"
        data-tauri-drag-region
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.6)",
          letterSpacing: 0.5,
        }}
      >
        <img
          src="/logo.png"
          className="titlebar-drag-region"
          data-tauri-drag-region
          alt="CrystalTides Logo"
          style={{ width: 16, height: 16, objectFit: "contain", imageRendering: "pixelated" }}
        />
        <span className="titlebar-drag-region" data-tauri-drag-region>CrystalTides Launcher</span>
      </div>

      {/* Control Buttons */}
      <div className="titlebar-no-drag" style={{ display: "flex", gap: 4 }} onMouseDown={(e) => e.stopPropagation()}>
        <button type="button"
          onClick={handleMinimize}
          aria-label="Minimizar ventana"
          style={{
            width: 32,
            height: 24,
            border: "none",
            borderRadius: 4,
            backgroundColor: "transparent",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 150ms ease, background-color 150ms ease, border-color 150ms ease, opacity 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
          }}
          title="Minimizar"
        >
          <span aria-hidden="true">─</span>
        </button>
        <button type="button"
          onClick={handleClose}
          aria-label="Cerrar ventana"
          style={{
            width: 32,
            height: 24,
            border: "none",
            borderRadius: 4,
            backgroundColor: "transparent",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 150ms ease, background-color 150ms ease, border-color 150ms ease, opacity 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
            e.currentTarget.style.color = "#EF4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
          }}
          title="Cerrar"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  );
};