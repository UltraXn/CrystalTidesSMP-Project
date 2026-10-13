import { Request, Response } from 'express';
import supabase from '../services/supabaseService.js';
import * as gachaBalanceService from '../services/gachaBalanceService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export interface RoadmapDayConfig {
  day: number;
  title: string;
  reward_type: 'killucoins' | 'gacha_spin' | 'achievement';
  reward_value: number;
  multiplier: number;
  is_jackpot?: boolean;
}

interface UserStreakRow {
  user_id: string;
  current_streak?: number;
  streak_shields?: number;
  prestige_level?: number;
  last_claim_at?: string | null;
  total_claims?: number;
}

interface StreakCalculationResult {
  valid: boolean;
  errorMsg?: string;
  errorCode?: string;
  newStreak: number;
  remainingShields: number;
  usedShield: boolean;
}

interface PrestigeMilestoneResult {
  nextPrestigeLevel: number;
  prestigeUp: boolean;
  achievementId: string;
  achievementTitle: string;
  unlockedAchievement: boolean;
}

const CONSTANTS = {
  ERROR_UNAUTHORIZED: 'UNAUTHORIZED',
  MSG_USER_ID_REQUIRED: 'User ID required',
  TABLE_ROADMAP_CONFIG: 'monthly_roadmap_config',
  TABLE_USER_STREAKS: 'user_daily_streaks',
  TABLE_USER_ACHIEVEMENTS: 'user_achievements',
  TABLE_USER_TITLES: 'user_titles',
  COL_USER_ID: 'user_id',
  COL_DAY: 'day',
  ACHIEVEMENT_ID_COL: 'achievement_id',
  LEGENDARY_ACHIEVEMENT_ID: 'legend_of_crystaltides',
  LOGRO_PREFIX: 'Logro: ',
  MIN_CLAIM_HOURS: 20,
  RESET_CLAIM_HOURS: 48,
  DEFAULT_SHIELDS: 3,
  MAX_PRESTIGE: 6,
  PRESTIGE_MULTIPLIER_STEP: 0.15,
  MAX_DAYS: 30,
} as const;

const DEFAULT_ROADMAP: readonly RoadmapDayConfig[] = [
  {
    day: 1,
    title: 'Día 1: Bienvenida',
    reward_type: 'killucoins',
    reward_value: 25,
    multiplier: 1,
  },
  {
    day: 2,
    title: 'Día 2: Primer Paso',
    reward_type: 'killucoins',
    reward_value: 50,
    multiplier: 1,
  },
  {
    day: 3,
    title: 'Día 3: Giro Gacha Bronce',
    reward_type: 'gacha_spin',
    reward_value: 1,
    multiplier: 1,
  },
  {
    day: 4,
    title: 'Día 4: Continuidad',
    reward_type: 'killucoins',
    reward_value: 100,
    multiplier: 1,
  },
  { day: 5, title: 'Día 5: En Racha', reward_type: 'killucoins', reward_value: 125, multiplier: 1 },
  {
    day: 6,
    title: 'Día 6: Giro Gacha Bronce',
    reward_type: 'gacha_spin',
    reward_value: 1,
    multiplier: 1,
  },
  {
    day: 7,
    title: 'Día 7: Botín de Cobre',
    reward_type: 'killucoins',
    reward_value: 175,
    multiplier: 1,
  },

  {
    day: 8,
    title: 'Día 8: Impulso x2',
    reward_type: 'killucoins',
    reward_value: 200,
    multiplier: 2,
  },
  {
    day: 9,
    title: 'Día 9: Carga Doble',
    reward_type: 'killucoins',
    reward_value: 225,
    multiplier: 2,
  },
  {
    day: 10,
    title: 'Día 10: Giro Gacha Plata',
    reward_type: 'gacha_spin',
    reward_value: 1,
    multiplier: 2,
  },
  {
    day: 11,
    title: 'Día 11: Plata Viva',
    reward_type: 'killucoins',
    reward_value: 275,
    multiplier: 2,
  },
  {
    day: 12,
    title: 'Día 12: Constancia',
    reward_type: 'killucoins',
    reward_value: 300,
    multiplier: 2,
  },
  {
    day: 13,
    title: 'Día 13: Giro Gacha Plata',
    reward_type: 'gacha_spin',
    reward_value: 1,
    multiplier: 2,
  },
  {
    day: 14,
    title: 'Día 14: Botín de Hierro',
    reward_type: 'killucoins',
    reward_value: 350,
    multiplier: 2,
  },

  {
    day: 15,
    title: 'Día 15: Super Impulso x5',
    reward_type: 'killucoins',
    reward_value: 400,
    multiplier: 5,
  },
  {
    day: 16,
    title: 'Día 16: Fuerza Dorada',
    reward_type: 'killucoins',
    reward_value: 425,
    multiplier: 5,
  },
  {
    day: 17,
    title: 'Día 17: Giro Gacha Oro',
    reward_type: 'gacha_spin',
    reward_value: 1,
    multiplier: 5,
  },
  {
    day: 18,
    title: 'Día 18: Fuego Dorado',
    reward_type: 'killucoins',
    reward_value: 475,
    multiplier: 5,
  },
  {
    day: 19,
    title: 'Día 19: Avance Épico',
    reward_type: 'killucoins',
    reward_value: 500,
    multiplier: 5,
  },
  {
    day: 20,
    title: 'Día 20: Giro Gacha Oro',
    reward_type: 'gacha_spin',
    reward_value: 1,
    multiplier: 5,
  },
  {
    day: 21,
    title: 'Día 21: Bloque de Oro',
    reward_type: 'killucoins',
    reward_value: 550,
    multiplier: 5,
  },

  {
    day: 22,
    title: 'Día 22: Ultra Multiplicador x10',
    reward_type: 'killucoins',
    reward_value: 600,
    multiplier: 10,
  },
  {
    day: 23,
    title: 'Día 23: Poder Esmeralda',
    reward_type: 'killucoins',
    reward_value: 625,
    multiplier: 10,
  },
  {
    day: 24,
    title: 'Día 24: Giro Gacha Mítico',
    reward_type: 'gacha_spin',
    reward_value: 1,
    multiplier: 10,
  },
  {
    day: 25,
    title: 'Día 25: Resplandor Esmeralda',
    reward_type: 'killucoins',
    reward_value: 675,
    multiplier: 10,
  },
  {
    day: 26,
    title: 'Día 26: Maestría',
    reward_type: 'killucoins',
    reward_value: 700,
    multiplier: 10,
  },
  {
    day: 27,
    title: 'Día 27: Giro Gacha Mítico',
    reward_type: 'gacha_spin',
    reward_value: 1,
    multiplier: 10,
  },
  {
    day: 28,
    title: 'Día 28: Bloque Esmeralda',
    reward_type: 'killucoins',
    reward_value: 750,
    multiplier: 10,
  },
  {
    day: 29,
    title: 'Día 29: Estrella del Nether',
    reward_type: 'gacha_spin',
    reward_value: 2,
    multiplier: 10,
  },
  {
    day: 30,
    title: 'Día 30: 👑 JACKPOT IRIDIUM X50',
    reward_type: 'achievement',
    reward_value: 2500,
    multiplier: 50,
    is_jackpot: true,
  },
];

const PRESTIGE_ACHIEVEMENTS: Readonly<Record<number, { id: string; title: string }>> = {
  1: { id: 'prestige_bronce', title: `${CONSTANTS.LOGRO_PREFIX}Prestigio Bronce` },
  2: { id: 'prestige_plata', title: `${CONSTANTS.LOGRO_PREFIX}Prestigio Plata` },
  3: { id: 'prestige_oro', title: `${CONSTANTS.LOGRO_PREFIX}Prestigio Oro` },
  4: { id: 'prestige_diamante', title: `${CONSTANTS.LOGRO_PREFIX}Prestigio Diamante` },
  5: { id: 'prestige_esmeralda', title: `${CONSTANTS.LOGRO_PREFIX}Prestigio Esmeralda` },
  6: { id: 'prestige_iridium', title: `${CONSTANTS.LOGRO_PREFIX}Prestigio Iridium Mítico` },
};

function extractUserId(req: Request): string | undefined {
  const authUser = (req as Request & { user?: { id?: string } }).user;
  return authUser?.id ?? (req.query.userId as string) ?? (req.body.userId as string) ?? undefined;
}

function canClaimStreak(lastClaimAt: string | null | undefined): boolean {
  if (!lastClaimAt) return true;
  const hoursSinceLastClaim = (Date.now() - new Date(lastClaimAt).getTime()) / (1000 * 60 * 60);
  return hoursSinceLastClaim >= CONSTANTS.MIN_CLAIM_HOURS;
}

function calculateNextStreak(
  lastClaimAt: Date | null,
  currentStreak: number,
  streakShields: number,
): StreakCalculationResult {
  if (!lastClaimAt) {
    return {
      valid: true,
      newStreak: currentStreak,
      remainingShields: streakShields,
      usedShield: false,
    };
  }

  const hoursDiff = (Date.now() - lastClaimAt.getTime()) / (1000 * 60 * 60);
  if (hoursDiff < CONSTANTS.MIN_CLAIM_HOURS) {
    return {
      valid: false,
      errorMsg: 'Debes esperar 20 horas entre reclamos',
      errorCode: 'COOLDOWN_ACTIVE',
      newStreak: currentStreak,
      remainingShields: streakShields,
      usedShield: false,
    };
  }

  const nextStreakValue = (currentStreak % CONSTANTS.MAX_DAYS) + 1;
  if (hoursDiff > CONSTANTS.RESET_CLAIM_HOURS) {
    if (streakShields > 0) {
      return {
        valid: true,
        newStreak: nextStreakValue,
        remainingShields: streakShields - 1,
        usedShield: true,
      };
    }
    return { valid: true, newStreak: 1, remainingShields: 0, usedShield: false };
  }

  return {
    valid: true,
    newStreak: nextStreakValue,
    remainingShields: streakShields,
    usedShield: false,
  };
}

function calculateRewardAmount(dayConfig: RoadmapDayConfig, prestigeLevel: number): number {
  const prestigeMultiplier = 1 + prestigeLevel * CONSTANTS.PRESTIGE_MULTIPLIER_STEP;
  const baseRewardAmount = (dayConfig.reward_value || 50) * (dayConfig.multiplier || 1);
  return Math.floor(baseRewardAmount * prestigeMultiplier);
}

function resolvePrestigeMilestone(
  currentStreak: number,
  isJackpot: boolean | undefined,
  currentPrestige: number,
): PrestigeMilestoneResult {
  const isMilestone = currentStreak === CONSTANTS.MAX_DAYS || Boolean(isJackpot);
  if (!isMilestone) {
    return {
      nextPrestigeLevel: currentPrestige,
      prestigeUp: false,
      achievementId: '',
      achievementTitle: '',
      unlockedAchievement: false,
    };
  }

  const canAdvancePrestige = currentPrestige < CONSTANTS.MAX_PRESTIGE;
  const nextPrestigeLevel = canAdvancePrestige ? currentPrestige + 1 : currentPrestige;
  const prestigeUp = canAdvancePrestige;

  const fallbackAch = {
    id: `prestige_${nextPrestigeLevel}`,
    title: `${CONSTANTS.LOGRO_PREFIX}Prestigio Nivel ${nextPrestigeLevel}`,
  };
  const ach = PRESTIGE_ACHIEVEMENTS[nextPrestigeLevel] || fallbackAch;

  return {
    nextPrestigeLevel,
    prestigeUp,
    achievementId: ach.id,
    achievementTitle: ach.title,
    unlockedAchievement: true,
  };
}

async function unlockAchievements(
  userId: string,
  achievementId: string,
  achievementTitle: string,
): Promise<void> {
  const cleanTitleName = achievementTitle.replace(CONSTANTS.LOGRO_PREFIX, '');
  const nowIso = new Date().toISOString();

  await supabase.from(CONSTANTS.TABLE_USER_ACHIEVEMENTS).upsert({
    [CONSTANTS.COL_USER_ID]: userId,
    achievement_id: achievementId,
    title: achievementTitle,
    unlocked_at: nowIso,
  });

  await supabase.from(CONSTANTS.TABLE_USER_TITLES).upsert({
    [CONSTANTS.COL_USER_ID]: userId,
    title_id: achievementId,
    title_name: cleanTitleName,
    unlocked_at: nowIso,
  });
}

function buildRewardMessage(
  currentStreak: number,
  prestigeUp: boolean,
  achievementTitle: string,
  prestigeLevel: number,
  usedShield: boolean,
  streakShields: number,
): string {
  let msg = `¡Recompensa del Día ${currentStreak} reclamada!`;
  if (prestigeUp) {
    msg += ` 👑 ¡Avanzaste a ${achievementTitle} (+${prestigeLevel * 15}% KC)!`;
  }
  if (usedShield) {
    msg += ` 🛡️ (¡Escudo de Racha activado! Tu racha fue salvada, escudos restantes: ${streakShields})`;
  }
  return msg;
}

async function fetchDayConfig(day: number): Promise<RoadmapDayConfig> {
  const { data: config } = await supabase
    .from(CONSTANTS.TABLE_ROADMAP_CONFIG)
    .select('*')
    .eq(CONSTANTS.COL_DAY, day)
    .single();

  return (
    (config as RoadmapDayConfig | null) ||
    DEFAULT_ROADMAP.find((d) => d.day === day) ||
    DEFAULT_ROADMAP[0]
  );
}

async function checkLegendaryAchievement(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from(CONSTANTS.TABLE_USER_ACHIEVEMENTS)
    .select('*')
    .eq(CONSTANTS.COL_USER_ID, userId)
    .eq(CONSTANTS.ACHIEVEMENT_ID_COL, CONSTANTS.LEGENDARY_ACHIEVEMENT_ID)
    .single();

  return Boolean(data);
}

async function saveStreakUpdate(
  userId: string,
  streak: number,
  prestige: number,
  shields: number,
  totalClaims: number,
): Promise<void> {
  await supabase.from(CONSTANTS.TABLE_USER_STREAKS).upsert({
    [CONSTANTS.COL_USER_ID]: userId,
    current_streak: streak,
    prestige_level: prestige,
    streak_shields: shields,
    last_claim_at: new Date().toISOString(),
    total_claims: totalClaims + 1,
  });
}

export const getRoadmapConfig = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(CONSTANTS.TABLE_ROADMAP_CONFIG)
      .select('*')
      .order(CONSTANTS.COL_DAY, { ascending: true });

    if (error || !data || data.length === 0) {
      return sendSuccess(res, DEFAULT_ROADMAP);
    }

    return sendSuccess(res, data);
  } catch (error) {
    console.error('[Roadmap] Error fetching config:', error);
    return sendSuccess(res, DEFAULT_ROADMAP);
  }
};

export const getUserStreakStatus = async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return sendError(res, CONSTANTS.MSG_USER_ID_REQUIRED, CONSTANTS.ERROR_UNAUTHORIZED, 401);
    }

    const { data: rawStreak } = await supabase
      .from(CONSTANTS.TABLE_USER_STREAKS)
      .select('*')
      .eq(CONSTANTS.COL_USER_ID, userId)
      .single();

    const streak = rawStreak as UserStreakRow | null;
    const currentStreak = streak?.current_streak ?? 0;
    const canClaim = canClaimStreak(streak?.last_claim_at);
    const hasLegendaryAchievement = await checkLegendaryAchievement(userId);

    return sendSuccess(res, {
      currentStreak: currentStreak === 0 ? 1 : currentStreak,
      canClaim,
      lastClaimAt: streak?.last_claim_at ?? null,
      totalClaims: streak?.total_claims ?? 0,
      prestigeLevel: streak?.prestige_level ?? 0,
      streakShields: streak?.streak_shields ?? CONSTANTS.DEFAULT_SHIELDS,
      hasLegendaryAchievement,
    });
  } catch (error) {
    console.error('[Roadmap] Error fetching streak:', error);
    return sendSuccess(res, {
      currentStreak: 1,
      canClaim: true,
      lastClaimAt: null,
      totalClaims: 0,
      prestigeLevel: 0,
      streakShields: CONSTANTS.DEFAULT_SHIELDS,
      hasLegendaryAchievement: false,
    });
  }
};

export const claimDailyReward = async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return sendError(res, CONSTANTS.MSG_USER_ID_REQUIRED, CONSTANTS.ERROR_UNAUTHORIZED, 401);
    }

    const { data: rawStreak } = await supabase
      .from(CONSTANTS.TABLE_USER_STREAKS)
      .select('*')
      .eq(CONSTANTS.COL_USER_ID, userId)
      .single();

    const streak = rawStreak as UserStreakRow | null;
    const lastClaimAt = streak?.last_claim_at ? new Date(streak.last_claim_at) : null;
    const streakResult = calculateNextStreak(
      lastClaimAt,
      streak?.current_streak ?? 1,
      streak?.streak_shields ?? CONSTANTS.DEFAULT_SHIELDS,
    );

    if (!streakResult.valid) {
      return sendError(
        res,
        streakResult.errorMsg ?? 'No se pudo reclamar la racha',
        streakResult.errorCode ?? 'STREAK_CLAIM_FAILED',
        400,
      );
    }

    const dayConfig = await fetchDayConfig(streakResult.newStreak);
    const milestone = resolvePrestigeMilestone(
      streakResult.newStreak,
      dayConfig.is_jackpot,
      streak?.prestige_level ?? 0,
    );

    const rewardAmount = calculateRewardAmount(dayConfig, milestone.nextPrestigeLevel);
    await gachaBalanceService.refundGachaBalance(userId, rewardAmount);

    await saveStreakUpdate(
      userId,
      streakResult.newStreak,
      milestone.nextPrestigeLevel,
      streakResult.remainingShields,
      streak?.total_claims ?? 0,
    );

    if (milestone.unlockedAchievement) {
      await unlockAchievements(userId, milestone.achievementId, milestone.achievementTitle);
    }

    const newBalance = await gachaBalanceService.getGachaBalance(userId);
    const message = buildRewardMessage(
      streakResult.newStreak,
      milestone.prestigeUp,
      milestone.achievementTitle,
      milestone.nextPrestigeLevel,
      streakResult.usedShield,
      streakResult.remainingShields,
    );

    return sendSuccess(res, {
      claimedDay: streakResult.newStreak,
      rewardAmount,
      prestigeLevel: milestone.nextPrestigeLevel,
      achievementTitle: milestone.achievementTitle,
      streakShields: streakResult.remainingShields,
      usedShield: streakResult.usedShield,
      rewardType: dayConfig.reward_type,
      newBalance,
      unlockedAchievement: milestone.unlockedAchievement,
      message,
    });
  } catch (error) {
    console.error('[Roadmap] Error claiming daily reward:', error);
    return sendError(res, 'Failed to claim daily reward', 'CLAIM_FAILED', 500);
  }
};

export const updateRoadmapAdminConfig = async (req: Request, res: Response) => {
  try {
    const days = req.body.days as RoadmapDayConfig[];
    if (!Array.isArray(days)) {
      return sendError(res, 'Days array required', 'INVALID_BODY', 400);
    }

    const { error } = await supabase.from(CONSTANTS.TABLE_ROADMAP_CONFIG).upsert(days);

    if (error) {
      console.error('[Roadmap Admin] Supabase error:', error);
    }

    return sendSuccess(res, { message: 'Configuración de Roadmap actualizada correctamente' });
  } catch (error) {
    console.error('[Roadmap Admin] Error updating config:', error);
    return sendError(res, 'Failed to update roadmap config', 'UPDATE_FAILED', 500);
  }
};
