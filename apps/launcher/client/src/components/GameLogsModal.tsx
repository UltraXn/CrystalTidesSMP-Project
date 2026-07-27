import React, { useState, useMemo } from "react";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
}

interface GameLogsModalProps {
  logs: LogEntry[];
  onClose: () => void;
  onClearLogs?: () => void;
}

export const GameLogsModal: React.FC<GameLogsModalProps> = ({
  logs,
  onClose,
  onClearLogs,
}) => {
  const [filterLevel, setFilterLevel] = useState<"ALL" | "INFO" | "WARN" | "ERROR">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterLevel !== "ALL" && log.level !== filterLevel) return false;
      if (searchQuery.trim()) {
        return log.message.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [logs, filterLevel, searchQuery]);

  const handleCopy = async () => {
    const rawText = logs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join("\n");
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy logs:", e);
    }
  };

  const levelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "ERROR": return "#F87171";
      case "WARN": return "#FBBF24";
      case "DEBUG": return "#A7F3D0";
      default: return "#94A3B8";
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9990,
      background: "rgba(5, 8, 16, 0.85)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 820,
        height: "80vh",
        background: "#0B1120",
        border: "1px solid rgba(45, 212, 191, 0.25)",
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 30px rgba(45, 212, 191, 0.1)",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 22px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(15, 23, 42, 0.6)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📜</span>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#FFF" }}>
              Consola y Registros de Minecraft
            </h3>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(45, 212, 191, 0.15)",
              color: "#2DD4BF",
              border: "1px solid rgba(45, 212, 191, 0.3)",
            }}>
              {filteredLogs.length} líneas
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: 18,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>

        {/* Toolbar: Filter & Search */}
        <div style={{
          padding: "10px 18px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "rgba(0, 0, 0, 0.2)",
        }}>
          {/* Level Filter Buttons */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["ALL", "INFO", "WARN", "ERROR"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: filterLevel === lvl ? "1px solid #2DD4BF" : "1px solid rgba(255, 255, 255, 0.1)",
                  background: filterLevel === lvl ? "rgba(45, 212, 191, 0.2)" : "rgba(255, 255, 255, 0.04)",
                  color: filterLevel === lvl ? "#2DD4BF" : "rgba(255, 255, 255, 0.6)",
                  cursor: "pointer",
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search box & Copy */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFF",
                fontSize: 11,
                outline: "none",
                width: 180,
              }}
            />
            {onClearLogs && (
              <button
                onClick={onClearLogs}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Limpiar
              </button>
            )}
            <button
              onClick={handleCopy}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: copied ? "rgba(52, 211, 153, 0.2)" : "rgba(45, 212, 191, 0.15)",
                border: copied ? "1px solid #34D399" : "1px solid rgba(45, 212, 191, 0.3)",
                color: copied ? "#34D399" : "#2DD4BF",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {copied ? "✓ Copiado" : "Copiar Logs"}
            </button>
          </div>
        </div>

        {/* Logs Terminal Window */}
        <div style={{
          flex: 1,
          padding: 16,
          overflowY: "auto",
          fontFamily: "'Fira Code', 'Consolas', monospace",
          fontSize: 11.5,
          lineHeight: 1.5,
          background: "#060A12",
          color: "#E2E8F0",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>
          {filteredLogs.length === 0 ? (
            <div style={{ color: "rgba(255, 255, 255, 0.3)", textAlign: "center", marginTop: 40 }}>
              No hay logs registrados por el momento.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} style={{ display: "flex", gap: 10, wordBreak: "break-word" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.35)", userSelect: "none" }}>[{log.timestamp}]</span>
                <span style={{ color: levelColor(log.level), fontWeight: 700, minWidth: 50 }}>[{log.level}]</span>
                <span style={{ flex: 1 }}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
