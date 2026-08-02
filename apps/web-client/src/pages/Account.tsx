import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Medal, Info, CheckCircle, Lock, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { supabase } from "../services/supabaseClient";
import { UserIdentity, Provider } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import "../styles/pages/dashboard.css";
import "../styles/pages/account.css";
import Loader from "../components/UI/Loader";
import ConfirmationModal from "../components/UI/ConfirmationModal";
import PlayerStats from "../components/Widgets/PlayerStats";
import { MEDAL_ICONS } from "../utils/MedalIcons";
import Toast, { ToastType } from "../components/UI/Toast";
import { useSidebar } from "../hooks/useSidebar";
import { 
  useAccountSettings, 
  useUserThreads, 
  usePlayerStats, 
  useLinkStatus,
  useGenerateLinkCode,
  useVerifyLinkCode,
  useUnlinkAccount,
  useLinkMicrosoftAccount
} from "../hooks/useAccountData";

// Extracted Components
import AccountSidebar from "../components/Account/AccountSidebar";
import AchievementCard from "../components/Account/AchievementCard";
import ConnectionCards from "../components/Account/ConnectionCards";
import ProfileSettings from "../components/Account/ProfileSettings";

import SuccessModal from "../components/UI/SuccessModal";
import ShareableCard from "../components/Account/ShareableCard";
const PlaystyleRadar = lazy(() => import("../components/Account/PlaystyleRadarFinal"));



const parsePlaytimeHours = (playtime: unknown): number => {
    if (typeof playtime !== 'string') return 0;
    const hoursMatch = /\b(\d+)h/.exec(playtime);
    const minsMatch = /\b(\d+)m/.exec(playtime);
    const h = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
    const m = minsMatch ? Number.parseInt(minsMatch[1], 10) : 0;
    return h + (m / 60);
};

interface TranslatableItem {
  id?: string | number;
  name: string;
  description: string;
  criteria?: string;
  name_en?: string;
  description_en?: string;
  criteria_en?: string;
  [key: string]: unknown;
}

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

export default function Account() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Tab & Navigation State
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "overview");
  const [prestigeTab, setPrestigeTab] = useState<"constructor" | "luchador" | "mercader" | "constancia" | "explorador">("constructor");
  const [showAscendModal, setShowAscendModal] = useState(false);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tab = searchParams.get("tab") || "overview";
    if (tab !== activeTab) setActiveTab(tab);
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
  const money = typeof statsData?.money === "string" ? Number.parseFloat(statsData.money.replace(/[^0-9.-]+/g, "")) : Number(statsData?.money || 0);
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
  const { mutate: linkMicrosoft } = useLinkMicrosoftAccount();

  const handleLinkMicrosoft = ({ uuid, nick }: { uuid: string; nick: string }) => {
    linkMicrosoft({ uuid, nick }, {
      onSuccess: () => {
        supabase.auth.refreshSession();
        setShowSuccessModal(true);
      },
      onError: (err: Error) => showToast(err.message || "Error al vincular cuenta de Microsoft", "error"),
    });
  };

  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
  const identityToUnlinkRef = useRef<UserIdentity | null>(null);
  const unlinkTargetRef = useRef<"provider" | "minecraft" | "discord" | null>(null);
  const identityToUnlink = identityToUnlinkRef.current;
  const unlinkTarget = unlinkTargetRef.current;
  const setIdentityToUnlink = (val: UserIdentity | null) => { identityToUnlinkRef.current = val; };
  const setUnlinkTarget = (val: "provider" | "minecraft" | "discord" | null) => { unlinkTargetRef.current = val; };

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

  // Handle Microsoft Popup OAuth redirect code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && window.opener && window.opener !== window) {
      window.opener.postMessage({ type: "MS_AUTH_CODE", code }, window.location.origin);
      window.close();
    }
  }, []);

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
  const getLocalizedText = (item: TranslatableItem, field: 'name' | 'description' | 'criteria', fallbackTranslationKey?: string) => {
    const isEnglish = i18n.language.startsWith('en');
    
    // 1. Priority: Dynamic English content from DB
    if (isEnglish) {
        if (field === 'name' && item.name_en) return item.name_en;
        if (field === 'description' && item.description_en) return item.description_en;
        if (field === 'criteria' && item.criteria_en) return item.criteria_en;
    }

    // 2. Secondary: Static Translation (if key provided and exists)
    // Note: We use the spanish text as default value for t()
    if (fallbackTranslationKey) {
        const defaultValue = item[field] as string | undefined;
        const translation = t(fallbackTranslationKey, { defaultValue: defaultValue || "" });
        // If translation is different from key (meaning it was found) OR distinct from default (if t returns default on missing)
        return translation;
    }

    // 3. Fallback: Default DB text (Spanish)
    return item[field];
  };


  if (loading || !user) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#080808",
        }}
      >
        <Loader style={{ height: "auto", minHeight: "auto" }} />
      </div>
    );
  }

    return (
        <div className="min-h-screen bg-[#080808] pb-16 pt-28">
            <div className="max-w-350 mx-auto px-6 lg:flex lg:gap-10">
                {/* Mobile Overlay */}
                {isMobile && sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Cerrar menú lateral"
                        className="fixed inset-0 z-150 bg-black/80 backdrop-blur-sm transition-opacity border-none cursor-pointer w-full text-left"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <AccountSidebar
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
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
                  <p className="mx-auto mb-8 max-w-125 leading-[1.8] text-white/60">
                    {t(
                      "account.overview.not_linked_msg",
                      "Para ver tus estadísticas en tiempo real (dinero, tiempo de juego, muertes), necesitas verificar que eres el dueño de la cuenta de Minecraft.",
                    )}
                  </p>
                  <button type="button"
                    onClick={() => setActiveTab("connections")}
                    style={{
                      boxShadow: "0 10px 25px rgba(231, 76, 60, 0.2)",
                    }}
                    className="cursor-pointer rounded-2xl bg-[#ff6b6b] px-10 py-4 text-base font-extrabold text-white transition-colors duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                    onFocus={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    {t("account.overview.verify_btn", "Verificar Ahora")}
                  </button>
                </div>
              )}

              {isLinked && (
                <>
                  <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                    <div className="dashboard-card animate-slide-up rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                      <h3 className="mb-6 flex items-center gap-2.5 border-b border-white/5 pb-4 text-lg text-white">
                        🎯{" "}
                        {t("account.overview.playstyle.title", "Estilo de Juego")}
                      </h3>
                      <Suspense fallback={<div className="flex items-center justify-center py-10"><Loader /></div>}>
                        <PlaystyleRadar
                          stats={{
                            blocksPlaced: Number(statsData?.raw_blocks_placed || 0),
                            blocksMined: Number(statsData?.raw_blocks_mined || 0),
                            kills: Number(statsData?.raw_kills || 0),
                            mobKills: Number(statsData?.mob_kills || 0),
                            playtimeHours: parsePlaytimeHours(statsData?.playtime),
                            money:
                              typeof statsData?.money === "string"
                                ? Number.parseFloat(
                                    statsData.money.replace(/[^0-9.-]+/g, ""),
                                  )
                                : 0,
                            rank: statsData?.raw_rank || "default",
                          }}
                        />
                      </Suspense>

                      {/* Explicación Detallada de cada Fórmula (en el lado izquierdo) */}
                      <div className="mt-4 p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-3">
                        <div className="font-extrabold text-xs text-[#38BDF8] flex items-center gap-1.5">
                          💡 {t('account.overview.formula_header', '¿Cómo se calcula cada Puntuación?')}
                        </div>

                        <div className="flex flex-col gap-2 text-[11.5px] leading-relaxed text-gray-300">
                          <div className="flex items-start gap-1.5">
                            <strong className="text-sky-400 font-bold shrink-0 flex items-center gap-1">
                              <img src="https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png" className="w-4 h-4 object-contain" alt="Constructor" />
                              {t('about.roles.radar.builder', 'Constructor')}:
                            </strong>
                            <span>{t('about.roles.branch.constructor.formula', 'Bloques minados + colocados. Cada hito de bloques te otorga un nuevo rango de construcción.')}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <strong className="text-rose-500 font-bold shrink-0 flex items-center gap-1">
                              <img src="https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png" className="w-4 h-4 object-contain" alt="Luchador" />
                              {t('about.roles.radar.fighter', 'Luchador')}:
                            </strong>
                            <span>{t('about.roles.branch.luchador.formula', '15 pts por kill PvP a jugadores y 1 pt por mob hostil eliminado.')}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <strong className="text-amber-400 font-bold shrink-0 flex items-center gap-1">
                              <img src="/images/killucoins/coin_oro.webp" className="w-4 h-4 object-contain" alt="Mercader" />
                              {t('about.roles.radar.merchant', 'Mercader')}:
                            </strong>
                            <span>{t('about.roles.branch.mercader.formula', 'Escala logarítmica (100 × log₁₀(KilluCoins)). Cuanto más capital acumules, mayor rango económico obtienes.')}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <strong className="text-fuchsia-400 font-bold shrink-0 flex items-center gap-1">
                              <img src="https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png" className="w-4 h-4 object-contain" alt="Constancia" />
                              {t('about.roles.radar.constancy', 'Constancia')}:
                            </strong>
                            <span>{t('about.roles.branch.constancia.formula', 'Crecimiento cuadrático (Días de Racha)². Premia la fidelidad máxima sin romper logins diarios.')}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <strong className="text-emerald-400 font-bold shrink-0 flex items-center gap-1">
                              <img src="https://minecraft.wiki/w/Special:Redirect/file/Compass.png" className="w-4 h-4 object-contain" alt="Explorador" />
                              {t('about.roles.radar.explorer', 'Explorador')}:
                            </strong>
                            <span>{t('about.roles.branch.explorador.formula', '10 pts por hora de juego activa + 1 pt por cada km (1,000 bloques) recorrido en Minecraft.')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dashboard-card animate-slide-up rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-center">
                      <h3 className="mb-4 flex items-center gap-2 text-lg text-white font-black uppercase tracking-tight border-b border-white/5 pb-3">
                        <Info color="var(--accent)" size={20} />
                        {t("account.overview.playstyle.metrics_title", "Métricas de Estilo de Juego")}
                      </h3>

                      {/* Lista de Filas con Badges de Rangos */}
                      <div className="flex flex-col gap-3.5">
                        {/* Constructor */}
                        <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 hover:border-sky-500/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-bold text-sm text-sky-400">
                              <img src="https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png" className="w-4 h-4 object-contain" alt="Constructor" />
                              {t('about.roles.radar.builder', 'Constructor')}
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">{t('account.overview.playstyle.blocks_formula', 'Bloques Minados + Colocados')}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Wooden_Pickaxe.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.constructor.rank.1.name', 'Iniciado')} ({t('about.roles.branch.constructor.rank.1.req', '0')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Iron_Pickaxe.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.constructor.rank.2.name', 'Novato')} ({t('about.roles.branch.constructor.rank.2.req', '1k')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Diamond_Pickaxe.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.constructor.rank.3.name', 'Hábil')} ({t('about.roles.branch.constructor.rank.3.req', '10k')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Netherite_Pickaxe.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.constructor.rank.4.name', 'Arquitecto')} ({t('about.roles.branch.constructor.rank.4.req', '50k')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-lg text-sky-400 font-extrabold flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Beacon.png" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" /> {t('about.roles.branch.constructor.rank.5.name', 'Maestro Constructor')}</span>
                          </div>
                        </div>

                        {/* Luchador */}
                        <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 hover:border-rose-500/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                              <img src="https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png" className="w-4 h-4 object-contain" alt="Luchador" />
                              {t('about.roles.radar.fighter', 'Luchador')}
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">{t('account.overview.playstyle.pvp_formula', 'PvP (x15) + Mobs (x1)')}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Wooden_Sword.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.luchador.rank.1.name', 'Recluta')} ({t('about.roles.branch.luchador.rank.1.req', '0')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Iron_Sword.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.luchador.rank.2.name', 'Novato')} ({t('about.roles.branch.luchador.rank.2.req', '50')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.luchador.rank.3.name', 'Guerrero')} ({t('about.roles.branch.luchador.rank.3.req', '500')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Netherite_Sword.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.luchador.rank.4.name', 'Maestro de Armas')} ({t('about.roles.branch.luchador.rank.4.req', '2.5k')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg text-rose-400 font-extrabold flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Mace.png" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" /> {t('about.roles.branch.luchador.rank.5.name', 'Señor de la Guerra')}</span>
                          </div>
                        </div>

                        {/* Mercader */}
                        <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 hover:border-amber-500/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                              <img src="/images/killucoins/coin_oro.webp" className="w-4 h-4 object-contain" alt="Mercader" />
                              {t('about.roles.radar.merchant', 'Mercader')}
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">{t('account.overview.playstyle.merchant_formula', '100 × log₁₀(KilluCoins)')}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="/images/killucoins/coin_cobre.webp" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.mercader.rank.1.name', 'Ambulante')} ({t('about.roles.branch.mercader.rank.1.req', '0')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="/images/killucoins/coin_plata.webp" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.mercader.rank.2.name', 'Novato')} ({t('about.roles.branch.mercader.rank.2.req', '1k')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="/images/killucoins/coin_oro.webp" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.mercader.rank.3.name', 'Próspero')} ({t('about.roles.branch.mercader.rank.3.req', '10k')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="/images/killucoins/coin_diamante.webp" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.mercader.rank.4.name', 'Noble')} ({t('about.roles.branch.mercader.rank.4.req', '50k')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-amber-400 font-extrabold flex items-center gap-1"><img alt="" src="/images/killucoins/coin_iridium.webp" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" /> {t('about.roles.branch.mercader.rank.5.name', 'Gran Maestro Gremial')}</span>
                          </div>
                        </div>

                        {/* Constancia */}
                        <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 hover:border-fuchsia-500/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-bold text-sm text-fuchsia-400">
                              <img src="https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png" className="w-4 h-4 object-contain" alt="Constancia" />
                              {t('about.roles.radar.constancy', 'Constancia')}
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">{t('account.overview.playstyle.constancy_formula', '(Días de Racha)²')}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Clock.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.constancia.rank.1.name', 'Visitante')} ({t('about.roles.branch.constancia.rank.1.req', '0d')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Compass.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.constancia.rank.2.name', 'Viajero')} ({t('about.roles.branch.constancia.rank.2.req', '7d')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Bottle_o%27_Enchanting.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.constancia.rank.3.name', 'Devoto')} ({t('about.roles.branch.constancia.rank.3.req', '14d')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.constancia.rank.4.name', 'Viciado')} ({t('about.roles.branch.constancia.rank.4.req', '30d')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-fuchsia-500/10 border border-fuchsia-500/30 px-2.5 py-1 rounded-lg text-fuchsia-400 font-extrabold flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Nether_Star.png" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_6px_rgba(217,70,239,0.5)]" /> {t('about.roles.branch.constancia.rank.5.name', 'Inquebrantable')}</span>
                          </div>
                        </div>

                        {/* Explorador */}
                        <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 hover:border-emerald-500/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                              <img src="https://minecraft.wiki/w/Special:Redirect/file/Compass.png" className="w-4 h-4 object-contain" alt="Explorador" />
                              {t('about.roles.radar.explorer', 'Explorador')}
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">{t('account.overview.playstyle.explorer_formula', 'Horas (x10) + Km')}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Leather_Boots_(item)_JE2.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.explorador.rank.1.name', 'Novato')} ({t('about.roles.branch.explorador.rank.1.req', '0 pts')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Spyglass.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.explorador.rank.2.name', 'Curioso')} ({t('about.roles.branch.explorador.rank.2.req', '100 pts')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Empty_Map.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.explorador.rank.3.name', 'Mapeador')} ({t('about.roles.branch.explorador.rank.3.req', '500 pts')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Elytra.png" className="w-3.5 h-3.5 object-contain" /> {t('about.roles.branch.explorador.rank.4.name', 'Pionero')} ({t('about.roles.branch.explorador.rank.4.req', '2k pts')})</span>
                            <span className="text-gray-600">→</span>
                            <span className="bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-emerald-400 font-extrabold flex items-center gap-1"><img alt="" src="https://minecraft.wiki/w/Special:Redirect/file/Recovery_Compass.png" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" /> {t('about.roles.branch.explorador.rank.5.name', 'Explorador Experto')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Explicación del Rango Máximo */}
                      <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex flex-col gap-2">
                        <div className="font-bold flex items-center gap-1.5 text-amber-400 text-sm">
                          🏆 {t('about.roles.rules.max_rank_title', 'Reglas del Rango Máximo')}
                        </div>
                        <div className="flex flex-col gap-1.5 text-[11.5px]">
                          <div>
                            • <strong>{t('about.roles.rules.req_label', 'Requisito Rango Máximo:')}</strong> {t('about.roles.rules.max_rank_req', 'Debes ser el jugador con más puntos/estadística de la categoría en la que estás destacando.')}
                          </div>
                          <div>
                            • <strong>{t('about.roles.rules.limit_label', 'Límite de 1 Rango Activo:')}</strong> {t('about.roles.rules.limit_active', 'Solo puedes poseer 1 título máximo simultáneo al mismo tiempo.')}
                          </div>
                          <div>
                            • <strong>{t('about.roles.rules.transfer_label', 'Transferencia Directa:')}</strong> {t('about.roles.rules.transfer', 'Se transfiere si otro jugador supera tu puntaje. El Duelo 1v1 es exclusivo del Señor de la Guerra.')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel Completo Inferior (Full-Width): Sistema de Prestigios */}
                  <div className="mt-8 dashboard-card animate-slide-up rounded-2xl border border-purple-500/30 bg-linear-to-br from-purple-900/20 via-black/40 to-indigo-900/30 p-6 text-xs text-purple-100 leading-relaxed flex flex-col gap-5 shadow-lg shadow-purple-950/40">
                    <div className="font-extrabold flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-500/20 pb-5 gap-3 text-purple-300 text-base">
                      <span className="flex items-center gap-2 text-white">⭐ {t('account.overview.prestige.title', 'Sistema de Prestigios de Estilo de Juego')}</span>

                      {/* Selector de Pestañas de Estilos */}
                      <div className="flex flex-wrap items-center gap-2 p-1">
                        {(["constructor", "luchador", "mercader", "constancia", "explorador"] as const).map((key) => {
                          const tabsConfig = {
                            constructor: { label: t('about.roles.radar.builder', 'Constructor'), icon: "https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png" },
                            luchador: { label: t('about.roles.radar.fighter', 'Luchador'), icon: "https://minecraft.wiki/w/Special:Redirect/file/Netherite_Sword.png" },
                            mercader: { label: t('about.roles.radar.merchant', 'Mercader'), icon: "/images/killucoins/coin_oro.webp" },
                            constancia: { label: t('about.roles.radar.constancy', 'Constancia'), icon: "https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png" },
                            explorador: { label: t('about.roles.radar.explorer', 'Explorador'), icon: "https://minecraft.wiki/w/Special:Redirect/file/Recovery_Compass.png" },
                          };

                          const item = tabsConfig[key];

                          return (
                            <button aria-label="Action" type="button"
                              key={key}
                              onClick={() => setPrestigeTab(key)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none ${
                                prestigeTab === key
                                  ? "bg-purple-600 border border-purple-300 text-white shadow-[0_0_12px_rgba(147,51,234,0.5)]"
                                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <img src={item.icon} className="w-4 h-4 object-contain" alt={item.label} />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Data según la pestaña seleccionada con Control de Bloqueo Real */}
                    {(() => {
                      const isCurrentCategoryTop1 = (() => {
                        switch (prestigeTab) {
                          case "constructor": return !!statsData?.is_top1_constructor;
                          case "luchador": return !!statsData?.is_top1_luchador;
                          case "mercader": return !!statsData?.is_top1_mercader;
                          case "constancia": return !!statsData?.is_top1_constancia;
                          case "explorador": return !!statsData?.is_top1_explorador;
                        }
                      })();

                      const currentPrestigeLevel = (() => {
                        switch (prestigeTab) {
                          case "constructor": return statsData?.prestige_constructor || 0;
                          case "luchador": return statsData?.prestige_luchador || 0;
                          case "mercader": return statsData?.prestige_mercader || 0;
                          case "constancia": return statsData?.prestige_constancia || 0;
                          case "explorador": return statsData?.prestige_explorador || 0;
                        }
                      })();

                      const radarKeyMap: Record<string, string> = { constructor: 'builder', luchador: 'fighter', mercader: 'merchant', constancia: 'constancy', explorador: 'explorer' };
                      const translatedBranch = t(`about.roles.radar.${radarKeyMap[prestigeTab]}`, prestigeTab).toUpperCase();

                      const archetypeMockups = {
                        constructor: [
                          { levelNum: 1, level: t('account.overview.prestige.level1', '⭐ Prestigio I'), rankName: t('account.overview.prestige.arch.constructor.p1', 'Iniciado de Piedra'), bonus: t('account.overview.prestige.bonus1', '+5% KC Diarios'), tag: "[P1] Chat", color: "text-amber-400", border: "border-amber-600/40", bg: "bg-amber-900/20", item: "https://minecraft.wiki/w/Special:Redirect/file/Cobblestone.png" },
                          { levelNum: 2, level: t('account.overview.prestige.level2', '⭐⭐ Prestigio II'), rankName: t('account.overview.prestige.arch.constructor.p2', 'Constructor Consagrado'), bonus: t('account.overview.prestige.bonus2', '+10% KC Diarios'), tag: "[P2] Chat", color: "text-slate-300", border: "border-slate-400/40", bg: "bg-slate-700/20", item: "https://minecraft.wiki/w/Special:Redirect/file/Iron_Pickaxe.png" },
                          { levelNum: 3, level: t('account.overview.prestige.level3', '⭐⭐⭐ Prestigio III'), rankName: t('account.overview.prestige.arch.constructor.p3', 'Gran Arquitecto'), bonus: t('account.overview.prestige.bonus3_discount', '+15% KC + Descuento'), tag: "[P3] Chat", color: "text-yellow-400", border: "border-yellow-400/40", bg: "bg-yellow-500/10", item: "https://minecraft.wiki/w/Special:Redirect/file/Golden_Pickaxe.png" },
                          { levelNum: 4, level: t('account.overview.prestige.level4', '⭐⭐⭐⭐ Prestigio IV'), rankName: t('account.overview.prestige.arch.constructor.p4', 'Maestro Constructor'), bonus: "+20% KC + 3 Spins", tag: "[P4] Chat", color: "text-cyan-400", border: "border-cyan-400/40", bg: "bg-cyan-500/10", item: "https://minecraft.wiki/w/Special:Redirect/file/Diamond_Pickaxe.png" },
                          { levelNum: 5, level: t('account.overview.prestige.level5', '💎 Prestigio V'), rankName: t('account.overview.prestige.arch.constructor.p5', 'Arquitecto Mítico'), bonus: "+25% KC + Title", tag: t('account.overview.prestige.tag_neon', '[P5] Neón'), color: "text-fuchsia-300", border: "border-fuchsia-400/50", bg: "bg-fuchsia-500/15", item: "https://minecraft.wiki/w/Special:Redirect/file/Beacon.png" },
                        ],
                        luchador: [
                          { levelNum: 1, level: t('account.overview.prestige.level1', '⭐ Prestigio I'), rankName: t('account.overview.prestige.arch.luchador.p1', 'Guerrero de Bronce'), bonus: t('account.overview.prestige.bonus1', '+5% KC Diarios'), tag: "[P1] Chat", color: "text-amber-400", border: "border-amber-600/40", bg: "bg-amber-900/20", item: "https://minecraft.wiki/w/Special:Redirect/file/Wooden_Sword.png" },
                          { levelNum: 2, level: t('account.overview.prestige.level2', '⭐⭐ Prestigio II'), rankName: t('account.overview.prestige.arch.luchador.p2', 'Campeón de Batalla'), bonus: t('account.overview.prestige.bonus2', '+10% KC Diarios'), tag: "[P2] Chat", color: "text-slate-300", border: "border-slate-400/40", bg: "bg-slate-700/20", item: "https://minecraft.wiki/w/Special:Redirect/file/Iron_Sword.png" },
                          { levelNum: 3, level: t('account.overview.prestige.level3', '⭐⭐⭐ Prestigio III'), rankName: t('account.overview.prestige.arch.luchador.p3', 'Señor de Guerra'), bonus: t('account.overview.prestige.bonus3_aura', '+15% KC + Aura'), tag: "[P3] Chat", color: "text-yellow-400", border: "border-yellow-400/40", bg: "bg-yellow-500/10", item: "https://minecraft.wiki/w/Special:Redirect/file/Golden_Sword.png" },
                          { levelNum: 4, level: t('account.overview.prestige.level4', '⭐⭐⭐⭐ Prestigio IV'), rankName: t('account.overview.prestige.arch.luchador.p4', 'Maestro de Armas'), bonus: "+20% KC + 3 Spins", tag: "[P4] Chat", color: "text-cyan-400", border: "border-cyan-400/40", bg: "bg-cyan-500/10", item: "https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png" },
                          { levelNum: 5, level: t('account.overview.prestige.level5', '💎 Prestigio V'), rankName: t('account.overview.prestige.arch.luchador.p5', 'Gladiador Supremo'), bonus: t('account.overview.prestige.bonus5_swords', '+25% KC + Espadas'), tag: t('account.overview.prestige.tag_neon', '[P5] Neón'), color: "text-fuchsia-300", border: "border-fuchsia-400/50", bg: "bg-fuchsia-500/15", item: "https://minecraft.wiki/w/Special:Redirect/file/Mace.png" },
                        ],
                        mercader: [
                          { levelNum: 1, level: t('account.overview.prestige.level1', '⭐ Prestigio I'), rankName: t('account.overview.prestige.arch.mercader.p1', 'Mercader Próspero'), bonus: t('account.overview.prestige.bonus1', '+5% KC Diarios'), tag: "[P1] Chat", color: "text-amber-400", border: "border-amber-600/40", bg: "bg-amber-900/20", item: "/images/killucoins/coin_cobre.webp" },
                          { levelNum: 2, level: t('account.overview.prestige.level2', '⭐⭐ Prestigio II'), rankName: t('account.overview.prestige.arch.mercader.p2', 'Comerciante de Élite'), bonus: t('account.overview.prestige.bonus2', '+10% KC Diarios'), tag: "[P2] Chat", color: "text-slate-300", border: "border-slate-400/40", bg: "bg-slate-700/20", item: "/images/killucoins/coin_plata.webp" },
                          { levelNum: 3, level: t('account.overview.prestige.level3', '⭐⭐⭐ Prestigio III'), rankName: t('account.overview.prestige.arch.mercader.p3', 'Barón Financiero'), bonus: "+15% KC + 10% Off", tag: "[P3] Chat", color: "text-yellow-400", border: "border-yellow-400/40", bg: "bg-yellow-500/10", item: "/images/killucoins/coin_oro.webp" },
                          { levelNum: 4, level: t('account.overview.prestige.level4', '⭐⭐⭐⭐ Prestigio IV'), rankName: t('account.overview.prestige.arch.mercader.p4', 'Gran Maestro Gremial'), bonus: "+20% KC + 3 Spins", tag: "[P4] Chat", color: "text-cyan-400", border: "border-cyan-400/40", bg: "bg-cyan-500/10", item: "/images/killucoins/coin_diamante.webp" },
                          { levelNum: 5, level: t('account.overview.prestige.level5', '💎 Prestigio V'), rankName: t('account.overview.prestige.arch.mercader.p5', 'Magnate Legendario'), bonus: "+25% KC + Rain", tag: t('account.overview.prestige.tag_neon', '[P5] Neón'), color: "text-fuchsia-300", border: "border-fuchsia-400/50", bg: "bg-fuchsia-500/15", item: "/images/killucoins/coin_iridium.webp" },
                        ],
                        constancia: [
                          { levelNum: 1, level: t('account.overview.prestige.level1', '⭐ Prestigio I'), rankName: t('account.overview.prestige.arch.constancia.p1', 'Devoto del Servidor'), bonus: t('account.overview.prestige.bonus1', '+5% KC Diarios'), tag: "[P1] Chat", color: "text-amber-400", border: "border-amber-600/40", bg: "bg-amber-900/20", item: "https://minecraft.wiki/w/Special:Redirect/file/Clock.png" },
                          { levelNum: 2, level: t('account.overview.prestige.level2', '⭐⭐ Prestigio II'), rankName: t('account.overview.prestige.arch.constancia.p2', 'Pilar Inquebrantable'), bonus: t('account.overview.prestige.bonus2', '+10% KC Diarios'), tag: "[P2] Chat", color: "text-slate-300", border: "border-slate-400/40", bg: "bg-slate-700/20", item: "https://minecraft.wiki/w/Special:Redirect/file/Compass.png" },
                          { levelNum: 3, level: t('account.overview.prestige.level3', '⭐⭐⭐ Prestigio III'), rankName: t('account.overview.prestige.arch.constancia.p3', 'Guardián de Racha'), bonus: "+15% KC + Shield", tag: "[P3] Chat", color: "text-yellow-400", border: "border-yellow-400/40", bg: "bg-yellow-500/10", item: "https://minecraft.wiki/w/Special:Redirect/file/Bottle_o%27_Enchanting.png" },
                          { levelNum: 4, level: t('account.overview.prestige.level4', '⭐⭐⭐⭐ Prestigio IV'), rankName: t('account.overview.prestige.arch.constancia.p4', 'Leyenda Inquebrantable'), bonus: "+20% KC + 3 Spins", tag: "[P4] Chat", color: "text-cyan-400", border: "border-cyan-400/40", bg: "bg-cyan-500/10", item: "https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png" },
                          { levelNum: 5, level: t('account.overview.prestige.level5', '💎 Prestigio V'), rankName: t('account.overview.prestige.arch.constancia.p5', 'Titán Eterno'), bonus: "+25% KC + Totem", tag: t('account.overview.prestige.tag_neon', '[P5] Neón'), color: "text-fuchsia-300", border: "border-fuchsia-400/50", bg: "bg-fuchsia-500/15", item: "https://minecraft.wiki/w/Special:Redirect/file/Nether_Star.png" },
                        ],
                        explorador: [
                          { levelNum: 1, level: t('account.overview.prestige.level1', '⭐ Prestigio I'), rankName: t('account.overview.prestige.arch.explorador.p1', 'Navegante de Reinos'), bonus: t('account.overview.prestige.bonus1', '+5% KC Diarios'), tag: "[P1] Chat", color: "text-amber-400", border: "border-amber-600/40", bg: "bg-amber-900/20", item: "https://minecraft.wiki/w/Special:Redirect/file/Leather_Boots_(item)_JE2.png" },
                          { levelNum: 2, level: t('account.overview.prestige.level2', '⭐⭐ Prestigio II'), rankName: t('account.overview.prestige.arch.explorador.p2', 'Mapeador Ancestral'), bonus: t('account.overview.prestige.bonus2', '+10% KC Diarios'), tag: "[P2] Chat", color: "text-slate-300", border: "border-slate-400/40", bg: "bg-slate-700/20", item: "https://minecraft.wiki/w/Special:Redirect/file/Spyglass.png" },
                          { levelNum: 3, level: t('account.overview.prestige.level3', '⭐⭐⭐ Prestigio III'), rankName: t('account.overview.prestige.arch.explorador.p3', 'Pionero del Horizonte'), bonus: "+15% KC + Compass", tag: "[P3] Chat", color: "text-yellow-400", border: "border-yellow-400/40", bg: "bg-yellow-500/10", item: "https://minecraft.wiki/w/Special:Redirect/file/Empty_Map.png" },
                          { levelNum: 4, level: t('account.overview.prestige.level4', '⭐⭐⭐⭐ Prestigio IV'), rankName: t('account.overview.prestige.arch.explorador.p4', 'Explorador Experto'), bonus: "+20% KC + 3 Spins", tag: "[P4] Chat", color: "text-cyan-400", border: "border-cyan-400/40", bg: "bg-cyan-500/10", item: "https://minecraft.wiki/w/Special:Redirect/file/Elytra.png" },
                          { levelNum: 5, level: t('account.overview.prestige.level5', '💎 Prestigio V'), rankName: t('account.overview.prestige.arch.explorador.p5', 'Conquistador de Mundos'), bonus: "+25% KC + Trail", tag: t('account.overview.prestige.tag_neon', '[P5] Neón'), color: "text-fuchsia-300", border: "border-fuchsia-400/50", bg: "bg-fuchsia-500/15", item: "https://minecraft.wiki/w/Special:Redirect/file/Recovery_Compass.png" },
                        ],
                      };

                      const list = archetypeMockups[prestigeTab];

                      return (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 my-2">
                            {list.map((item) => {
                              const isUnlocked = item.levelNum <= currentPrestigeLevel;
                              const isNextTarget = isCurrentCategoryTop1 && item.levelNum === currentPrestigeLevel + 1;
                              const isLocked = !isUnlocked && !isNextTarget;

                              let cardBg = "bg-black/60";
                              let cardBorder = "border-white/5";
                              let itemColor = "text-gray-400";
                              if (isUnlocked) {
                                cardBg = item.bg;
                                cardBorder = item.border;
                                itemColor = item.color;
                              } else if (isNextTarget) {
                                cardBg = "bg-purple-900/30";
                                cardBorder = "border-purple-400";
                                itemColor = "text-purple-300";
                              }

                              const opacityClass = isLocked ? "opacity-40" : "opacity-100";

                              return (
                                <div key={item.levelNum} className={`p-4 rounded-xl ${cardBg} border ${cardBorder} ${opacityClass} flex flex-col items-center gap-1.5 text-center transition-colors hover:scale-[1.02] shadow-md relative overflow-hidden group`}>
                                  {isUnlocked && (
                                    <span className="absolute top-2 right-2 text-[9.5px] font-bold text-emerald-400 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> {t('account.overview.prestige.active', 'Activo')}
                                    </span>
                                  )}
                                  {isLocked && (
                                    <span className="absolute top-2 right-2 text-[9.5px] font-bold text-gray-500 flex items-center gap-1">
                                      <Lock className="w-3 h-3" /> {t('account.overview.prestige.locked', 'Bloqueado')}
                                    </span>
                                  )}
                                  <img src={item.item} className={`w-6 h-6 object-contain my-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform ${isLocked ? "grayscale" : ""}`} alt={item.rankName} />
                                  <span className={`${itemColor} font-extrabold text-xs tracking-wide`}>{item.level}</span>
                                  <span className={`text-xs ${isLocked ? "text-gray-400" : "text-white"} font-bold truncate w-full`} title={item.rankName}>{item.rankName}</span>
                                  <span className="text-[11px] text-gray-300 font-medium mt-0.5">{item.bonus}</span>
                                  <span className={`text-[10.5px] ${isUnlocked ? item.color : "text-gray-500"} font-mono font-semibold mt-0.5`}>{item.tag}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-purple-500/20 text-xs text-purple-200/90 gap-3">
                            {(() => {
                              if (!isCurrentCategoryTop1) {
                                return (
                                  <span className="text-red-400 flex items-center gap-1.5">
                                    <Lock className="w-4 h-4 text-red-400" /> <em>{t('account.overview.prestige.locked_msg', 'Bloqueado: Debes ser el jugador #1 con Rango Máximo en {{branch}} para ascender.', { branch: translatedBranch })}</em>
                                  </span>
                                );
                              }
                              if (currentPrestigeLevel >= 5) {
                                return (
                                  <span>👑 <em>{t('account.overview.prestige.max_reached', '¡Felicidades! Has alcanzado el Nivel Máximo V de Prestigio en {{branch}}.', { branch: translatedBranch })}</em></span>
                                );
                              }
                              return (
                                <span>✨ <em>{t('account.overview.prestige.req_met', '¡Requisito Cumplido! Eres el #1 del servidor en {{branch}}. Puedes ascender al Nivel {{level}}.', { branch: translatedBranch, level: currentPrestigeLevel + 1 })}</em></span>
                              );
                            })()}

                            <button type="button"
                              disabled={!isCurrentCategoryTop1 || currentPrestigeLevel >= 5}
                              onClick={() => setShowAscendModal(true)}
                              className={`px-5 py-2.5 rounded-xl font-extrabold transition-colors cursor-pointer whitespace-nowrap outline-none focus:outline-none flex items-center gap-2 ${
                                !isCurrentCategoryTop1 || currentPrestigeLevel >= 5
                                  ? "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-60"
                                  : "bg-purple-600 hover:bg-purple-500 border border-purple-300 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:scale-[1.02]"
                              }`}
                            >
                              {(() => {
                                if (!isCurrentCategoryTop1) {
                                  return (
                                    <>
                                      <Lock className="w-4 h-4" /> {t('account.overview.prestige.btn_req', '🔒 Requisito: Alcanzar Rango Máximo')}
                                    </>
                                  );
                                }
                                if (currentPrestigeLevel >= 5) {
                                  return t('account.overview.prestige.btn_max', '👑 Prestigio Máximo Alcanzado');
                                }
                                return (
                                  <>
                                    <Sparkles className="w-4 h-4" /> {t('account.overview.prestige.btn_ascend', '⭐ Ascender a Prestigio {{level}}', { level: currentPrestigeLevel + 1 })}
                                  </>
                                );
                              })()}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Modal / Maqueta interactiva de Ascenso de Prestigio */}
                  {showAscendModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                      <div className="bg-linear-to-b from-purple-950/90 via-slate-950 to-black border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(147,51,234,0.3)] relative text-white flex flex-col gap-6">
                        <button aria-label="Action" type="button"
                          onClick={() => setShowAscendModal(false)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-white/5 flex items-center justify-center cursor-pointer"
                        >
                          ✕
                        </button>

                        <div className="text-center flex flex-col items-center gap-2">
                          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(147,51,234,0.4)] mb-1">
                            ⭐
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-tight text-white">
                            Maqueta de Ascenso — Prestigio I
                          </h3>
                          <p className="text-xs text-purple-200/70">
                            Simulación interactiva del proceso de reinicio y reclamo de bonificaciones permanentes para la rama <strong className="text-purple-300">{prestigeTab.toUpperCase()}</strong>.
                          </p>
                        </div>

                        <div className="bg-black/50 rounded-2xl p-4 border border-white/10 flex flex-col gap-3 text-xs">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Estado Actual:</span>
                            <span className="text-amber-400 font-bold">Top 1 / Rango Máximo (100%)</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Nuevo Estado:</span>
                            <span className="text-purple-400 font-extrabold flex items-center gap-1">⭐ Prestigio I</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Bonificación Permanente:</span>
                            <span className="text-emerald-400 font-bold">+5% KC Diarios</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Recompensa Inmediata:</span>
                            <span className="text-sky-400 font-bold">1 Spin Gratis en Gacha 🎰</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Badge de Chat:</span>
                            <span className="bg-purple-900/40 border border-purple-500/40 px-2 py-0.5 rounded text-purple-300 font-mono text-[11px]">[P1] Chat</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-amber-300/80 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed text-center">
                          ⚠️ <em>Al ascender, tus puntos de esta rama se reiniciarán a 0 para comenzar el progreso hacia Prestigio II. Tus multiplicadores e insignias pasadas se mantendrán para siempre.</em>
                        </div>

                        <div className="flex gap-3">
                          <button aria-label="Action" type="button"
                            onClick={() => setShowAscendModal(false)}
                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button aria-label="Action" type="button"
                            onClick={() => {
                              setShowAscendModal(false);
                              showToast(`✨ ¡Ascenso a Prestigio I (${prestigeTab.toUpperCase()}) simulado con éxito!`, "success");
                            }}
                            className="flex-1 bg-purple-600 hover:bg-purple-500 border border-purple-300 text-white py-3 rounded-xl font-black text-xs transition-colors cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:scale-[1.02]"
                          >
                            ⭐ Confirmar Ascenso
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
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
                    user?.user_metadata?.full_name ||
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
                                    <div className="absolute top-8 left-17.5 right-17.5 h-px bg-white/10 z-0" />

                                    {/* Nodes */}
                                    <div className="flex flex-col items-center min-w-35 relative z-10">
                                        <div className="w-4 h-4 rounded-full bg-(--accent) mb-4 shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]" />
                                        <span className="text-white text-xs font-black uppercase tracking-widest leading-loose">
                                            {t("account.journey_arrival", "Llegada")}
                                        </span>
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            {statsData?.member_since || "???"}
                                        </span>
                                    </div>

                                    {statsData?.raw_rank && !["default"].includes(statsData.raw_rank.toLowerCase()) && (
                                        <div className="flex flex-col items-center min-w-35 relative z-10 mx-auto">
                                            <div className="w-3 h-3 rounded-full bg-white mb-4" />
                                            <span className="text-white text-xs font-black uppercase tracking-widest leading-loose">
                                                {t("account.journey_promotion", "Ascenso")}
                                            </span>
                                            <span className="text-(--accent) text-[10px] font-black uppercase tracking-widest mt-1">
                                                {statsData.raw_rank}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center min-w-35 relative z-10 ml-auto text-right">
                                        <div className="w-4 h-4 rotate-45 bg-green-500 mb-4 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                        <span className="text-white text-xs font-black uppercase tracking-widest leading-loose">
                                            {t("account.journey_today", "Hoy")}
                                        </span>
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            {parsePlaytimeHours(statsData?.playtime).toFixed(1)}h {t("account.journey_played", "jugadas")}
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
                {(() => {
                  const userAchievementsSet = new Set(user?.user_metadata?.achievements || []);
                  return achievementDefinitions.length > 0 ? (
                    achievementDefinitions.map((achievement) => {
                      const isUnlocked =
                        unlockStatus[achievement.id] ||
                        userAchievementsSet.has(achievement.id) ||
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
                        title={getLocalizedText(achievement, 'name', `account.achievements.items.${achievement.id}`) as string}
                        description={getLocalizedText(achievement, 'description', `account.achievements.items.${achievement.id}_desc`) as string}
                        criteria={getLocalizedText(achievement, 'criteria', `account.achievements.items.${achievement.id}_criteria`) as string}
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
                ); })()}
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
                        className="bg-white text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-(--accent) transition-colors shadow-xl shadow-white/5"
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
                          onFocus={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.05)")
                          }
                          onBlur={(e) =>
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
              {!user?.user_metadata?.medals ||
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
                          {getLocalizedText(def, 'name', `account.medals.items.${medalId}.title`) as string}
                        </h3>
                        <p style={{ color: "#ccc", fontSize: "0.85rem" }}>
                          {getLocalizedText(def, 'description', `account.medals.items.${medalId}.desc`) as string}
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
                onLinkMicrosoft={handleLinkMicrosoft}
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
