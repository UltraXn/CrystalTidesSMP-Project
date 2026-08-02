
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

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
