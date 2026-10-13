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

const ITEM_FILENAME_MAP: Record<string, string> = {
  carbón: 'Coal_JE4_BE3.png',
  cobre: 'Raw_Copper_JE3_BE2.png',
  hierro: 'Iron_Ingot_JE3_BE2.png',
  oro: 'Gold_Ingot_JE4_BE2.webp',
  diamante: 'Diamond_JE3_BE3.png',
  esmeraldas: 'Emerald_JE3_BE3.png',
  esmeralda: 'Emerald_JE3_BE3.png',
  'netherite lingote': 'Netherite_Ingot_JE1_BE2.png',
  elytra: 'Elytra_JE2_BE2.png',
  totem: 'Totem_of_Undying_JE2_BE2.png',
  mending: 'enchanted_book.gif',
  'manzana dorada': 'Golden_Apple_JE2_BE2.png',
  'pico hierro': 'Iron_Pickaxe_JE3_BE2.png',
  antorchas: 'Torch.webp',
  filetes: 'Steak_JE4_BE3.png',
  lapislázuli: 'Lapis_Lazuli_JE2_BE2.png',
  escudo: 'Shield_JE2_BE1.webp',
  'cubo agua': 'Water_Bucket_JE2_BE2.png',
  'bloque hierro': 'Bloque_hierro.webp',
  montura: 'Saddle_JE2_BE2.png',
  'bloque diamante': 'Block_of_Diamond_JE5_BE3.webp',
  'bloque oro': 'Gold_block.webp',
  beacon: 'Beacon_JE6_BE2.webp',
  'caparazón shulker': 'Shulker_Shell_JE2_BE2.png',
  'netherite scrap': 'Netherite_Scrap_JE2_BE1.png',
  'bloque esmeralda': 'Bloque_Esmeralda.webp',
  'caja shulker': 'Caja_de_shulker.webp',
  'bloque netherite': 'Block_of_Netherite_JE1_BE1.webp',
  tridente: 'Trident_(item).png',
  'estrella nether': 'Nether_Star.gif',
  velocidad: 'Potion_of_Swiftness_JE3.png',
  'pechera netherite': 'Netherite_Chestplate_JE2_BE1.png',
  'armadura netherite': 'Netherite_Chestplate_JE2_BE1.png',
  silencio: 'Silence_Armor_Trim_Smithing_Template_JE1_BE1.png',
  'mejora netherite': 'Netherite_Upgrade_Smithing_Template_JE1_BE1.png',
  pigstep: 'Music_Disc_Pigstep_JE1_BE1.png',
  wither: 'Wither_Skeleton_Skull_(S)_JE2.png',
  'cabeza dragon': 'Dragon_Head_(S)_JE1.png',
  sniffer: 'Sniffer_Egg_(item)_JE1_BE1.png',
  'heavy core': 'Heavy_Core_JE1_BE1.png',
  notch: 'Enchanted_Golden_Apple_JE2_BE2.gif',
  zanahoria: 'Golden_Carrot_JE4_BE2.png',
};

const getKillucoinImage = (nameLower: string): string => {
  if (nameLower.includes('250.000')) return COIN_IMAGES.diamond;
  if (nameLower.includes('2.500.000')) return COIN_IMAGES.iridium;
  if (nameLower.includes('25.000')) return COIN_IMAGES.emerald;
  if (nameLower.includes('2.500')) return COIN_IMAGES.gold;
  if (nameLower.includes('250')) return COIN_IMAGES.silver;
  return COIN_IMAGES.bronze;
};

const getItemImg = (name: string): string | null => {
  const n = name.toLowerCase();

  if (n.includes('xp')) return '/images/xp_bottle.webp';

  if (n.includes('killucoins') || n.includes(' kc')) {
    return getKillucoinImage(n);
  }

  for (const [key, filename] of Object.entries(ITEM_FILENAME_MAP)) {
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

const FAILSAFE_PATTERNS: ReadonlyArray<readonly [string, string]> = [
  ['xp', '/images/items/xp_bottle.webp'],
  ['capa', '/images/items/Elytra_JE2_BE2.png'],
  ['elytra', '/images/items/Elytra_JE2_BE2.png'],
  ['estrella nether', '/images/items/Nether_Star.gif'],
  ['mending', '/images/items/enchanted_book.gif'],
  ['silencio', '/images/items/Silence_Armor_Trim_Smithing_Template_JE1_BE1.png'],
  ['heavy core', '/images/items/Heavy_Core_JE1_BE1.png'],
  ['sniffer', '/images/items/Sniffer_Egg_(item)_JE1_BE1.png'],
  ['pigstep', '/images/items/Music_Disc_Pigstep_JE1_BE1.png'],
  ['wither', '/images/items/Wither_Skeleton_Skull_(S)_JE2.png'],
  ['notch', '/images/items/Enchanted_Golden_Apple_JE2_BE2.gif'],
  ['escudo', '/images/items/Shield_JE2_BE1.webp'],
  ['mejora netherite', '/images/items/Netherite_Upgrade_Smithing_Template_JE1_BE1.png'],
  ['zanahoria oro', '/images/items/Golden_Carrot_JE4_BE2.png'],
  ['carbón', '/images/items/Coal_JE4_BE3.png'],
  ['cobre', '/images/items/Raw_Copper_JE3_BE2.png'],
];

const KILLUCOIN_TIERS: ReadonlyArray<readonly [string, string]> = [
  ['2.500.000', COIN_IMAGES.iridium],
  ['250.000', COIN_IMAGES.diamond],
  ['25.000', COIN_IMAGES.emerald],
  ['2.500', COIN_IMAGES.gold],
  ['250', COIN_IMAGES.silver],
];

export function getGachaFailsafeImage(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes('killucoins') || n.includes(' kc')) {
    for (const [amt, coin] of KILLUCOIN_TIERS) {
      if (n.includes(amt)) return coin;
    }
    return COIN_IMAGES.bronze;
  }
  for (const [key, path] of FAILSAFE_PATTERNS) {
    if (n.includes(key)) return path;
  }
  return null;
}

/** Prefer explicit image_url, otherwise map by reward name. */
export const resolveRewardImage = (name: string, imageUrl?: string | null): string | null => {
  if (imageUrl) return imageUrl;
  if (isLossReward({ name })) return null;
  return getItemImg(name);
};

interface RarityRateReward {
  id?: string;
  name?: string;
  rarity: string;
  chance: number;
  value?: string | number;
}

const getBucketKey = (r: RarityRateReward): string => {
  if (
    r.id?.endsWith('_loss') ||
    (typeof r.name === 'string' && (r.name.includes('PRÓXIMA') || r.name.includes('TRY AGAIN'))) ||
    r.value === 0 ||
    r.value === '0'
  ) {
    return 'miss';
  }
  return r.rarity;
};

/** Aggregate real weighted rates for the rates panel (matches server selectWeightedReward). */
export const computeRarityRates = (
  rewards: RarityRateReward[],
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

  const totals: Record<string, number> = {};
  let sum = 0;
  for (const r of rewards) {
    const key = getBucketKey(r);
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
    return {
      key,
      label: labels[key],
      exact,
      pct: Math.floor(exact),
      frac: exact - Math.floor(exact),
    };
  });
  let leftover = 100 - raw.reduce((acc, row) => acc + row.pct, 0);
  raw
    .toSorted((a, b) => b.frac - a.frac)
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
