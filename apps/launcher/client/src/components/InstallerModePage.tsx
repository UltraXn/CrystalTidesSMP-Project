import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AmbientBubbles } from "./AmbientBubbles";
import { WindowTitleBar } from "./WindowTitleBar";

interface InstallerModePageProps {
  onFinish: () => void;
}

export const InstallerModePage: React.FC<InstallerModePageProps> = ({ onFinish }) => {
  const [step, setStep] = useState<"welcome" | "directory" | "installing" | "finish">("welcome");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<"terms" | "privacy" | null>(null);
  const [installPath, setInstallPath] = useState("");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparando sistema...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Resolve default install path
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

  const handleStartInstall = async () => {
    setStep("installing");
    setProgress(0.1);
    setStatusText("Verificando directorio de destino...");
    setErrorMessage(null);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProgress(0.35);
      setStatusText("Creando estructura de carpetas (~/.crystaltides)...");

      // Ensure target directory exists via Rust helper or write
      await invoke("write_text_file", {
        path: `${installPath}/.installed.json`,
        content: JSON.stringify({ installedAt: new Date().toISOString(), version: "0.1.0" }),
      });

      await new Promise((r) => setTimeout(r, 700));
      setProgress(0.65);
      setStatusText("Configurando librerías y perfiles oficiales...");

      await new Promise((r) => setTimeout(r, 800));
      setProgress(0.9);
      setStatusText("Generando accesos directos...");

      await new Promise((r) => setTimeout(r, 500));
      setProgress(1.0);
      setStatusText("¡Instalación completada con éxito!");
      setStep("finish");
    } catch (err: any) {
      setErrorMessage(err.message || String(err));
      setStatusText("Ocurrió un error durante la instalación.");
    }
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

      {/* Main Container */}
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
            width: 520,
            padding: "32px 36px",
            backgroundColor: "rgba(13, 17, 23, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(45, 212, 191, 0.25)",
            borderRadius: 20,
            boxShadow: "0 20px 48px rgba(0,0,0,0.6), 0 0 30px rgba(45, 212, 191, 0.12)",
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
              border: "1.5px solid rgba(45, 212, 191, 0.35)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
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
            {step === "finish" ? "¡Instalación Completada!" : "Instalador de CrystalTides Launcher"}
          </h2>
          <p style={{ margin: "6px 0 20px 0", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
            {step === "welcome" && "Bienvenido a la experiencia oficial del cliente CrystalTidesSMP."}
            {step === "directory" && "Selecciona la carpeta de destino para guardar los archivos."}
            {step === "installing" && statusText}
            {step === "finish" && "El entorno está listo para sumergirte en el servidor."}
          </p>

          {/* PASO 1: Bienvenida y Legal */}
          {step === "welcome" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", textAlign: "left" }}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.5,
                }}
              >
                Este asistente instalará <strong>CrystalTides Launcher</strong> en tu equipo. Obtendrás sincronización automática de mods, perfiles aislados y acceso seguro al servidor.
              </div>

              {/* Checkbox Términos */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="terms-check"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#2DD4BF", cursor: "pointer" }}
                />
                <label htmlFor="terms-check" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.4, cursor: "pointer" }}>
                  Acepto los{" "}
                  <span
                    onClick={(e) => { e.preventDefault(); setShowTermsModal("terms"); }}
                    style={{ color: "#2DD4BF", textDecoration: "underline", fontWeight: 600 }}
                  >
                    Términos de Servicio
                  </span>{" "}
                  y la{" "}
                  <span
                    onClick={(e) => { e.preventDefault(); setShowTermsModal("privacy"); }}
                    style={{ color: "#2DD4BF", textDecoration: "underline", fontWeight: 600 }}
                  >
                    Política de Privacidad
                  </span>{" "}
                  de CrystalTidesSMP.
                </label>
              </div>

              <button
                disabled={!acceptedTerms}
                onClick={() => setStep("directory")}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: "11px 0",
                  borderRadius: 10,
                  border: "none",
                  background: acceptedTerms
                    ? "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: acceptedTerms ? "#0B0D14" : "rgba(255, 255, 255, 0.3)",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  cursor: acceptedTerms ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  boxShadow: acceptedTerms ? "0 4px 16px rgba(45, 212, 191, 0.3)" : "none",
                }}
              >
                CONTINUAR ➔
              </button>
            </div>
          )}

          {/* PASO 2: Directorio de Instalación */}
          {step === "directory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", textAlign: "left" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
                  📁 Carpeta de Instalación
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={installPath}
                    onChange={(e) => setInstallPath(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: "#FFF",
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  />
                </div>
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>
                  Ruta recomendada para aislar los mods de tu .minecraft habitual.
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => setStep("welcome")}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ATRÁS
                </button>
                <button
                  onClick={handleStartInstall}
                  style={{
                    flex: 2,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)",
                    color: "#0B0D14",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(45, 212, 191, 0.3)",
                  }}
                >
                  INSTALAR AHORA
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Progreso de Instalación */}
          {step === "installing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
              <div
                style={{
                  width: "100%",
                  height: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 999,
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, progress * 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #2DD4BF 0%, #5EEAD4 100%)",
                    borderRadius: 999,
                    transition: "width 0.3s ease",
                    boxShadow: "0 0 12px rgba(45, 212, 191, 0.6)",
                  }}
                />
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {Math.round(progress * 100)}% completado
              </span>
              {errorMessage && (
                <div style={{ color: "#EF4444", fontSize: 12, marginTop: 8 }}>
                  ⚠️ Error: {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* PASO 4: Finalizado */}
          {step === "finish" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
              <button
                onClick={onFinish}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)",
                  color: "#0B0D14",
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(45, 212, 191, 0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                🚀 INICIAR LAUNCHER
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legal Modal Overlay */}
      {showTermsModal && (
        <div
          onClick={() => setShowTermsModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 500,
              maxHeight: "75vh",
              backgroundColor: "rgba(13, 17, 23, 0.95)",
              border: "1px solid rgba(45, 212, 191, 0.3)",
              borderRadius: 16,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#2DD4BF" }}>
                {showTermsModal === "terms" ? "📜 Términos de Servicio" : "🔒 Política de Privacidad"}
              </h3>
              <button
                onClick={() => setShowTermsModal(null)}
                style={{ background: "none", border: "none", color: "#FFF", fontSize: 16, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.5,
                overflowY: "auto",
                maxHeight: "55vh",
                paddingRight: 8,
              }}
            >
              {showTermsModal === "terms" ? (
                <div>
                  <p><strong>1. CÓDIGO Y COMUNIDAD:</strong> CrystalTidesSMP Launcher es un cliente dedicado para acceder a nuestra red de servidores.</p>
                  <p><strong>2. NO AFILIACIÓN CON MOJANG:</strong> Este proyecto NO es oficial de Mojang AB ni Microsoft Corporation.</p>
                  <p><strong>3. REGLAS DEL SERVIDOR:</strong> Queda prohibido el uso de hacks, cheats o clientes modificados que otorguen ventajas desleales.</p>
                  <p><strong>4. RESPONSABILIDAD:</strong> El cliente se proporciona tal cual, sin garantías explícitas sobre datos locales.</p>
                </div>
              ) : (
                <div>
                  <p><strong>DATOS RECOPILADOS:</strong> Exclusivamente UUID de Minecraft, sesión autenticada y versión del cliente para validar el ingreso al servidor.</p>
                  <p><strong>PROTECCIÓN DE DATOS:</strong> No vendemos ni compartimos información con terceros.</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowTermsModal(null)}
              style={{
                alignSelf: "flex-end",
                backgroundColor: "rgba(45, 212, 191, 0.2)",
                border: "1px solid #2DD4BF",
                color: "#2DD4BF",
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
