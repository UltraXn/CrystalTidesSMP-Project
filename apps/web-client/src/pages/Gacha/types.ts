export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export const RARITY_CLASS_MAP: Record<string, string> = {
  common: 'rarity-common',
  uncommon: 'rarity-uncommon',
  rare: 'rarity-rare',
  epic: 'rarity-epic',
  legendary: 'rarity-legendary',
  mythic: 'rarity-mythic',
};

export const TIER_CLASS_MAP: Record<string | number, string> = {
  bronze: 'tier-bronze',
  silver: 'tier-silver',
  gold: 'tier-gold',
  emerald: 'tier-emerald',
  diamond: 'tier-diamond',
  ultra: 'tier-ultra',
  1: 'tier-1',
  2: 'tier-2',
  3: 'tier-3',
  4: 'tier-4',
  5: 'tier-5',
  'tier-1': 'tier-1',
  'tier-2': 'tier-2',
  'tier-3': 'tier-3',
  'tier-4': 'tier-4',
  'tier-5': 'tier-5',
};

export const TIER_BTN_CLASS_MAP: Record<string | number, string> = {
  bronze: 'tier-btn-bronze',
  silver: 'tier-btn-silver',
  gold: 'tier-btn-gold',
  emerald: 'tier-btn-emerald',
  diamond: 'tier-btn-diamond',
  ultra: 'tier-btn-ultra',
  1: 'tier-btn-1',
  2: 'tier-btn-2',
  3: 'tier-btn-3',
  4: 'tier-btn-4',
  5: 'tier-btn-5',
  'tier-1': 'tier-btn-1',
  'tier-2': 'tier-btn-2',
  'tier-3': 'tier-btn-3',
  'tier-4': 'tier-btn-4',
  'tier-5': 'tier-btn-5',
};

export interface GachaReward {
  id: string;
  name: string;
  rarity: Rarity;
  color: string;
  image_url: string | null;
}

export interface RawGachaResult {
  id: string;
  reward_id: string;
  reward_name?: string;
  name?: string;
  rarity: Rarity;
  created_at: string;
  color?: string;
  image_url?: string;
}

// Mapped result used in the UI, merging raw backend data with frontend reward metadata
export interface MappedGachaResult extends RawGachaResult {
  name: string;
  image_url: string;
  color: string;
}

export interface GachaHistoryEntry {
  id: string;
  reward_id: string;
  reward_name: string;
  rarity: Rarity;
  created_at: string;
  image_url?: string;
  roll_time?: string;
}

export interface GachaTier {
  id: string;
  name: string;
  color: string;
  icon: string;
  cost: number;
  rewards: GachaReward[];
}

export interface RollResponse {
  success: boolean;
  data?: RawGachaResult | { results: RawGachaResult[] };
  code?: string;
}
