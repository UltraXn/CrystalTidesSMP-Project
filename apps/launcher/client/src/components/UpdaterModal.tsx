import React, { useState } from "react";
import { Update } from "@tauri-apps/plugin-updater";
import { downloadAndApplyUpdate } from "../services/updateService";

interface UpdaterModalProps {
  version: string;
  notes?: string;
  updateObj: Update;
  onClose: () => void;
}

export const UpdaterModal: React.FC<UpdaterModalProps> = ({
  version,
  notes,
  updateObj,
  onClose,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await downloadAndApplyUpdate(updateObj, (downloaded, total) => {
        if (total && total > 0) {
          setProgress(Math.round((downloaded / total) * 100));
        } else {
          setProgress((prev) => Math.min(prev + 5, 95));
        }
      });
    } catch (err: unknown) {
      console.error("Update failed:", err);
      const msg = err instanceof Error ? err.message : "Error al actualizar la aplicación";
      setError(msg);
      setIsUpdating(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(5, 8, 16, 0.85)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 440,
        background: "linear-gradient(180deg, #0F172A 0%, #0A0F1D 100%)",
        border: "1px solid rgba(45, 212, 191, 0.3)",
        borderRadius: 20,
        padding: "24px 28px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.15)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(45, 212, 191, 0.15)",
            border: "1px solid rgba(45, 212, 191, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}>
            🚀
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#FFF" }}>
              Nueva Actualización Disponible
            </h3>
            <span style={{ fontSize: 12, color: "#2DD4BF", fontWeight: 600 }}>
              Versión {version}
            </span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div style={{
            maxHeight: 120,
            overflowY: "auto",
            padding: 12,
            borderRadius: 10,
            background: "rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: 12,
            color: "rgba(255, 255, 255, 0.75)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.4,
          }}>
            {notes}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ fontSize: 12, color: "#F87171", background: "rgba(239, 68, 68, 0.1)", padding: 10, borderRadius: 8 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Progress Bar */}
        {isUpdating && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255, 255, 255, 0.6)" }}>
              <span>Descargando e instalando...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: 6, width: "100%", background: "rgba(255, 255, 255, 0.1)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #2DD4BF, #0D9488)",
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {!isUpdating && (
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#FFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Más tarde
            </button>
          )}
          <button
            disabled={isUpdating}
            onClick={handleUpdate}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              background: isUpdating
                ? "rgba(45, 212, 191, 0.3)"
                : "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)",
              border: "none",
              color: "#052A26",
              fontSize: 13,
              fontWeight: 800,
              cursor: isUpdating ? "wait" : "pointer",
              boxShadow: "0 4px 14px rgba(45, 212, 191, 0.3)",
            }}
          >
            {isUpdating ? "Actualizando..." : "Actualizar Ahora"}
          </button>
        </div>
      </div>
    </div>
  );
};
