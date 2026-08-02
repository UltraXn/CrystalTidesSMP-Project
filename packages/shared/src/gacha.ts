export type GachaRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type GachaRewardType = 'currency' | 'item' | 'xp';

export interface GachaRewardConfig {
    id: string;
    name: string;
    rarity: GachaRarity;
    type: GachaRewardType;
    value: string | number;
    chance: number;
    image_url?: string;
    color?: string;
}

export interface GachaTierConfig {
    id: string;
    name: string;
    cost: number;
    color: string;
    icon: string;
    rewards: GachaRewardConfig[];
}

const XP_IMAGE = '/images/items/xp_bottle.webp';

export const COIN_IMAGES = {
    bronze: '/images/killucoins/coin_cobre.webp',
    silver: '/images/killucoins/coin_plata.webp',
    gold: '/images/killucoins/coin_oro.webp',
    emerald: '/images/killucoins/coin_esmeralda.webp',
    diamond: '/images/killucoins/coin_diamante.webp',
    iridium: '/images/killucoins/coin_iridium.webp',
} as const;

export const GACHA_TIERS: GachaTierConfig[] = [
    {
        id: 'bronze',
        name: 'Bronze',
        cost: 100,
        color: '#cd7f32',
        icon: COIN_IMAGES.bronze,
        rewards: [
            { id: 'b_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', type: 'xp', value: 0, chance: 40, color: '#94a3b8', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'b_xp', name: '150 XP', rarity: 'common', type: 'xp', value: 150, chance: 25, image_url: XP_IMAGE, color: '#94a3b8' },
            { id: 'b_coal', name: '32x Carbón', rarity: 'common', type: 'item', value: 'coal 32', chance: 10, color: '#94a3b8' },
            { id: 'b_copper', name: '16x Cobre', rarity: 'common', type: 'item', value: 'raw_copper 16', chance: 10, color: '#94a3b8' },
            { id: 'b_torch', name: '64x Antorchas', rarity: 'common', type: 'item', value: 'torch 64', chance: 9, color: '#94a3b8' },
            { id: 'b_steak', name: '16x Filetes', rarity: 'common', type: 'item', value: 'cooked_beef 16', chance: 8, color: '#94a3b8' },
            { id: 'b_speed', name: '1x Poción Velocidad I', rarity: 'rare', type: 'item', value: 'potion{Potion:"minecraft:swiftness"} 1', chance: 5, color: '#3b82f6' },
            { id: 'b_gold_jackpot', name: '¡JACKPOT DE ORO!', rarity: 'mythic', type: 'currency', value: 1000, chance: 1, image_url: COIN_IMAGES.gold, color: '#ffcc00' },
            { id: 'b_cons', name: '25 KC', rarity: 'common', type: 'currency', value: 25, chance: 3, image_url: COIN_IMAGES.bronze, color: '#cd7f32' },
            { id: 'b_jackpot', name: '100 KC', rarity: 'legendary', type: 'currency', value: 100, chance: 4, image_url: COIN_IMAGES.bronze, color: '#ff8000' },
        ],
    },
    {
        id: 'silver',
        name: 'Silver',
        cost: 1000,
        color: '#c0c0c0',
        icon: COIN_IMAGES.silver,
        rewards: [
            { id: 's_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', type: 'xp', value: 0, chance: 15, color: '#94a3b8', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 's_xp', name: '400 XP', rarity: 'common', type: 'xp', value: 400, chance: 15, image_url: XP_IMAGE, color: '#94a3b8' },
            { id: 's_iron', name: '16x Hierro', rarity: 'rare', type: 'item', value: 'iron_ingot 16', chance: 15, color: '#3b82f6' },
            { id: 's_lapis', name: '32x Lapislázuli', rarity: 'rare', type: 'item', value: 'lapis_lazuli 32', chance: 15, color: '#3b82f6' },
            { id: 's_carrot', name: '16x Zanahorias de Oro', rarity: 'rare', type: 'item', value: 'golden_carrot 16', chance: 5, color: '#3b82f6' },
            { id: 's_gold', name: '4x Oro', rarity: 'rare', type: 'item', value: 'gold_ingot 4', chance: 10, color: '#3b82f6' },
            { id: 's_upgrade', name: '1x Mejora de Netherite', rarity: 'epic', type: 'item', value: 'netherite_upgrade_smithing_template 1', chance: 5, color: '#a335ee' },
            { id: 's_pick', name: '1x Pico Hierro', rarity: 'rare', type: 'item', value: 'iron_pickaxe 1', chance: 4, color: '#3b82f6' },
            { id: 's_shield', name: '1x Escudo', rarity: 'rare', type: 'item', value: 'shield 1', chance: 4, color: '#3b82f6' },
            { id: 's_bucket', name: '1x Cubo Agua', rarity: 'rare', type: 'item', value: 'water_bucket 1', chance: 4, color: '#3b82f6' },
            { id: 's_cons', name: '250 KC', rarity: 'rare', type: 'currency', value: 250, chance: 3, image_url: COIN_IMAGES.silver, color: '#c0c0c0' },
            { id: 's_jackpot', name: '1.000 KC', rarity: 'legendary', type: 'currency', value: 1000, chance: 5, image_url: COIN_IMAGES.silver, color: '#ff8000' },
        ],
    },
    {
        id: 'gold',
        name: 'Gold',
        cost: 10000,
        color: '#ffd700',
        icon: COIN_IMAGES.gold,
        rewards: [
            { id: 'g_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', type: 'xp', value: 0, chance: 20, color: '#94a3b8', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'g_xp', name: '1500 XP', rarity: 'rare', type: 'xp', value: 1500, chance: 20, image_url: XP_IMAGE, color: '#3b82f6' },
            { id: 'g_gold', name: '12x Oro', rarity: 'epic', type: 'item', value: 'gold_ingot 12', chance: 7, color: '#a335ee' },
            { id: 'g_diamond', name: '3x Diamantes', rarity: 'epic', type: 'item', value: 'diamond 3', chance: 7, color: '#a335ee' },
            { id: 'g_pigstep', name: '1x Disco "Pigstep"', rarity: 'legendary', type: 'item', value: 'music_disc_pigstep 1', chance: 5, color: '#ff8000' },
            { id: 'g_wither', name: '3x Cráneos de Wither', rarity: 'legendary', type: 'item', value: 'wither_skeleton_skull 3', chance: 5, color: '#ff8000' },
            { id: 'g_iblock', name: '1x Bloque Hierro', rarity: 'epic', type: 'item', value: 'iron_block 1', chance: 6, color: '#a335ee' },
            { id: 'g_totem', name: '1x Totem', rarity: 'epic', type: 'item', value: 'totem_of_undying 1', chance: 7, color: '#a335ee' },
            { id: 'g_apple', name: '1x Manzana Dorada', rarity: 'epic', type: 'item', value: 'golden_apple 1', chance: 6, color: '#a335ee' },
            { id: 'g_saddle', name: '1x Montura', rarity: 'epic', type: 'item', value: 'saddle 1', chance: 5, color: '#a335ee' },
            { id: 'g_cons', name: '2.500 KC', rarity: 'epic', type: 'currency', value: 2500, chance: 7, image_url: COIN_IMAGES.gold, color: '#ffd700' },
            { id: 'g_jackpot', name: '10.000 KC', rarity: 'legendary', type: 'currency', value: 10000, chance: 5, image_url: COIN_IMAGES.gold, color: '#ff8000' },
        ],
    },
    {
        id: 'emerald',
        name: 'Emerald',
        cost: 100000,
        color: '#50c878',
        icon: COIN_IMAGES.emerald,
        rewards: [
            { id: 'e_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', type: 'xp', value: 0, chance: 20, color: '#94a3b8', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'e_xp', name: '4000 XP', rarity: 'epic', type: 'xp', value: 4000, chance: 20, image_url: XP_IMAGE, color: '#a335ee' },
            { id: 'e_sniffer', name: '1x Huevo de Sniffer', rarity: 'legendary', type: 'item', value: 'sniffer_egg 1', chance: 5, color: '#ff8000' },
            { id: 'e_emerald', name: '16x Esmeraldas', rarity: 'legendary', type: 'item', value: 'emerald 16', chance: 9, color: '#ff8000' },
            { id: 'e_dblock', name: '1x Bloque Diamante', rarity: 'legendary', type: 'item', value: 'diamond_block 1', chance: 9, color: '#ff8000' },
            { id: 'e_gblock', name: '1x Bloque Oro', rarity: 'legendary', type: 'item', value: 'gold_block 1', chance: 10, color: '#ff8000' },
            { id: 'e_mending', name: '1x Mending', rarity: 'legendary', type: 'item', value: 'enchanted_book{StoredEnchantments:[{id:"minecraft:mending",lvl:1}]} 1', chance: 7, color: '#ff8000' },
            { id: 'e_beacon', name: '1x Beacon', rarity: 'legendary', type: 'item', value: 'beacon 1', chance: 5, color: '#ff8000' },
            { id: 'e_shulker_s', name: '1x Caparazón Shulker', rarity: 'legendary', type: 'item', value: 'shulker_shell 1', chance: 5, color: '#ff8000' },
            { id: 'e_cons', name: '25.000 KC', rarity: 'legendary', type: 'currency', value: 25000, chance: 5, image_url: COIN_IMAGES.emerald, color: '#50c878' },
            { id: 'e_jackpot', name: '100.000 KC', rarity: 'legendary', type: 'currency', value: 100000, chance: 5, image_url: COIN_IMAGES.emerald, color: '#ff8000' },
        ],
    },
    {
        id: 'diamond',
        name: 'Diamond',
        cost: 1000000,
        color: '#00f2ff',
        icon: COIN_IMAGES.diamond,
        rewards: [
            { id: 'd_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', type: 'xp', value: 0, chance: 20, color: '#94a3b8', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'd_xp', name: '10000 XP', rarity: 'legendary', type: 'xp', value: 10000, chance: 20, image_url: XP_IMAGE, color: '#ff8000' },
            { id: 'd_heavy', name: '1x Heavy Core', rarity: 'mythic', type: 'item', value: 'heavy_core 1', chance: 5, color: '#ffcc00' },
            { id: 'd_notch', name: '1x Manzana Notch', rarity: 'mythic', type: 'item', value: 'enchanted_golden_apple 1', chance: 5, color: '#ffcc00' },
            { id: 'd_head', name: '1x Cabeza Dragon', rarity: 'legendary', type: 'item', value: 'dragon_head 1', chance: 5, color: '#ff8000' },
            { id: 'd_silence', name: 'Plantilla Herrería Silencio', rarity: 'mythic', type: 'item', value: 'silence_armor_trim_smithing_template 1', chance: 5, color: '#ffcc00' },
            { id: 'd_dblocks', name: '4x Bloque Diamante', rarity: 'legendary', type: 'item', value: 'diamond_block 4', chance: 5, color: '#ff8000' },
            { id: 'd_scrap', name: '1x Netherite Scrap', rarity: 'legendary', type: 'item', value: 'netherite_scrap 1', chance: 5, color: '#ff8000' },
            { id: 'd_eblocks', name: '2x Bloque Esmeralda', rarity: 'legendary', type: 'item', value: 'emerald_block 2', chance: 5, color: '#ff8000' },
            { id: 'd_elytra', name: '1x Elytra', rarity: 'legendary', type: 'item', value: 'elytra 1', chance: 5, color: '#ff8000' },
            { id: 'd_shulker_b', name: '1x Caja Shulker', rarity: 'legendary', type: 'item', value: 'shulker_box 1', chance: 5, color: '#ff8000' },
            { id: 'd_cons', name: '250.000 KC', rarity: 'legendary', type: 'currency', value: 250000, chance: 5, image_url: COIN_IMAGES.diamond, color: '#00f2ff' },
            { id: 'd_jackpot', name: '1.000.000 KC', rarity: 'legendary', type: 'currency', value: 1000000, chance: 15, image_url: COIN_IMAGES.diamond, color: '#ff8000' },
        ],
    },
    {
        id: 'iridium',
        name: 'Iridium',
        cost: 10000000,
        color: '#b150b3',
        icon: COIN_IMAGES.iridium,
        rewards: [
            { id: 'i_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', type: 'xp', value: 0, chance: 25, color: '#94a3b8', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'i_xp', name: '25000 XP', rarity: 'legendary', type: 'xp', value: 25000, chance: 25, image_url: XP_IMAGE, color: '#ff8000' },
            { id: 'i_ingot', name: '1x Lingote Netherite', rarity: 'legendary', type: 'item', value: 'netherite_ingot 1', chance: 8, color: '#ff8000' },
            { id: 'i_scraps', name: '4x Netherite Scrap', rarity: 'legendary', type: 'item', value: 'netherite_scrap 4', chance: 8, color: '#ff8000' },
            { id: 'i_nblock', name: '1x Bloque Netherite', rarity: 'legendary', type: 'item', value: 'netherite_block 1', chance: 4, color: '#ff8000' },
            { id: 'i_trident', name: '1x Tridente', rarity: 'legendary', type: 'item', value: 'trident 1', chance: 5, color: '#ff8000' },
            { id: 'i_star', name: '1x Estrella Nether', rarity: 'legendary', type: 'item', value: 'nether_star 1', chance: 5, color: '#ff8000' },
            { id: 'i_armor', name: '1x Armadura Netherite', rarity: 'legendary', type: 'item', value: 'netherite_chestplate 1', chance: 5, color: '#ff8000' },
            { id: 'i_cons', name: '2.500.000 KC', rarity: 'legendary', type: 'currency', value: 2500000, chance: 10, image_url: COIN_IMAGES.iridium, color: '#b150b3' },
            { id: 'i_jackpot', name: '10.000.000 KC', rarity: 'legendary', type: 'currency', value: 10000000, chance: 5, image_url: COIN_IMAGES.iridium, color: '#ff8000' },
        ],
    },
    {
        id: 'ultra',
        name: 'Ultra',
        cost: 0,
        color: '#6366f1',
        icon: '/images/killucoins/ultra_gen.webp',
        rewards: [
            { id: 'u_xp', name: '75.000 XP', rarity: 'legendary', type: 'xp', value: 75000, chance: 40, image_url: XP_IMAGE, color: '#ffaa00' },
            { id: 'u_gem', name: 'Ultra Gema (Evento)', rarity: 'legendary', type: 'item', value: 'netherite_scrap 1', chance: 30, image_url: '/images/killucoins/ultra_gen.webp', color: '#ff00ff' },
            { id: 'u_cloak', name: 'Capa Cósmica (Exclusivo)', rarity: 'legendary', type: 'item', value: 'elytra 1', chance: 15, image_url: '/images/items/Elytra_JE2_BE2.png', color: '#6366f1' },
            { id: 'u_jackpot', name: '50.000.000 KC (JACKPOT)', rarity: 'legendary', type: 'currency', value: 50000000, chance: 15, image_url: '/images/killucoins/ultra_gen.webp', color: '#ff0000' },
        ],
    },
];

export const GACHA_TIERS_MAP: Record<string, GachaTierConfig> = Object.fromEntries(
    GACHA_TIERS.map((tier) => [tier.id, tier])
);

export const TIER_COOLDOWNS: Record<string, number> = {
    bronze: 6,
    silver: 18,
    gold: 34,
    emerald: 48,
    diamond: 72,
    iridium: 96,
    ultra: 0,
};

export const TIER_PREFIXES: Record<string, string> = {
    bronze: 'b_',
    silver: 's_',
    gold: 'g_',
    emerald: 'e_',
    diamond: 'd_',
    iridium: 'i_',
    ultra: 'u_',
};

/** Tiers that require unlocked_tiers in linked_accounts (or admin bypass). */
export const EVENT_ONLY_TIERS = new Set(['ultra']);

export function selectWeightedReward(rewards: GachaRewardConfig[]): GachaRewardConfig {
    const totalWeight = rewards.reduce((sum, reward) => sum + reward.chance, 0);
    if (totalWeight <= 0) return rewards[0];

    const random = Math.random() * totalWeight;
    let currentWeight = 0;

    for (const reward of rewards) {
        currentWeight += reward.chance;
        if (random <= currentWeight) {
            return reward;
        }
    }

    return rewards[rewards.length - 1];
}

export function parseItemGiveValue(value: string): { itemSpec: string; count: number } {
    const trimmed = value.trim();
    const match = trimmed.match(/^(.+?)\s+(\d+)$/);
    if (match) {
        return { itemSpec: match[1], count: parseInt(match[2], 10) };
    }
    return { itemSpec: trimmed, count: 1 };
}

export function validateGachaTierWeights(): void {
    for (const tier of GACHA_TIERS) {
        const total = tier.rewards.reduce((sum, reward) => sum + reward.chance, 0);
        if (Math.abs(total - 100) > 0.001) {
            console.warn(`[Gacha] Tier "${tier.id}" weights sum to ${total} (expected 100). RNG normalizes dynamically.`);
        }
    }
}
