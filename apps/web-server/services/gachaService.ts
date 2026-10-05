import crypto from 'node:crypto';
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
} as const;

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

export const rollGacha = async (
  userId: string,
  tierId: string = 'bronze',
  quantity: number = 1,
  isAdmin: boolean = false,
  testResult?: 'win' | 'loss' | 'random',
  forceDeduction: boolean = false,
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
  let deducted = false;

  try {
    if (!skipAllConsumption && totalCost > 0) {
      newBalance = await deductGachaBalance(userId, totalCost);
      deducted = true;
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
    if (deducted && !skipAllConsumption && totalCost > 0) {
      await refundSafely(userId, totalCost);
    }
    throw error;
  }
};

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
