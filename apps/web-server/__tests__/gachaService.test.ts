import { describe, it, expect } from 'vitest';
import {
    selectWeightedReward,
    parseItemGiveValue,
    GACHA_TIERS,
    type GachaRewardConfig,
} from '@crystaltides/shared';
import { getCommandForReward } from '../services/gachaService.js';

describe('gacha RNG', () => {
    it('selectWeightedReward returns a reward from the pool', () => {
        const rewards: GachaRewardConfig[] = [
            { id: 'a', name: 'A', rarity: 'common', type: 'xp', value: 1, chance: 50 },
            { id: 'b', name: 'B', rarity: 'rare', type: 'xp', value: 2, chance: 50 },
        ];
        const picked = selectWeightedReward(rewards);
        expect(['a', 'b']).toContain(picked.id);
    });

    it('handles tiers whose weights do not sum to 100', () => {
        const bronze = GACHA_TIERS.find((tier) => tier.id === 'bronze');
        expect(bronze).toBeDefined();

        const counts: Record<string, number> = {};
        for (let i = 0; i < 5000; i++) {
            const reward = selectWeightedReward(bronze!.rewards);
            counts[reward.id] = (counts[reward.id] ?? 0) + 1;
        }

        expect(counts['b_speed'] ?? 0).toBeGreaterThan(0);
        expect(counts['b_jackpot'] ?? 0).toBeGreaterThan(0);
    });
});

describe('getCommandForReward', () => {
    it('builds a simple item give command', () => {
        const cmd = getCommandForReward(
            { id: 'b_coal', name: 'Coal', rarity: 'common', type: 'item', value: 'coal 32', chance: 10 },
            'TestPlayer'
        );
        expect(cmd).toBe('give TestPlayer coal 32');
    });

    it('builds an NBT item give command', () => {
        const cmd = getCommandForReward(
            {
                id: 'b_speed',
                name: 'Speed',
                rarity: 'rare',
                type: 'item',
                value: 'potion{Potion:"minecraft:swiftness"} 1',
                chance: 5,
            },
            'TestPlayer'
        );
        expect(cmd).toBe('give TestPlayer potion{Potion:"minecraft:swiftness"} 1');
    });

    it('returns null for loss rewards', () => {
        const cmd = getCommandForReward(
            { id: 'b_loss', name: 'Loss', rarity: 'common', type: 'xp', value: 0, chance: 40 },
            'TestPlayer'
        );
        expect(cmd).toBeNull();
    });

    it('builds currency and xp commands', () => {
        expect(
            getCommandForReward(
                { id: 'b_cons', name: 'KC', rarity: 'common', type: 'currency', value: 25, chance: 3 },
                'TestPlayer'
            )
        ).toBe('eco give TestPlayer 25');

        expect(
            getCommandForReward(
                { id: 'b_xp', name: 'XP', rarity: 'common', type: 'xp', value: 150, chance: 25 },
                'TestPlayer'
            )
        ).toBe('xp give TestPlayer 150');
    });
});

describe('parseItemGiveValue', () => {
    it('parses item id and count', () => {
        expect(parseItemGiveValue('coal 32')).toEqual({ itemSpec: 'coal', count: 32 });
        expect(parseItemGiveValue('potion{Potion:"minecraft:swiftness"} 1')).toEqual({
            itemSpec: 'potion{Potion:"minecraft:swiftness"}',
            count: 1,
        });
    });
});
