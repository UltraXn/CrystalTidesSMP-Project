import React, { useState, useEffect } from "react";
import "../../styles/launcher.css";
import { CrystalCard } from "./CrystalCard";
import { useAuth } from "./mockLauncherState";
import { RoleBadge } from "./RoleBadge";
import { fetchServerStatus, type ServerStatus } from "./mockLauncherState";
import { syncOfficialMods } from "./mockLauncherState";
import { launchGame } from "./mockLauncherState";
import { getSettings } from "./mockLauncherState";
import { fetchNews, type NewsPost } from "./mockLauncherState";
import {
  Profile,
  getActiveProfile,
  resolveProfileGameDir,
} from "./mockLauncherState";
import { ProfileSelector } from "./ProfileSelector";
import { ProfileEditorDialog } from "./ProfileEditorDialog";
import { SkinViewer } from "./SkinViewer";
const invoke = async (_cmd: string, _args?: unknown) => { return null; };
import { fetchMinecraftProfile, setActiveCape, hideCape, type MinecraftCape } from "./mockLauncherState";

const CONSTANTS = {
  SERVER_IP: "mc.crystaltidesSMP.net",
  ACCENT_COLOR: "var(--accent)",
  BORDER_LOW: "var(--border-low)",
  ACTIVE_STATE: "ACTIVE",
  INACTIVE_STATE: "INACTIVE",
  SESSION_MICROSOFT: "microsoft",
  SESSION_GUEST: "guest",
  BG_WHITE_05: "rgba(255, 255, 255, 0.05)",
  TEXT_MUTED_55: "rgba(255, 255, 255, 0.55)",
  ACCENT_TINT_12: "rgba(45, 212, 191, 0.12)",
  ACCENT_BORDER_30: "rgba(45, 212, 191, 0.3)",
} as const;

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

/* ── Helpers de presentación ── */

const getDayPart = (): string => {
  const h = new Date().getHours();
  if (h < 7) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 21) return "Buenas tardes";
  return "Buenas noches";
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "Hace 1 semana" : `Hace ${weeks} semanas`;
};

interface ChipStyle {
  color: string;
  background: string;
  border: string;
  thumb: string;
}

const categoryStyle = (category: string): ChipStyle => {
  const c = category.toLowerCase();
  if (c.includes("evento")) {
    return {
      color: "#C4B5FD",
      background: "rgba(139, 92, 246, 0.12)",
      border: "rgba(139, 92, 246, 0.35)",
      thumb: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 55%, #1E1038 100%)",
    };
  }
  if (c.includes("mantenimiento")) {
    return {
      color: "#FCD34D",
      background: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.35)",
      thumb: "linear-gradient(135deg, #D97706 0%, #92400E 55%, #2A1503 100%)",
    };
  }
  if (c.includes("anuncio") || c.includes("comunidad")) {
    return {
      color: "#7DD3FC",
      background: "rgba(14, 165, 233, 0.12)",
      border: "rgba(14, 165, 233, 0.35)",
      thumb: "linear-gradient(135deg, #0EA5E9 0%, #155E75 55%, #062530 100%)",
    };
  }
  return {
    color: CONSTANTS.ACCENT_COLOR,
    background: CONSTANTS.ACCENT_TINT_12,
    border: CONSTANTS.ACCENT_BORDER_30,
    thumb: "linear-gradient(135deg, #0F766E 0%, #134E4A 55%, #04211E 100%)",
  };
};

const getStatusDotColor = (isLoading: boolean, serverStatus: ServerStatus | null): string => {
  if (isLoading) return "#FFA726";
  if (!serverStatus) return "rgba(255, 255, 255, 0.3)";
  return serverStatus.online ? "#10B981" : "#EF4444";
};

const renderStatusMeta = (isLoading: boolean, serverStatus: ServerStatus | null): React.ReactNode => {
  if (isLoading) {
    return <span style={{ color: "rgba(255,255,255,0.5)" }}>Consultando estado...</span>;
  }
  if (!serverStatus) {
    return <span style={{ color: "rgba(255,255,255,0.5)" }}>No disponible</span>;
  }
  if (!serverStatus.online) {
    return <span style={{ color: "#FCA5A5" }}>Desconectado</span>;
  }
  const hasPlayerCount = serverStatus.playersOnline !== null && serverStatus.playersMax !== null;
  const players = hasPlayerCount
    ? ` · ${serverStatus.playersOnline}/${serverStatus.playersMax} jugadores`
    : "";
  return (
    <>
      <span style={{ color: "#34D399", fontWeight: 600 }}>En línea</span>
      <span style={{ color: CONSTANTS.TEXT_MUTED_55 }}>{players}</span>
    </>
  );
};

const getAccountBadgeLabel = (sessionType?: string): string => {
  if (sessionType === CONSTANTS.SESSION_GUEST) return "Invitado";
  if (sessionType === CONSTANTS.SESSION_MICROSOFT) return "Premium";
  return "Sin sesión";
};

const getPlayButtonText = (isLaunching: boolean, isInGame: boolean): string => {
  if (isInGame) return "En juego";
  if (isLaunching) return "Iniciando";
  return "Jugar";
};

const getPlayButtonAriaLabel = (isLaunching: boolean, isInGame: boolean): string => {
  if (isLaunching) return "Iniciando Minecraft...";
  if (isInGame) return "En partida de Minecraft";
  return "Iniciar juego";
};

/* ── Componente: Server Status Pill ── */

interface ServerStatusPillProps {
  status: ServerStatus | null;
  isLoading: boolean;
  ipCopied: boolean;
  onCopyIp: () => void;
}

const ServerStatusPill: React.FC<ServerStatusPillProps> = ({
  status,
  isLoading,
  ipCopied,
  onCopyIp,
}) => {
  const dotColor = getStatusDotColor(isLoading, status);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "rgba(255, 255, 255, 0.03)",
        border: `1px solid ${CONSTANTS.BORDER_LOW}`,
        borderRadius: 14,
        padding: "10px 12px 10px 16px",
      }}
    >
      <div
        className="pulse-dot"
        style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#FFF" }}>{CONSTANTS.SERVER_IP}</div>
        <div style={{ fontSize: 11, marginTop: 1 }}>{renderStatusMeta(isLoading, status)}</div>
      </div>
      <button
        aria-label={ipCopied ? "IP copiada al portapapeles" : "Copiar IP del servidor"}
        type="button"
        onClick={onCopyIp}
        title="Copiar IP"
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: CONSTANTS.BG_WHITE_05,
          border: `1px solid ${CONSTANTS.BORDER_LOW}`,
          color: CONSTANTS.TEXT_MUTED_55,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = CONSTANTS.ACCENT_COLOR;
          e.currentTarget.style.borderColor = CONSTANTS.ACCENT_BORDER_30;
          e.currentTarget.style.background = CONSTANTS.ACCENT_TINT_12;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = CONSTANTS.TEXT_MUTED_55;
          e.currentTarget.style.borderColor = CONSTANTS.BORDER_LOW;
          e.currentTarget.style.background = CONSTANTS.BG_WHITE_05;
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span
          className={`copied-tip ${ipCopied ? "visible" : ""}`}
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            background: "#0E1118",
            border: `1px solid ${CONSTANTS.ACCENT_BORDER_30}`,
            color: CONSTANTS.ACCENT_COLOR,
            fontSize: 10.5,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 8,
            whiteSpace: "nowrap",
          }}
        >
          ¡IP copiada!
        </span>
      </button>
    </div>
  );
};

/* ── Componente: Quick Play Button ── */

interface QuickPlayButtonProps {
  isLaunching: boolean;
  isInGame: boolean;
  launchProgress: number;
  launchStatus: string | null;
  onPlay: () => void;
}

const QuickPlayButton: React.FC<QuickPlayButtonProps> = ({
  isLaunching,
  isInGame,
  launchProgress,
  launchStatus,
  onPlay,
}) => {
  const buttonLabel = getPlayButtonText(isLaunching, isInGame);
  const buttonAria = getPlayButtonAriaLabel(isLaunching, isInGame);
  const background = isInGame
    ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
    : "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)";
  const progressPercent = isLaunching ? launchProgress * 100 : 0;
  const showProgressBorder = isLaunching && launchProgress < 1;

  return (
    <button
      aria-label={buttonAria}
      aria-busy={isLaunching}
      type="button"
      onClick={onPlay}
      disabled={isLaunching}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: 12,
        background,
        color: "#FFFFFF",
        cursor: isLaunching ? "wait" : "pointer",
        fontFamily: "var(--font-family)",
        fontSize: 16,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
        height: 56,
        transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        if (!isLaunching) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.filter = "brightness(1.06)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.filter = "none";
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: `${progressPercent}%`,
          background: "linear-gradient(90deg, rgba(6, 40, 36, 0.35), rgba(6, 40, 36, 0.55))",
          borderRight: showProgressBorder ? "2px solid rgba(255, 255, 255, 0.65)" : "none",
          transition: "width 0.35s ease",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          height: "100%",
        }}
      >
        {!isLaunching && (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4.5v15l13-7.5-13-7.5z" />
          </svg>
        )}
        <span>{buttonLabel}</span>
        {isLaunching && !isInGame && (
          <span style={{ fontSize: 13, letterSpacing: "0.05em" }}>{Math.round(launchProgress * 100)}%</span>
        )}
      </div>
      {isLaunching && launchStatus && (
        <div
          style={{
            position: "absolute",
            left: 20,
            bottom: 7,
            zIndex: 1,
            fontSize: 9.5,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(5, 42, 38, 0.75)",
          }}
        >
          {launchStatus}
        </div>
      )}
    </button>
  );
};

/* ── Componente: News Banner Carousel ── */

interface NewsBannerProps {
  news: NewsPost[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onNavigateNews?: () => void;
  onHoverChange: (hover: boolean) => void;
}

const NewsBanner: React.FC<NewsBannerProps> = ({
  news,
  activeIndex,
  onSelectIndex,
  onPrev,
  onNext,
  onNavigateNews,
  onHoverChange,
}) => {
  const currentPost = news[activeIndex] || news[0];
  const currentStyle = currentPost ? categoryStyle(currentPost.category) : categoryStyle("");

  return (
    <div className="reveal-up" style={{ flex: 2.15, display: "flex", flexDirection: "column", minHeight: 0, animationDelay: "0.06s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Novedades
        </h2>
        <button
          type="button"
          onClick={() => onNavigateNews?.()}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontSize: 11.5,
            fontWeight: 600,
            color: CONSTANTS.ACCENT_COLOR,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            opacity: 0.85,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
          onFocus={(e) => (e.currentTarget.style.opacity = "1")}
          onBlur={(e) => (e.currentTarget.style.opacity = "0.85")}
        >
          Ver todo
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <div
        className="hero-news-carousel"
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        onFocus={() => onHoverChange(true)}
        onBlur={() => onHoverChange(false)}
        style={{
          flex: 1,
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          background: "rgba(10, 15, 26, 0.6)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
          minHeight: 0,
        }}
      >
        {!currentPost ? (
          <div style={{ padding: 20, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: "auto" }}>
            No hay novedades disponibles por ahora.
          </div>
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              {currentPost.imageUrl ? (
                <img
                  src={currentPost.imageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.65)",
                    transition: "color 0.5s ease, background-color 0.5s ease, border-color 0.5s ease, opacity 0.5s ease",
                  }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: currentStyle.thumb,
                    opacity: 0.85,
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(10, 15, 26, 0.15) 0%, rgba(10, 15, 26, 0.7) 55%, rgba(10, 15, 26, 0.95) 100%)",
                }}
              />
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 2,
                padding: "20px 24px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 12px",
                    borderRadius: 999,
                    color: currentStyle.color,
                    background: currentStyle.background,
                    border: `1px solid ${currentStyle.border}`,
                    backdropFilter: "blur(8px)",
                    boxShadow: `0 0 12px ${currentStyle.border}`,
                  }}
                >
                  {currentPost.category}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)", fontWeight: 500 }}>
                  {timeAgo(currentPost.createdAt)}
                </span>
              </div>

              <h3
                style={{
                  margin: "0 0 6px 0",
                  fontSize: 20,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  color: "#FFFFFF",
                  letterSpacing: "-0.01em",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                {currentPost.title}
              </h3>

              <p
                style={{
                  margin: "0 0 14px 0",
                  fontSize: 12.5,
                  color: "rgba(255, 255, 255, 0.78)",
                  lineHeight: 1.45,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  maxWidth: "92%",
                }}
              >
                {currentPost.content}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => onNavigateNews?.()}
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "#FFFFFF",
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "7px 16px",
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    backdropFilter: "blur(8px)",
                    transition: "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = CONSTANTS.ACCENT_COLOR;
                    e.currentTarget.style.color = "#052A26";
                    e.currentTarget.style.borderColor = CONSTANTS.ACCENT_COLOR;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                  }}
                >
                  <span>Leer noticia completa</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

                {news.length > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        aria-label="Noticia anterior"
                        type="button"
                        onClick={onPrev}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "rgba(0, 0, 0, 0.4)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "#FFF",
                          fontSize: 10,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backdropFilter: "blur(6px)",
                          transition: "color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s",
                        }}
                      >
                        <span aria-hidden="true">◀</span>
                      </button>
                      <button
                        aria-label="Noticia siguiente"
                        type="button"
                        onClick={onNext}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "rgba(0, 0, 0, 0.4)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "#FFF",
                          fontSize: 10,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backdropFilter: "blur(6px)",
                          transition: "color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s",
                        }}
                      >
                        <span aria-hidden="true">▶</span>
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {news.map((post, idx) => (
                        <button
                          aria-label={`Ir a noticia ${idx + 1}: ${post.title}`}
                          aria-pressed={activeIndex === idx}
                          type="button"
                          key={post.id}
                          onClick={() => onSelectIndex(idx)}
                          style={{
                            width: activeIndex === idx ? 18 : 7,
                            height: 7,
                            borderRadius: 999,
                            background: activeIndex === idx ? CONSTANTS.ACCENT_COLOR : "rgba(255, 255, 255, 0.3)",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            transition: "color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Componente: Cape Manager Control ── */

interface CapeManagerProps {
  userCapes: MinecraftCape[];
  selectedIndex: number;
  isEquipping: boolean;
  onPrevCape: () => void;
  onNextCape: () => void;
  onToggleCape: () => void;
}

const getCapeButtonStyles = (isEquipping: boolean, isNoCape: boolean, isCurrentlyActive: boolean) => {
  let background = "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)";
  let border = "none";
  let boxShadow = "0 4px 12px rgba(45, 212, 191, 0.25)";

  if (isNoCape) {
    background = "rgba(239, 68, 68, 0.15)";
    border = "1px solid rgba(239, 68, 68, 0.3)";
    boxShadow = "none";
  } else if (isCurrentlyActive) {
    background = "rgba(255, 255, 255, 0.1)";
    border = "1px solid rgba(255, 255, 255, 0.2)";
    boxShadow = "none";
  }

  return {
    background,
    border,
    boxShadow,
    color: isEquipping ? "rgba(255,255,255,0.4)" : "#FFF",
    cursor: isEquipping ? "not-allowed" : "pointer",
  };
};

const getCapeButtonLabel = (isEquipping: boolean, isNoCape: boolean, isCurrentlyActive: boolean): string => {
  if (isEquipping) return "Procesando...";
  if (isNoCape) return "Quitar Capa";
  if (isCurrentlyActive) return "Equipada";
  return "Equipar Capa";
};

const CapeManager: React.FC<CapeManagerProps> = ({
  userCapes,
  selectedIndex,
  isEquipping,
  onPrevCape,
  onNextCape,
  onToggleCape,
}) => {
  const isNoCape = selectedIndex === -1;
  const isCurrentlyActive = !isNoCape && userCapes[selectedIndex]?.state === CONSTANTS.ACTIVE_STATE;
  const capeDisplayName = isNoCape ? "Sin Capa" : userCapes[selectedIndex]?.alias || "Capa Oficial";
  const buttonStyle = getCapeButtonStyles(isEquipping, isNoCape, isCurrentlyActive);
  const buttonLabel = getCapeButtonLabel(isEquipping, isNoCape, isCurrentlyActive);

  return (
    <div
      style={{
        marginTop: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        width: "100%",
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "90%",
          background: "rgba(0, 0, 0, 0.2)",
          borderRadius: 20,
          padding: "4px 12px",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <button
          aria-label="Capa anterior"
          type="button"
          onClick={onPrevCape}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 14,
            cursor: "pointer",
            padding: "2px 6px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#2DD4BF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"; }}
        >
          <span aria-hidden="true">◀</span>
        </button>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#FFF",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 120,
          }}
        >
          {capeDisplayName}
        </span>

        <button
          aria-label="Capa siguiente"
          type="button"
          onClick={onNextCape}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 14,
            cursor: "pointer",
            padding: "2px 6px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#2DD4BF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"; }}
        >
          <span aria-hidden="true">▶</span>
        </button>
      </div>

      <button
        aria-label={isNoCape ? "Ocultar capa equipada" : `Equipar capa ${userCapes[selectedIndex]?.alias || "Oficial"}`}
        aria-busy={isEquipping}
        type="button"
        disabled={isEquipping}
        onClick={onToggleCape}
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          borderRadius: 8,
          padding: "6px 16px",
          transition: "color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s",
          width: "90%",
          ...buttonStyle,
        }}
        onMouseEnter={(e) => {
          if (isEquipping) return;
          if (isNoCape) {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
          } else if (isCurrentlyActive) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
          } else {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(45, 212, 191, 0.35)";
          }
        }}
        onMouseLeave={(e) => {
          if (isNoCape) {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
          } else if (isCurrentlyActive) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          } else {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 212, 191, 0.25)";
          }
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
};

/* ── Launch preparation helper ── */

const buildGameLaunchOptions = (
  username: string,
  uuid: string | undefined,
  accessToken: string | undefined,
  profile: Profile,
  resolvedGameDir: string,
  settings: ReturnType<typeof getSettings>
) => ({
  username,
  uuid: uuid || "00000000-0000-0000-0000-000000000000",
  accessToken: accessToken || "placeholder_token",
  mcVersion: profile.mcVersion,
  loaderType: profile.loaderType,
  loaderVersion: profile.loaderVersion,
  minRam: profile.minRam !== undefined ? profile.minRam : settings.minRam,
  maxRam: profile.maxRam !== undefined ? profile.maxRam : settings.maxRam,
  useOptimization: profile.useOptimization,
  javaArgs: profile.javaArgs,
  javaPath: profile.javaPath || settings.javaPath || undefined,
  gameDir: resolvedGameDir,
});

/* ── Componente Principal: HomePage ── */

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { currentSession, crystalSession } = useAuth();
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const [news, setNews] = useState<NewsPost[]>([]);
  const [ipCopied, setIpCopied] = useState(false);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  const [profilesVersion, setProfilesVersion] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);

  const [activeCapeUrl, setActiveCapeUrl] = useState<string | undefined>(undefined);
  const [userCapes, setUserCapes] = useState<MinecraftCape[]>([]);
  const [selectedCapeIndex, setSelectedCapeIndex] = useState<number>(-1);
  const [isEquippingCape, setIsEquippingCape] = useState(false);

  useEffect(() => {
    let ignore = false;
    const loadStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const status = await fetchServerStatus(CONSTANTS.SERVER_IP);
        if (!ignore) setServerStatus(status);
      } finally {
        if (!ignore) setIsLoadingStatus(false);
      }
    };

    loadStatus();
    fetchNews(5).then((data) => {
      if (!ignore) setNews(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (news.length <= 1 || isHoveringCarousel) return;
    const interval = setInterval(() => {
      setActiveNewsIndex((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [news.length, isHoveringCarousel]);

  useEffect(() => {
    let ignore = false;
    const loadProfileAndCapes = async () => {
      if (currentSession?.type === CONSTANTS.SESSION_MICROSOFT && currentSession.accessToken) {
        try {
          const profile = await fetchMinecraftProfile(currentSession.accessToken);
          if (!ignore && profile && profile.capes) {
            const capes = profile.capes || [];
            setUserCapes(capes);

            const activeIndex = capes.findIndex((c) => c.state === CONSTANTS.ACTIVE_STATE);
            if (activeIndex !== -1) {
              setSelectedCapeIndex(activeIndex);
              setActiveCapeUrl(capes[activeIndex].url || undefined);
            } else {
              setSelectedCapeIndex(-1);
              setActiveCapeUrl(undefined);
            }
          }
        } catch (err) {
          console.error("Error loading profile capes:", err);
        }
      } else if (!ignore) {
        setUserCapes([]);
        setSelectedCapeIndex(-1);
        setActiveCapeUrl(undefined);
      }
    };

    loadProfileAndCapes();
    return () => {
      ignore = true;
    };
  }, [currentSession]);

  const handleProfileChanged = () => {
    setProfilesVersion((v) => v + 1);
  };

  const handleCopyIp = async () => {
    try {
      await navigator.clipboard.writeText(CONSTANTS.SERVER_IP);
      setIpCopied(true);
      setTimeout(() => setIpCopied(false), 1600);
    } catch {
      // Clipboard unavailable
    }
  };

  const handlePrevCape = () => {
    if (userCapes.length === 0) return;
    const nextIndex = selectedCapeIndex - 1 < -1 ? userCapes.length - 1 : selectedCapeIndex - 1;
    setSelectedCapeIndex(nextIndex);
    setActiveCapeUrl(nextIndex === -1 ? undefined : (userCapes[nextIndex]?.url || undefined));
  };

  const handleNextCape = () => {
    if (userCapes.length === 0) return;
    const nextIndex = selectedCapeIndex + 1 >= userCapes.length ? -1 : selectedCapeIndex + 1;
    setSelectedCapeIndex(nextIndex);
    setActiveCapeUrl(nextIndex === -1 ? undefined : (userCapes[nextIndex]?.url || undefined));
  };

  const handleToggleCape = async () => {
    if (!currentSession?.accessToken) return;
    setIsEquippingCape(true);
    try {
      if (selectedCapeIndex === -1) {
        await hideCape(currentSession.accessToken);
        setUserCapes((prev) => prev.map((c) => ({ ...c, state: CONSTANTS.INACTIVE_STATE })));
        return;
      }
      const targetCape = userCapes[selectedCapeIndex];
      if (targetCape && targetCape.id) {
        await setActiveCape(currentSession.accessToken, targetCape.id);
        setUserCapes((prev) =>
          prev.map((c, idx) => ({
            ...c,
            state: idx === selectedCapeIndex ? CONSTANTS.ACTIVE_STATE : CONSTANTS.INACTIVE_STATE,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to change cape state:", err);
    } finally {
      setIsEquippingCape(false);
    }
  };

  const handlePlay = async () => {
    if (!currentSession || isLaunching) return;
    setIsLaunching(true);
    setLaunchError(null);
    setLaunchStatus("Resolviendo directorios...");
    setLaunchProgress(0.02);

    try {
      const homeDir: string | null = await invoke("get_home_dir");
      if (!homeDir) throw new Error("No se pudo obtener el directorio personal.");

      const profile = getActiveProfile();
      const resolvedGameDir = resolveProfileGameDir(profile, homeDir);
      const settings = getSettings();

      if (profile.loaderType !== "vanilla" && profile.loaderType !== "") {
        setLaunchStatus("Sincronizando mods...");
        setLaunchProgress(0.05);
        await syncOfficialMods(resolvedGameDir, (status, progress) => {
          setLaunchStatus(status);
          setLaunchProgress(progress * 0.4);
        });
      }

      setLaunchStatus("Iniciando Minecraft...");
      setLaunchProgress(0.5);

      const launchOpts = buildGameLaunchOptions(
        currentSession.username,
        currentSession.uuid,
        currentSession.accessToken,
        profile,
        resolvedGameDir,
        settings
      );

      await launchGame(launchOpts, (status, progress) => {
        setLaunchStatus(status);
        setLaunchProgress(0.5 + progress * 0.5);
      });

      setLaunchStatus("¡En juego!");
      setLaunchProgress(1);

      setTimeout(() => {
        setLaunchStatus(null);
        setIsLaunching(false);
      }, 5000);
    } catch (err: unknown) {
      setLaunchError(err instanceof Error ? err.message : String(err));
      setLaunchStatus(null);
      setIsLaunching(false);
    }
  };

  const isInGame = isLaunching && launchProgress >= 1;

  return (
    <div
      style={{
        padding: "26px 28px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* ── Hero: saludo + módulo de servidor consolidado ── */}
      <section className="reveal-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: CONSTANTS.ACCENT_COLOR,
              marginBottom: 4,
            }}
          >
            {getDayPart()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 27, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#FFF" }}>
              {crystalSession?.username || currentSession?.username || "Invitado"}
            </h1>
            {crystalSession?.role && <RoleBadge role={crystalSession.role} size="md" />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: CONSTANTS.ACCENT_COLOR,
                background: CONSTANTS.ACCENT_TINT_12,
                border: "1px solid rgba(45, 212, 191, 0.25)",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              {getAccountBadgeLabel(currentSession?.type)}
            </span>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Todo listo para sumergirte</span>
          </div>
        </div>

        <ServerStatusPill
          status={serverStatus}
          isLoading={isLoadingStatus}
          ipCopied={ipCopied}
          onCopyIp={handleCopyIp}
        />
      </section>

      {/* ── Contenido: novedades + jugador ── */}
      <section style={{ flex: 1, display: "flex", gap: 18, minHeight: 0 }}>
        <NewsBanner
          news={news}
          activeIndex={activeNewsIndex}
          onSelectIndex={setActiveNewsIndex}
          onPrev={() => setActiveNewsIndex((prev) => (prev - 1 + news.length) % news.length)}
          onNext={() => setActiveNewsIndex((prev) => (prev + 1) % news.length)}
          onNavigateNews={() => onNavigate?.("news")}
          onHoverChange={setIsHoveringCarousel}
        />

        {/* Tarjeta del jugador */}
        <div className="reveal-up custom-scrollbar" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12, height: "100%", overflowY: "auto", animationDelay: "0.12s" }}>
          <CrystalCard
            enableHoverEffect={false}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "18px 16px 15px",
              position: "relative",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -70,
                left: "50%",
                transform: "translateX(-50%)",
                width: 260,
                height: 260,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(45, 212, 191, 0.14) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", zIndex: 1, color: "#FFF" }}>
              {currentSession?.username || "Invitado"}
            </div>
            {crystalSession?.role && (
              <RoleBadge role={crystalSession.role} size="md" style={{ marginTop: 6, zIndex: 1 }} />
            )}
            <div style={{ flex: 1, width: "100%", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1, minHeight: 0 }}>
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 130,
                  height: 26,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(45, 212, 191, 0.3) 0%, transparent 70%)",
                  filter: "blur(6px)",
                }}
              />
              <div className="float-anim" style={{ width: "100%", height: "100%", zIndex: 1 }}>
                <SkinViewer username={currentSession?.username || "Steve"} uuid={currentSession?.uuid} capeUrl={activeCapeUrl} />
              </div>
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                zIndex: 1,
                marginBottom: currentSession?.type === CONSTANTS.SESSION_MICROSOFT ? 2 : 0,
              }}
            >
              Skin 3D interactiva
            </div>

            {currentSession?.type === CONSTANTS.SESSION_MICROSOFT && userCapes.length > 0 && (
              <CapeManager
                userCapes={userCapes}
                selectedIndex={selectedCapeIndex}
                isEquipping={isEquippingCape}
                onPrevCape={handlePrevCape}
                onNextCape={handleNextCape}
                onToggleCape={handleToggleCape}
              />
            )}
          </CrystalCard>
        </div>
      </section>

      {/* ── Error de lanzamiento ── */}
      {launchError && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--danger)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#FFBABA",
            fontSize: 13,
            textAlign: "left",
          }}
        >
          ⚠️ {launchError}
        </div>
      )}

      {/* ── Dock: perfil + jugar ── */}
      <section
        className="reveal-up"
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 12,
          animationDelay: "0.18s",
          position: "relative",
          zIndex: 10,
          backgroundColor: "rgba(11, 14, 21, 0.95)",
          backdropFilter: "blur(16px)",
          padding: "10px 12px",
          borderRadius: 14,
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
        }}
      >
        <ProfileSelector
          key={profilesVersion}
          onEditProfile={(p) => {
            setProfileToEdit(p);
            setIsEditingProfile(true);
          }}
          onCreateProfile={() => {
            setIsCreatingProfile(true);
          }}
          onProfileChanged={handleProfileChanged}
        />

        <QuickPlayButton
          isLaunching={isLaunching}
          isInGame={isInGame}
          launchProgress={launchProgress}
          launchStatus={launchStatus}
          onPlay={handlePlay}
        />
      </section>

      {/* Editor/Creator Modal */}
      {(isEditingProfile || isCreatingProfile) && (
        <ProfileEditorDialog
          profile={isEditingProfile ? profileToEdit : null}
          onClose={() => {
            setIsEditingProfile(false);
            setIsCreatingProfile(false);
            setProfileToEdit(null);
          }}
          onSave={handleProfileChanged}
        />
      )}
    </div>
  );
};