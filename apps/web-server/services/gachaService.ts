import supabase from '../config/supabaseClient.js';
import * as commandService from './commandService.js';

// Estructura de un Premio
export interface GachaReward {
    id: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    type: 'currency' | 'item' | 'rank' | 'xp' | 'crate';
    value: string | number; // Ej: 100 (monedas), "vip_rank" (id)
    chance: number; // Porcentaje 0-100 (ej: 0.5 para legendario)
    image_url?: string;
}

// Configuración de Premios Mejorada
const REWARDS_POOL: GachaReward[] = [
    // COMMON (70% total)
    { id: 'xp_small', name: '100 XP', rarity: 'common', type: 'xp', value: 100, chance: 35 },
    { id: 'coins_small', name: '50 KilluCoins', rarity: 'common', type: 'currency', value: 50, chance: 35 },
    
    // RARE (20% total)
    { id: 'coins_med', name: '500 KilluCoins', rarity: 'rare', type: 'currency', value: 500, chance: 10 },
    { id: 'item_diamond', name: 'x5 Diamantes', rarity: 'rare', type: 'item', value: 'diamond 5', chance: 10 },
    
    // EPIC (8% total)
    { id: 'rank_vip_3d', name: 'Rango VIP (3 Días)', rarity: 'epic', type: 'rank', value: 'vip_3d', chance: 4 },
    { id: 'coins_large', name: '2000 KilluCoins', rarity: 'epic', type: 'currency', value: 2000, chance: 3 },
    { id: 'item_gold_apple', name: 'x3 Manzanas de Oro', rarity: 'epic', type: 'item', value: 'golden_apple 3', chance: 1 },
    
    // LEGENDARY (2% total)
    { id: 'rank_mvp_1d', name: 'Rango MVP (1 Día)', rarity: 'legendary', type: 'rank', value: 'mvp_1d', chance: 1 },
    { id: 'item_netherite', name: 'Lingote de Netherite', rarity: 'legendary', type: 'item', value: 'netherite_ingot 1', chance: 0.8 },
    { id: 'crate_premium', name: 'Llave Caja Premium', rarity: 'legendary', type: 'crate', value: 'premium_key', chance: 0.2 },
];

export const rollGacha = async (userId: string) => {
    // 1. Resolve Minecraft Identity
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError || !user) throw new Error("USER_NOT_FOUND");

    const mcNick = user.user_metadata?.minecraft_nick;
    if (!mcNick) {
        throw new Error("ACCOUNT_NOT_LINKED");
    }

    // 2. Check Cooldown (1 free roll per 24 hours)
    const canRoll = await checkCooldown(userId);
    if (!canRoll) {
        throw new Error("COOLDOWN_ACTIVE");
    }

    // 3. Logic: Probability (Weighted Random)
    const random = Math.random() * 100;
    let currentWeight = 0;
    let selectedReward: GachaReward | null = null;

    for (const reward of REWARDS_POOL) {
        currentWeight += reward.chance;
        if (random <= currentWeight) {
            selectedReward = reward;
            break;
        }
    }

    // Fallback
    if (!selectedReward) selectedReward = REWARDS_POOL[0];

    // 4. Deliver Reward (Save to history)
    await saveDrop(userId, selectedReward);

    // 5. Queue Command in CrystalCore Bridge
    const command = getCommandForReward(selectedReward, mcNick); 
    if (command) {
        await commandService.queueCommand(command);
    }

    return selectedReward;
};

// Helper to sanitize Minecraft nicknames (Allow only A-Z, 0-9, and _)
const sanitizeNick = (nick: string): string => {
    return nick.replace(/[^a-zA-Z0-9_]/g, '');
};

// Helper to generate commands based on reward type
const getCommandForReward = (reward: GachaReward, targetNick: string): string | null => {
    const safeNick = sanitizeNick(targetNick);
    
    if (!safeNick) {
        console.error("[GACHA] Attempted to generate command for invalid nickname:", targetNick);
        return null;
    }

    switch (reward.type) {
        case 'currency':
             return `eco give ${safeNick} ${reward.value}`;
        case 'rank':
             // vault/luckperms command
             // Assuming rank ids match what we defined or have a mapping
             return `lp user ${safeNick} parent addtemp ${reward.value} 3d`; // Simplified
        case 'item':
             return `give ${safeNick} minecraft:${reward.value}`;
        case 'xp':
             return `xp give ${safeNick} ${reward.value}`;
        case 'crate':
             return `crate give ${safeNick} ${reward.value} 1`;
        default:
             return null;
    }
}

const checkCooldown = async (userId: string): Promise<boolean> => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Check last roll
    const { data, error } = await supabase
        .from('gacha_history')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Gacha Cooldown Check Error:", error);
        return false; // Fail safe
    }

    return data.length === 0;
};

const saveDrop = async (userId: string, reward: GachaReward) => {
    const { error } = await supabase
        .from('gacha_history')
        .insert({ 
            user_id: userId, 
            reward_id: reward.id, 
            reward_name: reward.name,
            rarity: reward.rarity,
            created_at: new Date().toISOString()
        });
    
    if (error) console.error("Error saving drop:", error);
    console.log(`[GACHA] User ${userId} won ${reward.name}`);
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

