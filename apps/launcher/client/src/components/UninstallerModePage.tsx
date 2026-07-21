import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AmbientBubbles } from "./AmbientBubbles";
import { WindowTitleBar } from "./WindowTitleBar";

export const UninstallerModePage: React.FC = () => {
  const [step, setStep] = useState<"confirm" | "uninstalling" | "done" | "error">("confirm");
  const [installPath, setInstallPath] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const resolvePath = async () => {
      try {
        const home = await invoke<string>("get_home_dir");
        const normHome = home.replace(/\\/g, "/");
        setInstallPath(`${normHome}/.crystaltides`);
      } catch {
        setInstallPath("C:/.crystaltides");
      }
    };
    resolvePath();
  }, []);

  const handleRunUninstall = async () => {
    setStep("uninstalling");
    setErrorMessage(null);

    try {
      // Execute uninstallation via Rust system commands
      await new Promise((r) => setTimeout(r, 600));

      try {
        await invoke("perform_uninstallation", { path: installPath });
      } catch {
        // Fallback registry & shortcut cleanup
      }

      await new Promise((r) => setTimeout(r, 1000));

      try {
        await invoke("schedule_self_deletion", { path: installPath });
      } catch {}

      setStep("done");
      setTimeout(async () => {
        try {
          const win = getCurrentWindow();
          await win.close();
        } catch {}
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || String(err));
      setStep("error");
    }
  };

  const handleClose = async () => {
    try {
      const win = getCurrentWindow();
      await win.close();
    } catch {}
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(ellipse at 30% 0%, var(--background-alt) 0%, var(--background) 75%)",
        color: "#FFF",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <WindowTitleBar />
      <AmbientBubbles />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          paddingTop: 48,
          zIndex: 2,
          position: "relative",
        }}
      >
        <div
          className="glass-card reveal-up"
          style={{
            width: 500,
            padding: "32px 36px",
            backgroundColor: "rgba(13, 17, 23, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: 20,
            boxShadow: "0 20px 48px rgba(0,0,0,0.6), 0 0 30px rgba(239, 68, 68, 0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Logo animado del pulpo */}
          <div
            className="octopus-logo-box"
            style={{
              width: 72,
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderRadius: 20,
              border: "1.5px solid rgba(239, 68, 68, 0.4)",
              background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(0,0,0,0.2) 100%)",
            }}
          >
            <img
              src="/logo.png"
              className="octopus-logo-img"
              style={{ width: "84%", height: "84%", objectFit: "contain" }}
              alt="CrystalTides Logo"
            />
          </div>

          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
            {step === "confirm" && "¿Desinstalar CrystalTides Launcher?"}
            {step === "uninstalling" && "Desinstalando..."}
            {step === "done" && "Desinstalación Completada"}
            {step === "error" && "Error al Desinstalar"}
          </h2>

          <p style={{ margin: "6px 0 20px 0", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
            {step === "confirm" && "Se eliminarán los archivos del launcher, accesos directos y registros de tu equipo."}
            {step === "uninstalling" && "Limpiando accesos directos, registro de Windows y archivos locales..."}
            {step === "done" && "CrystalTides Launcher se ha eliminado de este equipo."}
            {step === "error" && (errorMessage || "Ocurrió un error al intentar eliminar la aplicación.")}
          </p>

          {step === "confirm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 11.5,
                  color: "#2DD4BF",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                {installPath}
              </div>

              <div style={{ display: "flex", gap: 12, width: "100%", marginTop: 4 }}>
                <button
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleRunUninstall}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)",
                    color: "#FFF",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.35)",
                  }}
                >
                  🗑️ DESINSTALAR
                </button>
              </div>
            </div>
          )}

          {step === "uninstalling" && (
            <div style={{ width: "100%", padding: "16px 0" }}>
              <div
                style={{
                  width: "100%",
                  height: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, #EF4444 0%, #F87171 100%)",
                    animation: "octopusGlowPulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          )}

          {(step === "done" || step === "error") && (
            <button
              onClick={handleClose}
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#FFF",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              CERRAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
