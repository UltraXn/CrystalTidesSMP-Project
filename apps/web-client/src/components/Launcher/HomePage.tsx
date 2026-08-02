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

const SERVER_IP = "mc.crystaltidesSMP.net";

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
  if (c.includes("evento"))
    return {
      color: "#C4B5FD",
      background: "rgba(139, 92, 246, 0.12)",
      border: "rgba(139, 92, 246, 0.35)",
      thumb: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 55%, #1E1038 100%)",
    };
  if (c.includes("mantenimiento"))
    return {
      color: "#FCD34D",
      background: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.35)",
      thumb: "linear-gradient(135deg, #D97706 0%, #92400E 55%, #2A1503 100%)",
    };
  if (c.includes("anuncio") || c.includes("comunidad"))
    return {
      color: "#7DD3FC",
      background: "rgba(14, 165, 233, 0.12)",
      border: "rgba(14, 165, 233, 0.35)",
      thumb: "linear-gradient(135deg, #0EA5E9 0%, #155E75 55%, #062530 100%)",
    };
  return {
    color: "var(--accent)",
    background: "rgba(45, 212, 191, 0.12)",
    border: "rgba(45, 212, 191, 0.3)",
    thumb: "linear-gradient(135deg, #0F766E 0%, #134E4A 55%, #04211E 100%)",
  };
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { currentSession, crystalSession } = useAuth();
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchError, setLaunchError] = useState<string | null>(null);

  // v2: noticias + feedback de copiar IP
  const [news, setNews] = useState<NewsPost[]>([]);
  const [ipCopied, setIpCopied] = useState(false);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  // Profile Dialog states
  const [profilesVersion, setProfilesVersion] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);

  // Capes state
  const [activeCapeUrl, setActiveCapeUrl] = useState<string | undefined>(undefined);
  const [userCapes, setUserCapes] = useState<MinecraftCape[]>([]);
  const [selectedCapeIndex, setSelectedCapeIndex] = useState<number>(-1);
  const [isEquippingCape, setIsEquippingCape] = useState(false);

  useEffect(() => {
    let ignore = false;
    loadServerStatus();
    fetchNews(5).then((data) => { if (!ignore) setNews(data); });
    return () => { ignore = true; };
  }, []);

  // Auto-advance news carousel slider
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
      if (currentSession?.type === "microsoft" && currentSession.accessToken) {
        try {
          const profile = await fetchMinecraftProfile(currentSession.accessToken);
          if (!ignore && profile && profile.capes) {
            const capes = profile.capes || [];
            setUserCapes(capes);
            
            const activeIndex = capes.findIndex((c) => c.state === "ACTIVE");
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
    return () => { ignore = true; };
  }, [currentSession]);

  const loadServerStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const status = await fetchServerStatus(SERVER_IP);
      setServerStatus(status);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Remonta el selector para reflejar cambios (editar/clonar/eliminar perfiles)
  const handleProfileChanged = () => {
    setProfilesVersion((v) => v + 1);
  };

  const handleCopyIp = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_IP);
    } catch {
      // Portapapeles no disponible (permisos del webview); el feedback visual no se muestra
      return;
    }
    setIpCopied(true);
    setTimeout(() => setIpCopied(false), 1600);
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

      // Only sync mods if it's not a pure vanilla profile
      if (profile.loaderType !== "vanilla" && profile.loaderType !== "") {
        setLaunchStatus("Sincronizando mods...");
        setLaunchProgress(0.05);
        await syncOfficialMods(resolvedGameDir, (status, progress) => {
          setLaunchStatus(status);
          setLaunchProgress(progress * 0.4); // Scale to 40% of the bar
        });
      }

      setLaunchStatus("Iniciando Minecraft...");
      setLaunchProgress(0.5);

      await launchGame({
        username: currentSession.username,
        uuid: currentSession.uuid || "00000000-0000-0000-0000-000000000000",
        accessToken: currentSession.accessToken || "placeholder_token",
        mcVersion: profile.mcVersion,
        loaderType: profile.loaderType,
        loaderVersion: profile.loaderVersion,
        minRam: profile.minRam !== undefined ? profile.minRam : settings.minRam,
        maxRam: profile.maxRam !== undefined ? profile.maxRam : settings.maxRam,
        useOptimization: profile.useOptimization,
        javaArgs: profile.javaArgs,
        javaPath: profile.javaPath || settings.javaPath || undefined,
        gameDir: resolvedGameDir,
      }, (status, progress) => {
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

  const statusDotColor = (): string => {
    if (isLoadingStatus) return "#FFA726";
    if (!serverStatus) return "rgba(255,255,255,0.3)";
    return serverStatus.online ? "#10B981" : "#EF4444";
  };

  // v2: meta consolidado del módulo de servidor
  const statusMeta = (): React.ReactNode => {
    if (isLoadingStatus) return <span style={{ color: "rgba(255,255,255,0.5)" }}>Consultando estado...</span>;
    if (!serverStatus) return <span style={{ color: "rgba(255,255,255,0.5)" }}>No disponible</span>;
    if (!serverStatus.online) return <span style={{ color: "#FCA5A5" }}>Desconectado</span>;
    const players = serverStatus.playersOnline !== null && serverStatus.playersMax !== null
      ? ` · ${serverStatus.playersOnline}/${serverStatus.playersMax} jugadores`
      : "";
    return (
      <>
        <span style={{ color: "#34D399", fontWeight: 600 }}>En línea</span>
        <span style={{ color: "rgba(255,255,255,0.55)" }}>{players}</span>
      </>
    );
  };

  const accountBadgeLabel = (): string => {
    switch (currentSession?.type) {
      case "guest": return "Invitado";
      case "microsoft": return "Premium";
      default: return "Sin sesión";
    }
  };

  const isInGame = isLaunching && launchProgress >= 1;

  return (
    <div style={{
      padding: "26px 28px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      height: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    }}>
      {/* ── Hero: saludo + módulo de servidor consolidado ── */}
      <section className="reveal-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 4,
          }}>
            {getDayPart()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 27, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#FFF" }}>
              {crystalSession?.username || currentSession?.username || "Invitado"}
            </h1>
            {crystalSession?.role && <RoleBadge role={crystalSession.role} size="md" />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--accent)",
              background: "rgba(45, 212, 191, 0.12)",
              border: "1px solid rgba(45, 212, 191, 0.25)",
              padding: "2px 8px",
              borderRadius: 999,
            }}>
              {accountBadgeLabel()}
            </span>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Todo listo para sumergirte</span>
          </div>
        </div>

        {/* Módulo de servidor (antes duplicado: pill + tarjeta) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-low)",
          borderRadius: 14,
          padding: "10px 12px 10px 16px",
        }}>
          <div className="pulse-dot" style={{ backgroundColor: statusDotColor(), boxShadow: `0 0 8px ${statusDotColor()}` }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#FFF" }}>{SERVER_IP}</div>
            <div style={{ fontSize: 11, marginTop: 1 }}>{statusMeta()}</div>
          </div>
          <button aria-label="Action" type="button"
            onClick={handleCopyIp}
            title="Copiar IP"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-low)",
              color: "rgba(255, 255, 255, 0.55)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.3)";
              e.currentTarget.style.background = "rgba(45, 212, 191, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.55)";
              e.currentTarget.style.borderColor = "var(--border-low)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
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
                border: "1px solid rgba(45, 212, 191, 0.3)",
                color: "var(--accent)",
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
      </section>

      {/* ── Contenido: novedades + jugador ── */}
      <section style={{ flex: 1, display: "flex", gap: 18, minHeight: 0 }}>
        {/* Novedades */}
        <div className="reveal-up" style={{ flex: 2.15, display: "flex", flexDirection: "column", minHeight: 0, animationDelay: "0.06s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Novedades
            </h2>
            <button
              type="button"
              onClick={() => onNavigate?.("news")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--accent)",
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

          {(() => {
            const currentPost = news[activeNewsIndex] || news[0];
            const currentStyle = currentPost ? categoryStyle(currentPost.category) : categoryStyle("");

            return (
              <div
                className="hero-news-carousel"
                onMouseEnter={() => setIsHoveringCarousel(true)}
                onMouseLeave={() => setIsHoveringCarousel(false)}
                onFocus={() => setIsHoveringCarousel(true)}
                onBlur={() => setIsHoveringCarousel(false)}
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
                {currentPost ? (
                  <>
                    {/* Background Image / Gradient */}
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
                      {/* Subtle Gradient Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(10, 15, 26, 0.15) 0%, rgba(10, 15, 26, 0.7) 55%, rgba(10, 15, 26, 0.95) 100%)",
                        }}
                      />
                    </div>

                    {/* Content Overlay */}
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
                        <button type="button"
                          onClick={() => onNavigate?.("news")}
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
                            e.currentTarget.style.background = "var(--accent)";
                            e.currentTarget.style.color = "#052A26";
                            e.currentTarget.style.borderColor = "var(--accent)";
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

                        {/* Controls & Dots */}
                        {news.length > 1 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {/* Prev / Next Arrows */}
                            <div style={{ display: "flex", gap: 6 }}>
                              <button aria-label="Action" type="button"
                                onClick={() => setActiveNewsIndex((prev) => (prev - 1 + news.length) % news.length)}
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
                                ◀
                              </button>
                              <button aria-label="Action" type="button"
                                onClick={() => setActiveNewsIndex((prev) => (prev + 1) % news.length)}
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
                                ▶
                              </button>
                            </div>

                            {/* Pagination Dots */}
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              {news.map((post, idx) => (
                                <button aria-label="Action" type="button"
                                  key={post.id}
                                  onClick={() => setActiveNewsIndex(idx)}
                                  style={{
                                    width: activeNewsIndex === idx ? 18 : 7,
                                    height: 7,
                                    borderRadius: 999,
                                    background: activeNewsIndex === idx ? "var(--accent)" : "rgba(255, 255, 255, 0.3)",
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
                ) : (
                  <div style={{ padding: 20, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: "auto" }}>
                    No hay novedades disponibles por ahora.
                  </div>
                )}
              </div>
            );
          })()}
        </div>

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
            {/* Glow superior */}
            <div style={{
              position: "absolute",
              top: -70,
              left: "50%",
              transform: "translateX(-50%)",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(45, 212, 191, 0.14) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", zIndex: 1, color: "#FFF" }}>
              {currentSession?.username || "Invitado"}
            </div>
            {crystalSession?.role && (
              <RoleBadge role={crystalSession.role} size="md" style={{ marginTop: 6, zIndex: 1 }} />
            )}
            <div style={{ flex: 1, width: "100%", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1, minHeight: 0 }}>
              {/* Pedestal de luz */}
              <div style={{
                position: "absolute",
                bottom: 4,
                left: "50%",
                transform: "translateX(-50%)",
                width: 130,
                height: 26,
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(45, 212, 191, 0.3) 0%, transparent 70%)",
                filter: "blur(6px)",
              }} />
              <div className="float-anim" style={{ width: "100%", height: "100%", zIndex: 1 }}>
                <SkinViewer username={currentSession?.username || "Steve"} uuid={currentSession?.uuid} capeUrl={activeCapeUrl} />
              </div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", zIndex: 1, marginBottom: currentSession?.type === "microsoft" ? 2 : 0 }}>
              Skin 3D interactiva
            </div>
            {currentSession?.type === "microsoft" && userCapes.length > 0 && (
              <div style={{
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                width: "100%",
                zIndex: 1,
              }}>
                {/* Carousel Selector */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "90%",
                  background: "rgba(0, 0, 0, 0.2)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}>
                  {/* Left Arrow */}
                  <button aria-label="Action" type="button"
                    onClick={() => {
                      if (userCapes.length === 0) return;
                      let nextIndex = selectedCapeIndex - 1;
                      if (nextIndex < -1) {
                        nextIndex = userCapes.length - 1;
                      }
                      setSelectedCapeIndex(nextIndex);
                      setActiveCapeUrl(nextIndex === -1 ? undefined : (userCapes[nextIndex]?.url || undefined));
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: 14,
                      cursor: "pointer",
                      padding: "2px 6px",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#2DD4BF"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                  >
                    ◀
                  </button>

                  {/* Cape Name */}
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#FFF",
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 120,
                  }}>
                    {selectedCapeIndex === -1 ? "Sin Capa" : userCapes[selectedCapeIndex]?.alias || "Capa Oficial"}
                  </span>

                  {/* Right Arrow */}
                  <button aria-label="Action" type="button"
                    onClick={() => {
                      if (userCapes.length === 0) return;
                      let nextIndex = selectedCapeIndex + 1;
                      if (nextIndex >= userCapes.length) {
                        nextIndex = -1;
                      }
                      setSelectedCapeIndex(nextIndex);
                      setActiveCapeUrl(nextIndex === -1 ? undefined : (userCapes[nextIndex]?.url || undefined));
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: 14,
                      cursor: "pointer",
                      padding: "2px 6px",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#2DD4BF"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                  >
                    ▶
                  </button>
                </div>

                {/* Action Button */}
                <button aria-label="Action" type="button"
                  disabled={isEquippingCape}
                  onClick={async () => {
                    if (!currentSession?.accessToken) return;
                    setIsEquippingCape(true);
                    try {
                      if (selectedCapeIndex === -1) {
                        await hideCape(currentSession.accessToken);
                        setUserCapes(prev => prev.map(c => ({ ...c, state: "INACTIVE" })));
                      } else {
                        const targetCape = userCapes[selectedCapeIndex];
                        if (targetCape && targetCape.id) {
                          await setActiveCape(currentSession.accessToken, targetCape.id);
                          setUserCapes(prev => prev.map((c, idx) => ({
                            ...c,
                            state: idx === selectedCapeIndex ? "ACTIVE" : "INACTIVE"
                          })));
                        }
                      }
                    } catch (err) {
                      console.error("Failed to change cape state:", err);
                    } finally {
                      setIsEquippingCape(false);
                    }
                  }}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: isEquippingCape ? "rgba(255,255,255,0.4)" : "#FFF",
                    background: selectedCapeIndex === -1
                      ? "rgba(239, 68, 68, 0.15)"
                      : userCapes[selectedCapeIndex]?.state === "ACTIVE"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)",
                    border: selectedCapeIndex === -1
                      ? "1px solid rgba(239, 68, 68, 0.3)"
                      : userCapes[selectedCapeIndex]?.state === "ACTIVE"
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "none",
                    borderRadius: 8,
                    padding: "6px 16px",
                    cursor: isEquippingCape ? "not-allowed" : "pointer",
                    transition: "color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s",
                    boxShadow: selectedCapeIndex !== -1 && userCapes[selectedCapeIndex]?.state !== "ACTIVE"
                      ? "0 4px 12px rgba(45, 212, 191, 0.25)"
                      : "none",
                    width: "90%",
                  }}
                  onMouseEnter={(e) => {
                    if (isEquippingCape) return;
                    if (selectedCapeIndex === -1) {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                    } else if (userCapes[selectedCapeIndex]?.state === "ACTIVE") {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                    } else {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(45, 212, 191, 0.35)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCapeIndex === -1) {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                    } else if (userCapes[selectedCapeIndex]?.state === "ACTIVE") {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    } else {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 212, 191, 0.25)";
                    }
                  }}
                >
                  {isEquippingCape
                    ? "Procesando..."
                    : selectedCapeIndex === -1
                      ? "Quitar Capa"
                      : userCapes[selectedCapeIndex]?.state === "ACTIVE"
                        ? "Equipada"
                        : "Equipar Capa"}
                </button>
              </div>
            )}
          </CrystalCard>
        </div>
      </section>

      {/* ── Error de lanzamiento ── */}
      {launchError && (
        <div style={{
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid var(--danger)",
          borderRadius: 10,
          padding: "10px 14px",
          color: "#FFBABA",
          fontSize: 13,
          textAlign: "left",
        }}>
          ⚠️ {launchError}
        </div>
      )}

      {/* ── Dock: perfil + jugar ── */}
      <section className="reveal-up" style={{ display: "flex", alignItems: "stretch", gap: 14, animationDelay: "0.18s", position: "relative", zIndex: 10, backgroundColor: "rgba(10, 14, 23, 0.95)", backdropFilter: "blur(16px)", padding: "10px 14px", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.12)", boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.4)" }}>
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

        {/* Botón JUGAR con progreso integrado */}
        <button aria-label="Action" type="button"
          onClick={handlePlay}
          disabled={isLaunching}
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            borderRadius: 14,
            background: isInGame
              ? "linear-gradient(135deg, #34D399, #10B981)"
              : "linear-gradient(135deg, var(--accent) 0%, #14B8A6 55%, var(--primary) 100%)",
            color: "#052A26",
            cursor: isLaunching ? "wait" : "pointer",
            fontFamily: "var(--font-family)",
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            boxShadow: "0 6px 24px rgba(45, 212, 191, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
            height: 62,
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease, box-shadow 0.25s ease",
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
          {/* Relleno de progreso */}
          <div style={{
            position: "absolute",
            inset: 0,
            width: `${isLaunching ? launchProgress * 100 : 0}%`,
            background: "linear-gradient(90deg, rgba(6, 40, 36, 0.35), rgba(6, 40, 36, 0.55))",
            borderRight: isLaunching && launchProgress < 1 ? "2px solid rgba(255, 255, 255, 0.65)" : "none",
            transition: "width 0.35s ease",
            pointerEvents: "none",
          }} />
          {/* Etiqueta */}
          <div style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            height: "100%",
          }}>
            {!isLaunching && (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4.5v15l13-7.5-13-7.5z" />
              </svg>
            )}
            <span>{isInGame ? "En juego" : isLaunching ? "Iniciando" : "Jugar"}</span>
            {isLaunching && !isInGame && (
              <span style={{ fontSize: 13, letterSpacing: "0.05em" }}>{Math.round(launchProgress * 100)}%</span>
            )}
          </div>
          {/* Estado inferior */}
          {isLaunching && launchStatus && (
            <div style={{
              position: "absolute",
              left: 20,
              bottom: 7,
              zIndex: 1,
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(5, 42, 38, 0.75)",
            }}>
              {launchStatus}
            </div>
          )}
        </button>
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
