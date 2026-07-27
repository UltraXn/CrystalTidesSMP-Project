import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AmbientBubbles } from "./components/AmbientBubbles";
import { WindowTitleBar } from "./components/WindowTitleBar";
import "./index.css";

export function App() {
  const [step, setStep] = useState<"welcome" | "directory" | "installing" | "finish">("welcome");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<"terms" | "privacy" | null>(null);
  const [installPath, setInstallPath] = useState("");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparando entorno...");
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

  const handleStartInstall = async () => {
    setStep("installing");
    setProgress(0.12);
    setStatusText("Verificando dependencias y espacio en disco...");
    setErrorMessage(null);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProgress(0.4);
      setStatusText("Creando estructura aislada (~/.crystaltides)...");

      await invoke("install_app", { targetDir: installPath });

      setProgress(0.8);
      setStatusText("Generando accesos directos y entradas de Windows...");

      await new Promise((r) => setTimeout(r, 700));
      setProgress(1.0);
      setStatusText("¡Entorno configurado y listo para jugar!");
      setStep("finish");
    } catch (err: any) {
      setErrorMessage(err.message || String(err));
      setStatusText("Error durante el proceso de instalación.");
    }
  };

  const handleLaunchApp = async () => {
    try {
      await invoke("launch_launcher", { installDir: installPath });
      try {
        await invoke("close_app");
      } catch {
        try {
          const win = getCurrentWindow();
          await win.close();
        } catch {}
      }
    } catch {
      alert("No se pudo iniciar el Launcher. Verifica la instalación.");
    }
  };

  const getStepIndex = () => {
    switch (step) {
      case "welcome": return 1;
      case "directory": return 2;
      case "installing": return 3;
      case "finish": return 4;
    }
  };

  const currentStepNum = getStepIndex();

  return (
    <div
      className="titlebar-drag-region"
      data-tauri-drag-region
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(ellipse at 50% -10%, var(--background-alt) 0%, var(--background) 80%)",
        color: "#FFF",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <WindowTitleBar />
      <AmbientBubbles />

      <div
        className="titlebar-drag-region"
        data-tauri-drag-region
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          paddingTop: 40,
          zIndex: 2,
          position: "relative",
        }}
      >
        <div
          className="glass-card titlebar-no-drag"
          style={{
            width: 520,
            padding: "26px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Stepper Nav */}
          <div className="stepper-nav" style={{ marginBottom: 14 }}>
            <div className={`stepper-step ${currentStepNum === 1 ? "active" : currentStepNum > 1 ? "completed" : ""}`}>
              <span>{currentStepNum > 1 ? "✓" : "1"}</span> Inicio
            </div>
            <div className="stepper-divider" />
            <div className={`stepper-step ${currentStepNum === 2 ? "active" : currentStepNum > 2 ? "completed" : ""}`}>
              <span>{currentStepNum > 2 ? "✓" : "2"}</span> Ruta
            </div>
            <div className="stepper-divider" />
            <div className={`stepper-step ${currentStepNum === 3 ? "active" : currentStepNum > 3 ? "completed" : ""}`}>
              <span>{currentStepNum > 3 ? "✓" : "3"}</span> Instalación
            </div>
            <div className="stepper-divider" />
            <div className={`stepper-step ${currentStepNum === 4 ? "active" : ""}`}>
              <span>4</span> Listo
            </div>
          </div>

          {/* Version Badge */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#2DD4BF",
              textTransform: "uppercase",
              background: "rgba(45, 212, 191, 0.12)",
              padding: "3px 12px",
              borderRadius: 20,
              border: "1px solid rgba(45, 212, 191, 0.3)",
              marginBottom: 12,
              boxShadow: "0 0 16px rgba(45, 212, 191, 0.15)",
            }}
          >
            CrystalTides SMP • Asistente Oficial
          </span>

          {/* Logo animado del pulpo */}
          <div
            className="octopus-logo-box"
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              borderRadius: 18,
              border: "1.5px solid rgba(45, 212, 191, 0.4)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(45,212,191,0.03) 100%)",
            }}
          >
            <img
              src="/logo.png"
              className="octopus-logo-img"
              style={{ width: "82%", height: "82%", objectFit: "contain" }}
              alt="CrystalTides Logo"
            />
          </div>

          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#F8FAFC" }}>
            {step === "welcome" && "Instalar CrystalTides Launcher"}
            {step === "directory" && "Ubicación del Cliente"}
            {step === "installing" && "Configurando el Entorno"}
            {step === "finish" && "¡Instalación Completada!"}
          </h2>
          <p style={{ margin: "4px 0 16px 0", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.45, maxWidth: 440 }}>
            {step === "welcome" && "Bienvenido a la experiencia oficial del servidor. Prepárate para ingresar en segundos."}
            {step === "directory" && "Selecciona la carpeta en tu sistema donde se guardarán los archivos y mods."}
            {step === "installing" && statusText}
            {step === "finish" && "Todo está listo. Puedes iniciar el launcher ahora y sumergirte en el servidor."}
          </p>

          {/* PASO 1: Bienvenida y Legal */}
          {step === "welcome" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", textAlign: "left" }}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                  <span style={{ color: "#2DD4BF", fontSize: 14 }}>✦</span> Sincronización automática de mods y recursos
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                  <span style={{ color: "#2DD4BF", fontSize: 14 }}>✦</span> Perfiles independientes sin alterar tu .minecraft
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                  <span style={{ color: "#2DD4BF", fontSize: 14 }}>✦</span> Rendimiento optimizado e integración nativa
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: acceptedTerms ? "rgba(45, 212, 191, 0.06)" : "rgba(255, 255, 255, 0.02)",
                  border: `1px solid ${acceptedTerms ? "rgba(45, 212, 191, 0.25)" : "rgba(255, 255, 255, 0.06)"}`,
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="checkbox"
                  id="terms-check"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#2DD4BF", cursor: "pointer", width: 16, height: 16 }}
                />
                <label htmlFor="terms-check" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.45, cursor: "pointer" }}>
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
                  </span>.
                </label>
              </div>

              <button
                disabled={!acceptedTerms}
                onClick={() => setStep("directory")}
                className="btn-primary"
                style={{ marginTop: 4 }}
              >
                CONTINUAR ➔
              </button>
            </div>
          )}

          {/* PASO 2: Directorio de Instalación */}
          {step === "directory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", textAlign: "left" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    📁 Carpeta de Instalación
                  </label>
                  <span style={{ fontSize: 10.5, color: "rgba(45, 212, 191, 0.8)", fontWeight: 600 }}>
                    ~150 MB Libres
                  </span>
                </div>
                <input
                  type="text"
                  value={installPath}
                  onChange={(e) => setInstallPath(e.target.value)}
                  className="installer-input"
                />
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                  💡 Se creará una carpeta dedicada para asegurar la aislación de archivos.
                </span>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setStep("welcome")}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  ← ATRÁS
                </button>
                <button
                  onClick={handleStartInstall}
                  className="btn-primary"
                  style={{ flex: 2 }}
                >
                  INSTALAR AHORA 🚀
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Progreso de Instalación */}
          {step === "installing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
              <div
                style={{
                  width: "100%",
                  height: 12,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: 999,
                  overflow: "hidden",
                  border: "1px solid rgba(45, 212, 191, 0.25)",
                  padding: 2,
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="progress-glow-bar"
                  style={{
                    width: `${Math.min(100, progress * 100)}%`,
                    height: "100%",
                    background: "var(--accent-gradient)",
                    borderRadius: 999,
                    transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: "0 0 16px rgba(45, 212, 191, 0.7)",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                <span style={{ color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#2DD4BF", boxShadow: "0 0 8px #2DD4BF" }} />
                  {statusText}
                </span>
                <span style={{ fontWeight: 800, color: "#2DD4BF", fontFamily: "monospace" }}>
                  {Math.round(progress * 100)}%
                </span>
              </div>

              {errorMessage && (
                <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4, background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
                  ⚠️ Error: {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* PASO 4: Finalizado */}
          {step === "finish" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
              <div
                style={{
                  backgroundColor: "rgba(45, 212, 191, 0.08)",
                  border: "1px solid rgba(45, 212, 191, 0.25)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.5,
                }}
              >
                🎉 Se ha creado un acceso directo en tu <strong>Escritorio</strong> y en el <strong>Menú de Inicio</strong>.
              </div>

              <button
                onClick={handleLaunchApp}
                className="btn-primary"
                style={{ padding: "15px 20px", fontSize: 14 }}
              >
                🚀 INICIAR LAUNCHER
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Legal */}
      {showTermsModal && (
        <div
          onClick={() => setShowTermsModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(3, 7, 18, 0.82)",
            backdropFilter: "blur(12px)",
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
              backgroundColor: "rgba(10, 15, 26, 0.95)",
              border: "1px solid rgba(45, 212, 191, 0.35)",
              borderRadius: 20,
              padding: 26,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxShadow: "0 24px 60px rgba(0,0,0,0.9), 0 0 30px rgba(45,212,191,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 17, color: "#2DD4BF", fontWeight: 700 }}>
                {showTermsModal === "terms" ? "📜 Términos de Servicio" : "🔒 Política de Privacidad"}
              </h3>
              <button
                onClick={() => setShowTermsModal(null)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.6,
                overflowY: "auto",
                maxHeight: "55vh",
                paddingRight: 8,
              }}
            >
              {showTermsModal === "terms" ? (
                <div>
                  <p><strong>1. CLIENTE OFICIAL:</strong> CrystalTidesSMP Launcher es el software cliente exclusivo para ingresar al servidor.</p>
                  <p><strong>2. NO AFILIADO:</strong> Este cliente no está afiliado con Mojang AB ni Microsoft.</p>
                  <p><strong>3. CONVIVENCIA:</strong> Queda prohibido el uso de hacks, exploits o cualquier ventaja injusta.</p>
                </div>
              ) : (
                <div>
                  <p><strong>PRIVACIDAD:</strong> Se resguardan únicamente credenciales de sesión y parámetros locales del servidor.</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowTermsModal(null)}
              className="btn-secondary"
              style={{ alignSelf: "flex-end", padding: "8px 20px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
