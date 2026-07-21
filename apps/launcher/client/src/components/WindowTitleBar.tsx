import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const WindowTitleBar: React.FC = () => {
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

  return (
    <div
      data-tauri-drag-region
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
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      {/* Title / Logo */}
      <div
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
          data-tauri-drag-region
          alt="CrystalTides Logo"
          style={{ width: 16, height: 16, objectFit: "contain", imageRendering: "pixelated" }}
        />
        <span data-tauri-drag-region>CrystalTides Launcher</span>
      </div>

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={handleMinimize}
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
            transition: "all 150ms ease",
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
          ─
        </button>
        <button
          onClick={handleClose}
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
            transition: "all 150ms ease",
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
          ✕
        </button>
      </div>
    </div>
  );
};