import React, { useState, useEffect } from "react";
import { useAuth } from "../services/authContext";
import { getSettings } from "../services/settingsService";
import { AccountSwitcherModal } from "./AccountSwitcherModal";
import { AmbientBubbles } from "./AmbientBubbles";
import { HomePage } from "./HomePage";
import { NewsPage } from "./NewsPage";
import { ModManagerPage } from "./ModManagerPage";
import { ProfileManagerPage } from "./ProfileManagerPage";
import { SettingsPage } from "./SettingsPage";
import { LogsPage } from "./LogsPage";

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
];

export const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState("home");
  const { currentSession, crystalSession, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
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
    switch (activePage) {
      case "profiles": return <ProfileManagerPage />;
      case "news": return <NewsPage />;
      case "mods": return <ModManagerPage />;
      case "settings": return <SettingsPage />;
      case "logs": return <LogsPage />;
      default: return <HomePage onNavigate={setActivePage} />;
    }
  };

  return (
    <div style={{
      display: "flex",
      width: "100%",
      height: "100%",
      background: "radial-gradient(ellipse at 30% 0%, var(--background-alt) 0%, var(--background) 75%)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* 🧼 Burbujas de ambiente Pixel Art */}
      <AmbientBubbles />

      {/* Sidebar */}
      <nav style={{
        width: 84,
        minWidth: 84,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 18,
        paddingBottom: 16,
        borderRight: "1px solid var(--border-low)",
        backgroundColor: "rgba(8, 10, 15, 0.75)",
        backdropFilter: "blur(10px)",
        boxSizing: "border-box",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div
          className="octopus-logo-box"
          style={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1.5px solid rgba(45, 212, 191, 0.3)",
            marginBottom: 26,
            cursor: "pointer",
            userSelect: "none",
            overflow: "hidden"
          }}
          title="CrystalTides SMP"
        >
          <img
            src="/logo.png"
            className="octopus-logo-img"
            style={{ width: "84%", height: "84%", objectFit: "contain" }}
            alt="CrystalTides Logo"
          />
        </div>

        {/* Nav Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", alignItems: "center", padding: "0 10px", boxSizing: "border-box" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            const isHovered = hoveredItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                title={item.label}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "9px 0 7px",
                  borderRadius: 12,
                  border: "1px solid transparent",
                  backgroundColor: isActive
                    ? "rgba(45, 212, 191, 0.12)"
                    : isHovered
                      ? "rgba(255, 255, 255, 0.03)"
                      : "transparent",
                  borderColor: isActive
                    ? "rgba(45, 212, 191, 0.22)"
                    : isHovered
                      ? "rgba(255, 255, 255, 0.05)"
                      : "transparent",
                  color: isActive ? "var(--accent)" : "rgba(243, 244, 246, 0.35)",
                  cursor: "pointer",
                  transition: "all 200ms ease",
                  position: "relative",
                  boxShadow: isActive ? "0 0 16px rgba(45, 212, 191, 0.08)" : "none",
                  fontFamily: "var(--font-family)",
                }}
              >
                <span style={{
                  display: "flex",
                  transform: isHovered ? "translateY(-1px) scale(1.08)" : "scale(1)",
                  transition: "transform 200ms ease",
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: isActive ? "var(--accent)" : isHovered ? "rgba(243, 244, 246, 0.55)" : "rgba(243, 244, 246, 0.35)",
                  transition: "color 200ms ease",
                }}>
                  {item.label}
                </span>

                {/* Active indicator bar */}
                {isActive && (
                  <div style={{
                    position: "absolute",
                    left: -10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 22,
                    borderRadius: "0 4px 4px 0",
                    backgroundColor: "var(--accent)",
                    boxShadow: "0 0 10px var(--accent)",
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User avatar + logout */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          width: "100%",
        }}>
          <div
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            title="Haz clic para seleccionar o cambiar de sesión"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: "var(--surface-ultra-low)",
              border: showAccountMenu ? "2px solid #2DD4BF" : "1px solid var(--border-low)",
              boxShadow: showAccountMenu ? "0 0 14px rgba(45, 212, 191, 0.4)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              cursor: "pointer",
              transition: "all 0.2s ease",
              overflow: "hidden",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!showAccountMenu) e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.6)";
            }}
            onMouseLeave={(e) => {
              if (!showAccountMenu) e.currentTarget.style.borderColor = "var(--border-low)";
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
          </div>

          {showAccountMenu && (
            <AccountSwitcherModal
              onClose={() => setShowAccountMenu(false)}
              onNavigateSettings={() => setActivePage("settings")}
            />
          )}
          <button
            onClick={logout}
            title="Cerrar sesión"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "1px solid rgba(239, 68, 68, 0.25)",
              backgroundColor: "transparent",
              color: "var(--danger)",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 200ms ease",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    </div>
  );
};
