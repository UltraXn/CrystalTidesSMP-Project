import React, { useState } from "react";
import { useAuth, SavedAccount } from "../services/authContext";
import { CrystalCard } from "./CrystalCard";
import { CrystalButton } from "./CrystalButton";
import { AmbientBubbles } from "./AmbientBubbles";

export const LoginPage: React.FC = () => {
  const {
    savedAccounts,
    loginGuest,
    loginMicrosoft,
    msDeviceCode,
    selectAccount,
    removeAccount,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"saved" | "guest" | "microsoft">(
    savedAccounts.length > 0 ? "saved" : "microsoft"
  );

  // Form states
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim().length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await loginGuest(nickname.trim());
    } catch (err: any) {
      setError(err.message || "Error al ingresar como invitado.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleMicrosoftSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginMicrosoft();
    } catch (err: any) {
      setError(err.message || "Error de autenticación con Microsoft.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelect = async (account: SavedAccount) => {
    setIsLoading(true);
    setError(null);
    try {
      await selectAccount(account.id);
    } catch (err: any) {
      setError(`Error al cambiar de cuenta: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { id: typeof activeTab; label: string; show: boolean }[] = [
    { id: "saved", label: "Guardadas", show: savedAccounts.length > 0 },
    { id: "microsoft", label: "Microsoft", show: true },
    { id: "guest", label: "Invitado", show: true },
  ];

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 30%, rgba(11, 44, 41, 0.6) 0%, var(--background) 70%)",
      padding: 24,
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow orb */}
      <div style={{
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, transparent 70%)",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      {/* Ambient Pixel Art Bubbles */}
      <AmbientBubbles />

      <CrystalCard
        style={{
          width: 480,
          padding: "36px 32px 32px",
          position: "relative",
          zIndex: 1,
        }}
        enableHoverEffect={false}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 28,
        }}>
          <div
            className="octopus-logo-box"
            style={{
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderRadius: 24,
              border: "1.5px solid rgba(45, 212, 191, 0.35)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
              cursor: "pointer",
            }}
          >
            <img
              src="/logo.png"
              className="octopus-logo-img"
              style={{ width: "85%", height: "85%", objectFit: "contain" }}
              alt="CrystalTides Logo"
            />
          </div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            color: "#FFFFFF",
            letterSpacing: 0.5,
          }}>
            CrystalTides Launcher
          </h1>
          <p style={{
            margin: "6px 0 0 0",
            fontSize: 13,
            color: "var(--text-muted)",
          }}>
            Inicia sesión para comenzar tu aventura
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: "flex",
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--border-low)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 28,
          gap: 4,
          justifyContent: "space-between",
        }}>
          {tabs.filter(t => t.show).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(null); }}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#FCA5A5",
            fontSize: 13,
            marginBottom: 20,
            textAlign: "left",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ─── Saved Accounts ─── */}
        {activeTab === "saved" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "var(--text-muted)" }}>
              Selecciona una cuenta para ingresar:
            </p>
            {savedAccounts.map((account) => (
              <div
                key={account.id}
                onClick={() => !isLoading && handleAccountSelect(account)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 12,
                  backgroundColor: "var(--surface-ultra-low)",
                  border: "1px solid var(--border-low)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 200ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.3)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-low)";
                  e.currentTarget.style.backgroundColor = "var(--surface-ultra-low)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: "rgba(45, 212, 191, 0.08)",
                    border: "1px solid rgba(45, 212, 191, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}>
                    {account.type === "microsoft" ? (
                      <img 
                        src={`https://mc-heads.net/avatar/${account.username}/32`}
                        style={{ width: 32, height: 32, borderRadius: 6, display: "block" }} 
                        alt="Minecraft avatar" 
                      />
                    ) : (
                      account.type === "guest" ? "👤" : "🎮"
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{ fontWeight: 600, color: "#FFFFFF", fontSize: 14 }}>{account.username}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {account.type === "microsoft" ? "Minecraft Premium" : "Invitado"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeAccount(account.id); }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(239, 68, 68, 0.5)",
                    fontSize: 14,
                    cursor: "pointer",
                    padding: 8,
                    borderRadius: 8,
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(239,68,68,0.5)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                  title="Eliminar Cuenta"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}



        {/* ─── Guest Login ─── */}
        {activeTab === "guest" && (
          <form onSubmit={handleGuestSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                Nombre de Usuario
              </label>
              <input
                type="text"
                placeholder="Ej. NachoPlayer"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255, 255, 255, 0.35)", textAlign: "left" }}>
              El modo invitado no requiere contraseña, pero solo puedes jugar en servidores que lo permitan.
            </p>
            <CrystalButton
              text="Ingresar como Invitado"
              variant="secondary"
              size="lg"
              isLoading={isLoading}
              onPressed={() => {}}
              style={{ marginTop: 4, width: "100%" }}
            />
          </form>
        )}

        {/* ─── Microsoft Login ─── */}
        {activeTab === "microsoft" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {msDeviceCode ? (
              <>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255, 255, 255, 0.7)", textAlign: "center", lineHeight: 1.6 }}>
                  Ingresa a la siguiente URL en tu navegador e introduce el código:
                </p>
                <a
                  href={msDeviceCode.verification_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    color: "var(--accent)",
                    fontSize: 14,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {msDeviceCode.verification_uri} ↗
                </a>
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "20px 28px",
                  borderRadius: 14,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  border: "1.5px solid rgba(45, 212, 191, 0.25)",
                  boxShadow: "0 0 20px rgba(45, 212, 191, 0.06)",
                }}>
                  <span style={{
                    fontSize: 36,
                    fontWeight: "bold",
                    letterSpacing: 8,
                    color: "#FFFFFF",
                    fontFamily: "'Outfit', monospace",
                  }}>
                    {msDeviceCode.user_code}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.35)",
                  textAlign: "center",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}>
                  Esperando autorización...
                </p>
              </>
            ) : (
              <>
                <div style={{
                  textAlign: "center",
                  padding: "8px 0",
                }}>
                  <p style={{ margin: 0, fontSize: 14, color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6 }}>
                    Ingresa con tu cuenta premium de Minecraft utilizando la verificación segura de Microsoft.
                  </p>
                </div>
                <CrystalButton
                  text="Iniciar con Microsoft"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  onPressed={handleMicrosoftSubmit}
                  icon={<span>🎮</span>}
                  style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    width: "100%",
                    color: "#FFFFFF",
                  }}
                />
              </>
            )}
          </div>
        )}
      </CrystalCard>
    </div>
  );
};
