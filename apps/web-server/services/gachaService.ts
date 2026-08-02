import supabase from '../config/supabaseClient.js';
import * as commandService from './commandService.js';
// Triggering reload
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

const resolveHasFreeRoll = async (userId: string, tierKey: string): Promise<boolean> => {
    const { data: hasEverRolled } = await supabase
        .from('gacha_history')
        .select('id')
        .eq('user_id', userId)
        .ilike('reward_id', `${TIER_PREFIXES[tierKey]}%`)
        .limit(1);

    const isFirstTime = !hasEverRolled || hasEverRolled.length === 0;
    if (isFirstTime) return true;

    const cooldownHours = TIER_COOLDOWNS[tierKey] ?? 24;
    return checkCooldown(userId, tierKey, cooldownHours);
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
                cooldownHours: TIER_COOLDOWNS[tierId] ?? 24,
            };
        })
    );

    return { balance, unlockedTiers, tiers: tierStatus };
};

export const rollGacha = async (
    userId: string,
    tierId: string = 'bronze',
    quantity: number = 1,
    isAdmin: boolean = false,
    testResult?: 'win' | 'loss' | 'random',
    forceDeduction: boolean = false
) => {
    const tierKey = tierId.toLowerCase();
    const tier = GACHA_TIERS_MAP[tierKey];
    if (!tier) throw new Error('INVALID_TIER');

    if (EVENT_ONLY_TIERS.has(tierKey) && !isAdmin) {
        const unlockedTiers = await getUnlockedTiers(userId);
        if (!unlockedTiers.includes(tierKey)) {
            throw new Error('TIER_LOCKED');
        }
    }

    const minecraftNick = await getLinkedMinecraftNick(userId);
    if (!minecraftNick) throw new Error('ACCOUNT_NOT_LINKED');

    const hasFreeRoll = await resolveHasFreeRoll(userId, tierKey);
    const totalCost = hasFreeRoll
        ? tier.cost * Math.max(0, quantity - 1)
        : tier.cost * quantity;

    const skipAllConsumption = isAdmin && !forceDeduction;
    const currentBalance = await getGachaBalance(userId);

    if (!skipAllConsumption && totalCost > 0 && currentBalance < totalCost) {
        throw new Error('INSUFFICIENT_BALANCE');
    }

    let newBalance = currentBalance;
    let deducted = false;

    try {
        if (!skipAllConsumption && totalCost > 0) {
            newBalance = await deductGachaBalance(userId, totalCost);
            deducted = true;
        }

        const allResults: GachaRewardConfig[] = [];
        const historyRows: Array<{
            user_id: string;
            reward_id: string;
            reward_name: string;
            rarity: string;
            created_at: string;
        }> = [];
        const commands: string[] = [];
        const now = new Date().toISOString();

        for (let i = 0; i < quantity; i++) {
            let selectedReward: GachaRewardConfig | null = null;

            if (isAdmin && testResult && testResult !== 'random') {
                if (testResult === 'loss') {
                    selectedReward = tier.rewards.find((r) => r.id.endsWith('_loss')) ?? {
                        id: `${TIER_PREFIXES[tierKey] ?? 'b_'}loss`,
                        name: 'TRY AGAIN',
                        rarity: 'common',
                        type: 'xp',
                        value: 0,
                        chance: 0,
                        color: '#666666',
                    };
                } else if (testResult === 'win') {
                    const highRarity = tier.rewards.filter(
                        (r) => r.rarity === 'legendary' || r.rarity === 'epic' || r.rarity === 'mythic'
                    );
                    const pool = highRarity.length > 0 ? highRarity : tier.rewards;
                    selectedReward = pool[Math.floor(Math.random() * pool.length)];
                }
            }

            if (!selectedReward) {
                selectedReward = selectWeightedReward(tier.rewards);
            }

            allResults.push(selectedReward);

            if (selectedReward.name !== 'TRY AGAIN') {
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

        if (historyRows.length > 0) {
            const { error: historyError } = await supabase.from('gacha_history').insert(historyRows);
            if (historyError) throw historyError;
        }

        await commandService.queueCommands(commands);

        return {
            ...allResults[0],
            results: allResults,
            newBalance: skipAllConsumption ? currentBalance : newBalance,
        };
    } catch (error) {
        if (deducted && !skipAllConsumption && totalCost > 0) {
            try {
                await refundGachaBalance(userId, totalCost);
            } catch (refundError) {
                console.error('[Gacha] Refund failed after roll error:', refundError);
            }
        }
        throw error;
    }
};

const sanitizeNick = (nick: string): string => nick.replace(/[^a-zA-Z0-9_]/g, '');

export const getCommandForReward = (reward: GachaRewardConfig, targetNick: string): string | null => {
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

const checkCooldown = async (userId: string, tierId: string, hours: number): Promise<boolean> => {
    if (hours <= 0) return true;

    const cooldownPeriod = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const prefix = TIER_PREFIXES[tierId.toLowerCase()] ?? 'b_';

    const { data } = await supabase
        .from('gacha_history')
        .select('created_at')
        .eq('user_id', userId)
        .ilike('reward_id', `${prefix}%`)
        .gte('created_at', cooldownPeriod)
        .limit(1);

    return !data || data.length === 0;
};

export const getHistory = async (userId: string) => {
    const { data, error } = await supabase
        .from('gacha_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;
    return data || [];
};
