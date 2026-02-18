import { LucideIcon, Coins, Star, Gem, Gift } from 'lucide-react';

export interface Reward {
    id: string;
    name: string;
    rarity: string;
    color: string;
    type?: string;
}

export const RARITY_COLORS: Record<string, string> = {
    common: '#b0c3d9',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000'
};

export const RARITY_ICONS: Record<string, LucideIcon> = {
    common: Star,
    rare: Coins,
    epic: Gem,
    legendary: Gift
};

export interface GachaHistoryItem {
    id: string;
    reward_name: string;
    rarity: string;
    created_at: string;
}

export const GACHA_TIERS = [
    { 
        id: 'bronze', 
        name: 'BRONZE', 
        color: '#cd7f32', 
        icon: '/images/ui/Killucoins/coin_cobre.webp',
        cost: 1,
        customModelData: 10000,
        rewards: [
            { id: 'b1', name: '100 XP', rarity: 'common', color: RARITY_COLORS.common },
            { id: 'b2', name: '50 KilluCoins', rarity: 'common', color: RARITY_COLORS.common },
            { id: 'b3', name: 'Gorro de Lana', rarity: 'common', color: RARITY_COLORS.common },
            { id: 'b4', name: '200 XP', rarity: 'rare', color: RARITY_COLORS.rare },
            { id: 'b5', name: '100 KilluCoins', rarity: 'rare', color: RARITY_COLORS.rare },
        ]
    },
    { 
        id: 'silver', 
        name: 'SILVER', 
        color: '#c0c0c0', 
        icon: '/images/ui/Killucoins/coin_plata.webp',
        cost: 100,
        customModelData: 10004,
        rewards: [
            { id: 's1', name: '300 XP', rarity: 'common', color: RARITY_COLORS.common },
            { id: 's2', name: 'Partículas Simples', rarity: 'common', color: RARITY_COLORS.common },
            { id: 's3', name: '200 KilluCoins', rarity: 'rare', color: RARITY_COLORS.rare },
            { id: 's4', name: 'Key Crate (Cobre)', rarity: 'rare', color: RARITY_COLORS.rare },
            { id: 's5', name: 'Mascota: Slime', rarity: 'rare', color: RARITY_COLORS.rare },
        ]
    },
    { 
        id: 'gold', 
        name: 'GOLD', 
        color: '#ffd700', 
        icon: '/images/ui/Killucoins/coin_oro.webp',
        cost: 10000,
        customModelData: 10003,
        rewards: [
            { id: 'g1', name: '1000 XP', rarity: 'rare', color: RARITY_COLORS.rare },
            { id: 'g2', name: 'Sombrero Pirata', rarity: 'rare', color: RARITY_COLORS.rare },
            { id: 'g3', name: 'x5 Diamantes', rarity: 'rare', color: RARITY_COLORS.rare },
            { id: 'g4', name: 'Permiso /colors', rarity: 'epic', color: RARITY_COLORS.epic },
            { id: 'g5', name: '1000 KilluCoins', rarity: 'epic', color: RARITY_COLORS.epic },
        ]
    },
    { 
        id: 'emerald', 
        name: 'EMERALD', 
        color: '#50c878', 
        icon: '/images/ui/Killucoins/coin_esmeralda.webp',
        cost: 1000000,
        customModelData: 10001,
        rewards: [
            { id: 'e1', name: 'Efecto de Rastro', rarity: 'rare', color: RARITY_COLORS.rare },
            { id: 'e2', name: 'Key Crate (Oro)', rarity: 'epic', color: RARITY_COLORS.epic },
            { id: 'e3', name: '2000 KilluCoins', rarity: 'epic', color: RARITY_COLORS.epic },
            { id: 'e4', name: 'Kit Especial (Gemas)', rarity: 'epic', color: RARITY_COLORS.epic },
            { id: 'e5', name: 'Globo de Helio', rarity: 'legendary', color: RARITY_COLORS.legendary },
        ]
    },
    { 
        id: 'diamond', 
        name: 'DIAMOND', 
        color: '#00f2ff', 
        icon: '/images/ui/Killucoins/coin_diamante.webp',
        cost: 100000000,
        customModelData: 10005,
        rewards: [
            { id: 'c1', name: 'Mascota: Dragón', rarity: 'epic', color: RARITY_COLORS.epic },
            { id: 'c2', name: 'Permiso /fly (1h)', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'c3', name: 'Admin: Rename Item', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'c4', name: 'Item Mítico (Custom)', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'c5', name: 'Ultra Crate Key', rarity: 'legendary', color: RARITY_COLORS.legendary },
        ]
    },
    { 
        id: 'iridium', 
        name: 'IRIDIUM', 
        color: '#b150b3', 
        icon: '/images/ui/Killucoins/coin_iridium.webp',
        cost: 10000000000,
        customModelData: 10002,
        rewards: [
            { id: 'i1', name: 'Sombrero de Rey', rarity: 'epic', color: RARITY_COLORS.epic },
            { id: 'i2', name: 'Admin: Spawn Move', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'i3', name: 'Permiso /vjump', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'i4', name: 'Tag Personalizado', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'i5', name: 'Alas de Iridio', rarity: 'legendary', color: RARITY_COLORS.legendary },
        ]
    },
    { 
        id: 'ultra', 
        name: 'Ultra Gem', 
        color: '#6366f1', 
        icon: '/images/ui/Killucoins/ultra_gen.webp',
        cost: 0,
        customModelData: 99999, 
        rewards: [
            { id: 'u1', name: 'Admin: Estructura Custom', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'u2', name: 'x5 Ultra Keys', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'u3', name: 'Mascota Exclusiva', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'u4', name: 'Capa Cosmética', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'u5', name: 'Prestige XP Booster', rarity: 'legendary', color: RARITY_COLORS.legendary },
        ]
    }
];

export const VISUAL_REWARDS = GACHA_TIERS[0].rewards; 

export const formatCost = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(0) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
};
