import React, { useState, useEffect, useCallback, useRef, useMemo, createRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Lock, Sparkles, Gem, Trophy, Crown } from 'lucide-react';
import gsap from 'gsap';

import './GachaStyles.css';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/UI/Loader';
import { isAdmin, getUserRole } from '../../utils/roleUtils';

// Sub-components
import { GachaUnauthorized } from './GachaUnauthorized';
import { GachaHeader } from './GachaHeader';
import { GachaMachine } from './GachaMachine';
import { GachaControls } from './GachaControls';
import { GachaRewardsOverlay } from './GachaRewardsOverlay';
import { GachaHistory } from './GachaHistory';
import Gacha3DShowcase from '../../components/Gacha/Gacha3DShowcase';

import { 
    GachaReward, 
    RawGachaResult, 
    MappedGachaResult, 
    GachaHistoryEntry, 
    GachaTier, 
    RollResponse 
} from './types';

const RARITY_COLORS: Record<string, string> = {
    common: '#b0c3d9',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000',
    mythic: '#ffcc00'
};

const RARITY_ICONS: Record<string, React.ElementType> = {
    common: Star,
    rare: Sparkles,
    epic: Gem,
    legendary: Trophy,
    mythic: Crown
};


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const XP_IMAGE = '/images/items/xp_bottle.webp';
const COIN_IMAGES = {
    bronze: '/images/killucoins/coin_cobre.webp',
    silver: '/images/killucoins/coin_plata.webp',
    gold: '/images/killucoins/coin_oro.webp',
    emerald: '/images/killucoins/coin_esmeralda.webp',
    diamond: '/images/killucoins/coin_diamante.webp',
    iridium: '/images/killucoins/coin_iridium.webp'
};

// Helper for Minecraft items (placeholder CDN or local path if they exist)
const getItemImg = (name: string) => {
    const n = name.toLowerCase();
    
    // Mapping item names to local filenames (prioritizing new improved webp assets)
    const itemMap: Record<string, string> = {
        'carbón': 'Coal_JE4_BE3.png',
        'cobre': 'Raw_Copper_JE3_BE2.png',
        'hierro': 'Iron_Ingot_JE3_BE2.png',
        'oro': 'Gold_Ingot_JE4_BE2.webp',
        'diamante': 'Diamond_JE3_BE3.png',
        'esmeralda': 'Emerald_JE3_BE3.png',
        'netherite lingote': 'Netherite_Ingot_JE1_BE2.png',
        'elytra': 'Elytra_JE2_BE2.png',
        'totem': 'Totem_of_Undying_JE2_BE2.png',
        'mending': 'enchanted_book.gif',
        'manzana dorada': 'Golden_Apple_JE2_BE2.png',
        'pico hierro': 'Iron_Pickaxe_JE3_BE2.png',
        'antorcha': 'Torch.webp',
        'filete': 'Steak_JE4_BE3.png',
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
        'xp': 'xp_bottle.webp',
        'pechera netherite': 'Netherite_Chestplate_JE2_BE1.png',
        'armadura netherite': 'Netherite_Chestplate_JE2_BE1.png',
        'silencio': 'Silence_Armor_Trim_Smithing_Template_JE1_BE1.png',
        'mejora netherite': 'Netherite_Upgrade_Smithing_Template_JE1_BE1.png',
        'pigstep': 'Music_Disc_Pigstep_JE1_BE1.png',
        'head': 'Wither_Skeleton_Skull_(S)_JE2.png',
        'wither': 'Wither_Skeleton_Skull_(S)_JE2.png',
        'dragon': 'Dragon_Head_(S)_JE1.png',
        'cabeza dragon': 'Dragon_Head_(S)_JE1.png',
        'capa': 'Elytra_JE2_BE2.png',
        'sniffer': 'Sniffer_Egg_(item)_JE1_BE1.png',
        'heavy core': 'Heavy_Core_JE1_BE1.png',
        'notch': 'Enchanted_Golden_Apple_JE2_BE2.gif',
        'zanahoria oro': 'Golden_Carrot_JE4_BE2.png'
    };

    for (const [key, filename] of Object.entries(itemMap)) {
        if (n.includes(key)) return `/images/items/${filename}`;
    }

    return null;
};



const GACHA_TIERS: GachaTier[] = [
    { 
        id: 'bronze', 
        name: 'BRONZE', 
        color: '#cd7f32', 
        icon: COIN_IMAGES.bronze,
        cost: 100,
        rewards: [
            { id: 'b_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', color: '#666666', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'b_xp', name: '150 XP', rarity: 'common', color: RARITY_COLORS.common, image_url: XP_IMAGE },
            { id: 'b_coal', name: '32x Carbón', rarity: 'common', color: RARITY_COLORS.common, image_url: getItemImg('carbón') },
            { id: 'b_copper', name: '16x Cobre', rarity: 'common', color: RARITY_COLORS.common, image_url: getItemImg('cobre') },
            { id: 'b_torch', name: '64x Antorchas', rarity: 'common', color: RARITY_COLORS.common, image_url: getItemImg('antorchas') },
            { id: 'b_steak', name: '16x Filetes', rarity: 'common', color: RARITY_COLORS.common, image_url: getItemImg('filetes') },
            { id: 'b_speed', name: '1x Velocidad I', rarity: 'rare', color: RARITY_COLORS.rare, image_url: getItemImg('velocidad') },
            { id: 'b_gold_jackpot', name: '¡JACKPOT DE ORO!', rarity: 'mythic', color: RARITY_COLORS.mythic, image_url: '/images/killucoins/coin_oro.webp' },
            { id: 'b_cons', name: '25 KilluCoins', rarity: 'common', color: RARITY_COLORS.common, image_url: COIN_IMAGES.bronze },
            { id: 'b_jackpot', name: '100 KilluCoins', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: COIN_IMAGES.bronze },
        ]
    },
    { 
        id: 'silver', 
        name: 'SILVER', 
        color: '#c0c0c0', 
        icon: COIN_IMAGES.silver,
        cost: 1000,
        rewards: [
            { id: 's_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', color: '#666666', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 's_xp', name: '400 XP', rarity: 'common', color: RARITY_COLORS.common, image_url: XP_IMAGE },
            { id: 's_iron', name: '16x Hierro', rarity: 'rare', color: RARITY_COLORS.rare, image_url: getItemImg('hierro') },
            { id: 's_lapis', name: '32x Lapislázuli', rarity: 'rare', color: RARITY_COLORS.rare, image_url: getItemImg('lapislázuli') },
            { id: 's_carrot', name: '16x Zanahorias de Oro', rarity: 'rare', color: RARITY_COLORS.rare, image_url: getItemImg('zanahoria oro') },
            { id: 's_gold', name: '4x Oro', rarity: 'rare', color: RARITY_COLORS.rare, image_url: getItemImg('oro') },
            { id: 's_upgrade', name: '1x Mejora de Netherite', rarity: 'epic', color: RARITY_COLORS.epic, image_url: getItemImg('mejora netherite') },
            { id: 's_pick', name: '1x Pico Hierro', rarity: 'rare', color: RARITY_COLORS.rare, image_url: getItemImg('pico hierro') },
            { id: 's_shield', name: '1x Escudo', rarity: 'rare', color: RARITY_COLORS.rare, image_url: getItemImg('escudo') },
            { id: 's_bucket', name: '1x Cubo Agua', rarity: 'rare', color: RARITY_COLORS.rare, image_url: getItemImg('cubo agua') },
            { id: 's_cons', name: '250 KilluCoins', rarity: 'rare', color: RARITY_COLORS.rare, image_url: COIN_IMAGES.silver },
            { id: 's_jackpot', name: '1.000 KilluCoins', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: COIN_IMAGES.silver },
        ]
    },
    { 
        id: 'gold', 
        name: 'GOLD', 
        color: '#ffd700', 
        icon: COIN_IMAGES.gold,
        cost: 10000,
        rewards: [
            { id: 'g_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', color: '#666666', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'g_xp', name: '1500 XP', rarity: 'rare', color: RARITY_COLORS.rare, image_url: XP_IMAGE },
            { id: 'g_gold', name: '12x Oro', rarity: 'epic', color: RARITY_COLORS.epic, image_url: getItemImg('oro') },
            { id: 'g_diamond', name: '3x Diamantes', rarity: 'epic', color: RARITY_COLORS.epic, image_url: getItemImg('diamante') },
            { id: 'g_pigstep', name: '1x Disco "Pigstep"', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('pigstep') },
            { id: 'g_wither', name: '3x Cráneos de Wither', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('wither') },
            { id: 'g_iblock', name: '1x Bloque Hierro', rarity: 'epic', color: RARITY_COLORS.epic, image_url: getItemImg('bloque hierro') },
            { id: 'g_totem', name: '1x Totem', rarity: 'epic', color: RARITY_COLORS.epic, image_url: getItemImg('totem') },
            { id: 'g_apple', name: '1x Manzana Dorada', rarity: 'epic', color: RARITY_COLORS.epic, image_url: getItemImg('manzana dorada') },
            { id: 'g_saddle', name: '1x Montura', rarity: 'epic', color: RARITY_COLORS.epic, image_url: getItemImg('montura') },
            { id: 'g_cons', name: '2.500 KilluCoins', rarity: 'epic', color: RARITY_COLORS.epic, image_url: COIN_IMAGES.gold },
            { id: 'g_jackpot', name: '10.000 KilluCoins', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: COIN_IMAGES.gold },
        ]
    },
    { 
        id: 'emerald', 
        name: 'EMERALD', 
        color: '#50c878', 
        icon: COIN_IMAGES.emerald,
        cost: 100000,
        rewards: [
            { id: 'e_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', color: '#666666', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'e_xp', name: '4000 XP', rarity: 'epic', color: RARITY_COLORS.epic, image_url: XP_IMAGE },
            { id: 'e_sniffer', name: '1x Huevo de Sniffer', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('sniffer') },
            { id: 'e_emerald', name: '16x Esmeraldas', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('esmeralda') },
            { id: 'e_dblock', name: '1x Bloque Diamante', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('bloque diamante') },
            { id: 'e_gblock', name: '1x Bloque Oro', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('bloque oro') },
            { id: 'e_mending', name: '1x Mending', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('mending') },
            { id: 'e_beacon', name: '1x Beacon', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('beacon') },
            { id: 'e_shulker_s', name: '1x Caparazón Shulker', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('caparazón shulker') },
            { id: 'e_cons', name: '25.000 KilluCoins', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: COIN_IMAGES.emerald },
            { id: 'e_jackpot', name: '100.000 KilluCoins', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: COIN_IMAGES.emerald },
        ]
    },
    { 
        id: 'diamond', 
        name: 'DIAMOND', 
        color: '#00f2ff', 
        icon: COIN_IMAGES.diamond,
        cost: 1000000,
        rewards: [
            { id: 'd_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', color: '#666666', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'd_xp', name: '10.000 XP', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: XP_IMAGE },
            { id: 'd_heavy', name: '1x Heavy Core', rarity: 'mythic', color: RARITY_COLORS.mythic, image_url: getItemImg('heavy core') },
            { id: 'd_notch', name: '1x Manzana Notch', rarity: 'mythic', color: RARITY_COLORS.mythic, image_url: getItemImg('notch') },
            { id: 'd_head', name: '1x Cabeza Dragon', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('cabeza dragon') },
            { id: 'd_silence', name: 'Plantilla Herrería Silencio', rarity: 'mythic', color: RARITY_COLORS.mythic, image_url: getItemImg('silencio') },
            { id: 'd_dblocks', name: '4x Bloques de Diamante', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('bloque diamante') },
            { id: 'd_scrap', name: '1x Netherite Scrap', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('netherite scrap') },
            { id: 'd_eblocks', name: '2x Bloque Esmeralda', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('bloque esmeralda') },
            { id: 'd_elytra', name: '1x Elytra', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('elytra') },
            { id: 'd_shulker_b', name: '1x Caja Shulker', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('caja shulker') },
            { id: 'd_cons', name: '250.000 KilluCoins', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: COIN_IMAGES.diamond },
            { id: 'd_jackpot', name: '1.000.000 KilluCoins', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: COIN_IMAGES.diamond },
        ]
    },
    { 
        id: 'iridium', 
        name: 'IRIDIUM', 
        color: '#b150b3', 
        icon: COIN_IMAGES.iridium,
        cost: 10000000,
        rewards: [
            { id: 'i_loss', name: '¡SUERTE PARA LA PRÓXIMA!', rarity: 'common', color: '#666666', image_url: '/images/items/Barrier_(held)_JE2_BE2.png' },
            { id: 'i_xp', name: '25000 XP', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: XP_IMAGE },
            { id: 'i_ingot', name: '1x Lingote Netherite', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('netherite lingote') },
            { id: 'i_scraps', name: '4x Netherite Scrap', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('netherite scrap') },
            { id: 'i_nblock', name: '1x Bloque Netherite', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('bloque netherite') },
            { id: 'i_trident', name: '1x Tridente', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('tridente') },
            { id: 'i_star', name: '1x Estrella Nether', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('estrella nether') },
            { id: 'i_armor', name: '1x Pechera Netherite', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: getItemImg('pechera netherite') },
            { id: 'i_cons', name: '2.500.000 KilluCoins', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: COIN_IMAGES.iridium },
            { id: 'i_jackpot', name: '10.000.000 KilluCoins', rarity: 'legendary', color: RARITY_COLORS.legendary, image_url: COIN_IMAGES.iridium },
        ]
    },
    { 
        id: 'ultra', 
        name: 'Ultra', 
        color: '#6366f1', 
        icon: '/images/killucoins/ultra_gen.webp',
        cost: 0,
        rewards: [
            { id: 'u_xp', name: '75.000 XP', rarity: 'legendary', color: '#ffaa00', image_url: XP_IMAGE },
            { id: 'u_gem', name: 'Ultra Gema (Evento)', rarity: 'legendary', color: '#ff00ff', image_url: '/images/killucoins/ultra_gen.webp' },
            { id: 'u_cloak', name: 'Capa Cósmica (Exclusivo)', rarity: 'legendary', color: '#6366f1', image_url: getItemImg('elytra') },
            { id: 'u_jackpot', name: '50.000.000 KC (JACKPOT)', rarity: 'legendary', color: '#ff0000', image_url: '/images/killucoins/ultra_gen.webp' }
        ]
    }
];

const formatCost = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(0) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
};

export const Gacha = () => {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();

    const userIsAdmin = useMemo(() => isAdmin(user), [user]);
    const userRole = useMemo(() => getUserRole(user), [user]);

    const [selectedTier, setSelectedTier] = useState<GachaTier>(GACHA_TIERS[0] as GachaTier);
    const [killuBalance, setKilluBalance] = useState(0);
    const [spinQuantity, setSpinQuantity] = useState(1);
    const [isOpening, setIsOpening] = useState(false);
    const [isLinked, setIsLinked] = useState(true);
    
    // States
    const [cooldowns] = useState<Record<string, boolean>>({});
    const [freeRolls] = useState<Record<string, boolean>>({});
    const [isDevMode, setIsDevMode] = useState(false);
    const [testForceResult, setTestForceResult] = useState<'random' | 'win' | 'loss'>('random');
    const [isRealConsumption, setIsRealConsumption] = useState(false);
    const [showBulkRewards, setShowBulkRewards] = useState(false);
    const [bulkRewards, setBulkRewards] = useState<MappedGachaResult[] | null>(null);
    
    // History State
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<GachaHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const devBarRef = useRef<HTMLDivElement>(null);
    
    // Type-safe refs for reels
    const reelRefs = useMemo(() => [
        createRef<HTMLDivElement>(), 
        createRef<HTMLDivElement>(), 
        createRef<HTMLDivElement>()
    ], []);

    const fetchLinkStatus = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.from('profiles').select('minecraft_nick, gacha_balance').eq('id', user.id).single();
            if (!error) {
                if (data.minecraft_nick) setIsLinked(true);
                if (data.gacha_balance !== undefined) setKilluBalance(Number(data.gacha_balance || 0));
            }
        } catch (e) { console.error(e); }
    }, [user]);

    useEffect(() => { if (userIsAdmin) fetchLinkStatus(); }, [fetchLinkStatus, userIsAdmin]);

    const [reelItemsSet, setReelItemsSet] = useState<(GachaReward | MappedGachaResult)[][]>([[], [], []]);

    const generateReels = useCallback(() => {
        if (!selectedTier) return [[], [], []];
        return [0, 1, 2].map(() => {
            const items = [];
            for (let i = 0; i < 60; i++) {
                items.push(selectedTier.rewards[Math.floor(Math.random() * selectedTier.rewards.length)]);
            }
            return items;
        });
    }, [selectedTier]);

    useEffect(() => {
        setReelItemsSet(generateReels());
    }, [generateReels]);

    const handleOpen = useCallback(async () => {
        if (!user || isOpening || !isLinked) return;
        const hasFreeRoll = !cooldowns[selectedTier.id] || freeRolls[selectedTier.id];
        const totalCost = hasFreeRoll ? selectedTier.cost * (spinQuantity - 1) : selectedTier.cost * spinQuantity;

        if (killuBalance < totalCost && selectedTier.id !== 'ultra') return;

        setIsOpening(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/gacha/roll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ 
                    userId: user.id, 
                    tierId: selectedTier.id, 
                    quantity: spinQuantity, 
                    testResult: userIsAdmin ? testForceResult : undefined,
                    isRealConsumption: userIsAdmin ? isRealConsumption : true
                })
            });
            const rollRes: RollResponse = await res.json();
            if (!rollRes.success) throw new Error(rollRes.code);

            const apiData = rollRes.data;
            const results: RawGachaResult[] = apiData && 'results' in apiData ? apiData.results : (apiData ? [apiData as RawGachaResult] : []);
            
            // Map results to the local reward objects to get image_url, color, etc.
            const mappedResults: MappedGachaResult[] = results.map((res) => {
                const found = selectedTier.rewards.find((r) => 
                    (res.reward_id && r.id === res.reward_id) || 
                    (res.id && r.id === res.id) || 
                    (res.name && r.name === res.name) || 
                    (res.name && r.name.includes(res.name))
                );
                
                if (found) {
                    return { 
                        ...res, 
                        ...found, 
                        name: res.reward_name || res.name || found.name,
                        image_url: found.image_url || res.image_url || '',
                        color: found.color || res.color || '#fff'
                    } as MappedGachaResult;
                }
                
                return { 
                    ...res, 
                    name: res.reward_name || res.name || 'Unknown Reward',
                    image_url: res.image_url || '', 
                    color: res.color || '#fff' 
                } as MappedGachaResult;
            });

            const animateSpin = (item: GachaReward | MappedGachaResult, isBulk: boolean) => {
                return new Promise<void>((resolve) => {
                    const runAnimation = async () => {
                        // Update reels for this specific roll
                        setReelItemsSet(prev => prev.map((reel) => {
                            const newReel = [...reel];
                            newReel[46] = item;
                            return newReel;
                        }));

                        // Small delay to ensure the DOM has the new item at index 46
                        await new Promise(r => setTimeout(r, 50));

                        const targetIdx = 45; 
                        const reelH = targetIdx * 160; 
                        const tl = gsap.timeline({ onComplete: resolve });

                        // Speed: Bulk = ~1.2s total, Single = ~4-6s total
                        const baseDuration = isBulk ? 0.8 : 4;
                        const stagger = isBulk ? 0.2 : 1;
                        const ease = isBulk ? "power2.inOut" : "power4.inOut";
                        
                        reelRefs.forEach((ref, i) => {
                            const currentReel = ref.current;
                            if (!currentReel) return;
                            gsap.set(currentReel, { y: 0 });
                            tl.to(currentReel, { 
                                y: -reelH, 
                                duration: baseDuration + (i * stagger), 
                                ease: ease 
                            }, 0);
                        });
                    };
                    runAnimation();
                });
            };

            // Run each animation in sequence
            for (let i = 0; i < mappedResults.length; i++) {
                const currentItem = mappedResults[i];
                await animateSpin(currentItem, mappedResults.length > 1);
                
                // Brief pause if not the last one
                if (i < mappedResults.length - 1) {
                    await new Promise(r => setTimeout(r, 100));
                }
            }
            
            setBulkRewards(mappedResults);
            setShowBulkRewards(true);
            setIsOpening(false);
            
            // Sync balance after roll
            fetchLinkStatus();
        } catch (e) { 
            console.error(e); 
            setIsOpening(false); 
        }
    }, [user, isOpening, isLinked, cooldowns, selectedTier, freeRolls, spinQuantity, killuBalance, userIsAdmin, testForceResult, isRealConsumption, reelRefs, fetchLinkStatus]);

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        setHistoryLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/gacha/history/${user.id}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            const data = await res.json();
            if (data.success) {
                setHistory(data.data || []);
            }
        } catch (e) {
            console.error('Error fetching history:', e);
        } finally {
            setHistoryLoading(false);
        }
    }, [user]);

    const handleOpenHistory = () => {
        setShowHistory(true);
        fetchHistory();
    };

    if (authLoading) return <div className="gacha-page"><Loader /></div>;
    if (!userIsAdmin && !isDevMode) return <GachaUnauthorized userRole={userRole || 'Guest'} />;

    return (
        <div className="gacha-page" ref={containerRef}>
            <div className="gacha-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
            </div>

            <div className="gacha-container">
                <GachaHeader 
                    canAccessDev={userIsAdmin} isDevMode={isDevMode} setIsDevMode={setIsDevMode}
                    testForceResult={testForceResult} setTestForceResult={setTestForceResult}
                    setIsRealConsumption={setIsRealConsumption}
                    isRealConsumption={isRealConsumption}
                    setKilluBalance={setKilluBalance}
                    devBarRef={devBarRef} GACHA_TIERS={GACHA_TIERS} selectedTier={selectedTier}
                    setSelectedTier={setSelectedTier} isOpening={isOpening}
                />
                <div className="tier-selector">
                    {GACHA_TIERS.map(tier => {
                        const isLocked = false; 
                        const hasFreeRoll = false; 
                        return (
                            <button 
                                key={tier.id} 
                                className={`tier-btn tier-btn-${tier.id} ${selectedTier.id === tier.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                onClick={() => !isOpening && !isLocked && setSelectedTier(tier)}
                                style={{ '--tier-color': tier.color } as React.CSSProperties}
                            >
                                <img src={tier.icon} alt={tier.name} className="tier-icon" />
                                <div className="tier-info">
                                    <span className="tier-label">{tier.name}</span>
                                    <div className="tier-value">
                                        {hasFreeRoll ? (
                                            <span className="free-roll-badge">{t('gacha.free_roll')}</span>
                                        ) : tier.id === 'ultra' ? (
                                            <span className="event-only-badge">{t('gacha.event_only')}</span>
                                        ) : (
                                            <>
                                                {formatCost(tier.cost)} 
                                            </>
                                        )}
                                    </div>
                                </div>
                                {isLocked && <Lock className="lock-icon" size={14} />}
                            </button>
                        );
                    })}
                </div>

                <div className="gacha-main">
                    <div className="gacha-decoration-left-placeholder">
                        <Gacha3DShowcase tierColor={selectedTier.color} />
                    </div>

                    <div className="gacha-game-layout">
                        <GachaMachine 
                            reelItemsSet={reelItemsSet} 
                            reelRefs={reelRefs as unknown as React.RefObject<HTMLDivElement>[]}
                            isOpening={isOpening} 
                            RARITY_ICONS={RARITY_ICONS}
                            selectedTier={selectedTier}
                        />

                        <GachaControls 
                            spinQuantity={spinQuantity} setSpinQuantity={setSpinQuantity}
                            isOpening={isOpening} selectedTier={selectedTier} killuBalance={killuBalance}
                            rollGacha={handleOpen} formatCost={formatCost}
                        />
                    </div>

                </div>
            </div>

            <GachaRewardsOverlay 
                showBulkRewards={showBulkRewards} bulkRewards={bulkRewards}
                selectedTier={selectedTier} setShowBulkRewards={setShowBulkRewards}
            />

            <GachaHistory 
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onOpen={handleOpenHistory}
                history={history}
                loading={historyLoading}
                RARITY_ICONS={RARITY_ICONS}
                RARITY_COLORS={RARITY_COLORS}
                tierColor={selectedTier.color}
            />
        </div>
    );
};

export default Gacha;
