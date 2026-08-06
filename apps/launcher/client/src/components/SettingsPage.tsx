import React, { useState } from "react";
import { CrystalCard } from "./CrystalCard";
import { CrystalButton } from "./CrystalButton";
import { CrystalPageHeader } from "./CrystalPageHeader";
import { getSettings, saveSettings, type LauncherSettings } from "../services/settingsService";
import { useAuth } from "../services/authContext";
import { RoleBadge } from "./RoleBadge";

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<LauncherSettings>(getSettings());
  const [tempMaxRam, setTempMaxRam] = useState(settings.maxRam / 1024);
  const [javaPath, setJavaPath] = useState(settings.javaPath || "");
  const [width, setWidth] = useState(settings.width || 1280);
  const [height, setHeight] = useState(settings.height || 720);
  const [fullscreen, setFullscreen] = useState(settings.fullscreen || false);
  const [autoConnect, setAutoConnect] = useState(settings.autoConnect ?? true);
  const [serverHost, setServerHost] = useState(settings.serverHost || "mc.crystaltidesSMP.net");
  const [serverPort, setServerPort] = useState(settings.serverPort || 25565);
  const [saved, setSaved] = useState(false);

  // CrystalTides Web Account state & actions
  const { crystalSession, loginCrystal, logoutCrystal } = useAuth();
  const [crystalEmail, setCrystalEmail] = useState("");
  const [crystalPassword, setCrystalPassword] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const handleLinkCrystal = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = crystalEmail.trim();
    const cleanPassword = crystalPassword.trim();
    if (!cleanEmail || !cleanPassword) {
      setLinkError("Por favor ingresa tu correo electrónico y tu contraseña de la web.");
      return;
    }
    setIsLinking(true);
    setLinkError(null);
    try {
      await loginCrystal(cleanEmail, cleanPassword);
      setCrystalEmail("");
      setCrystalPassword("");
    } catch (err: unknown) {
      console.error("Crystal login error:", err);
      setLinkError(err instanceof Error ? err.message : "Credenciales incorrectas o error al conectar.");
    } finally {
      setIsLinking(false);
    }
  };

  const handleSave = () => {
    const updated = saveSettings({
      ...settings,
      maxRam: tempMaxRam * 1024,
      minRam: Math.min(2048, (tempMaxRam * 1024) / 2),
      javaPath: javaPath || undefined,
      width,
      height,
      fullscreen,
      autoConnect,
      serverHost,
      serverPort,
    });
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    localStorage.removeItem("crystaltides_settings");
    const defaults = getSettings();
    setSettings(defaults);
    setTempMaxRam(defaults.maxRam / 1024);
    setJavaPath("");
    setWidth(1280);
    setHeight(720);
    setFullscreen(false);
    setAutoConnect(true);
    setServerHost("mc.crystaltidesSMP.net");
    setServerPort(25565);
  };

  const sectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    textAlign: "left",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  };



  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <CrystalPageHeader eyebrow="Configuración" title="Ajustes del Launcher" />

      <div style={{ flex: 1, overflowY: "auto", marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 🌊 Cuenta de CrystalTides Web */}
        <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
          <div style={sectionStyle}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: "bold", color: "#FFFFFF", display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/logo.png" style={{ width: 18, height: 18, objectFit: "contain", imageRendering: "pixelated" }} alt="Logo" />
              <span>Cuenta de CrystalTides</span>
            </h4>
            
            {crystalSession ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(45, 212, 191, 0.03)", border: "1px solid rgba(45, 212, 191, 0.15)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: "rgba(45, 212, 191, 0.08)",
                    border: "1px solid rgba(45, 212, 191, 0.2)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {crystalSession.avatarUrl ? (
                      <img src={crystalSession.avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Avatar" />
                    ) : (
                      <img src="/logo.png" style={{ width: 24, height: 24, objectFit: "contain" }} alt="Logo" />
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                    <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: 14.5 }}>{crystalSession.username}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{crystalSession.email}</span>
                    <RoleBadge role={crystalSession.role} size="md" style={{ marginTop: 4 }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logoutCrystal}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "var(--danger)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.18)";
                    e.currentTarget.style.borderColor = "var(--danger)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
                  }}
                >
                  Desvincular Cuenta
                </button>
              </div>
            ) : (
              <div>
                <p style={{ margin: "0 0 14px 0", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.45 }}>
                  Vincula tu cuenta de nuestra web oficial para sincronizar tu rango del servidor, participar en eventos del launcher y desbloquear características premium.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 450 }}>
                  {linkError && (
                    <div style={{
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#FF9999",
                      fontSize: 12.5,
                      fontWeight: 600,
                      textAlign: "left",
                      lineHeight: 1.4,
                    }}>
                      ⚠️ {linkError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                      <label htmlFor="crystal-email" style={labelStyle}>Correo de la Web</label>
                      <input
                        id="crystal-email"
                        type="text"
                        placeholder="tu_correo@ejemplo.com"
                        value={crystalEmail}
                        onChange={(e) => setCrystalEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleLinkCrystal(); }}
                        disabled={isLinking}
                        style={{ padding: "8px 12px", fontSize: 13 }}
                      />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                      <label htmlFor="crystal-password" style={labelStyle}>Contraseña</label>
                      <input
                        id="crystal-password"
                        type="password"
                        placeholder="••••••••"
                        value={crystalPassword}
                        onChange={(e) => setCrystalPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleLinkCrystal(); }}
                        disabled={isLinking}
                        style={{ padding: "8px 12px", fontSize: 13 }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLinking}
                    onClick={handleLinkCrystal}
                    style={{
                      marginTop: 4,
                      alignSelf: "flex-start",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#FFF",
                      background: "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 20px",
                      cursor: isLinking ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      boxShadow: "0 4px 12px rgba(45, 212, 191, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      if (isLinking) return;
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(45, 212, 191, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 212, 191, 0.2)";
                    }}
                  >
                    {isLinking ? "Conectando..." : "🌊 Conectar Cuenta Web"}
                  </button>
                </div>
              </div>
            )}

            {/* Avatar Preference toggle */}
            <div style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#FFF" }}>🖼️ Preferencia de Icono de Perfil</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Elige si prefieres mostrar tu foto de la web o la cabeza de Minecraft en el launcher</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    const updated = saveSettings({ avatarPreference: "web" });
                    setSettings(updated);
                    window.dispatchEvent(new Event("crystaltides_settings_updated"));
                  }}
                  style={{
                    backgroundColor: (settings.avatarPreference || "web") === "web" ? "rgba(45, 212, 191, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${(settings.avatarPreference || "web") === "web" ? "#2DD4BF" : "rgba(255, 255, 255, 0.12)"}`,
                    color: (settings.avatarPreference || "web") === "web" ? "#2DD4BF" : "rgba(255, 255, 255, 0.6)",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 8,
                    padding: "6px 12px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  🌊 Foto Web
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = saveSettings({ avatarPreference: "minecraft" });
                    setSettings(updated);
                    window.dispatchEvent(new Event("crystaltides_settings_updated"));
                  }}
                  style={{
                    backgroundColor: settings.avatarPreference === "minecraft" ? "rgba(45, 212, 191, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${settings.avatarPreference === "minecraft" ? "#2DD4BF" : "rgba(255, 255, 255, 0.12)"}`,
                    color: settings.avatarPreference === "minecraft" ? "#2DD4BF" : "rgba(255, 255, 255, 0.6)",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 8,
                    padding: "6px 12px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  ⛏️ Cabeza Minecraft
                </button>
              </div>
            </div>
          </div>
        </CrystalCard>

        {/* RAM */}
        <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
          <div style={sectionStyle}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: "bold", color: "#FFFFFF" }}>🧠 Memoria RAM</h4>
            <div>
              <label style={labelStyle}>Máxima ({tempMaxRam} GB)</label>
              <input
                type="range"
                min={2}
                max={16}
                step={1}
                value={tempMaxRam}
                onChange={(e) => setTempMaxRam(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)", marginTop: 8 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                <span>2 GB</span>
                <span>16 GB</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                id="opt-jvm"
                checked={settings.useOptimization}
                onChange={(e) => setSettings({ ...settings, useOptimization: e.target.checked })}
                style={{ accentColor: "var(--primary)" }}
              />
              <label htmlFor="opt-jvm" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
                Activar optimizaciones de G1GC (Recomendado)
              </label>
            </div>
          </div>
        </CrystalCard>

        {/* Java */}
        <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
          <div style={sectionStyle}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: "bold", color: "#FFFFFF" }}>☕ Ruta de Java (opcional)</h4>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              Deja vacío para usar el Java automático gestionado por el launcher.
            </p>
            <input
              type="text"
              placeholder="C:\Program Files\Java\jdk-21\bin\java.exe"
              value={javaPath}
              onChange={(e) => setJavaPath(e.target.value)}

            />
          </div>
        </CrystalCard>

        {/* Resolution */}
        <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
          <div style={sectionStyle}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: "bold", color: "#FFFFFF" }}>🖥️ Resolución</h4>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="resolution-width" style={labelStyle}>Ancho</label>
                <input
                  id="resolution-width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  disabled={fullscreen}
                  style={{ marginTop: 4 }}
                />
              </div>
              <span style={{ color: "rgba(255,255,255,0.3)", marginTop: 20 }}>×</span>
              <div style={{ flex: 1 }}>
                <label htmlFor="resolution-height" style={labelStyle}>Alto</label>
                <input
                  id="resolution-height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  disabled={fullscreen}
                  style={{ marginTop: 4 }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                id="opt-fullscreen"
                checked={fullscreen}
                onChange={(e) => setFullscreen(e.target.checked)}
                style={{ accentColor: "var(--primary)" }}
              />
              <label htmlFor="opt-fullscreen" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
                Pantalla completa
              </label>
            </div>
          </div>
        </CrystalCard>

        {/* Server */}
        <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
          <div style={sectionStyle}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: "bold", color: "#FFFFFF" }}>🌐 Servidor</h4>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                id="opt-autoconnect"
                checked={autoConnect}
                onChange={(e) => setAutoConnect(e.target.checked)}
                style={{ accentColor: "var(--primary)" }}
              />
              <label htmlFor="opt-autoconnect" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
                Conectar automáticamente al servidor al iniciar Minecraft
              </label>
            </div>
            {autoConnect && (
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 3 }}>
                  <label htmlFor="srv-host" style={labelStyle}>Host</label>
                  <input
                    id="srv-host"
                    type="text"
                    value={serverHost}
                    onChange={(e) => setServerHost(e.target.value)}
                    style={{ marginTop: 4 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="srv-port" style={labelStyle}>Puerto</label>
                  <input
                    id="srv-port"
                    type="number"
                    value={serverPort}
                    onChange={(e) => setServerPort(Number(e.target.value))}
                    style={{ marginTop: 4 }}
                  />
                </div>
              </div>
            )}
          </div>
        </CrystalCard>

        {/* Version */}
        <CrystalCard style={{ padding: 20 }} enableHoverEffect={false}>
          <div style={sectionStyle}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: "bold", color: "#FFFFFF" }}>🎮 Versión del Juego</h4>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="opt-mcversion" style={labelStyle}>Minecraft</label>
                <select
                  id="opt-mcversion"
                  value={settings.mcVersion}
                  onChange={(e) => setSettings({ ...settings, mcVersion: e.target.value })}
                  style={{ marginTop: 4 }}
                >
                  <option value="1.21.1">1.21.1 (Recomendado)</option>
                  <option value="1.20.1">1.20.1</option>
                  <option value="1.19.4">1.19.4</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="opt-loaderType" style={labelStyle}>Mod Loader</label>
                <select
                  id="opt-loaderType"
                  value={settings.loaderType}
                  onChange={(e) => setSettings({ ...settings, loaderType: e.target.value })}
                  style={{ marginTop: 4 }}
                >
                  <option value="neoforge">NeoForge</option>
                  <option value="fabric">Fabric</option>
                  <option value="">Ninguno (Vanilla)</option>
                </select>
              </div>
            </div>
          </div>
        </CrystalCard>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, paddingBottom: 24 }}>
          <CrystalButton
            text="Restaurar Valores"
            variant="ghost"
            size="md"
            onPressed={handleReset}
            style={{ flex: 1 }}
          />
          <CrystalButton
            text={saved ? "✅ Guardado" : "Guardar Configuración"}
            variant="primary"
            size="md"
            onPressed={handleSave}
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
};
