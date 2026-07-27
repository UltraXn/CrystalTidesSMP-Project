import React, { useState } from "react";

export interface CrashDiagnostic {
  exit_code: number;
  primary_cause: string;
  detailed_reason: string;
  offending_mod?: string;
  recommended_action: string;
  raw_snippet: string;
  timestamp: string;
}

interface CrashReporterModalProps {
  diagnostic: CrashDiagnostic;
  onClose: () => void;
  onAutoFix?: () => void;
}

export const CrashReporterModal: React.FC<CrashReporterModalProps> = ({
  diagnostic,
  onClose,
  onAutoFix,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const handleCopyReport = async () => {
    const text = `=== CRYSTALTIDES CRASH DIAGNOSTIC ===\nCode: ${diagnostic.exit_code}\nCause: ${diagnostic.primary_cause}\nReason: ${diagnostic.detailed_reason}\nMod: ${diagnostic.offending_mod || "N/A"}\nAction: ${diagnostic.recommended_action}\nTimestamp: ${diagnostic.timestamp}\n\n=== RAW SNIPPET ===\n${diagnostic.raw_snippet}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFixClick = () => {
    if (!onAutoFix) return;
    setIsFixing(true);
    setTimeout(() => {
      onAutoFix();
      setIsFixing(false);
    }, 1500);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(5, 8, 16, 0.88)",
      backdropFilter: "blur(14px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 580,
        background: "linear-gradient(180deg, #180D0E 0%, #0F0809 100%)",
        border: "1px solid rgba(239, 68, 68, 0.4)",
        borderRadius: 22,
        padding: "24px 28px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(239, 68, 68, 0.15)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}>
            🛠️
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#FFF" }}>
              AutoReparador de Crashes
            </h3>
            <span style={{ fontSize: 12, color: "#F87171", fontWeight: 700 }}>
              Código de Salida: {diagnostic.exit_code} (Fallo Detectado)
            </span>
          </div>
        </div>

        {/* Cause Box */}
        <div style={{
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          borderRadius: 12,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#FCA5A5" }}>
            ⚠️ {diagnostic.primary_cause}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.4 }}>
            {diagnostic.detailed_reason}
          </div>
          {diagnostic.offending_mod && (
            <div style={{ fontSize: 11, color: "#F87171", fontFamily: "monospace", marginTop: 4 }}>
              🧩 Archivo afectado: {diagnostic.offending_mod}
            </div>
          )}
        </div>

        {/* Recommended Action */}
        <div style={{
          background: "rgba(45, 212, 191, 0.08)",
          border: "1px solid rgba(45, 212, 191, 0.25)",
          borderRadius: 12,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#2DD4BF", textTransform: "uppercase", letterSpacing: 0.5 }}>
            💡 Solución Sugerida
          </div>
          <div style={{ fontSize: 12.5, color: "#FFF", fontWeight: 600 }}>
            {diagnostic.recommended_action}
          </div>
        </div>

        {/* Raw Log Preview */}
        <details style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", cursor: "pointer" }}>
          <summary style={{ fontWeight: 700, marginBottom: 6 }}>Ver fragmento técnico del crash log</summary>
          <pre style={{
            background: "#000",
            padding: 12,
            borderRadius: 8,
            maxHeight: 120,
            overflowY: "auto",
            fontSize: 10,
            color: "#CBD5E1",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            whiteSpace: "pre-wrap",
          }}>
            {diagnostic.raw_snippet}
          </pre>
        </details>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button
            onClick={handleCopyReport}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#FFF",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copied ? "✓ Copiado" : "Copiar Informe"}
          </button>
          
          <button
            onClick={onClose}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#FFF",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>

          {onAutoFix && (
            <button
              disabled={isFixing}
              onClick={handleFixClick}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                background: isFixing
                  ? "rgba(45, 212, 191, 0.3)"
                  : "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)",
                border: "none",
                color: "#052A26",
                fontSize: 12.5,
                fontWeight: 800,
                cursor: isFixing ? "wait" : "pointer",
                boxShadow: "0 4px 14px rgba(45, 212, 191, 0.3)",
              }}
            >
              {isFixing ? "Reparando..." : "⚡ Ejecutar Reparación Automática"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
