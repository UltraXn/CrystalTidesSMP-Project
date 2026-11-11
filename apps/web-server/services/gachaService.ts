import crypto from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import pool from '../config/database.js';
import supabase from '../config/supabaseClient.js';
import * as commandService from './commandService.js';
import {
  GACHA_TIERS_MAP,
  TIER_COOLDOWNS,
  TIER_PREFIXES,
  EVENT_ONLY_TIERS,
  selectWeightedReward,
  parseItemGiveValue,
  validateGachaTierWeights,
  type GachaRewardConfig,
} from '@crystaltides/shared';
import {
  getGachaBalance,
  deductGachaBalance,
  refundGachaBalance,
  getUnlockedTiers,
  getLinkedMinecraftNick,
} from './gachaBalanceService.js';

validateGachaTierWeights();

const CONSTANTS = {
  DEFAULT_COOLDOWN_HOURS: 24,
  DEFAULT_PREFIX: 'b_',
  TRY_AGAIN_NAME: 'TRY AGAIN',
  TABLE_GACHA_HISTORY: 'gacha_history',
  COL_USER_ID: 'user_id',
  COL_REWARD_ID: 'reward_id',
  COL_CREATED_AT: 'created_at',
} as const;

const GACHA_ERRORS = {
  INVALID_TIER: 'INVALID_TIER',
  TIER_LOCKED: 'TIER_LOCKED',
  ACCOUNT_NOT_LINKED: 'ACCOUNT_NOT_LINKED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ROLL_IN_PROGRESS: 'ROLL_IN_PROGRESS',
  ROLL_LOCK_FAILED: 'ROLL_LOCK_FAILED',
} as const;

// Each roll in flight keeps one pooled connection for its lock while its own
// queries need another: capped under half the pool (connectionLimit 10 in
// config/database.ts) so they never starve.
export const MAX_ROLLS_IN_FLIGHT = 4;
let rollsInFlight = 0;

/**
 * Runs `fn` while holding a MySQL named lock for `userId`, so one user's rolls
 * never overlap: the free-roll check and the history row that consumes it are
 * otherwise separate steps, and parallel requests would all roll for free.
 * The lock lives in MySQL, so it also holds across server instances.
 */
async function withRollLock<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  if (rollsInFlight >= MAX_ROLLS_IN_FLIGHT) throw new Error(GACHA_ERRORS.ROLL_IN_PROGRESS);

  rollsInFlight += 1;
  try {
    const conn = await pool.getConnection();
    let lockStillHeld = false;
    try {
      const lockName = `gacha_roll:${userId}`;
      // Timeout 0: a request that waited would sit on a pooled connection.
      const [rows] = await conn.query<RowDataPacket[]>('SELECT GET_LOCK(?, 0) AS acquired', [
        lockName,
      ]);
      // 1 = acquired, 0 = held by another roll, NULL = MySQL could not take the lock.
      const result: unknown = rows[0]?.acquired;
      const acquired = result == null ? null : Number(result);
      if (acquired === 0) throw new Error(GACHA_ERRORS.ROLL_IN_PROGRESS);
      if (acquired !== 1) throw new Error(GACHA_ERRORS.ROLL_LOCK_FAILED);

      try {
        return await fn();
      } finally {
        await conn.query('SELECT RELEASE_LOCK(?)', [lockName]).catch((releaseError: unknown) => {
          console.error('[Gacha] Failed to release roll lock:', releaseError);
          lockStillHeld = true;
        });
      }
    } finally {
      // The lock belongs to the MySQL session: a connection that still holds it
      // must die instead of going back to the pool, or the user stays locked out.
      if (lockStillHeld) conn.destroy();
      else conn.release();
    }
  } finally {
    rollsInFlight -= 1;
  }
}

interface GachaHistoryInsertRow {
  user_id: string;
  reward_id: string;
  reward_name: string;
  rarity: string;
  created_at: string;
}

interface TierValidationResult {
  tierKey: string;
  tier: (typeof GACHA_TIERS_MAP)[string];
  minecraftNick: string;
}

interface RollExecutionPlan {
  allResults: GachaRewardConfig[];
  historyRows: GachaHistoryInsertRow[];
  commands: string[];
}

export type GachaTestResult = 'win' | 'loss' | 'random';

const sanitizeNick = (nick: string): string => nick.replace(/\W/g, '');

const checkCooldown = async (userId: string, tierId: string, hours: number): Promise<boolean> => {
  if (hours <= 0) return true;

  const cooldownPeriod = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const prefix = TIER_PREFIXES[tierId.toLowerCase()] ?? CONSTANTS.DEFAULT_PREFIX;

  const { data } = await supabase
    .from(CONSTANTS.TABLE_GACHA_HISTORY)
    .select(CONSTANTS.COL_CREATED_AT)
    .eq(CONSTANTS.COL_USER_ID, userId)
    .ilike(CONSTANTS.COL_REWARD_ID, `${prefix}%`)
    .gte(CONSTANTS.COL_CREATED_AT, cooldownPeriod)
    .limit(1);

  return !data || data.length === 0;
};

const resolveHasFreeRoll = async (userId: string, tierKey: string): Promise<boolean> => {
  const prefix = TIER_PREFIXES[tierKey] ?? CONSTANTS.DEFAULT_PREFIX;
  const { data: hasEverRolled } = await supabase
    .from(CONSTANTS.TABLE_GACHA_HISTORY)
    .select('id')
    .eq(CONSTANTS.COL_USER_ID, userId)
    .ilike(CONSTANTS.COL_REWARD_ID, `${prefix}%`)
    .limit(1);

  const isFirstTime = !hasEverRolled || hasEverRolled.length === 0;
  if (isFirstTime) return true;

  const cooldownHours = TIER_COOLDOWNS[tierKey] ?? CONSTANTS.DEFAULT_COOLDOWN_HOURS;
  return checkCooldown(userId, tierKey, cooldownHours);
};

const validateTierAndAccess = async (
  userId: string,
  tierId: string,
  isAdmin: boolean,
): Promise<TierValidationResult> => {
  const tierKey = tierId.toLowerCase();
  const tier = GACHA_TIERS_MAP[tierKey];
  if (!tier) throw new Error(GACHA_ERRORS.INVALID_TIER);

  if (EVENT_ONLY_TIERS.has(tierKey) && !isAdmin) {
    const unlockedTiers = await getUnlockedTiers(userId);
    if (!unlockedTiers.includes(tierKey)) {
      throw new Error(GACHA_ERRORS.TIER_LOCKED);
    }
  }

  const minecraftNick = await getLinkedMinecraftNick(userId);
  if (!minecraftNick) throw new Error(GACHA_ERRORS.ACCOUNT_NOT_LINKED);

  return { tierKey, tier, minecraftNick };
};

const resolveLossReward = (
  tier: (typeof GACHA_TIERS_MAP)[string],
  tierKey: string,
): GachaRewardConfig => {
  const fallbackPrefix = TIER_PREFIXES[tierKey] ?? CONSTANTS.DEFAULT_PREFIX;
  return (
    tier.rewards.find((r) => r.id.endsWith('_loss')) ?? {
      id: `${fallbackPrefix}loss`,
      name: CONSTANTS.TRY_AGAIN_NAME,
      rarity: 'common',
      type: 'xp',
      value: 0,
      chance: 0,
      color: '#666666',
    }
  );
};

const resolveWinReward = (tier: (typeof GACHA_TIERS_MAP)[string]): GachaRewardConfig => {
  const highRarity = tier.rewards.filter(
    (r) => r.rarity === 'legendary' || r.rarity === 'epic' || r.rarity === 'mythic',
  );
  const pool = highRarity.length > 0 ? highRarity : tier.rewards;
  return pool[crypto.randomInt(0, pool.length)];
};

const resolveAdminTestReward = (
  tier: (typeof GACHA_TIERS_MAP)[string],
  tierKey: string,
  testResult?: GachaTestResult,
): GachaRewardConfig | null => {
  if (!testResult || testResult === 'random') return null;
  return testResult === 'loss' ? resolveLossReward(tier, tierKey) : resolveWinReward(tier);
};

const generateSingleReward = (
  tier: (typeof GACHA_TIERS_MAP)[string],
  tierKey: string,
  isAdmin: boolean,
  testResult?: GachaTestResult,
): GachaRewardConfig => {
  if (isAdmin && testResult) {
    const adminReward = resolveAdminTestReward(tier, tierKey, testResult);
    if (adminReward) return adminReward;
  }
  return selectWeightedReward(tier.rewards);
};

const executeRolls = (
  tier: (typeof GACHA_TIERS_MAP)[string],
  tierKey: string,
  quantity: number,
  userId: string,
  minecraftNick: string,
  isAdmin: boolean,
  testResult?: 'win' | 'loss' | 'random',
): RollExecutionPlan => {
  const allResults: GachaRewardConfig[] = [];
  const historyRows: GachaHistoryInsertRow[] = [];
  const commands: string[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < quantity; i++) {
    const selectedReward = generateSingleReward(tier, tierKey, isAdmin, testResult);
    allResults.push(selectedReward);

    if (selectedReward.name !== CONSTANTS.TRY_AGAIN_NAME) {
      historyRows.push({
        user_id: userId,
        reward_id: selectedReward.id,
        reward_name: selectedReward.name,
        rarity: selectedReward.rarity,
        created_at: now,
      });
    }

    const cmd = getCommandForReward(selectedReward, minecraftNick);
    if (cmd) commands.push(cmd);
  }

  return { allResults, historyRows, commands };
};

const persistAndDispatchRolls = async (
  historyRows: GachaHistoryInsertRow[],
  commands: string[],
): Promise<void> => {
  if (historyRows.length > 0) {
    const { error: historyError } = await supabase
      .from(CONSTANTS.TABLE_GACHA_HISTORY)
      .insert(historyRows);
    if (historyError) throw historyError;
  }

  await commandService.queueCommands(commands);
};

const refundSafely = async (userId: string, amount: number): Promise<void> => {
  try {
    await refundGachaBalance(userId, amount);
  } catch (refundError) {
    console.error('[Gacha] Refund failed after roll error:', refundError);
  }
};

export const getGachaStatus = async (userId: string) => {
  const [balance, unlockedTiers] = await Promise.all([
    getGachaBalance(userId),
    getUnlockedTiers(userId),
  ]);

  const tierStatus: Record<string, { hasFreeRoll: boolean; cooldownHours: number }> = {};

  await Promise.all(
    Object.keys(GACHA_TIERS_MAP).map(async (tierId) => {
      tierStatus[tierId] = {
        hasFreeRoll: await resolveHasFreeRoll(userId, tierId),
        cooldownHours: TIER_COOLDOWNS[tierId] ?? CONSTANTS.DEFAULT_COOLDOWN_HOURS,
      };
    }),
  );

  return { balance, unlockedTiers, tiers: tierStatus };
};

const rollGachaLocked = async (
  userId: string,
  tierId: string,
  quantity: number,
  isAdmin: boolean,
  testResult: 'win' | 'loss' | 'random' | undefined,
  forceDeduction: boolean,
) => {
  const { tierKey, tier, minecraftNick } = await validateTierAndAccess(userId, tierId, isAdmin);

  const hasFreeRoll = await resolveHasFreeRoll(userId, tierKey);
  const effectiveRollsToCharge = hasFreeRoll ? Math.max(0, quantity - 1) : quantity;
  const totalCost = tier.cost * effectiveRollsToCharge;

  const skipAllConsumption = isAdmin && !forceDeduction;
  const currentBalance = await getGachaBalance(userId);

  if (!skipAllConsumption && totalCost > 0 && currentBalance < totalCost) {
    throw new Error(GACHA_ERRORS.INSUFFICIENT_BALANCE);
  }

  let newBalance = currentBalance;

  try {
    if (!skipAllConsumption && totalCost > 0) {
      newBalance = await deductGachaBalance(userId, totalCost);
    }

    const { allResults, historyRows, commands } = executeRolls(
      tier,
      tierKey,
      quantity,
      userId,
      minecraftNick,
      isAdmin,
      testResult,
    );

    await persistAndDispatchRolls(historyRows, commands);

    return {
      ...allResults[0],
      results: allResults,
      newBalance: skipAllConsumption ? currentBalance : newBalance,
    };
  } catch (error) {
    if (newBalance !== currentBalance && !skipAllConsumption && totalCost > 0) {
      await refundSafely(userId, totalCost);
    }
    throw error;
  }
};

export const rollGacha = (
  userId: string,
  tierId: string = 'bronze',
  quantity: number = 1,
  isAdmin: boolean = false,
  testResult?: 'win' | 'loss' | 'random',
  forceDeduction: boolean = false,
) =>
  withRollLock(userId, () =>
    rollGachaLocked(userId, tierId, quantity, isAdmin, testResult, forceDeduction),
  );

export const getCommandForReward = (
  reward: GachaRewardConfig,
  targetNick: string,
): string | null => {
  const safeNick = sanitizeNick(targetNick);
  if (!safeNick) return null;

  if (reward.id.endsWith('_loss') || reward.value === 0 || reward.value === '0') {
    return null;
  }

  switch (reward.type) {
    case 'currency':
      return `eco give ${safeNick} ${reward.value}`;
    case 'item': {
      const { itemSpec, count } = parseItemGiveValue(String(reward.value));
      return `give ${safeNick} ${itemSpec} ${count}`;
    }
    case 'xp':
      return `xp give ${safeNick} ${reward.value}`;
    default:
      return null;
  }
};

export const getHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from(CONSTANTS.TABLE_GACHA_HISTORY)
    .select('*')
    .eq(CONSTANTS.COL_USER_ID, userId)
    .order(CONSTANTS.COL_CREATED_AT, { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
};
