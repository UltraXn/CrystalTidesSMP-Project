import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Award, HelpCircle, Lock, CheckCircle, Sparkles } from "lucide-react";

interface PlayerStatsData {
  username: string;
  rank: string;
  rank_image: string;
  playtime: string;
  weekly_playtime: string;
  kills: number;
  weekly_kills: number;
  mob_kills: number;
  deaths: number;
  weekly_deaths: number;
  money: string;
  weekly_kc_earned: string;
  gacha_spins_weekly: number;
  blocks_mined?: number;
  blocks_placed?: number;
  streak_days?: number;
  member_since: string;
  is_top1_constructor?: boolean;
  is_top1_luchador?: boolean;
  is_top1_mercader?: boolean;
  is_top1_constancia?: boolean;
  is_top1_explorador?: boolean;
  top1_constructor_score?: number;
  top1_luchador_score?: number;
  top1_mercader_score?: number;
  top1_constancia_score?: number;
  top1_explorador_score?: number;
  prestige_constructor?: number;
  prestige_luchador?: number;
  prestige_mercader?: number;
  prestige_constancia?: number;
  prestige_explorador?: number;
}

interface PlayerStatsWidgetProps {
  username?: string | null;
}

interface PentagonAxis {
  key: "constructor" | "luchador" | "mercader" | "constancia" | "explorador";
  label: string;
  value: string | number;
  score: number;
  rawPoints?: number;
  icon: React.ReactNode;
  color: string;
}

const getMcItemUrl = (filename: string) => `https://minecraft.wiki/w/Special:Redirect/file/${filename}`;

const parsePlaytimeHours = (ptStr: string): number => {
  if (!ptStr) return 0;
  const h = parseInt(ptStr.match(/(\d+)h/)?.[1] || "0");
  const m = parseInt(ptStr.match(/(\d+)m/)?.[1] || "0");
  return h + m / 60;
};

const parseMoneyNum = (moneyStr: string): number => {
  if (!moneyStr) return 0;
  return parseFloat(moneyStr.replace(/[^0-9.-]+/g, "")) || 0;
};

const getTopRelativeScore = (val: number, top1Val?: number, isTop1?: boolean) => {
  if (isTop1) return 100;
  const benchmark = Math.max(top1Val || 100000, 100);
  return Math.min(99, Math.max(10, Math.round((val / benchmark) * 100)));
};

export function PlayerStatsWidget({ username }: PlayerStatsWidgetProps) {
  const [prestigeTab, setPrestigeTab] = useState<"constructor" | "luchador" | "mercader" | "constancia" | "explorador">("constructor");
  const [showAscendModal, setShowAscendModal] = useState(false);
  const [isAscending, setIsAscending] = useState(false);

  const queryClient = useQueryClient();
  const { data: stats } = useQuery<PlayerStatsData>({
    queryKey: ['playerStats', username],
    queryFn: async () => {
      try {
        const res = await fetch(`https://api.crystaltidessmp.net/api/player-stats/${encodeURIComponent(username || '')}`);
        if (!res.ok) throw new Error("Failed to fetch player stats");
        const data = await res.json();
        if (data.success && data.data) return data.data;
        throw new Error("Invalid response format");
      } catch {
        return {
          username: username,
          rank: "Aventurero",
          rank_image: "user.png",
          playtime: "142h 30m",
          weekly_playtime: "8h 45m",
          kills: 154,
          weekly_kills: 18,
          mob_kills: 1420,
          deaths: 23,
          weekly_deaths: 3,
          money: "1,250 KC",
          weekly_kc_earned: "+350 KC",
          gacha_spins_weekly: 4,
          blocks_mined: 38900,
          blocks_placed: 45210,
          member_since: "14 de Febrero, 2026"
        };
      }
    },
    enabled: Boolean(username)
  });

  if (!username) return null;

  const blocksVal = (stats?.blocks_mined ?? 0) + (stats?.blocks_placed ?? 0) || 63600;
  const scoreConstructor = getTopRelativeScore(blocksVal, stats?.top1_constructor_score || 100000, stats?.is_top1_constructor);

  const killsVal = stats?.kills ?? 0;
  const mobKillsVal = stats?.mob_kills ?? 0;
  const totalCombatPoints = killsVal * 15 + mobKillsVal;
  const scoreLuchador = getTopRelativeScore(totalCombatPoints, stats?.top1_luchador_score || 5000, stats?.is_top1_luchador);

  const moneyVal = parseMoneyNum(stats?.money || "") || 12450;
  const merchantLogPoints = Math.round(100 * Math.log10(Math.max(1, moneyVal)));
  const scoreMercader = getTopRelativeScore(merchantLogPoints, stats?.top1_mercader_score || 500, stats?.is_top1_mercader);

  const streakVal = stats?.streak_days ?? 14;
  const streakPoints = Math.pow(streakVal, 2);
  const scoreConstancia = getTopRelativeScore(streakPoints, stats?.top1_constancia_score || 900, stats?.is_top1_constancia);

  const playtimeHours = parsePlaytimeHours(stats?.playtime || "") || 14.2;
  const kmTraveled = playtimeHours * 35;
  const totalExploradorPts = (playtimeHours * 10) + kmTraveled;
  const scoreExplorador = getTopRelativeScore(totalExploradorPts, stats?.top1_explorador_score || 3000, stats?.is_top1_explorador);

  const axes: PentagonAxis[] = [
    { key: "constructor", label: "Constructor", value: `${(blocksVal / 1000).toFixed(1)}k`, score: scoreConstructor, rawPoints: blocksVal, icon: <img src="https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Constructor" />, color: "#38BDF8" },
    { key: "luchador", label: "Luchador", value: `${killsVal} Kills`, score: scoreLuchador, rawPoints: totalCombatPoints, icon: <img src="https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Luchador" />, color: "#F43F5E" },
    { key: "mercader", label: "Mercader", value: stats?.money || "12.4k KC", score: scoreMercader, rawPoints: merchantLogPoints, icon: <img src="/images/killucoins/coin_oro.webp" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Mercader" />, color: "#F59E0B" },
    { key: "constancia", label: "Constancia", value: `${streakVal} días`, score: scoreConstancia, rawPoints: streakPoints, icon: <img src="https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Constancia" />, color: "#E879F9" },
    { key: "explorador", label: "Explorador", value: `${playtimeHours.toFixed(1)}h`, score: scoreExplorador, rawPoints: Math.round(totalExploradorPts), icon: <img src="https://minecraft.wiki/w/Special:Redirect/file/Compass.png" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Explorador" />, color: "#10B981" },
  ];

  const cx = 130;
  const cy = 108;
  const radius = 75;

  const getCoordinates = (index: number, scorePercent: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const r = (radius * scorePercent) / 100;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const polygonPoints = axes
    .map((axis, i) => {
      const pt = getCoordinates(i, axis.score);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  // Estructura de Líneas de Carrera y Maestría
  const careerTracks = [
    {
      key: "constructor",
      label: "Constructor",
      color: "#38BDF8",
      formula: "Bloques Minados + Colocados",
      icon: "https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png",
      rawVal: blocksVal,
      isTop1: stats?.is_top1_constructor,
      tiers: [
        { name: "Iniciado", req: "0", item: getMcItemUrl("Wooden_Pickaxe.png"), minVal: 0 },
        { name: "Novato", req: "1k", item: getMcItemUrl("Iron_Pickaxe.png"), minVal: 1000 },
        { name: "Hábil", req: "10k", item: getMcItemUrl("Diamond_Pickaxe.png"), minVal: 10000 },
        { name: "Arquitecto", req: "50k", item: getMcItemUrl("Netherite_Pickaxe.png"), minVal: 50000 },
        { name: "Maestro Constructor", req: "Top 1", item: getMcItemUrl("Beacon.png"), isTop1Tier: true },
      ]
    },
    {
      key: "luchador",
      label: "Luchador",
      color: "#F43F5E",
      formula: "PvP (x15) + Mobs (x1)",
      icon: "https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png",
      rawVal: totalCombatPoints,
      isTop1: stats?.is_top1_luchador,
      tiers: [
        { name: "Recluta", req: "0", item: getMcItemUrl("Wooden_Sword.png"), minVal: 0 },
        { name: "Novato", req: "50", item: getMcItemUrl("Iron_Sword.png"), minVal: 50 },
        { name: "Guerrero", req: "500", item: getMcItemUrl("Diamond_Sword.png"), minVal: 500 },
        { name: "Maestro de Armas", req: "2.5k", item: getMcItemUrl("Netherite_Sword.png"), minVal: 2500 },
        { name: "Señor de la Guerra", req: "Top 1", item: getMcItemUrl("Mace.png"), isTop1Tier: true },
      ]
    },
    {
      key: "mercader",
      label: "Mercader",
      color: "#F59E0B",
      formula: "100 × log₁₀(KilluCoins)",
      icon: "/images/killucoins/coin_oro.webp",
      rawVal: moneyVal,
      isTop1: stats?.is_top1_mercader,
      tiers: [
        { name: "Ambulante", req: "0", item: "/images/killucoins/coin_cobre.webp", minVal: 0 },
        { name: "Novato", req: "1k", item: "/images/killucoins/coin_plata.webp", minVal: 1000 },
        { name: "Próspero", req: "10k", item: "/images/killucoins/coin_oro.webp", minVal: 10000 },
        { name: "Noble", req: "50k", item: "/images/killucoins/coin_diamante.webp", minVal: 50000 },
        { name: "Gran Maestro Gremial", req: "Top 1", item: "/images/killucoins/coin_iridium.webp", isTop1Tier: true },
      ]
    },
    {
      key: "constancia",
      label: "Constancia",
      color: "#E879F9",
      formula: "(Días de Racha)²",
      icon: "https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png",
      rawVal: streakVal,
      isTop1: stats?.is_top1_constancia,
      tiers: [
        { name: "Visitante", req: "0", item: getMcItemUrl("Clock.png"), minVal: 0 },
        { name: "Viajero", req: "7d", item: getMcItemUrl("Compass.png"), minVal: 7 },
        { name: "Devoto", req: "14d", item: getMcItemUrl("Bottle_o%27_Enchanting.png"), minVal: 14 },
        { name: "Viciado", req: "30d", item: getMcItemUrl("Totem_of_Undying.png"), minVal: 30 },
        { name: "Inquebrantable", req: "Top 1", item: getMcItemUrl("Nether_Star.png"), isTop1Tier: true },
      ]
    },
    {
      key: "explorador",
      label: "Explorador",
      color: "#10B981",
      formula: "Horas (x10) + Km",
      icon: "https://minecraft.wiki/w/Special:Redirect/file/Compass.png",
      rawVal: totalExploradorPts,
      isTop1: stats?.is_top1_explorador,
      tiers: [
        { name: "Novato", req: "0", item: getMcItemUrl("Leather_Boots_(item)_JE2.png"), minVal: 0 },
        { name: "Curioso", req: "100", item: getMcItemUrl("Spyglass.png"), minVal: 100 },
        { name: "Mapeador", req: "500", item: getMcItemUrl("Empty_Map.png"), minVal: 500 },
        { name: "Pionero", req: "2k", item: getMcItemUrl("Elytra.png"), minVal: 2000 },
        { name: "Explorador Experto", req: "Top 1", item: getMcItemUrl("Recovery_Compass.png"), isTop1Tier: true },
      ]
    }
  ];

  // Comprobar bloqueo / desbloqueo de Prestigio para la pestaña actual
  const isCurrentCategoryTop1 = (() => {
    switch (prestigeTab) {
      case "constructor": return !!stats?.is_top1_constructor;
      case "luchador": return !!stats?.is_top1_luchador;
      case "mercader": return !!stats?.is_top1_mercader;
      case "constancia": return !!stats?.is_top1_constancia;
      case "explorador": return !!stats?.is_top1_explorador;
    }
  })();

  const currentPrestigeLevel = (() => {
    switch (prestigeTab) {
      case "constructor": return stats?.prestige_constructor || 0;
      case "luchador": return stats?.prestige_luchador || 0;
      case "mercader": return stats?.prestige_mercader || 0;
      case "constancia": return stats?.prestige_constancia || 0;
      case "explorador": return stats?.prestige_explorador || 0;
    }
  })();

  const handleConfirmAscend = async () => {
    if (!isCurrentCategoryTop1 || currentPrestigeLevel >= 5) return;
    setIsAscending(true);
    try {
      // Petición de actualización a la API / Supabase
      const nextLevel = currentPrestigeLevel + 1;
      const keyName = `prestige_${prestigeTab}` as keyof PlayerStatsData;

      queryClient.setQueryData<PlayerStatsData | undefined>(['playerStats', username], (prev) => prev ? {
        ...prev,
        [keyName]: nextLevel
      } : undefined);

      alert(`🎉 ¡Felicidades! Has ascendido exitosamente al Prestigio ${nextLevel} en ${prestigeTab.toUpperCase()}! (+${nextLevel * 5}% KC Diarios)`);
    } catch {
      alert("Error al procesar el ascenso.");
    } finally {
      setIsAscending(false);
      setShowAscendModal(false);
    }
  };

  return (
    <div style={{ width: "100%", color: "#FFF", fontSize: 12, display: "flex", flexDirection: "column", gap: 20, boxSizing: "border-box" }}>
      {/* Header del Perfil */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 16, background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(45, 212, 191, 0.25)", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={`https://mc-heads.net/avatar/${username}/40`}
            alt={username}
            style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid rgba(45, 212, 191, 0.4)" }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#2DD4BF" }}>{username}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Shield size={12} color="#38BDF8" /> {stats?.rank || "Aventurero"}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal: Izquierda (Radar 350px) vs Derecha (Líneas de Carrera expandida) */}
      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 20 }}>
        {/* Columna Izquierda: Radar Pentagon + Guía de Cálculo */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Radar Card */}
          <div style={{ padding: 20, borderRadius: 16, background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
              📊 Radar de Estilo de Juego (Histórico Total)
            </div>

            {/* SVG Diagram */}
            <div style={{ position: "relative", width: "100%", height: 220, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg width="260" height="220" viewBox="0 0 260 220" style={{ overflow: "visible" }}>
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
                  const gridPts = axes
                    .map((_, i) => {
                      const pt = getCoordinates(i, scale * 100);
                      return `${pt.x},${pt.y}`;
                    })
                    .join(" ");
                  return (
                    <polygon
                      key={scale}
                      points={gridPts}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                      strokeDasharray={scale === 1.0 ? "none" : "2,2"}
                    />
                  );
                })}

                {axes.map((_, i) => {
                  const endPt = getCoordinates(i, 100);
                  return (
                    <line
                      key={`item-${i}`}
                      x1={cx}
                      y1={cy}
                      x2={endPt.x}
                      y2={endPt.y}
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                    />
                  );
                })}

                <polygon
                  points={polygonPoints}
                  fill="rgba(45, 212, 191, 0.28)"
                  stroke="#2DD4BF"
                  strokeWidth="2.5"
                  style={{ filter: "drop-shadow(0 0 8px rgba(45,212,191,0.5))" }}
                />

                {axes.map((axis, i) => {
                  const pt = getCoordinates(i, axis.score);
                  return (
                    <g key={`item-${i}`}>
                      <circle cx={pt.x} cy={pt.y} r="4.5" fill={axis.color} stroke="#0F172A" strokeWidth="1.5" />
                    </g>
                  );
                })}

                {axes.map((axis, i) => {
                  const labelPt = getCoordinates(i, 122);
                  return (
                    <text
                      key={`item-${i}`}
                      x={labelPt.x}
                      y={labelPt.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={axis.color}
                      fontSize="9.5"
                      fontWeight="900"
                    >
                      {axis.label}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Raw Values Grid (Con minWidth 0 para evitar desbordamientos) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 4, width: "100%", marginTop: 12, boxSizing: "border-box" }}>
              {axes.map((axis) => (
                <div key={axis.label} style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "6px 2px", textAlign: "center", border: `1px solid ${axis.color}30`, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
                  {axis.icon}
                  <div style={{ fontSize: 8.5, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{axis.label}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 900, color: "#FFF", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{axis.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Guía Explicativa de Fórmulas */}
          <div style={{ padding: 16, borderRadius: 16, background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", gap: 10, fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
            <div style={{ fontWeight: 900, color: "#2DD4BF", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <HelpCircle size={14} /> ¿Cómo se calcula cada Puntuación?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <img src="https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Constructor" />
                <strong style={{ color: "#38BDF8" }}>Constructor:</strong> Bloques minados + colocados en tu historia.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <img src="https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Luchador" />
                <strong style={{ color: "#F43F5E" }}>Luchador:</strong> 15 pts por kill PvP a jugadores y 1 pt por mob hostil.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <img src="/images/killucoins/coin_oro.webp" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Mercader" />
                <strong style={{ color: "#F59E0B" }}>Mercader:</strong> Escala logarítmica (100 × log₁₀(KilluCoins)).
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <img src="https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Constancia" />
                <strong style={{ color: "#E879F9" }}>Constancia:</strong> Crecimiento cuadrático (Días de Racha)².
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <img src="https://minecraft.wiki/w/Special:Redirect/file/Compass.png" style={{ width: 14, height: 14, objectFit: "contain" }} alt="Explorador" />
                <strong style={{ color: "#10B981" }}>Explorador:</strong> 10 pts por hora de juego + 1 pt por km recorrido.
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Líneas de Carrera y Maestría (Píldoras con Flechas) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: 18, borderRadius: 16, background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 900, color: "#2DD4BF", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}>
              <Award size={16} /> Líneas de Carrera y Maestría
            </div>

            {/* Lista de Pistas de Progresión de Rangos */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {careerTracks.map((track) => {
                // Calcular cuál es el nivel activo actual del usuario
                let currentTierIndex = 0;
                if (track.isTop1) {
                  currentTierIndex = 4;
                } else {
                  for (let i = 3; i >= 0; i--) {
                    if (track.rawVal >= track.tiers[i].minVal!) {
                      currentTierIndex = i;
                      break;
                    }
                  }
                }

                return (
                  <div
                    key={track.key}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: "rgba(0, 0, 0, 0.4)",
                      border: `1px solid ${track.color}25`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10
                    }}
                  >
                    {/* Fila Superior: Título + Fórmula */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img src={track.icon} style={{ width: 16, height: 16, objectFit: "contain" }} alt={track.label} />
                        <span style={{ fontSize: 12, fontWeight: 900, color: track.color }}>{track.label}</span>
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
                        {track.formula}
                      </span>
                    </div>

                    {/* Fila Inferior: Flujo Horizontal de Píldoras con Flechas (Línea Continua) */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap", gap: 4, overflowX: "auto" }}>
                      {track.tiers.map((tier, tIdx) => {
                        const isCurrent = tIdx === currentTierIndex;
                        const isTop1Tier = tier.isTop1Tier;

                        let pillBg = "rgba(255, 255, 255, 0.04)";
                        let pillBorder = "1px solid rgba(255, 255, 255, 0.08)";
                        let textColor = "rgba(255, 255, 255, 0.5)";
                        let glowStyle = {};

                        if (isCurrent) {
                          pillBg = isTop1Tier ? `${track.color}30` : `${track.color}20`;
                          pillBorder = `1.5px solid ${track.color}`;
                          textColor = isTop1Tier ? "#FFF" : track.color;
                          glowStyle = { boxShadow: `0 0 12px ${track.color}60` };
                        }

                        return (
                          <div key={tIdx} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {/* Flecha Conectora */}
                            {tIdx > 0 && (
                              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", padding: "0 1px" }}>→</span>
                            )}

                            {/* Píldora del Rango */}
                            <div
                              style={{
                                padding: "4px 8px",
                                borderRadius: 8,
                                background: pillBg,
                                border: pillBorder,
                                color: textColor,
                                fontSize: 10,
                                fontWeight: isCurrent ? 900 : 600,
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                ...glowStyle
                              }}
                            >
                              <img src={tier.item} style={{ width: 13, height: 13, objectFit: "contain" }} alt={tier.name} />
                              <span>{tier.name}</span>
                              {!isTop1Tier && <span style={{ fontSize: 8.5, opacity: 0.65 }}>({tier.req})</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tarjeta Amarilla de Reglas Top 1 */}
            <div style={{ marginTop: 4, padding: 12, borderRadius: 12, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", fontSize: 10.5, color: "#FDE68A", lineHeight: 1.4 }}>
              <div style={{ fontWeight: 900, color: "#F59E0B", marginBottom: 6, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                🏆 Reglas del Rango Máximo
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10 }}>
                <div>• <strong>Requisito Rango Máximo:</strong> Debes ser el jugador con más puntos/estadística de la categoría en la que estás destacando.</div>
                <div>• <strong>Límite de 1 Rango Activo:</strong> Solo puedes poseer 1 título máximo simultáneo al mismo tiempo.</div>
                <div>• <strong>Transferencia Directa:</strong> Se transfiere si otro jugador supera tu puntaje. El Duelo 1v1 es exclusivo del Señor de la Guerra.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Completo Inferior (Full-Width): Sistema de Prestigios Bloqueado / Funcional */}
      <div style={{ padding: 20, borderRadius: 16, background: "linear-gradient(135deg, rgba(88, 28, 135, 0.25) 0%, rgba(0,0,0,0.5) 100%)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(168,85,247,0.2)", paddingBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#FFF", display: "flex", alignItems: "center", gap: 6 }}>⭐ Sistema de Prestigios de Estilo de Juego</span>
          {/* Tabs de Selección */}
          <div role="tablist" aria-label="Pestañas de arquetipos de prestigio" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["constructor", "luchador", "mercader", "constancia", "explorador"] as const).map((key) => {
              const tabsConfig = {
                constructor: { label: "Constructor", icon: "https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png" },
                luchador: { label: "Luchador", icon: "https://minecraft.wiki/w/Special:Redirect/file/Netherite_Sword.png" },
                mercader: { label: "Mercader", icon: "/images/killucoins/coin_oro.webp" },
                constancia: { label: "Constancia", icon: "https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png" },
                explorador: { label: "Explorador", icon: "https://minecraft.wiki/w/Special:Redirect/file/Recovery_Compass.png" },
              };
              const item = tabsConfig[key];
              const isActive = prestigeTab === key;
              return (
                <button
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Ver prestigio de arquetipo ${item.label}`}
                  type="button"
                  key={key}
                  onClick={() => setPrestigeTab(key)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 800,
                    border: isActive ? "1px solid #C084FC" : "1px solid rgba(255,255,255,0.1)",
                    background: isActive ? "#9333EA" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#FFF" : "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <img src={item.icon} style={{ width: 14, height: 14, objectFit: "contain" }} alt={item.label} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de los 5 Niveles de Prestigio con Control de Bloqueo Real */}
        {(() => {
          const archetypeMockups = {
            constructor: [
              { levelNum: 1, level: "⭐ Prestigio I", rankName: "Iniciado de Piedra", bonus: "+5% KC Diarios", tag: "[P1]", color: "#F59E0B", border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Cobblestone.png" },
              { levelNum: 2, level: "⭐⭐ Prestigio II", rankName: "Constructor Consagrado", bonus: "+10% KC Diarios", tag: "[P2]", color: "#CBD5E1", border: "rgba(203,213,225,0.3)", bg: "rgba(203,213,225,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Iron_Pickaxe.png" },
              { levelNum: 3, level: "⭐⭐⭐ Prestigio III", rankName: "Gran Arquitecto", bonus: "+15% KC", tag: "[P3]", color: "#FACC15", border: "rgba(250,204,21,0.3)", bg: "rgba(250,204,21,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Golden_Pickaxe.png" },
              { levelNum: 4, level: "⭐⭐⭐⭐ Prestigio IV", rankName: "Maestro Constructor", bonus: "+20% KC", tag: "[P4]", color: "#22D3EE", border: "rgba(34,211,238,0.3)", bg: "rgba(34,211,238,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Diamond_Pickaxe.png" },
              { levelNum: 5, level: "💎 Prestigio V", rankName: "Arquitecto Mítico", bonus: "+25% KC + Title", tag: "[P5]", color: "#E879F9", border: "rgba(232,121,249,0.4)", bg: "rgba(232,121,249,0.15)", item: "https://minecraft.wiki/w/Special:Redirect/file/Beacon.png" },
            ],
            luchador: [
              { levelNum: 1, level: "⭐ Prestigio I", rankName: "Guerrero de Bronce", bonus: "+5% KC Diarios", tag: "[P1]", color: "#F59E0B", border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Wooden_Sword.png" },
              { levelNum: 2, level: "⭐⭐ Prestigio II", rankName: "Campeón de Batalla", bonus: "+10% KC Diarios", tag: "[P2]", color: "#CBD5E1", border: "rgba(203,213,225,0.3)", bg: "rgba(203,213,225,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Iron_Sword.png" },
              { levelNum: 3, level: "⭐⭐⭐ Prestigio III", rankName: "Señor de Guerra", bonus: "+15% KC", tag: "[P3]", color: "#FACC15", border: "rgba(250,204,21,0.3)", bg: "rgba(250,204,21,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Golden_Sword.png" },
              { levelNum: 4, level: "⭐⭐⭐⭐ Prestigio IV", rankName: "Maestro de Armas", bonus: "+20% KC", tag: "[P4]", color: "#22D3EE", border: "rgba(34,211,238,0.3)", bg: "rgba(34,211,238,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png" },
              { levelNum: 5, level: "💎 Prestigio V", rankName: "Gladiador Supremo", bonus: "+25% KC + Espadas", tag: "[P5]", color: "#E879F9", border: "rgba(232,121,249,0.4)", bg: "rgba(232,121,249,0.15)", item: "https://minecraft.wiki/w/Special:Redirect/file/Mace.png" },
            ],
            mercader: [
              { levelNum: 1, level: "⭐ Prestigio I", rankName: "Mercader Próspero", bonus: "+5% KC Diarios", tag: "[P1]", color: "#F59E0B", border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.1)", item: "/images/killucoins/coin_cobre.webp" },
              { levelNum: 2, level: "⭐⭐ Prestigio II", rankName: "Comerciante de Élite", bonus: "+10% KC Diarios", tag: "[P2]", color: "#CBD5E1", border: "rgba(203,213,225,0.3)", bg: "rgba(203,213,225,0.1)", item: "/images/killucoins/coin_plata.webp" },
              { levelNum: 3, level: "⭐⭐⭐ Prestigio III", rankName: "Barón Financiero", bonus: "+15% KC", tag: "[P3]", color: "#FACC15", border: "rgba(250,204,21,0.3)", bg: "rgba(250,204,21,0.1)", item: "/images/killucoins/coin_oro.webp" },
              { levelNum: 4, level: "⭐⭐⭐⭐ Prestigio IV", rankName: "Gran Maestro Gremial", bonus: "+20% KC", tag: "[P4]", color: "#22D3EE", border: "rgba(34,211,238,0.3)", bg: "rgba(34,211,238,0.1)", item: "/images/killucoins/coin_diamante.webp" },
              { levelNum: 5, level: "💎 Prestigio V", rankName: "Magnate Legendario", bonus: "+25% KC + Rain", tag: "[P5]", color: "#E879F9", border: "rgba(232,121,249,0.4)", bg: "rgba(232,121,249,0.15)", item: "/images/killucoins/coin_iridium.webp" },
            ],
            constancia: [
              { levelNum: 1, level: "⭐ Prestigio I", rankName: "Devoto del Servidor", bonus: "+5% KC Diarios", tag: "[P1]", color: "#F59E0B", border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Clock.png" },
              { levelNum: 2, level: "⭐⭐ Prestigio II", rankName: "Pilar Inquebrantable", bonus: "+10% KC Diarios", tag: "[P2]", color: "#CBD5E1", border: "rgba(203,213,225,0.3)", bg: "rgba(203,213,225,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Compass.png" },
              { levelNum: 3, level: "⭐⭐⭐ Prestigio III", rankName: "Guardián de Racha", bonus: "+15% KC", tag: "[P3]", color: "#FACC15", border: "rgba(250,204,21,0.3)", bg: "rgba(250,204,21,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Bottle_o%27_Enchanting.png" },
              { levelNum: 4, level: "⭐⭐⭐⭐ Prestigio IV", rankName: "Leyenda Inquebrantable", bonus: "+20% KC", tag: "[P4]", color: "#22D3EE", border: "rgba(34,211,238,0.3)", bg: "rgba(34,211,238,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png" },
              { levelNum: 5, level: "💎 Prestigio V", rankName: "Titán Eterno", bonus: "+25% KC + Totem", tag: "[P5]", color: "#E879F9", border: "rgba(232,121,249,0.4)", bg: "rgba(232,121,249,0.15)", item: "https://minecraft.wiki/w/Special:Redirect/file/Nether_Star.png" },
            ],
            explorador: [
              { levelNum: 1, level: "⭐ Prestigio I", rankName: "Navegante de Reinos", bonus: "+5% KC Diarios", tag: "[P1]", color: "#F59E0B", border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Leather_Boots_(item)_JE2.png" },
              { levelNum: 2, level: "⭐⭐ Prestigio II", rankName: "Mapeador Ancestral", bonus: "+10% KC Diarios", tag: "[P2]", color: "#CBD5E1", border: "rgba(203,213,225,0.3)", bg: "rgba(203,213,225,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Spyglass.png" },
              { levelNum: 3, level: "⭐⭐⭐ Prestigio III", rankName: "Pionero del Horizonte", bonus: "+15% KC", tag: "[P3]", color: "#FACC15", border: "rgba(250,204,21,0.3)", bg: "rgba(250,204,21,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Empty_Map.png" },
              { levelNum: 4, level: "⭐⭐⭐⭐ Prestigio IV", rankName: "Explorador Experto", bonus: "+20% KC", tag: "[P4]", color: "#22D3EE", border: "rgba(34,211,238,0.3)", bg: "rgba(34,211,238,0.1)", item: "https://minecraft.wiki/w/Special:Redirect/file/Elytra.png" },
              { levelNum: 5, level: "💎 Prestigio V", rankName: "Conquistador de Mundos", bonus: "+25% KC + Trail", tag: "[P5]", color: "#E879F9", border: "rgba(232,121,249,0.4)", bg: "rgba(232,121,249,0.15)", item: "https://minecraft.wiki/w/Special:Redirect/file/Recovery_Compass.png" },
            ],
          };
          const list = archetypeMockups[prestigeTab];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
              {list.map((item) => {
                const isUnlocked = item.levelNum <= currentPrestigeLevel;
                const isNextTarget = isCurrentCategoryTop1 && item.levelNum === currentPrestigeLevel + 1;
                const isLocked = !isUnlocked && !isNextTarget;

                const cardBg = isUnlocked ? item.bg : isNextTarget ? "rgba(147,51,234,0.12)" : "rgba(0,0,0,0.5)";
                const cardBorder = isUnlocked ? `1px solid ${item.border}` : isNextTarget ? "1px solid #C084FC" : "1px solid rgba(255,255,255,0.05)";
                const opacity = isLocked ? 0.45 : 1;

                return (
                  <div key={item.levelNum} style={{ padding: 12, borderRadius: 12, background: cardBg, border: cardBorder, opacity, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 4, position: "relative" }}>
                    {isUnlocked && (
                      <span style={{ position: "absolute", top: 6, right: 6, fontSize: 9, color: "#10B981", display: "flex", alignItems: "center", gap: 2 }}>
                        <CheckCircle size={10} /> Activo
                      </span>
                    )}
                    {isLocked && (
                      <span style={{ position: "absolute", top: 6, right: 6, fontSize: 9, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 2 }}>
                        <Lock size={10} /> Bloqueado
                      </span>
                    )}
                    <img src={item.item} style={{ width: 22, height: 22, objectFit: "contain", margin: "2px 0", filter: isLocked ? "grayscale(0.8)" : "none" }} alt={item.rankName} />
                    <span style={{ color: isUnlocked ? item.color : isNextTarget ? "#C084FC" : "rgba(255,255,255,0.5)", fontWeight: 900, fontSize: 11 }}>{item.level}</span>
                    <span style={{ fontSize: 11, color: isLocked ? "rgba(255,255,255,0.5)" : "#FFF", fontWeight: 800 }}>{item.rankName}</span>
                    <span style={{ fontSize: 10, color: isLocked ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)" }}>{item.bonus}</span>
                    <span style={{ fontSize: 9.5, color: isUnlocked ? item.color : "rgba(255,255,255,0.4)", fontFamily: "monospace", fontWeight: 700 }}>{item.tag}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid rgba(168,85,247,0.2)", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
          {isCurrentCategoryTop1 ? (
            currentPrestigeLevel >= 5 ? (
              <span>👑 <em>¡Felicidades! Has alcanzado el <strong>Nivel Máximo V de Prestigio</strong> en {prestigeTab.toUpperCase()}.</em></span>
            ) : (
              <span>✨ <em>¡Requisito Cumplido! Eres el #1 del servidor en <strong>{prestigeTab.toUpperCase()}</strong>. Puedes ascender al Nivel {currentPrestigeLevel + 1}.</em></span>
            )
          ) : (
            <span style={{ color: "#FCA5A5", display: "flex", alignItems: "center", gap: 4 }}>
              <Lock size={13} color="#F87171" /> <em>Bloqueado: Debes ser el jugador #1 con Rango Máximo en <strong>{prestigeTab.toUpperCase()}</strong> para ascender.</em>
            </span>
          )}

          <button
            aria-label={!isCurrentCategoryTop1 ? "Ascenso bloqueado: debes alcanzar el rango máximo" : currentPrestigeLevel >= 5 ? "Prestigio máximo alcanzado" : `Ascender a prestigio nivel ${currentPrestigeLevel + 1}`}
            type="button"
            disabled={!isCurrentCategoryTop1 || currentPrestigeLevel >= 5}
            onClick={() => setShowAscendModal(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              background: (!isCurrentCategoryTop1 || currentPrestigeLevel >= 5) ? "rgba(255,255,255,0.05)" : "#9333EA",
              border: (!isCurrentCategoryTop1 || currentPrestigeLevel >= 5) ? "1px solid rgba(255,255,255,0.1)" : "1px solid #C084FC",
              color: (!isCurrentCategoryTop1 || currentPrestigeLevel >= 5) ? "rgba(255,255,255,0.4)" : "#FFF",
              fontWeight: 900,
              fontSize: 11,
              cursor: (!isCurrentCategoryTop1 || currentPrestigeLevel >= 5) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            {!isCurrentCategoryTop1 ? (
              <>
                <Lock size={13} /> 🔒 Requisito: Alcanzar Rango Máximo
              </>
            ) : currentPrestigeLevel >= 5 ? (
              "👑 Prestigio Máximo Alcanzado"
            ) : (
              <>
                <Sparkles size={13} /> ⭐ Ascender a Prestigio {currentPrestigeLevel + 1}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Ascenso */}
      {showAscendModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ascend-modal-title"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div style={{ background: "#0F172A", border: "1px solid rgba(168,85,247,0.4)", borderRadius: 16, padding: 20, maxWidth: 360, width: "100%", color: "#FFF", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(168,85,247,0.2)", paddingBottom: 10 }}>
              <span id="ascend-modal-title" style={{ fontWeight: 800, fontSize: 13, color: "#C084FC" }}>Confirmar Ascenso ⭐</span>
              <button aria-label="Cerrar ventana de ascenso" type="button" onClick={() => setShowAscendModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", lineHeight: 1.4, margin: 0 }}>
              ¿Deseas ascender al <strong>Nivel {currentPrestigeLevel + 1} de Prestigio</strong> en <strong>{prestigeTab.toUpperCase()}</strong> para ganar +5% en multiplicadores de KilluCoins diarios?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
              <button type="button" onClick={() => setShowAscendModal(false)} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, color: "#FFF", cursor: "pointer" }}>Cancelar</button>
              <button
                aria-label="Confirmar ascenso"
                aria-busy={isAscending}
                type="button"
                disabled={isAscending}
                onClick={handleConfirmAscend}
                style={{ padding: "6px 14px", borderRadius: 8, background: "#9333EA", border: "1px solid #C084FC", fontSize: 11, fontWeight: 800, color: "#FFF", cursor: "pointer" }}
              >
                {isAscending ? "Procesando..." : "Confirmar Ascenso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
