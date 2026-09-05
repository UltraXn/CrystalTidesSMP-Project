import React, { useState } from "react";
import { MorphIcon } from "morphicons/react";
import {
  X,
  LogOut,
  Settings,
  Plus,
} from "lucide";
import { useAuth, SavedAccount } from "../services/authContext";
import { getSettings, saveSettings } from "../services/settingsService";
import { RoleBadge } from "./RoleBadge";

interface AccountSwitcherModalProps {
  onClose: () => void;
  onNavigateSettings: () => void;
  /** "modal" (default) = popup flotante. "inline" = vista de página completa en el nav. */
  mode?: "modal" | "inline";
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  onClose,
  onNavigateSettings,
  mode = "modal",
}) => {
  const {
    currentSession,
    crystalSession,
    savedAccounts,
    selectAccount,
    removeAccount,
    loginGuest,
    logout,
  } = useAuth();

  const [showAddOffline, setShowAddOffline] = useState<boolean>(false);
  const [newOfflineNick, setNewOfflineNick] = useState<string>("");
  const [offlineError, setOfflineError] = useState<string | null>(null);

  const [avatarPref, setAvatarPref] = useState<"web" | "minecraft">(
    getSettings().avatarPreference || "web"
  );

  const handleToggleAvatarPref = (pref: "web" | "minecraft") => {
    setAvatarPref(pref);
    saveSettings({ avatarPreference: pref });
    window.dispatchEvent(new Event("crystaltides_settings_updated"));
  };

  // === INLINE / PAGE MODE ===
  if (mode === "inline") {
    return (
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          height: "100%",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Page Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
            paddingBottom: 14,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#2DD4BF", boxShadow: "0 0 10px #2DD4BF" }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            Cuentas &amp; Sesión
          </span>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1 }}>
          {/* Left: Perfiles de Minecraft */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.025)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Perfiles de Minecraft
              </span>
              <button
                type="button"
                onClick={() => { setShowAddOffline(!showAddOffline); setOfflineError(null); }}
                style={{
                  background: "rgba(45,212,191,0.10)",
                  border: "1px solid rgba(45,212,191,0.22)",
                  color: "#2DD4BF",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 7,
                  padding: "4px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 120ms ease",
                }}
              >
                <MorphIcon icon={showAddOffline ? X : Plus} size={11} color="currentColor" strokeWidth={2.5} />
                <span>{showAddOffline ? "Cancelar" : "Añadir Invitado"}</span>
              </button>
            </div>

            {/* Add guest input */}
            {showAddOffline && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "10px 12px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(45, 212, 191, 0.25)",
                  borderRadius: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={`https://mc-heads.net/avatar/${newOfflineNick.trim() || "Steve"}/24`}
                    alt="Preview"
                    style={{ width: 22, height: 22, borderRadius: 5 }}
                    onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                  />
                  <input
                    type="text"
                    value={newOfflineNick}
                    onChange={(e) => { setNewOfflineNick(e.target.value); setOfflineError(null); }}
                    placeholder="Nickname invitado..."
                    maxLength={16}
                    autoFocus
                    style={{
                      flex: 1,
                      height: 32,
                      borderRadius: 7,
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#FFFFFF",
                      fontSize: 12,
                      padding: "0 10px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const nick = newOfflineNick.trim();
                      if (!nick || nick.length < 3) { setOfflineError("Mínimo 3 caracteres"); return; }
                      if (!/^[a-zA-Z0-9_]+$/.test(nick)) { setOfflineError("Solo letras, números y _"); return; }
                      await loginGuest(nick);
                      setShowAddOffline(false);
                      setNewOfflineNick("");
                    }}
                    style={{
                      height: 32,
                      padding: "0 12px",
                      borderRadius: 7,
                      backgroundColor: "#2DD4BF",
                      border: "none",
                      color: "#051614",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Guardar
                  </button>
                </div>
                {offlineError && <span style={{ fontSize: 10.5, color: "#EF4444" }}>{offlineError}</span>}
              </div>
            )}

            {/* Accounts list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1 }}>
              {savedAccounts.length > 0 ? (
                savedAccounts.map((acc: SavedAccount) => {
                  const isActive = currentSession?.id === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => { if (!isActive) { selectAccount(acc.id); } }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: 12,
                        backgroundColor: isActive ? "rgba(45,212,191,0.08)" : "rgba(255,255,255,0.025)",
                        border: `1.5px solid ${isActive ? "rgba(45,212,191,0.35)" : "rgba(255,255,255,0.06)"}`,
                        cursor: isActive ? "default" : "pointer",
                        transition: "all 140ms ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.025)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={`https://mc-heads.net/avatar/${acc.username}/36`}
                          alt="Head"
                          style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)" }}
                          onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                        />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.85)" }}>
                            {acc.username}
                          </span>
                          <span style={{ fontSize: 10.5, color: isActive ? "#2DD4BF" : "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 600 }}>
                            {acc.type === "microsoft" ? "Microsoft" : "Invitado"}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {isActive ? (
                          <span style={{ fontSize: 9.5, fontWeight: 800, backgroundColor: "rgba(45,212,191,0.16)", border: "1px solid rgba(45,212,191,0.35)", color: "#2DD4BF", padding: "3px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Activo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeAccount(acc.id); }}
                            title="Quitar perfil"
                            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 4, display: "flex", transition: "color 120ms ease" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                          >
                            <MorphIcon icon={X} size={14} color="currentColor" strokeWidth={2.2} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: "20px 0" }}>
                  Sin cuentas guardadas
                </div>
              )}
            </div>
          </div>

          {/* Right: CrystalTides Account + Preferences + Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* CrystalTides Account Card */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.025)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#2DD4BF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Cuenta CrystalTides
                </span>
                {crystalSession && <RoleBadge role={crystalSession.role} size="sm" />}
              </div>
              {crystalSession ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={
                      avatarPref === "minecraft" && currentSession?.username
                        ? `https://mc-heads.net/avatar/${currentSession.username}/48`
                        : crystalSession.avatarUrl || "/logo.png"
                    }
                    style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", border: "1px solid rgba(255,255,255,0.12)" }}
                    alt="Avatar"
                    onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {crystalSession.username}
                    </span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {crystalSession.email}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Sin sincronizar</span>
                  <button
                    type="button"
                    onClick={() => { onNavigateSettings(); }}
                    style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.25)", color: "#2DD4BF", fontSize: 12, fontWeight: 700, borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}
                  >
                    Vincular
                  </button>
                </div>
              )}
            </div>

            {/* Avatar Preference */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "10px 14px",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Avatar en barra:</span>
              <div style={{ display: "flex", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3, border: "1px solid rgba(255,255,255,0.06)", gap: 3 }}>
                <button type="button" onClick={() => handleToggleAvatarPref("web")} style={{ backgroundColor: avatarPref === "web" ? "rgba(255,255,255,0.12)" : "transparent", border: avatarPref === "web" ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent", color: avatarPref === "web" ? "#FFFFFF" : "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "4px 10px", cursor: "pointer", transition: "all 120ms ease" }}>Web</button>
                <button type="button" onClick={() => handleToggleAvatarPref("minecraft")} style={{ backgroundColor: avatarPref === "minecraft" ? "rgba(45,212,191,0.16)" : "transparent", border: avatarPref === "minecraft" ? "1px solid rgba(45,212,191,0.3)" : "1px solid transparent", color: avatarPref === "minecraft" ? "#2DD4BF" : "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "4px 10px", cursor: "pointer", transition: "all 120ms ease" }}>Minecraft</button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
              <button
                type="button"
                onClick={() => { onClose(); logout(); }}
                style={{ flex: 1, height: 40, backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", color: "#F87171", fontSize: 13, fontWeight: 700, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 140ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.14)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.38)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.07)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.22)"; }}
              >
                <MorphIcon icon={LogOut} size={14} color="#F87171" strokeWidth={2.2} />
                <span>Cerrar Sesión</span>
              </button>
              <button
                type="button"
                onClick={() => { onNavigateSettings(); }}
                style={{ height: 40, backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#FFFFFF", fontSize: 13, fontWeight: 600, padding: "0 18px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 140ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
              >
                <MorphIcon icon={Settings} size={14} color="#FFFFFF" strokeWidth={2} />
                <span>Ajustes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === MODAL / POPUP MODE (existing behavior) ===
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Popover Card anchored right below user greeting in top header */}
      <div
        style={{
          position: "fixed",
          left: 92,
          top: 92,
          width: 340,
          backgroundColor: "rgba(8, 10, 15, 0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.09)",
          borderRadius: 18,
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.85), 0 0 32px rgba(45, 212, 191, 0.05)",
          zIndex: 1000,
          padding: "16px 18px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          userSelect: "none",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          animation: "authModeFadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#2DD4BF", boxShadow: "0 0 8px #2DD4BF" }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
              Cuentas &amp; Sesión
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(255, 255, 255, 0.45)",
              cursor: "pointer",
              borderRadius: 8,
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 140ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.45)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
            }}
          >
            <MorphIcon icon={X} size={13} color="currentColor" strokeWidth={2.2} />
          </button>
        </div>

        {/* Avatar Source Preference Segmented Control */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(255, 255, 255, 0.025)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: 10,
            padding: "5px 8px 5px 12px",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255, 255, 255, 0.6)" }}>
            Avatar en barra:
          </span>
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              borderRadius: 7,
              padding: 2,
              border: "1px solid rgba(255, 255, 255, 0.06)",
              gap: 2,
            }}
          >
            <button
              type="button"
              onClick={() => handleToggleAvatarPref("web")}
              style={{
                backgroundColor: avatarPref === "web" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                border: avatarPref === "web" ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid transparent",
                color: avatarPref === "web" ? "#FFFFFF" : "rgba(255, 255, 255, 0.45)",
                fontSize: 10.5,
                fontWeight: 700,
                borderRadius: 5,
                padding: "3px 8px",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              Web
            </button>
            <button
              type="button"
              onClick={() => handleToggleAvatarPref("minecraft")}
              style={{
                backgroundColor: avatarPref === "minecraft" ? "rgba(45, 212, 191, 0.16)" : "transparent",
                border: avatarPref === "minecraft" ? "1px solid rgba(45, 212, 191, 0.3)" : "1px solid transparent",
                color: avatarPref === "minecraft" ? "#2DD4BF" : "rgba(255, 255, 255, 0.45)",
                fontSize: 10.5,
                fontWeight: 700,
                borderRadius: 5,
                padding: "3px 8px",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              Minecraft
            </button>
          </div>
        </div>

        {/* Section 1: CrystalTides Web Account */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.025)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: 12,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, color: "#2DD4BF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Cuenta CrystalTides
            </span>
            {crystalSession && <RoleBadge role={crystalSession.role} size="sm" />}
          </div>

          {crystalSession ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={
                  avatarPref === "minecraft" && currentSession?.username
                    ? `https://mc-heads.net/avatar/${currentSession.username}/36`
                    : crystalSession.avatarUrl || "/logo.png"
                }
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  objectFit: "cover",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
                alt="Avatar"
                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
              />
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {crystalSession.username}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {crystalSession.email}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.4)" }}>Sin sincronizar</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateSettings();
                }}
                style={{
                  background: "rgba(45, 212, 191, 0.12)",
                  border: "1px solid rgba(45, 212, 191, 0.25)",
                  color: "#2DD4BF",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 7,
                  padding: "4px 10px",
                  cursor: "pointer",
                  transition: "all 120ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.12)";
                }}
              >
                Vincular
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Minecraft Profiles List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Perfiles de Minecraft
            </span>
            <button
              type="button"
              onClick={() => {
                setShowAddOffline(!showAddOffline);
                setOfflineError(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#2DD4BF",
                fontSize: 10.5,
                fontWeight: 700,
                cursor: "pointer",
                padding: "2px 4px",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "opacity 120ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              <MorphIcon icon={showAddOffline ? X : Plus} size={11} color="currentColor" strokeWidth={2.5} />
              <span>{showAddOffline ? "Cancelar" : "Añadir Invitado"}</span>
            </button>
          </div>

          {/* Expandable Add Guest Input */}
          {showAddOffline && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "8px 10px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(45, 212, 191, 0.25)",
                borderRadius: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src={`https://mc-heads.net/avatar/${newOfflineNick.trim() || "Steve"}/24`}
                  alt="Preview"
                  style={{ width: 22, height: 22, borderRadius: 5 }}
                  onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                />
                <input
                  type="text"
                  value={newOfflineNick}
                  onChange={(e) => {
                    setNewOfflineNick(e.target.value);
                    setOfflineError(null);
                  }}
                  placeholder="Nickname invitado..."
                  maxLength={16}
                  autoFocus
                  style={{
                    flex: 1,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#FFFFFF",
                    fontSize: 11.5,
                    padding: "0 8px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const nick = newOfflineNick.trim();
                    if (!nick || nick.length < 3) {
                      setOfflineError("Mínimo 3 caracteres");
                      return;
                    }
                    if (!/^[a-zA-Z0-9_]+$/.test(nick)) {
                      setOfflineError("Solo letras, números y _");
                      return;
                    }
                    await loginGuest(nick);
                    setShowAddOffline(false);
                    setNewOfflineNick("");
                    onClose();
                  }}
                  style={{
                    height: 28,
                    padding: "0 10px",
                    borderRadius: 6,
                    backgroundColor: "#2DD4BF",
                    border: "none",
                    color: "#051614",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Guardar
                </button>
              </div>
              {offlineError && (
                <span style={{ fontSize: 10, color: "#EF4444" }}>{offlineError}</span>
              )}
            </div>
          )}

          {/* Accounts List Container */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto", paddingRight: 2 }}>
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
                      backgroundColor: isActive ? "rgba(45, 212, 191, 0.08)" : "rgba(255, 255, 255, 0.025)",
                      border: `1px solid ${isActive ? "rgba(45, 212, 191, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
                      cursor: isActive ? "default" : "pointer",
                      transition: "all 140ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={`https://mc-heads.net/avatar/${acc.username}/28`}
                        alt="Head"
                        style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255, 255, 255, 0.08)" }}
                        onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.85)" }}>
                          {acc.username}
                        </span>
                        <span style={{ fontSize: 9.5, color: isActive ? "#2DD4BF" : "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", fontWeight: 600 }}>
                          {acc.type === "microsoft" ? "Microsoft" : "Invitado"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {isActive ? (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            backgroundColor: "rgba(45, 212, 191, 0.16)",
                            border: "1px solid rgba(45, 212, 191, 0.35)",
                            color: "#2DD4BF",
                            padding: "2px 7px",
                            borderRadius: 5,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Activo
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAccount(acc.id);
                          }}
                          title="Quitar perfil"
                          style={{
                            background: "none",
                            border: "none",
                            color: "rgba(255, 255, 255, 0.3)",
                            cursor: "pointer",
                            padding: 4,
                            display: "flex",
                            transition: "color 120ms ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.3)"; }}
                        >
                          <MorphIcon icon={X} size={12} color="currentColor" strokeWidth={2.2} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.4)", textAlign: "center", padding: "12px 0" }}>
                Sin cuentas guardadas
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Bottom Actions */}
        <div style={{ display: "flex", gap: 8, paddingTop: 6, borderTop: "1px solid rgba(255, 255, 255, 0.07)" }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            style={{
              flex: 1,
              height: 34,
              backgroundColor: "rgba(239, 68, 68, 0.06)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#F87171",
              fontSize: 11.5,
              fontWeight: 700,
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 140ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.12)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.06)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
            }}
          >
            <MorphIcon icon={LogOut} size={12} color="#F87171" strokeWidth={2.2} />
            <span>Cerrar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateSettings();
            }}
            style={{
              height: 34,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              color: "#FFFFFF",
              fontSize: 11.5,
              fontWeight: 600,
              padding: "0 14px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 140ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.09)";
            }}
          >
            <MorphIcon icon={Settings} size={12} color="#FFFFFF" strokeWidth={2} />
            <span>Ajustes</span>
          </button>
        </div>
      </div>
    </>
  );
};
