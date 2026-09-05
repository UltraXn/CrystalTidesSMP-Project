import React, { useState, useEffect } from "react";
import { WindowTitleBar } from "./WindowTitleBar";
import { useAuth } from "./mockLauncherState";
import { getSettings } from "./mockLauncherState";
import { AccountSwitcherModal } from "./AccountSwitcherModal";
import { AmbientBubbles } from "./AmbientBubbles";
import { HomePage } from "./HomePage";
import { NewsPage } from "./NewsPage";
import { ModManagerPage } from "./ModManagerPage";
import { ProfileManagerPage } from "./ProfileManagerPage";
import { SettingsPage } from "./SettingsPage";
import { LogsPage } from "./LogsPage";
import { RewardsPage } from "./RewardsPage";
import { PlayerStatsWidget } from "./PlayerStatsWidget";
import { SocialPanel } from "./SocialPanel";
import { VersionSwitcherModal } from "./VersionSwitcherModal";
import { CrashModal } from "./CrashModal";
import { Users, AlertTriangle, Layers } from "lucide-react";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  id: string;
}

const NAV_ITEMS: SidebarItem[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    label: "Inicio",
    id: "home",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "Perfiles",
    id: "profiles",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    label: "Mods",
    id: "mods",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
      </svg>
    ),
    label: "Noticias",
    id: "news",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    label: "Ajustes",
    id: "settings",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    label: "Logs",
    id: "logs",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v10H4V12" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
    label: "Recompensas",
    id: "rewards",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    label: "Estadísticas",
    id: "stats",
  },
];

export const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState("home");
  const { currentSession, crystalSession, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showVersionSwitcher, setShowVersionSwitcher] = useState(false);
  const [showCrashModal, setShowCrashModal] = useState(false);

  const [avatarPref, setAvatarPref] = useState<"web" | "minecraft">(
    getSettings().avatarPreference || "web"
  );

  useEffect(() => {
    const handleUpdate = () => {
      setAvatarPref(getSettings().avatarPreference || "web");
    };
    window.addEventListener("crystaltides_settings_updated", handleUpdate);
    return () => window.removeEventListener("crystaltides_settings_updated", handleUpdate);
  }, []);

  const getDisplayAvatarSrc = (cSession: typeof crystalSession, mSession: typeof currentSession) => {
    if (avatarPref === "web" && cSession?.avatarUrl) {
      return cSession.avatarUrl;
    }
    if (mSession?.username) {
      return `https://mc-heads.net/avatar/${mSession.username}/36`;
    }
    return cSession?.avatarUrl || null;
  };

  const renderPage = () => {
    if (showVersionSwitcher) {
      return (
        <VersionSwitcherModal
          onSelectVersion={(_v, _loader) => {
            setShowVersionSwitcher(false);
          }}
          onClose={() => setShowVersionSwitcher(false)}
        />
      );
    }

    switch (activePage) {
      case "profiles": return <ProfileManagerPage />;
      case "news": return <NewsPage />;
      case "mods": return <ModManagerPage />;
      case "settings": return <SettingsPage />;
      case "logs": return <LogsPage />;
      case "rewards": return <RewardsPage />;
      case "stats": return (
        <div style={{ padding: "24px 32px", height: "100%", overflowY: "auto", boxSizing: "border-box" }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#FFF" }}>
              📊 Estadísticas del Jugador
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              Consulta tu progreso semanal e histórico en CrystalTides SMP.
            </p>
          </div>
          {crystalSession?.username ? (
            <PlayerStatsWidget username={crystalSession.username} />
          ) : (
            <div style={{
              padding: 28,
              borderRadius: 16,
              background: "rgba(15, 23, 42, 0.65)",
              border: "1px solid rgba(45, 212, 191, 0.2)",
              textAlign: "center",
              color: "rgba(255,255,255,0.8)",
              marginTop: 20,
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#2DD4BF", marginBottom: 6 }}>
                Autenticación Requerida
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", maxWidth: 460, margin: "0 auto" }}>
                Inicia sesión con tu **Cuenta Web oficial de CrystalTides SMP** para consultar tus estadísticas semanales, racha, KilluCoins e historial de juego de forma 100% segura.
              </div>
            </div>
          )}
        </div>
      );
      default: return (
        <HomePage
          onNavigate={(page) => {
            setShowVersionSwitcher(false);
            setActivePage(page);
          }}
        />
      );
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      background: "radial-gradient(ellipse at 50% 0%, #0d121c 0%, #060305 100%)",
      overflow: "hidden",
      position: "relative",
    }}>
      <WindowTitleBar />

      <div style={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "calc(100% - 32px)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* 🧼 Ambient Particles */}
        <AmbientBubbles />

        {/* Sidebar */}
        <nav style={{
          width: 74,
          minWidth: 74,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 16,
          paddingBottom: 16,
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
          backgroundColor: "rgba(7, 4, 10, 0.95)",
          backdropFilter: "blur(16px)",
          boxSizing: "border-box",
          zIndex: 10,
        }}>
          {/* Logo */}
          <div
            className="octopus-logo-box"
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              marginBottom: 16,
              cursor: "pointer",
              userSelect: "none",
              overflow: "hidden"
            }}
            title="CrystalTides Launcher"
            onClick={() => {
              setShowVersionSwitcher(false);
              setActivePage("home");
            }}
          >
            {logoFailed ? (
              <span style={{ fontSize: 22, userSelect: "none" }}>💎</span>
            ) : (
              <img
                src="/logo.png"
                className="octopus-logo-img"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
                alt="CrystalTides Logo"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = "true";
                    e.currentTarget.src = "/server_icon.png";
                  } else {
                    setLogoFailed(true);
                  }
                }}
              />
            )}
          </div>

          {/* Nav Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", alignItems: "center", padding: "0 8px", boxSizing: "border-box" }}>
            {NAV_ITEMS.map((item) => {
              const isActive = !showVersionSwitcher && activePage === item.id;
              const isHovered = hoveredItem === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setShowVersionSwitcher(false);
                    setActivePage(item.id);
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={item.label}
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    padding: "8px 0 6px",
                    borderRadius: 10,
                    border: "1px solid transparent",
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.08)"
                      : isHovered
                        ? "rgba(255, 255, 255, 0.03)"
                        : "transparent",
                    borderColor: isActive
                      ? "rgba(45, 212, 191, 0.3)"
                      : "transparent",
                    color: isActive ? "#FFFFFF" : isHovered ? "#E2E8F0" : "rgba(255, 255, 255, 0.4)",
                    cursor: "pointer",
                    transition: "all 160ms ease",
                    position: "relative",
                    boxShadow: isActive ? "0 2px 8px rgba(0, 0, 0, 0.25)" : "none",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  <span style={{
                    display: "flex",
                    color: isActive ? "#2DD4BF" : "inherit",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    transition: "transform 160ms ease",
                  }}>
                    {item.icon}
                  </span>
                  <span style={{
                    fontSize: 9.5,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.02em",
                    color: isActive ? "#FFFFFF" : "inherit",
                  }}>
                    {item.label}
                  </span>

                  {/* Active indicator bar */}
                  {isActive && (
                    <div style={{
                      position: "absolute",
                      left: -8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 20,
                      borderRadius: "0 3px 3px 0",
                      backgroundColor: "#2DD4BF",
                    }} />
                  )}
                </button>
              );
            })}

            {/* Quick Version Switcher Button */}
            <button
              type="button"
              onClick={() => setShowVersionSwitcher(!showVersionSwitcher)}
              title="Selector de Versiones"
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "8px 0 6px",
                borderRadius: 10,
                border: showVersionSwitcher ? "1px solid rgba(45, 212, 191, 0.4)" : "1px solid transparent",
                backgroundColor: showVersionSwitcher ? "rgba(45, 212, 191, 0.15)" : "transparent",
                color: showVersionSwitcher ? "#2DD4BF" : "rgba(255, 255, 255, 0.4)",
                cursor: "pointer",
                transition: "all 160ms ease",
              }}
            >
              <Layers size={18} color={showVersionSwitcher ? "#2DD4BF" : "currentColor"} />
              <span style={{ fontSize: 9, fontWeight: 700 }}>Versiones</span>
            </button>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Quick Actions (Social Panel & Diagnostic simulation) */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            width: "100%",
            marginBottom: 12,
            paddingTop: 8,
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          }}>
            {/* Social toggle */}
            <button
              type="button"
              onClick={() => setShowSocial(!showSocial)}
              title="Amigos en Línea"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: showSocial ? "1px solid rgba(45, 212, 191, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: showSocial ? "rgba(45, 212, 191, 0.15)" : "rgba(255, 255, 255, 0.03)",
                color: showSocial ? "#2DD4BF" : "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Users size={16} />
              <span style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#2DD4BF",
              }} />
            </button>

            {/* Crash modal simulation toggle */}
            <button
              type="button"
              onClick={() => setShowCrashModal(true)}
              title="Simular Diagnóstico de Crash"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1px solid rgba(239, 68, 68, 0.2)",
                backgroundColor: "rgba(239, 68, 68, 0.05)",
                color: "#EF4444",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={15} />
            </button>
          </div>

          {/* User avatar + logout */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            width: "100%",
          }}>
            <button
              type="button"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              title="Cambiar de Cuenta"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                overflow: "hidden",
                border: showAccountMenu ? "2px solid #2DD4BF" : "1px solid rgba(255, 255, 255, 0.12)",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 160ms ease",
                position: "relative",
                padding: 0,
              }}
            >
              {getDisplayAvatarSrc(crystalSession, currentSession) ? (
                <img
                  src={getDisplayAvatarSrc(crystalSession, currentSession)!}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  alt="Avatar"
                  onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>

            {showAccountMenu && (
              <AccountSwitcherModal
                onClose={() => setShowAccountMenu(false)}
                onNavigateSettings={() => setActivePage("settings")}
              />
            )}

            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1px solid rgba(239, 68, 68, 0.2)",
                backgroundColor: "transparent",
                color: "#EF4444",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 160ms ease",
                padding: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
          background: "transparent",
        }}>
          {renderPage()}
        </main>

        {/* Social Panel */}
        <SocialPanel isOpen={showSocial} onClose={() => setShowSocial(false)} />

        {/* Crash Diagnostic Modal */}
        <CrashModal
          isOpen={showCrashModal}
          onClose={() => setShowCrashModal(false)}
          onRelaunch={() => setShowCrashModal(false)}
        />
      </div>
    </div>
  );
};
