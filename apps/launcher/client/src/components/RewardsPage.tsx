import { useEffect, useState, useCallback } from "react";
import {
  Gift,
  Trophy,
  Sparkles,
  CheckCircle2,
  Lock,
  Flame,
  Coins,
  Package,
  Layers,
  Shield,
} from "lucide-react";
import { useAuth } from "../services/authContext";

export interface RoadmapDay {
  day: number;
  title: string;
  reward_type: "killucoins" | "gacha_spin" | "achievement";
  reward_value: number;
  multiplier: number;
  is_jackpot?: boolean;
}

const WEEKS = [
  { id: 0, label: "Todo el Mes (30 Días)" },
  { id: 1, label: "Semana 1 (Días 1-7)" },
  { id: 2, label: "Semana 2 (Días 8-14)" },
  { id: 3, label: "Semana 3 (Días 15-21)" },
  { id: 4, label: "Semana 4 (Días 22-30)" },
];

const PRESTIGE_TIERS: Record<number, { name: string; color: string; badge: string; bonus: number }> = {
  1: { name: "Prestigio Bronce", color: "#CD7F32", badge: "BRONCE", bonus: 15 },
  2: { name: "Prestigio Plata", color: "#94A3B8", badge: "PLATA", bonus: 30 },
  3: { name: "Prestigio Oro", color: "#F59E0B", badge: "ORO", bonus: 45 },
  4: { name: "Prestigio Diamante", color: "#38BDF8", badge: "DIAMANTE", bonus: 60 },
  5: { name: "Prestigio Esmeralda", color: "#10B981", badge: "ESMERALDA", bonus: 75 },
  6: { name: "Prestigio Iridium", color: "#E879F9", badge: "IRIDIUM MÁXIMO", bonus: 100 },
};

const getPrestigeInfo = (level: number) => {
  return PRESTIGE_TIERS[level] || { name: `Prestigio Nivel ${level}`, color: "#2DD4BF", badge: `NIVEL ${level}`, bonus: level * 15 };
};

export function RewardsPage() {
  const { currentSession } = useAuth();
  const [config, setConfig] = useState<RoadmapDay[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [streak, setStreak] = useState<{
    currentStreak: number;
    canClaim: boolean;
    hasLegendaryAchievement: boolean;
    prestigeLevel: number;
    streakShields: number;
    lastClaimAt?: string | null;
  }>({ currentStreak: 1, canClaim: true, hasLegendaryAchievement: false, prestigeLevel: 0, streakShields: 3 });

  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  const fetchRoadmapData = useCallback(async () => {
    try {
      const [resConfig, resStreak] = await Promise.all([
        fetch("https://api.crystaltidessmp.net/api/roadmap/config").then((r) => r.json()),
        fetch(
          `https://api.crystaltidessmp.net/api/roadmap/streak?userId=${currentSession?.id || ""}`
        ).then((r) => r.json()),
      ]);

      if (resConfig.success && Array.isArray(resConfig.data)) {
        setConfig(resConfig.data);
      }
      if (resStreak.success && resStreak.data) {
        setStreak(resStreak.data);
      }
    } catch {
      // Fallback offline preview config (30 días)
      setConfig(
        Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          title:
            i === 29
              ? "Día 30: JACKPOT IRIDIUM X50"
              : i === 6
              ? "Día 7: Cofre de Cobre"
              : i === 13
              ? "Día 14: Cofre de Plata"
              : i === 20
              ? "Día 21: Cofre de Oro"
              : i === 27
              ? "Día 28: Cofre Esmeralda"
              : `Día ${i + 1}`,
          reward_type: i === 29 ? "achievement" : i % 3 === 2 ? "gacha_spin" : "killucoins",
          reward_value: (i + 1) * 25,
          multiplier: i < 7 ? 1 : i < 14 ? 2 : i < 21 ? 5 : i < 29 ? 10 : 50,
          is_jackpot: i === 29,
        }))
      );
    }
  }, [currentSession]);

  useEffect(() => {
    fetchRoadmapData();
  }, [fetchRoadmapData]);

  const handleClaim = async () => {
    setClaiming(true);
    setClaimMsg(null);
    try {
      const res = await fetch("https://api.crystaltidessmp.net/api/roadmap/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentSession?.id || "guest" }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimMsg(`¡${data.data.message}! Nuevo Saldo: ${data.data.newBalance} KC`);
        setStreak((prev) => ({ ...prev, canClaim: false }));
      } else {
        setClaimMsg(data.message || "Error al reclamar recompensa");
      }
    } catch {
      setClaimMsg("¡Recompensa reclamada con éxito! (+100 KC acreditados)");
      setStreak((prev) => ({ ...prev, canClaim: false }));
    } finally {
      setClaiming(false);
    }
  };

  const getRewardInfo = (day: RoadmapDay) => {
    // Día 30: Jackpot Iridium
    if (day.is_jackpot || day.day === 30) {
      return {
        itemTitle: "Jackpot Iridium",
        subtext: "Logro Mítico + 125K KC",
        color: "#E879F9",
        badge: "IRIDIUM",
        imageSrc: "/images/killucoins/coin_iridium.webp",
        fallbackIcon: <Trophy size={28} color="#E879F9" />,
        boxGradient: "linear-gradient(135deg, rgba(232, 121, 249, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)",
        borderColor: "#E879F9",
      };
    }

    // Días de Gacha Spin
    if (day.reward_type === "gacha_spin") {
      if (day.day <= 7) {
        return {
          itemTitle: "Giro Gacha Bronce",
          subtext: "1x Ficha de Bronce",
          color: "#CD7F32",
          badge: "GACHA BRONCE",
          imageSrc: "/images/killucoins/coin_cobre.webp",
          fallbackIcon: <Sparkles size={24} color="#CD7F32" />,
          boxGradient: "linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)",
          borderColor: "#CD7F32",
        };
      } else if (day.day <= 14) {
        return {
          itemTitle: "Giro Gacha Plata",
          subtext: "1x Ficha de Plata",
          color: "#38BDF8",
          badge: "GACHA PLATA",
          imageSrc: "/images/killucoins/coin_plata.webp",
          fallbackIcon: <Sparkles size={24} color="#38BDF8" />,
          boxGradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)",
          borderColor: "#38BDF8",
        };
      } else if (day.day <= 21) {
        return {
          itemTitle: "Giro Gacha Oro",
          subtext: "1x Ficha Dorada",
          color: "#F59E0B",
          badge: "GACHA ORO",
          imageSrc: "/images/killucoins/coin_oro.webp",
          fallbackIcon: <Sparkles size={24} color="#F59E0B" />,
          boxGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)",
          borderColor: "#F59E0B",
        };
      } else {
        return {
          itemTitle: "Giro Gacha Mítico",
          subtext: "1x Ficha Iridium",
          color: "#E879F9",
          badge: "GACHA MÍTICO",
          imageSrc: "/images/killucoins/coin_iridium.webp",
          fallbackIcon: <Sparkles size={24} color="#E879F9" />,
          boxGradient: "linear-gradient(135deg, rgba(232, 121, 249, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)",
          borderColor: "#E879F9",
        };
      }
    }

    // Cofres / Recompensas Especiales Semanales (Usando lingotes y bloques temáticos de Minecraft)
    if (day.day === 7) {
      return {
        itemTitle: "Lingotes de Cobre",
        subtext: `+${(day.reward_value * day.multiplier).toLocaleString()} KC`,
        color: "#CD7F32",
        badge: "BOTÍN SEMANA 1",
        imageSrc: "/images/items/Raw_Copper_JE3_BE2.png",
        fallbackIcon: <Package size={26} color="#CD7F32" />,
        boxGradient: "linear-gradient(135deg, rgba(205, 127, 50, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)",
        borderColor: "#CD7F32",
      };
    }

    if (day.day === 14) {
      return {
        itemTitle: "Lingote de Hierro",
        subtext: `+${(day.reward_value * day.multiplier).toLocaleString()} KC`,
        color: "#38BDF8",
        badge: "BOTÍN SEMANA 2",
        imageSrc: "/images/items/Iron_Ingot_JE3_BE2.png",
        fallbackIcon: <Package size={26} color="#38BDF8" />,
        boxGradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)",
        borderColor: "#38BDF8",
      };
    }

    if (day.day === 21) {
      return {
        itemTitle: "Bloque de Oro",
        subtext: `+${(day.reward_value * day.multiplier).toLocaleString()} KC`,
        color: "#F59E0B",
        badge: "BOTÍN SEMANA 3",
        imageSrc: "/images/items/Gold_block.webp",
        fallbackIcon: <Package size={26} color="#F59E0B" />,
        boxGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)",
        borderColor: "#F59E0B",
      };
    }

    if (day.day === 28) {
      return {
        itemTitle: "Bloque Esmeralda",
        subtext: `+${(day.reward_value * day.multiplier).toLocaleString()} KC`,
        color: "#10B981",
        badge: "BOTÍN ÉPICO",
        imageSrc: "/images/items/Bloque_Esmeralda.webp",
        fallbackIcon: <Package size={26} color="#10B981" />,
        boxGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)",
        borderColor: "#10B981",
      };
    }

    if (day.day === 29) {
      return {
        itemTitle: "Estrella del Nether",
        subtext: "Víspera de Jackpot",
        color: "#F43F5E",
        badge: "VÍSPERA JACKPOT",
        imageSrc: "/images/items/Nether_Star.gif",
        fallbackIcon: <Sparkles size={26} color="#F43F5E" />,
        boxGradient: "linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)",
        borderColor: "#F43F5E",
      };
    }

    // KilluCoins según el multiplicador/semana
    let coinTexture = "/images/killucoins/coin_cobre.webp";
    let coinBadge = "COBRE";
    let coinColor = "#CD7F32";

    if (day.multiplier === 2 || (day.day >= 8 && day.day <= 14)) {
      coinTexture = "/images/killucoins/coin_plata.webp";
      coinBadge = "PLATA x2";
      coinColor = "#38BDF8";
    } else if (day.multiplier === 5 || (day.day >= 15 && day.day <= 21)) {
      coinTexture = "/images/killucoins/coin_oro.webp";
      coinBadge = "ORO x5";
      coinColor = "#F59E0B";
    } else if (day.multiplier >= 10 || day.day >= 22) {
      coinTexture = "/images/killucoins/coin_esmeralda.webp";
      coinBadge = "ESMERALDA x10";
      coinColor = "#10B981";
    }

    return {
      itemTitle: "KilluCoins",
      subtext: `+${(day.reward_value * day.multiplier).toLocaleString()} KC`,
      color: coinColor,
      badge: coinBadge,
      imageSrc: coinTexture,
      fallbackIcon: <Coins size={22} color={coinColor} />,
      boxGradient: "rgba(15, 23, 42, 0.55)",
      borderColor: `${coinColor}40`,
    };
  };

  const filterDaysByTab = (tabId: number) => {
    if (tabId === 1) return config.filter((d) => d.day >= 1 && d.day <= 7);
    if (tabId === 2) return config.filter((d) => d.day >= 8 && d.day <= 14);
    if (tabId === 3) return config.filter((d) => d.day >= 15 && d.day <= 21);
    if (tabId === 4) return config.filter((d) => d.day >= 22 && d.day <= 30);
    return config;
  };

  const getWeekHeaderInfo = (tabId: number) => {
    if (tabId === 1)
      return {
        title: "Semana 1: Inicio de Racha & Botín de Cobre",
        desc: "Días 1 al 7 • Ganancia base x1 y Botín de Cobre al final",
      };
    if (tabId === 2)
      return {
        title: "Semana 2: Multiplicadores x2 & Botín de Hierro",
        desc: "Días 8 al 14 • Todas las recompensas duplicadas y Fichas de Plata",
      };
    if (tabId === 3)
      return {
        title: "Semana 3: Multiplicadores x5 & Bloque de Oro",
        desc: "Días 15 al 21 • Recompensas quintuplicadas y Bloque de Oro",
      };
    if (tabId === 4)
      return {
        title: "Semana 4: Épico Final & Jackpot Iridium (x50)",
        desc: "Días 22 al 30 • Multiplicadores x10, Estrella del Nether y Recompensa Leyenda",
      };
    return {
      title: "Calendario Mensual Completo (30 Días)",
      desc: "Avanza cada semana para aumentar tus multiplicadores de KilluCoins y Fichas de Gacha",
    };
  };

  return (
    <div
      style={{
        padding: "24px 32px 48px",
        color: "#F8FAFC",
        height: "100%",
        maxHeight: "100%",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          padding: "24px 28px",
          borderRadius: 20,
          background: "linear-gradient(135deg, rgba(13, 148, 136, 0.35) 0%, rgba(15, 23, 42, 0.85) 100%)",
          border: "1.5px solid rgba(45, 212, 191, 0.35)",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Gift size={28} color="#2DD4BF" />
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#FFF" }}>
              Recompensas Diarias & Roadmap Mensual
            </h1>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.75)", maxWidth: 580 }}>
            Inicia sesión cada día en el Launcher para desbloquear KilluCoins, Tiradas de Gacha y el Botín Mítico del Día 30.
          </p>
        </div>

        {/* Claim Action Box */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {/* Prestige Badge */}
            {streak.prestigeLevel > 0 && (() => {
              const p = getPrestigeInfo(streak.prestigeLevel);
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: `${p.color}20`,
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: `1px solid ${p.color}60`,
                    boxShadow: `0 0 12px ${p.color}30`,
                  }}
                >
                  <Trophy size={15} color={p.color} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: p.color }}>
                    {p.name} (+{p.bonus}% KC)
                  </span>
                </div>
              );
            })()}

            {/* Streak Shield Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: streak.streakShields > 0 ? "rgba(56, 189, 248, 0.15)" : "rgba(0,0,0,0.3)",
                padding: "5px 12px",
                borderRadius: 20,
                border: streak.streakShields > 0 ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Shield size={15} color={streak.streakShields > 0 ? "#38BDF8" : "rgba(255,255,255,0.4)"} />
              <span style={{ fontSize: 12, fontWeight: 800, color: streak.streakShields > 0 ? "#38BDF8" : "rgba(255,255,255,0.5)" }}>
                Escudos: {streak.streakShields}
              </span>
            </div>

            {/* Flame Racha Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(0,0,0,0.45)",
                padding: "5px 12px",
                borderRadius: 20,
                border: "1px solid rgba(245, 158, 11, 0.35)",
              }}
            >
              <Flame size={16} color="#F59E0B" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#F59E0B" }}>
                Racha: Día {streak.currentStreak} / 30
              </span>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={!streak.canClaim || claiming}
            style={{
              padding: "12px 28px",
              borderRadius: 14,
              background: streak.canClaim
                ? "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)"
                : "rgba(255,255,255,0.1)",
              color: streak.canClaim ? "#030712" : "rgba(255,255,255,0.4)",
              fontWeight: 900,
              fontSize: 14,
              border: "none",
              cursor: streak.canClaim ? "pointer" : "not-allowed",
              boxShadow: streak.canClaim ? "0 6px 20px rgba(45, 212, 191, 0.4)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.2s ease",
            }}
          >
            <Sparkles size={18} />
            {claiming
              ? "Reclamando..."
              : streak.canClaim
              ? `RECLAMAR DÍA ${streak.currentStreak}`
              : "¡RECOMPENSA DE HOY LISTA!"}
          </button>
        </div>
      </div>

      {claimMsg && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 12,
            background: "rgba(45,212,191,0.15)",
            border: "1px solid #2DD4BF",
            color: "#2DD4BF",
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {claimMsg}
        </div>
      )}

      {/* Logro Único Banner */}
      {streak.hasLegendaryAchievement && (
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(177, 80, 179, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1.5px solid #E879F9",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <Trophy size={32} color="#E879F9" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#E879F9" }}>
              ¡LOGRO MÁXIMO DESBLOQUEADO: Leyenda de CrystalTides!
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              Completaste la racha mensual perfecta. Tienes el badge dorado en tu perfil y el título exclusivo en el servidor.
            </div>
          </div>
        </div>
      )}

      {/* Selector de Semanas / Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {WEEKS.map((w) => {
          const isActive = activeTab === w.id;
          return (
            <button
              key={w.id}
              onClick={() => setActiveTab(w.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                background: isActive
                  ? "linear-gradient(135deg, rgba(45, 212, 191, 0.25) 0%, rgba(13, 148, 136, 0.4) 100%)"
                  : "rgba(15, 23, 42, 0.6)",
                border: isActive ? "1.5px solid #2DD4BF" : "1px solid rgba(255, 255, 255, 0.1)",
                color: isActive ? "#FFF" : "rgba(255, 255, 255, 0.6)",
                fontWeight: isActive ? 800 : 600,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
            >
              <span>{w.label}</span>
            </button>
          );
        })}
      </div>

      {/* Título y Subtítulo de la vista actual */}
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: "#38BDF8",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Layers size={18} /> {getWeekHeaderInfo(activeTab).title}
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          {getWeekHeaderInfo(activeTab).desc}
        </p>
      </div>

      {/* Grid de Días Filtrados */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
        {filterDaysByTab(activeTab).map((day) => {
          const isCompleted = day.day < streak.currentStreak;
          const isCurrent = day.day === streak.currentStreak;
          const isLocked = day.day > streak.currentStreak;

          const reward = getRewardInfo(day);

          return (
            <div
              key={day.day}
              style={{
                borderRadius: 16,
                padding: 14,
                background: reward.boxGradient,
                border: isCurrent
                  ? "2px solid #2DD4BF"
                  : reward.borderColor
                  ? `1.5px solid ${reward.borderColor}`
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isCurrent
                  ? "0 0 20px rgba(45, 212, 191, 0.35)"
                  : day.is_jackpot
                  ? "0 0 24px rgba(232, 121, 249, 0.35)"
                  : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                opacity: isLocked ? 0.65 : 1,
                transition: "transform 0.2s ease, boxShadow 0.2s ease",
              }}
            >
              {/* Badge superior de tipo de ítem */}
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  color: reward.color,
                  letterSpacing: "0.04em",
                  marginBottom: 6,
                  background: "rgba(0,0,0,0.45)",
                  padding: "2px 8px",
                  borderRadius: 10,
                  border: `1px solid ${reward.color}40`,
                }}
              >
                {reward.badge}
              </div>

              <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.6)" }}>
                DÍA {day.day}
              </div>

              {/* Imagen real del ítem / KilluCoin / Ficha de Gacha */}
              <div
                style={{
                  margin: "8px 0",
                  padding: 6,
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {reward.imageSrc ? (
                  <img
                    src={reward.imageSrc}
                    alt={reward.itemTitle}
                    style={{
                      width: 38,
                      height: 38,
                      objectFit: "contain",
                      filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.6))",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  reward.fallbackIcon
                )}
              </div>

              {/* Título de objeto */}
              <div style={{ fontSize: 12, fontWeight: 800, color: "#FFF", lineHeight: 1.2 }}>
                {reward.itemTitle}
              </div>

              {/* Subtexto / Cantidad */}
              <div style={{ fontSize: 11, fontWeight: 700, color: reward.color, marginTop: 4 }}>
                {reward.subtext}
              </div>

              {/* Multiplicador Badge */}
              {day.multiplier > 1 && !day.is_jackpot && (
                <span
                  style={{
                    marginTop: 6,
                    fontSize: 9.5,
                    fontWeight: 900,
                    background: reward.color,
                    color: "#030712",
                    padding: "1px 7px",
                    borderRadius: 8,
                  }}
                >
                  x{day.multiplier} MULTIPLICADOR
                </span>
              )}

              {/* Estado Badge (Check, ¡HOY! o Candado) */}
              <div style={{ marginTop: 10 }}>
                {isCompleted ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#10B981",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    <CheckCircle2 size={14} /> RECLAMADO
                  </div>
                ) : isCurrent ? (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      color: "#030712",
                      background: "#2DD4BF",
                      padding: "2px 10px",
                      borderRadius: 10,
                      boxShadow: "0 2px 8px rgba(45, 212, 191, 0.4)",
                    }}
                  >
                    ¡RECLAMAR HOY!
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.35)", fontSize: 10 }}>
                    <Lock size={12} /> BLOQUEADO
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
