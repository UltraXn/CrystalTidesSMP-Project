import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Medal, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { UserIdentity, Provider } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import "../dashboard.css";
import Loader from "../components/UI/Loader";
import ConfirmationModal from "../components/UI/ConfirmationModal";
import PlayerStats from "../components/Widgets/PlayerStats";
import { MEDAL_ICONS } from "../utils/MedalIcons";
import Toast, { ToastType } from "../components/UI/Toast";
import { useSidebar } from "../context/SidebarContext";
import { 
  useAccountSettings, 
  useUserThreads, 
  usePlayerStats, 
  useLinkStatus,
  useGenerateLinkCode,
  useVerifyLinkCode,
  useUnlinkAccount
} from "../hooks/useAccountData";

// Extracted Components
import AccountSidebar from "../components/Account/AccountSidebar";
import AchievementCard from "../components/Account/AchievementCard";
import ConnectionCards from "../components/Account/ConnectionCards";
import ProfileSettings from "../components/Account/ProfileSettings";

import SuccessModal from "../components/UI/SuccessModal";
import PlaystyleRadar from "../components/Account/PlaystyleRadarFinal";
import ShareableCard from "../components/Account/ShareableCard";



export default function Account() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Tab & Navigation State
  const [activeTab, setActiveTabInternal] = useState(searchParams.get("tab") || "overview");
  
  const setActiveTab = (tab: string) => {
    setActiveTabInternal(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tab = searchParams.get("tab") || "overview";
    if (tab !== activeTab) setActiveTabInternal(tab);
  }, [searchParams, activeTab]);

  // 2. Queries (TanStack Query)
  const { data: settingsData } = useAccountSettings();
  const medalDefinitions = settingsData?.medal_definitions || [];
  const achievementDefinitions = settingsData?.achievement_definitions || [];

  const { data: userThreads = [], isLoading: loadingThreads } = useUserThreads(
    user?.id,
    activeTab === "posts"
  );

  const mcUUID = user?.user_metadata?.minecraft_uuid;
  const { data: statsData, isLoading: loadingStats, isError: statsError } = usePlayerStats(
    mcUUID,
    activeTab === "overview" || activeTab === "connections"
  );

  const [linkCode, setLinkCode] = useState<string | null>(null);
  const { data: linkStatus } = useLinkStatus(user?.id, !!linkCode && !mcUUID);

  // 3. UI States (Mobile/Sidebar)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (isMobile && sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isMobile, sidebarOpen]);

  // 4. Derived Data & Helpers
  const isLinked = !!mcUUID;
  const mcUsername = isLinked
    ? user?.user_metadata?.minecraft_nick || user?.user_metadata?.username
    : t("account.minecraft.not_linked");

  const identities = user?.identities || [];
  const discordIdentity = identities.find((id: UserIdentity) => id.provider === "discord");
  const twitchIdentity = identities.find((id: UserIdentity) => id.provider === "twitch");

  const discordMetadata = user?.user_metadata?.discord_id || user?.user_metadata?.discord_name || user?.user_metadata?.discord_tag;
  const isDiscordLinked = !!discordIdentity || !!discordMetadata;

  // Achievement Logic
  const hoursPlayed = statsData?.raw_playtime ? Number(statsData.raw_playtime) / 1000 / 60 / 60 : 0;
  const money = typeof statsData?.money === "string" ? parseFloat(statsData.money.replace(/[^0-9.-]+/g, "")) : Number(statsData?.money || 0);
  const blocksPlaced = Number(statsData?.raw_blocks_placed || 0);
  const blocksMined = Number(statsData?.raw_blocks_mined || 0);
  const kills = Number(statsData?.raw_kills || 0);

  const isDweller = !!user?.app_metadata?.discord_id || !!user?.user_metadata?.discord_id;
  const isMagnate = money >= 5000;
  const isArchitect = blocksPlaced >= 1000;
  const isDeepMiner = blocksMined >= 1000;
  const isGuardian = kills >= 10;
  const isTimeTraveler = hoursPlayed >= 50;
  const rankLower = (statsData?.raw_rank || "").toLowerCase();
  const isPatron = rankLower.includes("donador") || rankLower.includes("fundador") || rankLower.includes("donor") || rankLower.includes("founder") || rankLower.includes("neroferno");

  const unlockStatus: Record<string, boolean> = {
    dweller: isDweller,
    magnate: isMagnate,
    architect: isArchitect,
    deep_miner: isDeepMiner,
    guardian: isGuardian,
    time_traveler: isTimeTraveler,
    patron: isPatron,
  };

  // 5. Handlers & Mutations
  const { mutate: generateCode, isPending: linkLoading } = useGenerateLinkCode();
  const { mutate: verifyCode, isPending: isVerifyingMutation } = useVerifyLinkCode();
  const { mutate: unlinkAccount, isPending: isUnlinking } = useUnlinkAccount();

  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
  const [identityToUnlink, setIdentityToUnlink] = useState<UserIdentity | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<"provider" | "minecraft" | "discord" | null>(null);

  const [manualCode, setManualCode] = useState("");
  const [discordManualCode, setDiscordManualCode] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Backwards compatibility for UI states
  const isVerifying = isVerifyingMutation;
  const isVerifyingDiscord = isVerifyingMutation;
  const [sharingAchievement, setSharingAchievement] = useState<{title: string; description: string; icon: React.ReactNode; unlocked: boolean;} | null>(null);


  const [toast, setToast] = useState<{visible: boolean; message: string; type: ToastType;}>({visible: false, message: "", type: "info"});
  const showToast = (message: string, type: ToastType = "info") => setToast({ visible: true, message, type });

  const handleShare = (achievement: { name: string; description: string; icon: React.ReactNode; image_url?: string }) => {
    setSharingAchievement({
        ...achievement,
        title: achievement.name,
        icon: achievement.image_url ? (
            <img src={achievement.image_url} alt={achievement.name} className="w-full h-full object-contain rounded-lg" />
        ) : achievement.icon,
        unlocked: true,
    });
  };

  // Sync session on link success
  useEffect(() => {
    if (linkStatus?.linked) {
        setLinkCode(null);
        supabase.auth.refreshSession().then(() => setShowSuccessModal(true));
    }
  }, [linkStatus]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);


  const handleGenerateCode = () => {
    if (!user) return;
    generateCode(user.id, {
      onSuccess: (code) => setLinkCode(code),
      onError: (err: Error) => showToast(err.message || "Error al generar código", "error")
    });
  };

  const handleVerifyManualCode = () => {
    if (!user || !manualCode.trim()) return;
    verifyCode({ userId: user.id, code: manualCode.trim().toUpperCase() }, {
      onSuccess: () => {
        supabase.auth.refreshSession();
        setShowSuccessModal(true);
      },
      onError: (err: Error) => showToast(err.message, "error")
    });
  };

  const handleVerifyDiscordCode = () => {
    if (!user || !discordManualCode.trim()) return;
    verifyCode({ userId: user.id, code: discordManualCode.trim().toUpperCase() }, {
      onSuccess: () => {
        supabase.auth.refreshSession();
        setShowSuccessModal(true);
      },
      onError: (err: Error) => showToast(err.message, "error")
    });
  };


  const handleLinkProvider = async (provider: string) => {
    try {
      const { data, error } = await supabase.auth.linkIdentity({
        provider: provider as Provider,
        options: {
          redirectTo: window.location.href,
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error("Error linking provider:", error);
      const message = error instanceof Error ? error.message : String(error);
      alert("Error: " + message);
    }
  };

  const handleUnlinkProvider = (identity: UserIdentity) => {
    setIdentityToUnlink(identity);
    setUnlinkTarget("provider");
    setIsUnlinkModalOpen(true);
  };

  const handleUnlinkMinecraft = () => {
    setUnlinkTarget("minecraft");
    setIsUnlinkModalOpen(true);
  };

  const handleUnlinkDiscord = () => {
    setUnlinkTarget("discord");
    setIsUnlinkModalOpen(true);
  };

  const confirmUnlink = () => {
    if (!unlinkTarget) return;
    unlinkAccount({ target: unlinkTarget, identity: identityToUnlink || undefined }, {
      onSuccess: () => {
        showToast("Cambios guardados correctamente", "success");
        setIsUnlinkModalOpen(false);
        setIdentityToUnlink(null);
        setUnlinkTarget(null);
      },
      onError: (err: Error) => {
        showToast(err.message || "Error al desvincular", "error");
        setIsUnlinkModalOpen(false);
      }
    });
  };


  if (loading || !user)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "20vh", // Start at 20% of screen height
          background: "#080808",
        }}
      >
        <Loader style={{ height: "auto", minHeight: "auto" }} />
      </div>
    );

    return (
        <div className="min-h-screen bg-[#080808] pb-16 pt-28">
            <div className="max-w-[1400px] mx-auto px-6 lg:flex lg:gap-10">
                {/* Mobile Overlay */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 z-150 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <AccountSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    user={user}
                    statsData={statsData || undefined}
                    mcUsername={mcUsername}
                    isLinked={isLinked}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <main className="flex-1 mt-8 lg:mt-0 animate-fade-in relative">
          {activeTab === "overview" && (
            <div className="fade-in">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8 border-b border-white/5 pb-4">
                            {t("account.overview.stats_title")}
                        </h2>

              {isLinked ? (
                <PlayerStats
                  statsData={statsData}
                  loading={loadingStats}
                  error={statsError}
                />
              ) : (
                <div className="dashboard-card animate-fade-in mb-8 rounded-3xl border border-[#e74c3c]/10 bg-[#e74c3c]/5 px-8 py-12 text-center backdrop-blur-md">
                  <div className="mb-6 text-6xl drop-shadow-[0_0_10px_rgba(231,76,60,0.3)]">
                    🔗
                  </div>
                  <h3 className="mb-4 text-3xl font-extrabold text-[#ff6b6b]">
                    {t(
                      "account.overview.not_linked_title",
                      "¡Vincula tu cuenta!",
                    )}
                  </h3>
                  <p className="mx-auto mb-8 max-w-[500px] leading-[1.8] text-white/60">
                    {t(
                      "account.overview.not_linked_msg",
                      "Para ver tus estadísticas en tiempo real (dinero, tiempo de juego, muertes), necesitas verificar que eres el dueño de la cuenta de Minecraft.",
                    )}
                  </p>
                  <button
                    onClick={() => setActiveTab("connections")}
                    style={{
                      boxShadow: "0 10px 25px rgba(231, 76, 60, 0.2)",
                    }}
                    className="cursor-pointer rounded-2xl bg-[#ff6b6b] px-10 py-4 text-base font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    {t("account.overview.verify_btn", "Verificar Ahora")}
                  </button>
                </div>
              )}

              {isLinked && (
                <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                  <div className="dashboard-card animate-slide-up rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                    <h3 className="mb-6 flex items-center gap-2.5 border-b border-white/5 pb-4 text-lg text-white">
                      🎯{" "}
                      {t("account.overview.playstyle.title", "Estilo de Juego")}
                    </h3>
                    <PlaystyleRadar
                      stats={{
                        blocksPlaced: Number(statsData?.raw_blocks_placed || 0),
                        blocksMined: Number(statsData?.raw_blocks_mined || 0),
                        kills: Number(statsData?.raw_kills || 0),
                        mobKills: Number(statsData?.mob_kills || 0),
                        playtimeHours: statsData?.playtime
                          ? parseInt(
                              statsData.playtime.match(/(\d+)h/)?.[1] || "0",
                            ) +
                            parseInt(
                              statsData.playtime.match(/(\d+)m/)?.[1] || "0",
                            ) /
                              60
                          : 0,
                        money:
                          typeof statsData?.money === "string"
                            ? parseFloat(
                                statsData.money.replace(/[^0-9.-]+/g, ""),
                              )
                            : 0,
                        rank: statsData?.raw_rank || "default",
                      }}
                    />
                  </div>
                  <div
                    className="dashboard-card animate-slide-up"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(88, 101, 242, 0.1), rgba(0,0,0,0))",
                      padding: "2rem",
                      borderRadius: "16px",
                      border: "1px solid rgba(88, 101, 242, 0.2)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <h3
                      style={{
                        color: "#fff",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Info color="var(--accent)" />{" "}
                      {t(
                        "account.overview.playstyle.metrics_title",
                        "Métricas de Estilo",
                      )}
                    </h3>

                    <div style={{ overflowX: "auto", fontSize: "0.85rem" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          color: "#bbb",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.1)",
                              textAlign: "left",
                            }}
                          >
                            <th
                              style={{
                                padding: "6px 0",
                                color: "var(--accent)",
                              }}
                            >
                              {t("account.overview.playstyle.style", "Estilo")}
                            </th>
                            <th
                              style={{
                                padding: "6px 0",
                                color: "var(--accent)",
                              }}
                            >
                              {t(
                                "account.overview.playstyle.goal",
                                "Meta (100%)",
                              )}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <td
                              style={{
                                padding: "6px 0",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span style={{ color: "#e67e22" }}>🛠️</span>{" "}
                              {t(
                                "account.overview.playstyle.constructor",
                                "Constructor",
                              )}
                            </td>
                            <td style={{ padding: "6px 0" }}>
                              300,000{" "}
                              {t(
                                "account.overview.playstyle.blocks",
                                "bloques",
                              )}
                            </td>
                          </tr>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <td
                              style={{
                                padding: "6px 0",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span style={{ color: "#e74c3c" }}>⚔️</span>{" "}
                              {t(
                                "account.overview.playstyle.fighter",
                                "Luchador",
                              )}
                            </td>
                            <td style={{ padding: "6px 0" }}>
                              5,000{" "}
                              {t(
                                "account.overview.playstyle.pts_kill",
                                "pts (Kill x10)",
                              )}
                            </td>
                          </tr>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <td
                              style={{
                                padding: "6px 0",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span style={{ color: "#3498db" }}>🗺️</span>{" "}
                              {t(
                                "account.overview.playstyle.explorer",
                                "Explorador",
                              )}
                            </td>
                            <td style={{ padding: "6px 0" }}>
                              200{" "}
                              {t("account.overview.playstyle.hours", "horas")}
                            </td>
                          </tr>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <td
                              style={{
                                padding: "6px 0",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span style={{ color: "#f1c40f" }}>💰</span>{" "}
                              {t(
                                "account.overview.playstyle.merchant",
                                "Mercader",
                              )}
                            </td>
                            <td style={{ padding: "6px 0" }}>$1,000,000</td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                padding: "6px 0",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span style={{ color: "#9b59b6" }}>👥</span>{" "}
                              {t("account.overview.playstyle.social", "Social")}
                            </td>
                            <td style={{ padding: "6px 0" }}>
                              100{" "}
                              {t(
                                "account.overview.playstyle.pts_formula",
                                "pts (H x0.2 + Rango)",
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div
                        style={{
                          marginTop: "10px",
                          fontSize: "0.75rem",
                          color: "#666",
                          fontStyle: "italic",
                        }}
                      >
                        {t(
                          "account.overview.playstyle.social_note",
                          "* Social: +30 pts por rango Donador, Fundador, Killuwu, Neroferno, Developer o Staff.",
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "achievements" && (
            <div key="achievements" className="fade-in">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8 border-b border-white/5 pb-4">
                                {t("account.achievements.title")}
                            </h2>

              {sharingAchievement && (
                <ShareableCard
                  achievement={sharingAchievement}
                  username={
                    statsData?.username ||
                    user.user_metadata.full_name ||
                    "Jugador"
                  }
                  onClose={() => setSharingAchievement(null)}
                />
              )}

                            {/* Season Timeline */}
                            <div className="mb-10 bg-white/2 p-8 rounded-4xl border border-white/5 overflow-hidden">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-(--accent) mb-8">
                                    {t("account.journey_title", "📅 Tu Travesía en CrystalTides")}
                                </h3>
                                <div className="flex items-center gap-0 relative overflow-x-auto py-4 scrollbar-none">
                                    {/* Line Background */}
                                    <div className="absolute top-[32px] left-[70px] right-[70px] h-px bg-white/10 z-0" />

                                    {/* Nodes */}
                                    <div className="flex flex-col items-center min-w-[140px] relative z-10">
                                        <div className="w-4 h-4 rounded-full bg-(--accent) mb-4 shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]" />
                                        <span className="text-white text-xs font-black uppercase tracking-widest leading-loose">
                                            {t("account.journey_arrival", "Llegada")}
                                        </span>
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            {statsData?.member_since || "???"}
                                        </span>
                                    </div>

                                    {statsData?.raw_rank && !["default"].includes(statsData.raw_rank.toLowerCase()) && (
                                        <div className="flex flex-col items-center min-w-[140px] relative z-10 mx-auto">
                                            <div className="w-3 h-3 rounded-full bg-white mb-4" />
                                            <span className="text-white text-xs font-black uppercase tracking-widest leading-loose">
                                                {t("account.journey_promotion", "Ascenso")}
                                            </span>
                                            <span className="text-(--accent) text-[10px] font-black uppercase tracking-widest mt-1">
                                                {statsData.raw_rank}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center min-w-[140px] relative z-10 ml-auto text-right">
                                        <div className="w-4 h-4 rotate-45 bg-green-500 mb-4 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                        <span className="text-white text-xs font-black uppercase tracking-widest leading-loose">
                                            {t("account.journey_today", "Hoy")}
                                        </span>
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            {(statsData?.playtime ? (
                                                parseInt(statsData.playtime.match(/(\d+)h/)?.[1] || "0") + 
                                                parseInt(statsData.playtime.match(/(\d+)m/)?.[1] || "0") / 60
                                            ) : 0).toFixed(1)}h {t("account.journey_played", "jugadas")}
                                        </span>
                                    </div>
                                </div>
                            </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {achievementDefinitions.length > 0 ? (
                  achievementDefinitions.map((achievement) => {
                    const isUnlocked =
                      unlockStatus[achievement.id] ||
                      user.user_metadata?.achievements?.includes(
                        achievement.id,
                      ) ||
                      false;

                    // Prioritize uploaded image, fallback to emoji/icon
                    const renderedIcon = achievement.image_url ? (
                      <img
                        src={achievement.image_url}
                        alt={achievement.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      achievement.icon
                    );

                    return (
                      <AchievementCard
                        key={achievement.id}
                        title={achievement.name}
                        description={achievement.description}
                        criteria={achievement.criteria}
                        icon={renderedIcon}
                        unlocked={isUnlocked}
                        onShare={
                          isUnlocked
                            ? () => handleShare(achievement)
                            : undefined
                        }
                        color={achievement.color}
                      />
                    );
                  })
                ) : (
                  <p
                    style={{
                      color: "#666",
                      gridColumn: "1/-1",
                      textAlign: "center",
                    }}
                  >
                    No hay logros.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "posts" && (
            <div key="posts" className="fade-in">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white m-0">
                        {t("account.posts.title")}
                    </h2>
                    <Link
                        to="/forum"
                        className="bg-white text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-(--accent) transition-all shadow-xl shadow-white/5"
                    >
                        + {t("account.posts.create_topic", "Crear Tema")}
                    </Link>
                </div>

              {loadingThreads ? (
                <Loader text={t("account.posts.loading")} />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {userThreads.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "8px",
                      }}
                    >
                      <p
                        style={{ color: "var(--muted)", marginBottom: "1rem" }}
                      >
                        {t("account.posts.empty")}
                      </p>
                      <Link
                        to="/forum"
                        style={{
                          color: "var(--accent)",
                          textDecoration: "underline",
                        }}
                      >
                        {t("account.posts.go_to_forum", "Ir al Foro")}
                      </Link>
                    </div>
                  ) : (
                    userThreads.map((thread: { id: string | number; title: string; created_at: string; views: number; reply_count: number }) => (
                      <Link
                        to={`/forum/thread/topic/${thread.id}`}
                        key={thread.id}
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          className="thread-card-mini"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            padding: "1rem",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.05)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            transition: "background 0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.05)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.03)")
                          }
                        >
                          <div>
                            <h4
                              style={{ color: "#fff", margin: "0 0 0.3rem 0" }}
                            >
                              {thread.title}
                            </h4>
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--muted)",
                              }}
                            >
                              {new Date(thread.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              color: "var(--muted)",
                              fontSize: "0.9rem",
                            }}
                          >
                            <span>
                              {thread.views} {t("account.posts.views")}
                            </span>
                            <span>
                              {thread.reply_count} {t("account.posts.replies")}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "medals" && (
            <div key="medals" className="fade-in">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8 border-b border-white/5 pb-4">
                                {t("account.medals_title", "Mis Medallas")}
                            </h2>
              {!user.user_metadata?.medals ||
              user.user_metadata.medals.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "12px",
                  }}
                >
                  <Medal
                    size={48}
                    style={{ color: "#333", marginBottom: "1rem" }}
                  />
                  <p style={{ color: "#888" }}>
                    {t(
                      "account.no_medals",
                      "Aún no tienes medallas especiales.",
                    )}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {user.user_metadata.medals.map((medalId: string) => {
                    const def = medalDefinitions.find((m) => m.id === medalId);
                    if (!def) return null;
                    const Icon =
                      MEDAL_ICONS[def.icon as keyof typeof MEDAL_ICONS] ||
                      Medal;
                    return (
                      <div
                        key={medalId}
                        className="medal-card animate-pop"
                        style={{
                          background: `linear-gradient(145deg, ${def.color}10, rgba(0,0,0,0.4))`,
                          border: `1px solid ${def.color}40`,
                          borderRadius: "12px",
                          padding: "1.5rem",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "60px",
                            width: "60px",
                            marginBottom: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {def.image_url ? (
                            <img
                              src={def.image_url}
                              alt={def.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                filter: `drop-shadow(0 0 10px ${def.color}60)`,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                fontSize: "2.5rem",
                                color: def.color,
                                filter: `drop-shadow(0 0 10px ${def.color}60)`,
                              }}
                            >
                              <Icon />
                            </div>
                          )}
                        </div>
                        <h3
                          style={{
                            color: "#fff",
                            fontSize: "1.1rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {def.name}
                        </h3>
                        <p style={{ color: "#ccc", fontSize: "0.85rem" }}>
                          {def.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "connections" && (
            <div key="connections" className="fade-in">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8 border-b border-white/5 pb-4">
                                {t("account.connections.title")}
                            </h2>

              <ConnectionCards
                isLinked={isLinked}
                mcUsername={mcUsername}
                statsDataUsername={statsData?.username}
                linkCode={linkCode}
                linkLoading={linkLoading}
                onGenerateCode={handleGenerateCode}
                discordIdentity={discordIdentity}
                isDiscordLinked={isDiscordLinked}
                discordMetadataName={
                  user?.user_metadata?.discord_tag ||
                  user?.user_metadata?.discord_name ||
                  user?.user_metadata?.social_discord
                }
                discordMetadataAvatar={user?.user_metadata?.discord_avatar}
                twitchIdentity={twitchIdentity}
                onLinkProvider={handleLinkProvider}
                onUnlinkProvider={handleUnlinkProvider}
                onUnlinkMinecraft={handleUnlinkMinecraft}
                onUnlinkDiscord={handleUnlinkDiscord}
                manualCode={manualCode}
                onManualCodeChange={setManualCode}
                onVerifyCode={handleVerifyManualCode}
                isVerifying={isVerifying}
                discordManualCode={discordManualCode}
                onDiscordManualCodeChange={setDiscordManualCode}
                onVerifyDiscordCode={handleVerifyDiscordCode}
                isVerifyingDiscord={isVerifyingDiscord}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <ProfileSettings
              user={user}
              mcUsername={mcUsername}
              discordIdentity={discordIdentity}
              twitchIdentity={twitchIdentity}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      <ConfirmationModal
        isOpen={isUnlinkModalOpen}
        onClose={() => !isUnlinking && setIsUnlinkModalOpen(false)}
        onConfirm={confirmUnlink}
        isLoading={isUnlinking}
        title={t("account.unlink_confirm_title", "Desvincular cuenta")}
        message={t(
          "account.unlink_confirm_msg",
          "¿Estás seguro? Podrías perder acceso a ciertas características.",
        )}
      />

      <Toast
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onAction={() => window.location.reload()}
        title={t("account.connections.verify_success", "¡VINCULACIÓN EXITOSA!")}
        message={t(
          "account.connections.success_link_desc",
          "Tu cuenta de Minecraft ha sido conectada correctamente. Ahora tus estadísticas y rangos están sincronizados.",
        )}
        buttonText={t("common.accept", "GENIAL")}
      />

      {/* Mobile Bottom Navbar REMOVED */}
    </div>
  );
}
