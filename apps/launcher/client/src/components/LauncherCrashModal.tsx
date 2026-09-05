import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface CrashDiagnostic {
  exit_code: number;
  primary_cause: string;
  detailed_reason: string;
  offending_mod: string | null;
  recommended_action: string;
  raw_snippet: string;
  timestamp: string;
}

interface LauncherCrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRelaunch?: () => void;
  exitCode?: number;
  gameDir?: string;
}

export const LauncherCrashModal: React.FC<LauncherCrashModalProps> = ({
  isOpen,
  onClose,
  onRelaunch,
  exitCode = 255,
  gameDir,
}) => {
  const [copied, setCopied] = useState(false);
  const [diagnostic, setDiagnostic] = useState<CrashDiagnostic | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDiagnostic = async () => {
      try {
        const homeDir = await invoke<string | null>("get_home_dir");
        const gDir = gameDir || (homeDir ? `${homeDir.replace(/\\/g, "/")}/.crystaltides` : "");
        if (gDir) {
          const diag = await invoke<CrashDiagnostic>("analyze_game_crash", {
            gameDir: gDir,
            exitCode,
          });
          if (isMounted && diag) {
            setDiagnostic(diag);
          }
        }
      } catch (err) {
        console.warn("Could not analyze crash:", err);
      }
    };

    if (isOpen) {
      fetchDiagnostic();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, exitCode, gameDir]);

  if (!isOpen) return null;

  const errorMessage =
    diagnostic?.detailed_reason ||
    "The internal server encountered an error while starting or updating game assets.";
  const suspectedMod =
    diagnostic?.offending_mod ||
    "Lithium (lithium-fabric-mc1.21.3-0.12.2.jar)";
  const crashLogText =
    diagnostic?.raw_snippet ||
    `---- Minecraft Crash Report ----\nExit Code: ${exitCode}\nTimestamp: ${new Date().toISOString()}\nReason: ${errorMessage}`;

  const handleCopyLog = () => {
    navigator.clipboard.writeText(crashLogText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 460,
          backgroundColor: "#07060A",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          borderRadius: 20,
          boxShadow: "0 0 48px rgba(239, 68, 68, 0.2), 0 24px 64px rgba(0, 0, 0, 0.85)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 28px 24px 28px",
          boxSizing: "border-box",
          position: "relative",
          textAlign: "center",
        }}
      >
        {/* Top Close 'X' Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
            display: "flex",
            padding: 4,
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 1. Red Glowing Fatal Error Crystal Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            boxShadow: "0 0 32px rgba(239, 68, 68, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(239, 68, 68, 0.25)"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 2. Title & Error message */}
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", margin: "0 0 8px 0", letterSpacing: "-0.01em" }}>
          Game Crash Detected
        </h2>
        <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)", margin: "0 0 20px 0", lineHeight: 1.45, maxWidth: 380 }}>
          {errorMessage}
        </p>

        {/* 3. Suspected Cause Card */}
        <div
          style={{
            width: "100%",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: 12,
            padding: "12px 14px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 4,
            marginBottom: 22,
          }}
        >
          <span style={{ fontSize: 9.5, fontWeight: 800, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            SUSPECTED CAUSE
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", wordBreak: "break-all", textAlign: "left" }}>
            {suspectedMod}
          </span>
        </div>

        {/* 4. Action Buttons (Relaunch & Copy Log) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onRelaunch?.();
            }}
            style={{
              width: "100%",
              height: 42,
              borderRadius: 10,
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              color: "#EF4444",
              fontSize: 12.5,
              fontWeight: 900,
              letterSpacing: "0.04em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
            }}
          >
            <span>RELAUNCH GAME</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLog}
            style={{
              width: "100%",
              height: 38,
              borderRadius: 10,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: copied ? "#2DD4BF" : "rgba(255, 255, 255, 0.75)",
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 150ms ease",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            <span>{copied ? "Log Copied to Clipboard!" : "Copy Crash Log"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
