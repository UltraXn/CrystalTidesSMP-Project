import React, { useState } from "react";
import { AlertTriangle, RefreshCw, Copy, FileText, Check, X } from "lucide-react";

export const CrashModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRelaunch: () => void;
}> = ({ isOpen, onClose, onRelaunch }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleLog = `[18:42:01] [main/INFO]: Loading Minecraft 1.21.3 with Fabric Loader 0.15.7
[18:42:03] [main/ERROR]: Fatal error occurred during early initialization:
org.spongepowered.asm.mixin.transformer.throwables.MixinTransformerError: An unexpected critical error was encountered
Caused by: java.lang.NoSuchMethodError: 'net.minecraft.class_1937 net.minecraft.class_3218.method_8402()'
Suspected Cause: Lithium (lithium-fabric-mc1.21.3-0.12.2.jar)
Exit Code: 255`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleLog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crash-modal-title"
        style={{
          width: "100%",
          maxWidth: 480,
          backgroundColor: "#0d0914",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          borderRadius: 20,
          padding: "24px 28px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(239, 68, 68, 0.2)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          aria-label="Cerrar reporte de fallo"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
          }}
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Warning Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            color: "#EF4444",
          }}
        >
          <AlertTriangle size={28} aria-hidden="true" />
        </div>

        <h2 id="crash-modal-title" style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900, color: "#FFFFFF" }}>
          Cierre Inesperado Detectado
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.4 }}>
          El servidor interno o un mod ha generado un error fatal al actualizar una entidad de bloque. (Exit Code: 255)
        </p>

        {/* Suspected Cause Badge */}
        <div
          style={{
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 18,
            textAlign: "left",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "rgba(255, 255, 255, 0.4)", marginBottom: 3 }}>
            Causa Sospechosa
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", fontFamily: "monospace" }}>
            📦 Lithium (lithium-fabric-mc1.21.3-0.12.2.jar)
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onRelaunch();
            }}
            style={{
              width: "100%",
              padding: "10px 16px",
              backgroundColor: "#2dd4bf",
              color: "#022c22",
              border: "none",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(45, 212, 191, 0.3)",
            }}
          >
            <RefreshCw size={15} aria-hidden="true" /> Reiniciar Juego
          </button>

          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button
              type="button"
              aria-label="Copiar registro de fallo al portapapeles"
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 10,
                color: "#FFF",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {copied ? <Check size={14} aria-hidden="true" color="#2dd4bf" /> : <Copy size={14} aria-hidden="true" />}
              {copied ? "Copiado" : "Copiar Crash Log"}
            </button>

            <button
              type="button"
              aria-label="Ver carpeta de registros de logs"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 10,
                color: "#FFF",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <FileText size={14} aria-hidden="true" /> Ver Carpeta de Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
