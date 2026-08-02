import { GACHA_TIERS as SHARED_TIERS } from '@crystaltides/shared';
import type { GachaTier } from './types';

export { SHARED_TIERS };

const COIN_IMAGES: Record<string, string> = {
    bronze: '/images/killucoins/coin_cobre.webp',
    silver: '/images/killucoins/coin_plata.webp',
    gold: '/images/killucoins/coin_oro.webp',
    emerald: '/images/killucoins/coin_esmeralda.webp',
    diamond: '/images/killucoins/coin_diamante.webp',
    iridium: '/images/killucoins/coin_iridium.webp',
};

const getItemImg = (name: string): string | null => {
    const n = name.toLowerCase();

    if (n.includes('xp')) return '/images/xp_bottle.webp';

    if (n.includes('killucoins') || n.includes(' kc')) {
        if (n.includes('250.000')) return COIN_IMAGES.diamond;
        if (n.includes('2.500.000')) return COIN_IMAGES.iridium;
        if (n.includes('25.000')) return COIN_IMAGES.emerald;
        if (n.includes('2.500')) return COIN_IMAGES.gold;
        if (n.includes('250')) return COIN_IMAGES.silver;
        return COIN_IMAGES.bronze;
    }

    const itemMap: Record<string, string> = {
        'carbón': 'Coal_JE4_BE3.png',
        'cobre': 'Raw_Copper_JE3_BE2.png',
        'hierro': 'Iron_Ingot_JE3_BE2.png',
        'oro': 'Gold_Ingot_JE4_BE2.webp',
        'diamante': 'Diamond_JE3_BE3.png',
        'esmeraldas': 'Emerald_JE3_BE3.png',
        'esmeralda': 'Emerald_JE3_BE3.png',
        'netherite lingote': 'Netherite_Ingot_JE1_BE2.png',
        'elytra': 'Elytra_JE2_BE2.png',
        'totem': 'Totem_of_Undying_JE2_BE2.png',
        'mending': 'enchanted_book.gif',
        'manzana dorada': 'Golden_Apple_JE2_BE2.png',
        'pico hierro': 'Iron_Pickaxe_JE3_BE2.png',
        'antorchas': 'Torch.webp',
        'filetes': 'Steak_JE4_BE3.png',
        'lapislázuli': 'Lapis_Lazuli_JE2_BE2.png',
        'escudo': 'Shield_JE2_BE1.webp',
        'cubo agua': 'Water_Bucket_JE2_BE2.png',
        'bloque hierro': 'Bloque_hierro.webp',
        'montura': 'Saddle_JE2_BE2.png',
        'bloque diamante': 'Block_of_Diamond_JE5_BE3.webp',
        'bloque oro': 'Gold_block.webp',
        'beacon': 'Beacon_JE6_BE2.webp',
        'caparazón shulker': 'Shulker_Shell_JE2_BE2.png',
        'netherite scrap': 'Netherite_Scrap_JE2_BE1.png',
        'bloque esmeralda': 'Bloque_Esmeralda.webp',
        'caja shulker': 'Caja_de_shulker.webp',
        'bloque netherite': 'Block_of_Netherite_JE1_BE1.webp',
        'tridente': 'Trident_(item).png',
        'estrella nether': 'Nether_Star.gif',
        'velocidad': 'Potion_of_Swiftness_JE3.png',
        'pechera netherite': 'Netherite_Chestplate_JE2_BE1.png',
        'armadura netherite': 'Netherite_Chestplate_JE2_BE1.png',
        'silencio': 'Silence_Armor_Trim_Smithing_Template_JE1_BE1.png',
        'mejora netherite': 'Netherite_Upgrade_Smithing_Template_JE1_BE1.png',
        'pigstep': 'Music_Disc_Pigstep_JE1_BE1.png',
        'wither': 'Wither_Skeleton_Skull_(S)_JE2.png',
        'cabeza dragon': 'Dragon_Head_(S)_JE1.png',
        'sniffer': 'Sniffer_Egg_(item)_JE1_BE1.png',
        'heavy core': 'Heavy_Core_JE1_BE1.png',
        'notch': 'Enchanted_Golden_Apple_JE2_BE2.gif',
        'zanahoria': 'Golden_Carrot_JE4_BE2.png',
    };

    for (const [key, filename] of Object.entries(itemMap)) {
        if (n.includes(key)) return `/images/items/${filename}`;
    }

    return null;
};

/** Loss / miss reward (no prize). */
export const isLossReward = (item: {
    id?: string;
    name?: string;
    reward_name?: string;
    image_url?: string | null;
}): boolean => {
    const id = item.id ?? '';
    const name = (item.name ?? item.reward_name ?? '').toLowerCase();
    const img = item.image_url ?? '';
    return (
        id.endsWith('_loss') ||
        name.includes('próxima') ||
        name.includes('proxima') ||
        name.includes('try again') ||
        img.includes('Barrier')
    );
};

/** Prefer explicit image_url, otherwise map by reward name. */
export const resolveRewardImage = (name: string, imageUrl?: string | null): string | null => {
    if (imageUrl) return imageUrl;
    if (isLossReward({ name })) return null;
    return getItemImg(name);
};

/** Aggregate real weighted rates for the rates panel (matches server selectWeightedReward). */
export const computeRarityRates = (
    rewards: { id?: string; name?: string; rarity: string; chance: number; value?: string | number }[]
): { key: string; label: string; pct: number }[] => {
    const labels: Record<string, string> = {
        miss: 'Sin premio',
        mythic: 'Mítico',
        legendary: 'Legendario',
        epic: 'Épico',
        rare: 'Raro',
        common: 'Común',
    };
    const order = ['miss', 'mythic', 'legendary', 'epic', 'rare', 'common'] as const;

    const bucketKey = (r: (typeof rewards)[number]): string => {
        if (
            r.id?.endsWith('_loss') ||
            (typeof r.name === 'string' &&
                (r.name.includes('PRÓXIMA') || r.name.includes('TRY AGAIN'))) ||
            r.value === 0 ||
            r.value === '0'
        ) {
            return 'miss';
        }
        return r.rarity;
    };

    const totals: Record<string, number> = {};
    let sum = 0;
    for (const r of rewards) {
        const key = bucketKey(r);
        totals[key] = (totals[key] || 0) + r.chance;
        sum += r.chance;
    }

    if (sum <= 0) {
        return order.reduce<Array<{ key: string; label: string; pct: number }>>((acc, key) => {
            if (key !== 'miss') {
                acc.push({ key, label: labels[key], pct: 0 });
            }
            return acc;
        }, []);
    }

    // Largest-remainder so displayed ints always sum to 100
    const raw = order.map((key) => {
        const exact = ((totals[key] || 0) / sum) * 100;
        return { key, label: labels[key], exact, pct: Math.floor(exact), frac: exact - Math.floor(exact) };
    });
    let leftover = 100 - raw.reduce((acc, row) => acc + row.pct, 0);
    [...raw]
        .sort((a, b) => b.frac - a.frac)
        .forEach((row) => {
            if (leftover <= 0) return;
            row.pct += 1;
            leftover -= 1;
        });

    return raw.reduce<Array<{ key: string; label: string; pct: number }>>((acc, row) => {
        if ((totals[row.key] || 0) > 0) {
            acc.push({ key: row.key, label: row.label, pct: row.pct });
        }
        return acc;
    }, []);
};

export const DISPLAY_GACHA_TIERS: GachaTier[] = SHARED_TIERS.map((tier) => ({
    id: tier.id,
    name: tier.name.toUpperCase(),
    color: tier.color,
    icon: tier.icon,
    cost: tier.cost,
    rewards: tier.rewards.map((reward) => ({
        id: reward.id,
        name: reward.name,
        rarity: reward.rarity,
        color: reward.color ?? '#ffffff',
        image_url: reward.image_url ?? getItemImg(reward.name),
    })),
}));

export interface GachaStatusResponse {
    balance: number;
    unlockedTiers: string[];
    tiers: Record<string, { hasFreeRoll: boolean; cooldownHours: number }>;
}
