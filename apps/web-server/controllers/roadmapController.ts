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

const ERROR_UNAUTHORIZED = 'UNAUTHORIZED';
const MSG_USER_ID_REQUIRED = 'User ID required';
const TABLE_ROADMAP_CONFIG = 'monthly_roadmap_config';
const TABLE_USER_STREAKS = 'user_daily_streaks';
const TABLE_USER_ACHIEVEMENTS = 'user_achievements';
const TABLE_USER_TITLES = 'user_titles';
const COL_USER_ID = 'user_id';
const COL_DAY = 'day';
const LOGRO_PREFIX = 'Logro: ';

const MAX_PRESTIGE = 6;

const DEFAULT_ROADMAP: RoadmapDayConfig[] = [
    { day: 1, title: 'Día 1: Bienvenida', reward_type: 'killucoins', reward_value: 25, multiplier: 1 },
    { day: 2, title: 'Día 2: Primer Paso', reward_type: 'killucoins', reward_value: 50, multiplier: 1 },
    { day: 3, title: 'Día 3: Giro Gacha Bronce', reward_type: 'gacha_spin', reward_value: 1, multiplier: 1 },
    { day: 4, title: 'Día 4: Continuidad', reward_type: 'killucoins', reward_value: 100, multiplier: 1 },
    { day: 5, title: 'Día 5: En Racha', reward_type: 'killucoins', reward_value: 125, multiplier: 1 },
    { day: 6, title: 'Día 6: Giro Gacha Bronce', reward_type: 'gacha_spin', reward_value: 1, multiplier: 1 },
    { day: 7, title: 'Día 7: Botín de Cobre', reward_type: 'killucoins', reward_value: 175, multiplier: 1 },

    { day: 8, title: 'Día 8: Impulso x2', reward_type: 'killucoins', reward_value: 200, multiplier: 2 },
    { day: 9, title: 'Día 9: Carga Doble', reward_type: 'killucoins', reward_value: 225, multiplier: 2 },
    { day: 10, title: 'Día 10: Giro Gacha Plata', reward_type: 'gacha_spin', reward_value: 1, multiplier: 2 },
    { day: 11, title: 'Día 11: Plata Viva', reward_type: 'killucoins', reward_value: 275, multiplier: 2 },
    { day: 12, title: 'Día 12: Constancia', reward_type: 'killucoins', reward_value: 300, multiplier: 2 },
    { day: 13, title: 'Día 13: Giro Gacha Plata', reward_type: 'gacha_spin', reward_value: 1, multiplier: 2 },
    { day: 14, title: 'Día 14: Botín de Hierro', reward_type: 'killucoins', reward_value: 350, multiplier: 2 },

    { day: 15, title: 'Día 15: Super Impulso x5', reward_type: 'killucoins', reward_value: 400, multiplier: 5 },
    { day: 16, title: 'Día 16: Fuerza Dorada', reward_type: 'killucoins', reward_value: 425, multiplier: 5 },
    { day: 17, title: 'Día 17: Giro Gacha Oro', reward_type: 'gacha_spin', reward_value: 1, multiplier: 5 },
    { day: 18, title: 'Día 18: Fuego Dorado', reward_type: 'killucoins', reward_value: 475, multiplier: 5 },
    { day: 19, title: 'Día 19: Avance Épico', reward_type: 'killucoins', reward_value: 500, multiplier: 5 },
    { day: 20, title: 'Día 20: Giro Gacha Oro', reward_type: 'gacha_spin', reward_value: 1, multiplier: 5 },
    { day: 21, title: 'Día 21: Bloque de Oro', reward_type: 'killucoins', reward_value: 550, multiplier: 5 },

    { day: 22, title: 'Día 22: Ultra Multiplicador x10', reward_type: 'killucoins', reward_value: 600, multiplier: 10 },
    { day: 23, title: 'Día 23: Poder Esmeralda', reward_type: 'killucoins', reward_value: 625, multiplier: 10 },
    { day: 24, title: 'Día 24: Giro Gacha Mítico', reward_type: 'gacha_spin', reward_value: 1, multiplier: 10 },
    { day: 25, title: 'Día 25: Resplandor Esmeralda', reward_type: 'killucoins', reward_value: 675, multiplier: 10 },
    { day: 26, title: 'Día 26: Maestría', reward_type: 'killucoins', reward_value: 700, multiplier: 10 },
    { day: 27, title: 'Día 27: Giro Gacha Mítico', reward_type: 'gacha_spin', reward_value: 1, multiplier: 10 },
    { day: 28, title: 'Día 28: Bloque Esmeralda', reward_type: 'killucoins', reward_value: 750, multiplier: 10 },
    { day: 29, title: 'Día 29: Estrella del Nether', reward_type: 'gacha_spin', reward_value: 2, multiplier: 10 },
    { day: 30, title: 'Día 30: 👑 JACKPOT IRIDIUM X50', reward_type: 'achievement', reward_value: 2500, multiplier: 50, is_jackpot: true }
];

const PRESTIGE_ACHIEVEMENTS: Record<number, { id: string; title: string }> = {
    1: { id: 'prestige_bronce', title: `${LOGRO_PREFIX}Prestigio Bronce` },
    2: { id: 'prestige_plata', title: `${LOGRO_PREFIX}Prestigio Plata` },
    3: { id: 'prestige_oro', title: `${LOGRO_PREFIX}Prestigio Oro` },
    4: { id: 'prestige_diamante', title: `${LOGRO_PREFIX}Prestigio Diamante` },
    5: { id: 'prestige_esmeralda', title: `${LOGRO_PREFIX}Prestigio Esmeralda` },
    6: { id: 'prestige_iridium', title: `${LOGRO_PREFIX}Prestigio Iridium Mítico` },
};

export const getRoadmapConfig = async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_ROADMAP_CONFIG)
            .select('*')
            .order(COL_DAY, { ascending: true });

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
        const userId = req.user?.id || (req.query.userId as string);
        if (!userId) {
            return sendError(res, MSG_USER_ID_REQUIRED, ERROR_UNAUTHORIZED, 401);
        }

        const { data: streak } = await supabase
            .from(TABLE_USER_STREAKS)
            .select('*')
            .eq(COL_USER_ID, userId)
            .single();

        const currentStreak = streak?.current_streak ?? 0;
        const lastClaim = streak?.last_claim_at ? new Date(streak.last_claim_at) : null;
        
        let canClaim = true;
        if (lastClaim) {
            const hoursSinceLastClaim = (Date.now() - lastClaim.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastClaim < 20) {
                canClaim = false;
            }
        }

        const { data: achievement } = await supabase
            .from(TABLE_USER_ACHIEVEMENTS)
            .select('*')
            .eq(COL_USER_ID, userId)
            .eq('achievement_id', 'legend_of_crystaltides')
            .single();

        return sendSuccess(res, {
            currentStreak: currentStreak === 0 ? 1 : currentStreak,
            canClaim,
            lastClaimAt: streak?.last_claim_at ?? null,
            totalClaims: streak?.total_claims ?? 0,
            prestigeLevel: streak?.prestige_level ?? 0,
            streakShields: streak?.streak_shields ?? 3,
            hasLegendaryAchievement: !!achievement
        });
    } catch (error) {
        console.error('[Roadmap] Error fetching streak:', error);
        return sendSuccess(res, {
            currentStreak: 1,
            canClaim: true,
            lastClaimAt: null,
            totalClaims: 0,
            prestigeLevel: 0,
            streakShields: 3,
            hasLegendaryAchievement: false
        });
    }
};

interface StreakCalculationResult {
    valid: boolean;
    errorMsg?: string;
    errorCode?: string;
    newStreak: number;
    remainingShields: number;
    usedShield: boolean;
}

function calculateNextStreak(lastClaimAt: Date | null, currentStreak: number, streakShields: number): StreakCalculationResult {
    if (!lastClaimAt) {
        return { valid: true, newStreak: currentStreak, remainingShields: streakShields, usedShield: false };
    }

    const hoursDiff = (Date.now() - lastClaimAt.getTime()) / (1000 * 60 * 60);
    if (hoursDiff < 20) {
        return { valid: false, errorMsg: 'Debes esperar 20 horas entre reclamos', errorCode: 'COOLDOWN_ACTIVE', newStreak: currentStreak, remainingShields: streakShields, usedShield: false };
    }
    
    if (hoursDiff > 48) {
        if (streakShields > 0) {
            return { valid: true, newStreak: (currentStreak % 30) + 1, remainingShields: streakShields - 1, usedShield: true };
        }
        return { valid: true, newStreak: 1, remainingShields: 0, usedShield: false };
    }
    
    return { valid: true, newStreak: (currentStreak % 30) + 1, remainingShields: streakShields, usedShield: false };
}

async function unlockAchievements(userId: string, achievementId: string, achievementTitle: string) {
    const cleanTitleName = achievementTitle.replace(LOGRO_PREFIX, '');

    await supabase
        .from(TABLE_USER_ACHIEVEMENTS)
        .upsert({
            [COL_USER_ID]: userId,
            achievement_id: achievementId,
            title: achievementTitle,
            unlocked_at: new Date().toISOString()
        });

    await supabase
        .from(TABLE_USER_TITLES)
        .upsert({
            [COL_USER_ID]: userId,
            title_id: achievementId,
            title_name: cleanTitleName,
            unlocked_at: new Date().toISOString()
        });
}

function buildRewardMessage(currentStreak: number, prestigeUp: boolean, achievementTitle: string, prestigeLevel: number, usedShield: boolean, streakShields: number): string {
    let msg = `¡Recompensa del Día ${currentStreak} reclamada!`;
    if (prestigeUp) {
        msg += ` 👑 ¡Avanzaste a ${achievementTitle} (+${prestigeLevel * 15}% KC)!`;
    }
    if (usedShield) {
        msg += ` 🛡️ (¡Escudo de Racha activado! Tu racha fue salvada, escudos restantes: ${streakShields})`;
    }
    return msg;
}

export const claimDailyReward = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || (req.body.userId as string);
        if (!userId) {
            return sendError(res, MSG_USER_ID_REQUIRED, ERROR_UNAUTHORIZED, 401);
        }

        const { data: streak } = await supabase
            .from(TABLE_USER_STREAKS)
            .select('*')
            .eq(COL_USER_ID, userId)
            .single();

        const lastClaimAt = streak?.last_claim_at ? new Date(streak.last_claim_at) : null;
        let currentStreak = streak?.current_streak ?? 1;
        let streakShields = streak?.streak_shields ?? 3;
        let prestigeLevel = streak?.prestige_level ?? 0;

        const streakResult = calculateNextStreak(lastClaimAt, currentStreak, streakShields);
        if (!streakResult.valid) {
            return sendError(res, streakResult.errorMsg!, streakResult.errorCode!, 400);
        }

        currentStreak = streakResult.newStreak;
        streakShields = streakResult.remainingShields;
        const usedShield = streakResult.usedShield;

        const { data: config } = await supabase
            .from(TABLE_ROADMAP_CONFIG)
            .select('*')
            .eq(COL_DAY, currentStreak)
            .single();

        const dayConfig: RoadmapDayConfig = config || DEFAULT_ROADMAP.find(d => d.day === currentStreak) || DEFAULT_ROADMAP[0];
        
        const prestigeMultiplier = 1 + (prestigeLevel * 0.15);
        const baseRewardAmount = (dayConfig.reward_value || 50) * (dayConfig.multiplier || 1);
        const rewardAmount = Math.floor(baseRewardAmount * prestigeMultiplier);

        await gachaBalanceService.refundGachaBalance(userId, rewardAmount);

        let prestigeUp = false;
        let achievementId = '';
        let achievementTitle = '';
        let unlockedAchievement = false;

        if (currentStreak === 30 || dayConfig.is_jackpot) {
            if (prestigeLevel < MAX_PRESTIGE) {
                prestigeLevel += 1;
                prestigeUp = true;
            }
            const ach = PRESTIGE_ACHIEVEMENTS[prestigeLevel] || { id: `prestige_${prestigeLevel}`, title: `${LOGRO_PREFIX}Prestigio Nivel ${prestigeLevel}` };
            achievementId = ach.id;
            achievementTitle = ach.title;
        }

        await supabase
            .from(TABLE_USER_STREAKS)
            .upsert({
                [COL_USER_ID]: userId,
                current_streak: currentStreak,
                prestige_level: prestigeLevel,
                streak_shields: streakShields,
                last_claim_at: new Date().toISOString(),
                total_claims: (streak?.total_claims ?? 0) + 1
            });

        if (currentStreak === 30 || dayConfig.is_jackpot) {
            await unlockAchievements(userId, achievementId, achievementTitle);
            unlockedAchievement = true;
        }

        const newBalance = await gachaBalanceService.getGachaBalance(userId);
        const msg = buildRewardMessage(currentStreak, prestigeUp, achievementTitle, prestigeLevel, usedShield, streakShields);

        return sendSuccess(res, {
            claimedDay: currentStreak,
            rewardAmount,
            prestigeLevel,
            achievementTitle,
            streakShields,
            usedShield,
            rewardType: dayConfig.reward_type,
            newBalance,
            unlockedAchievement,
            message: msg
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

        const { error } = await supabase
            .from(TABLE_ROADMAP_CONFIG)
            .upsert(days);

        if (error) {
            console.error('[Roadmap Admin] Supabase error:', error);
        }

        return sendSuccess(res, { message: 'Configuración de Roadmap actualizada correctamente' });
    } catch (error) {
        console.error('[Roadmap Admin] Error updating config:', error);
        return sendError(res, 'Failed to update roadmap config', 'UPDATE_FAILED', 500);
    }
};
