import { useEffect, useState, useRef, type ReactNode } from 'react';
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
} from 'lucide-react';
import { useAuth } from './mockLauncherState';

export interface RoadmapDay {
  day: number;
  title: string;
  reward_type: 'killucoins' | 'gacha_spin' | 'achievement';
  reward_value: number;
  multiplier: number;
  is_jackpot?: boolean;
}

interface StreakState {
  currentStreak: number;
  canClaim: boolean;
  hasLegendaryAchievement: boolean;
  prestigeLevel: number;
  streakShields: number;
  lastClaimAt?: string | null;
}

interface RewardVisualInfo {
  itemTitle: string;
  subtext: string;
  color: string;
  badge: string;
  imageSrc: string;
  fallbackIcon: ReactNode;
  boxGradient: string;
  borderColor: string;
}

interface ClaimResponsePayload {
  success: boolean;
  message?: string;
  data?: {
    message: string;
    newBalance: number;
  };
}

const COLORS = {
  TEAL: '#2DD4BF',
  COPPER: '#CD7F32',
  SILVER: '#38BDF8',
  GOLD: '#F59E0B',
  EMERALD: '#10B981',
  IRIDIUM: '#E879F9',
  ROSE: '#F43F5E',
  TRANSITION_BASE:
    'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
} as const;

const IMAGES = {
  COIN_COPPER: '/images/killucoins/coin_cobre.webp',
  COIN_SILVER: '/images/killucoins/coin_plata.webp',
  COIN_GOLD: '/images/killucoins/coin_oro.webp',
  COIN_EMERALD: '/images/killucoins/coin_esmeralda.webp',
  COIN_IRIDIUM: '/images/killucoins/coin_iridium.webp',
} as const;

const MESSAGES = {
  CLAIM_ERROR: '⚠️ Error al reclamar recompensa',
  NETWORK_ERROR: '⚠️ Error de conexión al reclamar',
} as const;

const WEEKS = [
  { id: 0, label: 'Todo el Mes (30 Días)', icon: '🗓️' },
  { id: 1, label: 'Semana 1 (Días 1-7)', icon: '🥉' },
  { id: 2, label: 'Semana 2 (Días 8-14)', icon: '🥈' },
  { id: 3, label: 'Semana 3 (Días 15-21)', icon: '🥇' },
  { id: 4, label: 'Semana 4 (Días 22-30)', icon: '👑' },
];

const PRESTIGE_TIERS: Record<
  number,
  { name: string; color: string; badge: string; bonus: number }
> = {
  1: { name: 'Prestigio Bronce', color: COLORS.COPPER, badge: '🥉 BRONCE', bonus: 15 },
  2: { name: 'Prestigio Plata', color: '#94A3B8', badge: '🥈 PLATA', bonus: 30 },
  3: { name: 'Prestigio Oro', color: COLORS.GOLD, badge: '🥇 ORO', bonus: 45 },
  4: { name: 'Prestigio Diamante', color: COLORS.SILVER, badge: '💎 DIAMANTE', bonus: 60 },
  5: { name: 'Prestigio Esmeralda', color: COLORS.EMERALD, badge: '✳️ ESMERALDA', bonus: 75 },
  6: { name: 'Prestigio Iridium', color: COLORS.IRIDIUM, badge: '👑 IRIDIUM MÁXIMO', bonus: 100 },
};

const WEEK_HEADER_INFO: Record<number, { title: string; desc: string }> = {
  1: {
    title: 'Semana 1: Inicio de Racha & Botín de Cobre',
    desc: 'Días 1 al 7 • Ganancia base x1 y Botín de Cobre al final',
  },
  2: {
    title: 'Semana 2: Multiplicadores x2 & Botín de Hierro',
    desc: 'Días 8 al 14 • Todas las recompensas duplicadas y Fichas de Plata',
  },
  3: {
    title: 'Semana 3: Multiplicadores x5 & Bloque de Oro',
    desc: 'Días 15 al 21 • Recompensas quintuplicadas y Bloque de Oro',
  },
  4: {
    title: 'Semana 4: Épico Final & 👑 Jackpot Iridium (x50)',
    desc: 'Días 22 al 30 • Multiplicadores x10, Estrella del Nether y Recompensa Leyenda',
  },
};

const DEFAULT_WEEK_HEADER_INFO = {
  title: 'Calendario Mensual Completo (30 Días)',
  desc: 'Avanza cada semana para aumentar tus multiplicadores de KilluCoins y Fichas de Gacha',
};

const getPrestigeInfo = (level: number) => {
  return (
    PRESTIGE_TIERS[level] || {
      name: `Prestigio Nivel ${level}`,
      color: COLORS.TEAL,
      badge: `⭐ NIVEL ${level}`,
      bonus: level * 15,
    }
  );
};

const getJackpotRewardInfo = (): RewardVisualInfo => ({
  itemTitle: 'Jackpot Iridium',
  subtext: 'Logro Mítico + 125K KC',
  color: COLORS.IRIDIUM,
  badge: '👑 IRIDIUM',
  imageSrc: IMAGES.COIN_IRIDIUM,
  fallbackIcon: <Trophy size={28} color={COLORS.IRIDIUM} />,
  boxGradient: 'linear-gradient(135deg, rgba(232, 121, 249, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)',
  borderColor: COLORS.IRIDIUM,
});

const GACHA_TIERS = [
  {
    maxDay: 7,
    title: 'Giro Gacha Bronce',
    subtext: '1x Ficha de Bronce',
    color: COLORS.COPPER,
    badge: '🎰 GACHA BRONCE',
    image: IMAGES.COIN_COPPER,
    gradient: 'linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)',
  },
  {
    maxDay: 14,
    title: 'Giro Gacha Plata',
    subtext: '1x Ficha de Plata',
    color: COLORS.SILVER,
    badge: '🎰 GACHA PLATA',
    image: IMAGES.COIN_SILVER,
    gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)',
  },
  {
    maxDay: 21,
    title: 'Giro Gacha Oro',
    subtext: '1x Ficha Dorada',
    color: COLORS.GOLD,
    badge: '🎰 GACHA ORO',
    image: IMAGES.COIN_GOLD,
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)',
  },
];

const getGachaRewardInfo = (dayNumber: number): RewardVisualInfo => {
  const tier = GACHA_TIERS.find((t) => dayNumber <= t.maxDay);
  if (tier) {
    return {
      itemTitle: tier.title,
      subtext: tier.subtext,
      color: tier.color,
      badge: tier.badge,
      imageSrc: tier.image,
      fallbackIcon: <Sparkles size={24} color={tier.color} />,
      boxGradient: tier.gradient,
      borderColor: tier.color,
    };
  }

  return {
    itemTitle: 'Giro Gacha Mítico',
    subtext: '1x Ficha Iridium',
    color: COLORS.IRIDIUM,
    badge: '🎰 GACHA MÍTICO',
    imageSrc: IMAGES.COIN_IRIDIUM,
    fallbackIcon: <Sparkles size={24} color={COLORS.IRIDIUM} />,
    boxGradient:
      'linear-gradient(135deg, rgba(232, 121, 249, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)',
    borderColor: COLORS.IRIDIUM,
  };
};

const SPECIAL_LOOTS: Record<
  number,
  {
    itemTitle: string;
    badge: string;
    color: string;
    imageSrc: string;
    gradient: string;
    isCustomSubtext?: boolean;
  }
> = {
  7: {
    itemTitle: 'Lingotes de Cobre',
    badge: '📦 BOTÍN SEMANA 1',
    color: COLORS.COPPER,
    imageSrc: '/images/items/Raw_Copper_JE3_BE2.png',
    gradient: 'linear-gradient(135deg, rgba(205, 127, 50, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)',
  },
  14: {
    itemTitle: 'Lingote de Hierro',
    badge: '📦 BOTÍN SEMANA 2',
    color: COLORS.SILVER,
    imageSrc: '/images/items/Iron_Ingot_JE3_BE2.png',
    gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)',
  },
  21: {
    itemTitle: 'Bloque de Oro',
    badge: '📦 BOTÍN SEMANA 3',
    color: COLORS.GOLD,
    imageSrc: '/images/items/Gold_block.webp',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)',
  },
  28: {
    itemTitle: 'Bloque Esmeralda',
    badge: '💎 BOTÍN ÉPICO',
    color: COLORS.EMERALD,
    imageSrc: '/images/items/Bloque_Esmeralda.webp',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)',
  },
  29: {
    itemTitle: 'Estrella del Nether',
    badge: '⭐ VÍSPEIRA JACKPOT',
    color: COLORS.ROSE,
    imageSrc: '/images/items/Nether_Star.gif',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)',
    isCustomSubtext: true,
  },
};

const getSpecialLootRewardInfo = (day: RoadmapDay): RewardVisualInfo | null => {
  const config = SPECIAL_LOOTS[day.day];
  if (!config) return null;

  const subtext = config.isCustomSubtext
    ? 'Víspera de Jackpot'
    : `+${(day.reward_value * day.multiplier).toLocaleString()} KC`;

  const fallbackIcon = config.isCustomSubtext ? (
    <Sparkles size={26} color={config.color} />
  ) : (
    <Package size={26} color={config.color} />
  );

  return {
    itemTitle: config.itemTitle,
    subtext,
    color: config.color,
    badge: config.badge,
    imageSrc: config.imageSrc,
    fallbackIcon,
    boxGradient: config.gradient,
    borderColor: config.color,
  };
};

const getKilluCoinTier = (day: RoadmapDay) => {
  if (day.multiplier >= 10 || day.day >= 22) {
    return { texture: IMAGES.COIN_EMERALD, badge: '💎 ESMERALDA x10', color: COLORS.EMERALD };
  }
  if (day.multiplier === 5 || (day.day >= 15 && day.day <= 21)) {
    return { texture: IMAGES.COIN_GOLD, badge: '🪙 ORO x5', color: COLORS.GOLD };
  }
  if (day.multiplier === 2 || (day.day >= 8 && day.day <= 14)) {
    return { texture: IMAGES.COIN_SILVER, badge: '🪙 PLATA x2', color: COLORS.SILVER };
  }
  return { texture: IMAGES.COIN_COPPER, badge: '🪙 COBRE', color: COLORS.COPPER };
};

const getCoinRewardInfo = (day: RoadmapDay): RewardVisualInfo => {
  const tier = getKilluCoinTier(day);
  return {
    itemTitle: 'KilluCoins',
    subtext: `+${(day.reward_value * day.multiplier).toLocaleString()} KC`,
    color: tier.color,
    badge: tier.badge,
    imageSrc: tier.texture,
    fallbackIcon: <Coins size={22} color={tier.color} />,
    boxGradient: 'rgba(15, 23, 42, 0.55)',
    borderColor: `${tier.color}40`,
  };
};

const getRewardInfo = (day: RoadmapDay): RewardVisualInfo => {
  if (day.is_jackpot || day.day === 30) {
    return getJackpotRewardInfo();
  }
  if (day.reward_type === 'gacha_spin') {
    return getGachaRewardInfo(day.day);
  }
  const specialLoot = getSpecialLootRewardInfo(day);
  if (specialLoot) {
    return specialLoot;
  }
  return getCoinRewardInfo(day);
};

const getWeekHeaderInfo = (tabId: number) => {
  return WEEK_HEADER_INFO[tabId] || DEFAULT_WEEK_HEADER_INFO;
};

const filterDaysByTab = (days: RoadmapDay[], tabId: number): RoadmapDay[] => {
  if (tabId === 1) return days.filter((d) => d.day >= 1 && d.day <= 7);
  if (tabId === 2) return days.filter((d) => d.day >= 8 && d.day <= 14);
  if (tabId === 3) return days.filter((d) => d.day >= 15 && d.day <= 21);
  if (tabId === 4) return days.filter((d) => d.day >= 22 && d.day <= 30);
  return days;
};

const getFallbackTitle = (day: number): string => {
  const titleMap: Record<number, string> = {
    30: 'Día 30: 👑 JACKPOT IRIDIUM X50',
    7: 'Día 7: Cofre de Cobre',
    14: 'Día 14: Cofre de Plata',
    21: 'Día 21: Cofre de Oro',
    28: 'Día 28: Cofre Esmeralda',
  };
  return titleMap[day] || `Día ${day}`;
};

const getFallbackMultiplier = (day: number): number => {
  if (day < 8) return 1;
  if (day < 15) return 2;
  if (day < 22) return 5;
  if (day < 30) return 10;
  return 50;
};

const createOfflineFallbackDays = (): RoadmapDay[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    let rewardType: RoadmapDay['reward_type'] = 'killucoins';
    if (day === 30) {
      rewardType = 'achievement';
    } else if (day % 3 === 0) {
      rewardType = 'gacha_spin';
    }

    return {
      day,
      title: getFallbackTitle(day),
      reward_type: rewardType,
      reward_value: day * 25,
      multiplier: getFallbackMultiplier(day),
      is_jackpot: day === 30,
    };
  });
};

function PrestigeBadge({ prestigeLevel }: Readonly<{ prestigeLevel: number }>) {
  if (prestigeLevel <= 0) return null;
  const p = getPrestigeInfo(prestigeLevel);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: `${p.color}20`,
        padding: '5px 12px',
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
}

function StreakShieldBadge({ shields }: Readonly<{ shields: number }>) {
  const hasShields = shields > 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: hasShields ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0,0,0,0.3)',
        padding: '5px 12px',
        borderRadius: 20,
        border: hasShields
          ? '1px solid rgba(56, 189, 248, 0.4)'
          : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Shield size={15} color={hasShields ? COLORS.SILVER : 'rgba(255,255,255,0.4)'} />
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: hasShields ? COLORS.SILVER : 'rgba(255,255,255,0.5)',
        }}
      >
        Escudos: {shields}
      </span>
    </div>
  );
}

function StreakFlameBadge({ streak }: Readonly<{ streak: number }>) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(0,0,0,0.45)',
        padding: '5px 12px',
        borderRadius: 20,
        border: '1px solid rgba(245, 158, 11, 0.35)',
      }}
    >
      <Flame size={16} color={COLORS.GOLD} />
      <span style={{ fontSize: 12, fontWeight: 800, color: COLORS.GOLD }}>
        Racha: Día {streak} / 30
      </span>
    </div>
  );
}

interface ClaimButtonProps {
  canClaim: boolean;
  claiming: boolean;
  currentStreak: number;
  onClaim: () => void;
}

function ClaimButton({ canClaim, claiming, currentStreak, onClaim }: Readonly<ClaimButtonProps>) {
  let label = '¡RECOMPENSA DE HOY LISTA!';
  if (claiming) {
    label = 'Reclamando...';
  } else if (canClaim) {
    label = `RECLAMAR DÍA ${currentStreak}`;
  }

  const ariaLabel = canClaim
    ? `Reclamar recompensa del día ${currentStreak}`
    : 'Recompensa de hoy ya reclamada';

  return (
    <button
      aria-label={ariaLabel}
      aria-busy={claiming}
      type="button"
      onClick={onClaim}
      disabled={!canClaim || claiming}
      style={{
        padding: '12px 28px',
        borderRadius: 14,
        background: canClaim
          ? 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)'
          : 'rgba(255,255,255,0.1)',
        color: canClaim ? '#030712' : 'rgba(255,255,255,0.4)',
        fontWeight: 900,
        fontSize: 14,
        border: 'none',
        cursor: canClaim ? 'pointer' : 'not-allowed',
        boxShadow: canClaim ? '0 6px 20px rgba(45, 212, 191, 0.4)' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: COLORS.TRANSITION_BASE,
      }}
    >
      <Sparkles size={18} aria-hidden="true" />
      {label}
    </button>
  );
}

interface RewardsHeaderBannerProps {
  streak: StreakState;
  claiming: boolean;
  onClaim: () => void;
}

function RewardsHeaderBanner({ streak, claiming, onClaim }: Readonly<RewardsHeaderBannerProps>) {
  return (
    <div
      style={{
        padding: '24px 28px',
        borderRadius: 20,
        background:
          'linear-gradient(135deg, rgba(13, 148, 136, 0.35) 0%, rgba(15, 23, 42, 0.85) 100%)',
        border: '1.5px solid rgba(45, 212, 191, 0.35)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Gift size={28} color={COLORS.TEAL} />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#FFF' }}>
            Recompensas Diarias & Roadmap Mensual
          </h1>
        </div>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 13,
            color: 'rgba(255,255,255,0.75)',
            maxWidth: 580,
          }}
        >
          Inicia sesión cada día en el Launcher para desbloquear KilluCoins, Tiradas de Gacha y el
          Botín Mítico del Día 30.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <PrestigeBadge prestigeLevel={streak.prestigeLevel} />
          <StreakShieldBadge shields={streak.streakShields} />
          <StreakFlameBadge streak={streak.currentStreak} />
        </div>

        <ClaimButton
          canClaim={streak.canClaim}
          claiming={claiming}
          currentStreak={streak.currentStreak}
          onClaim={onClaim}
        />
      </div>
    </div>
  );
}

function LegendaryAchievementBanner() {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background:
          'linear-gradient(135deg, rgba(177, 80, 179, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: `1.5px solid ${COLORS.IRIDIUM}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
      }}
    >
      <Trophy size={32} color={COLORS.IRIDIUM} aria-hidden="true" />
      <div>
        <div style={{ fontSize: 15, fontWeight: 900, color: COLORS.IRIDIUM }}>
          🏆 ¡LOGRO MÁXIMO DESBLOQUEADO: Leyenda de CrystalTides!
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
          Completaste la racha mensual perfecta. Tienes el badge dorado en tu perfil y el título
          exclusivo en el servidor.
        </div>
      </div>
    </div>
  );
}

interface WeekTabsProps {
  activeTab: number;
  onSelectTab: (tabId: number) => void;
}

function WeekTabs({ activeTab, onSelectTab }: Readonly<WeekTabsProps>) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar recompensas por semana"
      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}
    >
      {WEEKS.map((w) => {
        const isActive = activeTab === w.id;
        return (
          <button
            role="tab"
            aria-selected={isActive}
            aria-label={w.label}
            type="button"
            key={w.id}
            onClick={() => onSelectTab(w.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              background: isActive
                ? 'linear-gradient(135deg, rgba(45, 212, 191, 0.25) 0%, rgba(13, 148, 136, 0.4) 100%)'
                : 'rgba(15, 23, 42, 0.6)',
              border: isActive
                ? `1.5px solid ${COLORS.TEAL}`
                : '1px solid rgba(255, 255, 255, 0.1)',
              color: isActive ? '#FFF' : 'rgba(255, 255, 255, 0.6)',
              fontWeight: isActive ? 800 : 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: COLORS.TRANSITION_BASE,
            }}
          >
            <span aria-hidden="true">{w.icon}</span>
            <span>{w.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function RewardStatusBadge({
  isCompleted,
  isCurrent,
}: Readonly<{
  isCompleted: boolean;
  isCurrent: boolean;
}>) {
  if (isCompleted) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: COLORS.EMERALD,
          fontSize: 10,
          fontWeight: 800,
        }}
      >
        <CheckCircle2 size={14} /> RECLAMADO
      </div>
    );
  }

  if (isCurrent) {
    return (
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          color: '#030712',
          background: COLORS.TEAL,
          padding: '2px 10px',
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(45, 212, 191, 0.4)',
        }}
      >
        ¡RECLAMAR HOY!
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: 'rgba(255,255,255,0.35)',
        fontSize: 10,
      }}
    >
      <Lock size={12} /> BLOQUEADO
    </div>
  );
}

interface RewardCardProps {
  day: RoadmapDay;
  currentStreak: number;
}

function RewardCard({ day, currentStreak }: Readonly<RewardCardProps>) {
  const isCompleted = day.day < currentStreak;
  const isCurrent = day.day === currentStreak;
  const isLocked = day.day > currentStreak;

  const reward = getRewardInfo(day);

  let borderStyle = '1px solid rgba(255,255,255,0.08)';
  if (isCurrent) {
    borderStyle = `2px solid ${COLORS.TEAL}`;
  } else if (reward.borderColor) {
    borderStyle = `1.5px solid ${reward.borderColor}`;
  }

  let boxShadowStyle = 'none';
  if (isCurrent) {
    boxShadowStyle = '0 0 20px rgba(45, 212, 191, 0.35)';
  } else if (day.is_jackpot) {
    boxShadowStyle = '0 0 24px rgba(232, 121, 249, 0.35)';
  }

  return (
    <div
      style={{
        borderRadius: 16,
        padding: 14,
        background: reward.boxGradient,
        border: borderStyle,
        boxShadow: boxShadowStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        opacity: isLocked ? 0.65 : 1,
        transition: 'transform 0.2s ease, boxShadow 0.2s ease',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          color: reward.color,
          letterSpacing: '0.04em',
          marginBottom: 6,
          background: 'rgba(0,0,0,0.45)',
          padding: '2px 8px',
          borderRadius: 10,
          border: `1px solid ${reward.color}40`,
        }}
      >
        {reward.badge}
      </div>

      <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.6)' }}>
        DÍA {day.day}
      </div>

      <div
        style={{
          margin: '8px 0',
          padding: 6,
          borderRadius: 14,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {reward.imageSrc ? (
          <img
            src={reward.imageSrc}
            alt={reward.itemTitle}
            style={{
              width: 38,
              height: 38,
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          reward.fallbackIcon
        )}
      </div>

      <div style={{ fontSize: 12, fontWeight: 800, color: '#FFF', lineHeight: 1.2 }}>
        {reward.itemTitle}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: reward.color, marginTop: 4 }}>
        {reward.subtext}
      </div>

      {day.multiplier > 1 && !day.is_jackpot && (
        <span
          style={{
            marginTop: 6,
            fontSize: 9.5,
            fontWeight: 900,
            background: reward.color,
            color: '#030712',
            padding: '1px 7px',
            borderRadius: 8,
          }}
        >
          x{day.multiplier} MULTIPLICADOR
        </span>
      )}

      <div style={{ marginTop: 10 }}>
        <RewardStatusBadge isCompleted={isCompleted} isCurrent={isCurrent} />
      </div>
    </div>
  );
}

export function RewardsPage() {
  const { currentSession } = useAuth();
  const [config, setConfig] = useState<RoadmapDay[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [streak, setStreak] = useState<StreakState>({
    currentStreak: 1,
    canClaim: true,
    hasLegendaryAchievement: false,
    prestigeLevel: 0,
    streakShields: 3,
  });

  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const claimingRef = useRef(false);

  useEffect(() => {
    let ignore = false;
    const fetchRoadmapData = async () => {
      try {
        const userIdParam = currentSession?.id ?? '';
        const [resConfig, resStreak] = await Promise.all([
          fetch('https://api.crystaltidessmp.net/api/roadmap/config').then((r) => {
            if (!r.ok) throw new Error('Failed to fetch roadmap config');
            return r.json();
          }),
          fetch(`https://api.crystaltidessmp.net/api/roadmap/streak?userId=${userIdParam}`).then(
            (r) => {
              if (!r.ok) throw new Error('Failed to fetch roadmap streak');
              return r.json();
            },
          ),
        ]);

        if (!ignore) {
          if (resConfig.success && Array.isArray(resConfig.data)) {
            setConfig(resConfig.data);
          }
          if (resStreak.success && resStreak.data) {
            setStreak(resStreak.data);
          }
        }
      } catch {
        if (!ignore) {
          setConfig(createOfflineFallbackDays());
        }
      }
    };

    fetchRoadmapData();
    return () => {
      ignore = true;
    };
  }, [currentSession]);

  const handleClaim = async () => {
    if (claiming || claimingRef.current) return;
    claimingRef.current = true;
    setClaiming(true);
    setClaimMsg(null);

    try {
      const res = await fetch('https://api.crystaltidessmp.net/api/roadmap/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentSession?.id ?? 'guest' }),
      });

      if (!res.ok) {
        setClaimMsg(MESSAGES.CLAIM_ERROR);
        return;
      }

      const data: ClaimResponsePayload = await res.json();
      if (data.success && data.data) {
        setClaimMsg(`🎉 ¡${data.data.message}! Nuevo Saldo: ${data.data.newBalance} KC`);
        setStreak((prev) => ({ ...prev, canClaim: false }));
      } else {
        setClaimMsg(`⚠️ ${data.message ?? 'Error al reclamar recompensa'}`);
      }
    } catch {
      setClaimMsg(MESSAGES.NETWORK_ERROR);
    } finally {
      claimingRef.current = false;
      setClaiming(false);
    }
  };

  const headerInfo = getWeekHeaderInfo(activeTab);
  const displayedDays = filterDaysByTab(config, activeTab);

  return (
    <div
      style={{
        padding: '24px 32px 48px',
        color: '#F8FAFC',
        height: '100%',
        maxHeight: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <RewardsHeaderBanner streak={streak} claiming={claiming} onClaim={handleClaim} />

      {claimMsg && (
        <output
          aria-live="polite"
          style={{
            display: 'block',
            padding: '12px 18px',
            borderRadius: 12,
            background: 'rgba(45,212,191,0.15)',
            border: `1px solid ${COLORS.TEAL}`,
            color: COLORS.TEAL,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {claimMsg}
        </output>
      )}

      {streak.hasLegendaryAchievement && <LegendaryAchievementBanner />}

      <WeekTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: COLORS.SILVER,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Layers size={18} /> {headerInfo.title}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          {headerInfo.desc}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 14,
        }}
      >
        {displayedDays.map((day) => (
          <RewardCard key={day.day} day={day} currentStreak={streak.currentStreak} />
        ))}
      </div>
    </div>
  );
}
