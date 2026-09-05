import React, { useState } from "react";
import { LauncherLegalModal, LegalTabType } from "./LauncherLegalModal";

interface LauncherLoginViewProps {
  onLoginMicrosoft?: () => void;
  onViewGithub?: () => void;
  onContinueAsGuest?: (username: string) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onStartDrag?: (e: React.MouseEvent) => void;
}

export const LauncherLoginView: React.FC<LauncherLoginViewProps> = ({
  onLoginMicrosoft,
  onViewGithub,
  onContinueAsGuest,
  onMinimize,
  onMaximize,
  onClose,
  onStartDrag,
}) => {
  const [authMode, setAuthMode] = useState<"microsoft" | "guest">("microsoft");
  const [guestUsername, setGuestUsername] = useState<string>("");
  const [guestError, setGuestError] = useState<string | null>(null);

  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<LegalTabType>("tos");

  const handleStartDrag = async (e: React.MouseEvent) => {
    if (e.button === 0) {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().startDragging();
      } catch {
        onStartDrag?.(e);
      }
    }
  };

  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch {
      onMinimize?.();
    }
  };

  const handleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().toggleMaximize();
    } catch {
      onMaximize?.();
    }
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch {
      onClose?.();
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = guestUsername.trim() || "Invitado";
    if (cleanNick.length < 3 || cleanNick.length > 16) {
      setGuestError("El nombre debe tener entre 3 y 16 caracteres.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanNick)) {
      setGuestError("Solo letras, números y guiones bajos (_).");
      return;
    }

    setGuestError(null);
    onContinueAsGuest?.(cleanNick);
  };

  const openLegalModal = (tab: LegalTabType) => {
    setLegalTab(tab);
    setShowLegalModal(true);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#050307",
        color: "#FFFFFF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* ── TOP FRAMELESS TITLEBAR (Absolute overlay across full width) ── */}
      <header
        data-tauri-drag-region
        onMouseDown={handleStartDrag}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          fontSize: 12,
          color: "rgba(255, 255, 255, 0.45)",
          zIndex: 50,
        }}
      >
        {/* Left Branding */}
        <div data-tauri-drag-region style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src="/logo.png"
              alt="Crystal Client Mascot"
              style={{
                width: 17,
                height: 17,
                objectFit: "contain",
                opacity: 0.75,
                filter: "drop-shadow(0 0 6px rgba(45, 212, 191, 0.3))",
              }}
            />
            <span style={{ fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.01em", fontSize: 13 }}>
              Crystal Client
            </span>
          </div>
          <span style={{ color: "rgba(255, 255, 255, 0.12)" }}>|</span>
          <span style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.45)" }}>Build 0.9.2</span>
        </div>

        {/* Right Window Controls */}
        <div
          className="titlebar-no-drag"
          onMouseDown={(e) => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", gap: 14, color: "rgba(255, 255, 255, 0.6)" }}
        >
          <button
            type="button"
            onClick={handleMinimize}
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
            onClick={handleMaximize}
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
            onClick={handleClose}
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
      </header>

      {/* ── 50/50 SPLIT CONTAINER ── */}
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* ── LEFT HALF: AUTH & SOCIAL COLUMN (50%) ── */}
        <div
          style={{
            width: "50%",
            height: "100%",
            backgroundColor: "#050307",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "44px 32px 32px 32px",
            boxSizing: "border-box",
            zIndex: 10,
          }}
        >
          {/* Main Auth Card Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 320,
              maxWidth: "100%",
            }}
          >
            {/* 1. Large Mascot Logo */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, transparent 70%)",
                  filter: "blur(12px)",
                  zIndex: 0,
                }}
              />
              <img
                src="/logo.png"
                alt="Crystal Client Logo"
                style={{
                  width: 72,
                  height: 72,
                  objectFit: "contain",
                  position: "relative",
                  zIndex: 1,
                  filter: "drop-shadow(0 0 18px rgba(45, 212, 191, 0.35))",
                }}
              />
            </div>

            {/* 2. Brand Name Heading */}
            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.025em",
                margin: "0 0 22px 0",
                lineHeight: 1.1,
              }}
            >
              Crystal Client
            </h1>

            {/* Embedded animation keyframes */}
            <style>{`
              @keyframes authModeGlide {
                0% {
                  opacity: 0;
                  transform: translateY(6px) scale(0.98);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}</style>

            {/* 3. Action Area: Seamless Dynamic Switching */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {authMode === "microsoft" ? (
                <div
                  key="microsoft-view"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    animation: "authModeGlide 220ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Primary Microsoft Button */}
                  <button
                    type="button"
                    onClick={onLoginMicrosoft}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: "#FFFFFF",
                      border: "none",
                      color: "#0F172A",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      boxShadow: "0 4px 18px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)",
                      transition: "all 160ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1.5px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 255, 255, 0.25), 0 2px 4px rgba(0, 0, 0, 0.3)";
                      e.currentTarget.style.backgroundColor = "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 18px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)";
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}>Log in with</span>
                    <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                    </svg>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A" }}>Microsoft</span>
                  </button>

                  {/* Secondary Guest Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("guest");
                      setGuestError(null);
                    }}
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#FFFFFF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 160ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.08)";
                      e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.3)";
                      e.currentTarget.style.color = "#2DD4BF";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.color = "#FFFFFF";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Iniciar como Invitado</span>
                  </button>

                  {/* Tertiary GitHub Button */}
                  <button
                    type="button"
                    onClick={onViewGithub || (() => window.open("https://github.com/UltraXn/CrystalTidesSMP-Project", "_blank"))}
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#FFFFFF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      transition: "all 160ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.07)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255, 255, 255, 0.8)" }}>View code</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>GitHub</span>
                  </button>
                </div>
              ) : (
                <form
                  key="guest-view"
                  onSubmit={handleGuestSubmit}
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    animation: "authModeGlide 220ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type="text"
                      value={guestUsername}
                      onChange={(e) => {
                        setGuestUsername(e.target.value);
                        setGuestError(null);
                      }}
                      placeholder="Nickname (ej. Player)"
                      maxLength={16}
                      autoFocus
                      style={{
                        width: "100%",
                        height: 46,
                        borderRadius: 12,
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        border: guestError
                          ? "1px solid #EF4444"
                          : "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#FFFFFF",
                        padding: "0 14px 0 38px",
                        fontSize: 13.5,
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "all 140ms ease",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.5)";
                        e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.04)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(45, 212, 191, 0.8)",
                        display: "flex",
                        pointerEvents: "none",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>

                  {guestError && (
                    <span style={{ fontSize: 11, color: "#EF4444", textAlign: "left" }}>
                      {guestError}
                    </span>
                  )}

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      height: 46,
                      borderRadius: 12,
                      background: "linear-gradient(180deg, #3ec5b6 0%, #1ea596 55%, #158b7e 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.22)",
                      color: "#FFFFFF",
                      fontSize: 13.5,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(20, 184, 166, 0.25)",
                      transition: "all 140ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = "brightness(1.06)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Entrar como Invitado
                  </button>

                  {/* Back to Microsoft */}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("microsoft");
                      setGuestError(null);
                    }}
                    style={{
                      width: "100%",
                      height: 34,
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.45)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      transition: "color 140ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.45)";
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Volver a inicio con Microsoft</span>
                  </button>
                </form>
              )}
            </div>

            {/* 4. Social Icons Row (5 Squircles) */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              {/* Discord */}
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                title="Discord"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255, 255, 255, 0.8)",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
                  e.currentTarget.style.color = "#2DD4BF";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                title="X (Twitter)"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255, 255, 255, 0.8)",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
                  e.currentTarget.style.color = "#2DD4BF";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                title="Instagram"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255, 255, 255, 0.8)",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
                  e.currentTarget.style.color = "#2DD4BF";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                title="YouTube"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255, 255, 255, 0.8)",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
                  e.currentTarget.style.color = "#2DD4BF";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Patreon */}
              <a
                href="https://patreon.com"
                target="_blank"
                rel="noreferrer"
                title="Patreon"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255, 255, 255, 0.8)",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
                  e.currentTarget.style.color = "#2DD4BF";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.82 2.41a8.59 8.59 0 0 0-8.58 8.58c0 4.74 3.84 8.58 8.58 8.58a8.59 8.59 0 0 0 8.58-8.58 8.59 8.59 0 0 0-8.58-8.58zM2.6 21.59h3.45V2.41H2.6v19.18z" />
                </svg>
              </a>
            </div>

            {/* 5. Legal & Support Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11.5,
                color: "rgba(255, 255, 255, 0.4)",
              }}
            >
              <span
                onClick={() => openLegalModal("privacy")}
                style={{ cursor: "pointer", transition: "color 120ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#2DD4BF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
              >
                Privacy Policy
              </span>
              <span>•</span>
              <span
                onClick={() => openLegalModal("tos")}
                style={{ cursor: "pointer", transition: "color 120ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#2DD4BF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
              >
                Terms of Service
              </span>
              <span>•</span>
              <span
                onClick={() => openLegalModal("support")}
                style={{ cursor: "pointer", transition: "color 120ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#2DD4BF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
              >
                Support
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT HALF: CRYSTAL TIDES WALLPAPER & AMBIENCE (50%) ── */}
        <div
          style={{
            width: "50%",
            height: "100%",
            position: "relative",
            background:
              new Date().getHours() >= 6 && new Date().getHours() < 19
                ? "url('/wallpapers/crystaltides_day.png') center/cover no-repeat"
                : "url('/wallpapers/crystaltides_night.png') center/cover no-repeat",
            overflow: "hidden",
            transition: "background 400ms ease",
          }}
        >
          {/* Subtle Left Vignette Fade from Void to Wallpaper */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "25%",
              background: "linear-gradient(90deg, #050307 0%, rgba(5, 3, 7, 0) 100%)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          {/* Top/Bottom Ambient Vignette */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(180deg, rgba(5, 3, 7, 0.4) 0%, transparent 25%, transparent 75%, rgba(5, 3, 7, 0.6) 100%)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          {/* Center 3D Monolith Altar Glow Accent */}
          <div
            style={{
              position: "absolute",
              bottom: "22%",
              left: "42%",
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(45, 212, 191, 0.28) 0%, transparent 70%)",
              filter: "blur(28px)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* ── LEGAL & POLICIES MODAL (TOS / Privacy / Support) ── */}
      <LauncherLegalModal
        isOpen={showLegalModal}
        initialTab={legalTab}
        onClose={() => setShowLegalModal(false)}
      />
    </div>
  );
};
