import React, { useState, useEffect } from "react";
import { CrystalCard } from "./CrystalCard";
import { CrystalPageHeader } from "./CrystalPageHeader";
import { getLogs, clearLogs, getLogText, type LogEntry } from "./mockLauncherState";

const levelColor = (level: string): string => {
  switch (level) {
    case "error": return "#FF6B6B";
    case "warn": return "#FFD93D";
    case "debug": return "#6EC6FF";
    default: return "rgba(255,255,255,0.7)";
  }
};

const handleCopy = () => {
  navigator.clipboard.writeText(getLogText());
};

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const refresh = () => setLogs(getLogs());

  useEffect(() => { refresh(); }, []);

  const handleClear = () => {
    clearLogs();
    refresh();
  };

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <CrystalPageHeader
        eyebrow="Diagnóstico"
        title="Registros del Launcher"
        trailing={
          <div style={{ display: "flex", gap: 8 }}>
            <button aria-label="Action" type="button"
              onClick={refresh}
              style={{
                background: "none",
                border: "1px solid var(--border-low)",
                color: "var(--accent)",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              🔄
            </button>
            <button aria-label="Action" type="button"
              onClick={handleCopy}
              style={{
                background: "none",
                border: "1px solid var(--border-low)",
                color: "var(--accent)",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              📋 Copiar
            </button>
            <button aria-label="Action" type="button"
              onClick={handleClear}
              style={{
                background: "none",
                border: "1px solid var(--danger)",
                color: "var(--danger)",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              🗑️ Limpiar
            </button>
          </div>
        }
      />

      <CrystalCard style={{ flex: 1, marginTop: 24, padding: 0, overflow: "hidden" }} enableHoverEffect={false}>
        <div style={{
          height: "100%",
          overflowY: "auto",
          padding: 16,
          fontFamily: "monospace",
          fontSize: 12,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.7)",
        }}>
          {logs.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", paddingTop: 40 }}>
              No hay registros disponibles.
            </p>
          ) : (
            logs.map((entry) => (
              <div key={`${entry.timestamp}-${entry.level}-${entry.message}`} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.3)", minWidth: 170, flexShrink: 0 }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span style={{ color: levelColor(entry.level), minWidth: 50, fontWeight: "bold" }}>
                  {entry.level.toUpperCase()}
                </span>
                {entry.category && (
                  <span style={{ color: "var(--accent)", minWidth: 80 }}>
                    [{entry.category}]
                  </span>
                )}
                <span>{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </CrystalCard>
    </div>
  );
};
