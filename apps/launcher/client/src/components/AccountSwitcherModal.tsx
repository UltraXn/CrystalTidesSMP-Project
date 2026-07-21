import React, { useState } from "react";
import { useAuth, SavedAccount } from "../services/authContext";
import { getSettings, saveSettings } from "../services/settingsService";
import { RoleBadge } from "./RoleBadge";

interface AccountSwitcherModalProps {
  onClose: () => void;
  onNavigateSettings: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  onClose,
  onNavigateSettings,
}) => {
  const {
    currentSession,
    crystalSession,
    savedAccounts,
    selectAccount,
    removeAccount,
    logout,
  } = useAuth();

  const [avatarPref, setAvatarPref] = useState<"web" | "minecraft">(
    getSettings().avatarPreference || "web"
  );

  const handleToggleAvatarPref = (pref: "web" | "minecraft") => {
    setAvatarPref(pref);
    saveSettings({ avatarPreference: pref });
    window.dispatchEvent(new Event("crystaltides_settings_updated"));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          backgroundColor: "transparent",
        }}
      />

      {/* Popover Menu */}
      <div
        className="reveal-up"
        style={{
          position: "fixed",
          left: 92,
          bottom: 24,
          width: 330,
          backgroundColor: "rgba(13, 17, 23, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(45, 212, 191, 0.25)",
          borderRadius: 16,
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(45, 212, 191, 0.15)",
          zIndex: 1000,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#FFF", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            👤 Selector de Sesiones
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              fontSize: 16,
              padding: "2px 6px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Avatar Source Preference Toggle */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 10,
          padding: "6px 10px",
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>
            🖼️ Icono del Avatar:
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => handleToggleAvatarPref("web")}
              title="Usar Foto de Perfil de la Web"
              style={{
                backgroundColor: avatarPref === "web" ? "rgba(45, 212, 191, 0.25)" : "transparent",
                border: `1px solid ${avatarPref === "web" ? "var(--accent)" : "rgba(255,255,255,0.15)"}`,
                color: avatarPref === "web" ? "#2DD4BF" : "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              🌊 Web
            </button>
            <button
              onClick={() => handleToggleAvatarPref("minecraft")}
              title="Usar Cabeza de Minecraft"
              style={{
                backgroundColor: avatarPref === "minecraft" ? "rgba(45, 212, 191, 0.25)" : "transparent",
                border: `1px solid ${avatarPref === "minecraft" ? "var(--accent)" : "rgba(255,255,255,0.15)"}`,
                color: avatarPref === "minecraft" ? "#2DD4BF" : "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              ⛏️ Minecraft
            </button>
          </div>
        </div>

        {/* Section 1: CrystalTides Web Account */}
        <div style={{
          backgroundColor: "rgba(45, 212, 191, 0.04)",
          border: "1px solid rgba(45, 212, 191, 0.15)",
          borderRadius: 12,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              🌊 Cuenta Web Vinc.
            </span>
            {crystalSession && <RoleBadge role={crystalSession.role} size="sm" />}
          </div>

          {crystalSession ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={
                  avatarPref === "minecraft" && currentSession?.username
                    ? `https://mc-heads.net/avatar/${currentSession.username}/34`
                    : crystalSession.avatarUrl || "/logo.png"
                }
                style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover" }}
                alt="Avatar"
              />
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#FFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {crystalSession.username}
                </span>
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {crystalSession.email}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.5)" }}>Sin cuenta web vinculada</span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateSettings();
                }}
                style={{
                  background: "rgba(45, 212, 191, 0.15)",
                  border: "1px solid rgba(45, 212, 191, 0.3)",
                  color: "#2DD4BF",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                Vincular
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Minecraft Accounts List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            🎮 Perfiles de Minecraft
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 150, overflowY: "auto" }}>
            {savedAccounts.length > 0 ? (
              savedAccounts.map((acc: SavedAccount) => {
                const isActive = currentSession?.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      if (!isActive) {
                        selectAccount(acc.id);
                        onClose();
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 10,
                      backgroundColor: isActive ? "rgba(45, 212, 191, 0.12)" : "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${isActive ? "rgba(45, 212, 191, 0.35)" : "rgba(255, 255, 255, 0.06)"}`,
                      cursor: isActive ? "default" : "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={`https://mc-heads.net/avatar/${acc.username}/28`}
                        alt="Head"
                        style={{ width: 26, height: 26, borderRadius: 6 }}
                        onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: isActive ? "#FFF" : "rgba(255,255,255,0.8)" }}>
                          {acc.username}
                        </span>
                        <span style={{ fontSize: 9.5, color: isActive ? "var(--accent)" : "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                          {acc.type === "microsoft" ? "Premium" : "No-Premium"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {isActive && (
                        <span style={{
                          fontSize: 9,
                          fontWeight: 800,
                          backgroundColor: "#2DD4BF",
                          color: "#0D1117",
                          padding: "2px 6px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                        }}>
                          Activo
                        </span>
                      )}
                      {!isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAccount(acc.id);
                          }}
                          title="Quitar cuenta"
                          style={{
                            background: "none",
                            border: "none",
                            color: "rgba(239, 68, 68, 0.6)",
                            cursor: "pointer",
                            fontSize: 12,
                            padding: 2,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "8px 0" }}>
                Sin cuentas guardadas
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Actions */}
        <div style={{ display: "flex", gap: 8, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            style={{
              flex: 1,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#EF4444",
              fontSize: 11,
              fontWeight: 700,
              padding: "7px 10px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            🔄 Cambiar Perfil MC
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateSettings();
            }}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#FFF",
              fontSize: 11,
              fontWeight: 600,
              padding: "7px 12px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ⚙️ Ajustes
          </button>
        </div>
      </div>
    </>
  );
};
