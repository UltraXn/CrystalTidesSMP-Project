import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FaCoins, FaStar, FaGem, FaGift, FaLock, FaHistory, FaExclamationTriangle, FaClock, FaCheck } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { IconType } from 'react-icons';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/UI/Loader';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Gacha3DShowcase from '../components/Gacha/Gacha3DShowcase';
import { supabase } from '../services/supabaseClient';
import gsap from 'gsap';

interface Reward {
    id: string;
    name: string;
    rarity: string;
    color: string;
    type?: string;
}

const RARITY_COLORS: Record<string, string> = {
    common: '#b0c3d9',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000'
};

const RARITY_ICONS: Record<string, IconType> = {
    common: FaStar,
    rare: FaCoins,
    epic: FaGem,
    legendary: FaGift
};

interface GachaHistoryItem {
    id: string;
    reward_name: string;
    rarity: string;
    created_at: string;
}

const GACHA_TIERS = [
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
        color: '#6366f1', // Indigo/Blue-ish
        icon: '/images/ui/Killucoins/ultra_gen.webp',
        cost: 0,
        customModelData: 99999, // Custom logic case
        rewards: [
            { id: 'u1', name: 'Admin: Estructura Custom', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'u2', name: 'x5 Ultra Keys', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'u3', name: 'Mascota Exclusiva', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'u4', name: 'Capa Cosmética', rarity: 'legendary', color: RARITY_COLORS.legendary },
            { id: 'u5', name: 'Prestige XP Booster', rarity: 'legendary', color: RARITY_COLORS.legendary },
        ]
    }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const VISUAL_REWARDS = GACHA_TIERS[0].rewards; // Fallback

// Helper to format large numbers for the UI
const formatCost = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(0) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
};

export default function Gacha() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Restricted Access Check (Admins/Staff only for now)
    const allowedRoles = ['admin', 'neroferno', 'killu', 'helper', 'developer'];
    const isAdmin = allowedRoles.includes(user?.user_metadata?.role?.toLowerCase());

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [authLoading, isAdmin, navigate]);
    
    // Status
    const [isOpening, setIsOpening] = useState(false);
    const [reward, setReward] = useState<Reward | null>(null);
    const [history, setHistory] = useState<GachaHistoryItem[]>([]);
    const [cooldown, setCooldown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState(GACHA_TIERS[0]);
    const [linkingCode, setLinkingCode] = useState<string | null>(null);
    const [isLinked, setIsLinked] = useState(true);
    const [unlockedTiers, setUnlockedTiers] = useState<string[]>(['bronze']);
    const [killuBalance, setKilluBalance] = useState(0);
    const [freeRolls, setFreeRolls] = useState<Record<string, boolean>>({});

    // Milestone Check for Automatic Unlocks
    useEffect(() => {
        GACHA_TIERS.forEach(tier => {
            if (tier.id !== 'ultra' && killuBalance >= tier.cost && !unlockedTiers.includes(tier.id)) {
                setUnlockedTiers(prev => [...prev, tier.id]);
                setFreeRolls(prev => ({ ...prev, [tier.id]: true }));
                triggerConfetti('rare');
            }
        });
    }, [killuBalance, unlockedTiers]);

    // Refs for animations
    const containerRef = useRef<HTMLDivElement>(null);
    const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
    const rewardCardRef = useRef<HTMLDivElement>(null);

    // Link Status Sync
    const fetchLinkStatus = useCallback(async () => {
        if (!user) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/minecraft/link/check?userId=${user.id}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            const data = await res.json();
            if (data.linked) {
                setIsLinked(true);
                if (data.unlocked_tiers) {
                    setUnlockedTiers(data.unlocked_tiers.split(','));
                }
            }
        } catch (e) { console.error(e); }
    }, [user]);

    const generateLinkCode = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/minecraft/link/init`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ userId: user?.id })
            });
            const data = await res.json();
            if (data.success && data.code) {
                setLinkingCode(data.code);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (isAdmin) {
            // fetchLinkStatus(); // Disabled for now as per user request (no backend)
        }
    }, [fetchLinkStatus, isAdmin]);

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/gacha/history/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            if (res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        setHistory(data.data);
                        const lastRoll = data.data[0];
                        if (lastRoll) {
                            const lastDate = new Date(lastRoll.created_at);
                            const diff = Date.now() - lastDate.getTime();
                            if (diff < 24 * 60 * 60 * 1000) {
                                setCooldown(true);
                            }
                        }
                    }
                }
            }
        } catch (e) { console.error(e); }
    }, [user]);

    useEffect(() => {
        if (isAdmin) {
            fetchHistory();
        }
    }, [fetchHistory, isAdmin]);

    // Entrance Animation
    useEffect(() => {
        if (!authLoading && containerRef.current && isAdmin) {
            gsap.fromTo('.gacha-header > *', 
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, stagger: 0.2, duration: 1, ease: 'power3.out' }
            );
            gsap.fromTo('.slot-machine-container', 
                { opacity: 0, scale: 0.9, y: 30 },
                { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'back.out(1.7)', delay: 0.5 }
            );
        }
    }, [authLoading, isAdmin]);

    // Generate items for each reel (randomized for variety)
    const reelItemsSet = useMemo(() => {
        return [0, 1, 2].map(() => {
            const items = [];
            for (let i = 0; i < 60; i++) {
                items.push(selectedTier.rewards[Math.floor(Math.random() * selectedTier.rewards.length)]);
            }
            return items;
        });
    }, [selectedTier]);

    const handleOpen = async () => {
        if (!user || isOpening || cooldown || !isLinked) return;

        const hasFreeRoll = freeRolls[selectedTier.id];
        if (!hasFreeRoll && killuBalance < selectedTier.cost && selectedTier.id !== 'ultra') {
            setError('Saldo insuficiente para esta máquina.');
            return;
        }

        setIsOpening(true);
        setReward(null);
        setError(null);

        // ... animation logic stays the same ...
        // In the real app, the backend would handle this. 
        // For the mock, let's consume resources:
        if (hasFreeRoll) {
            setFreeRolls(prev => ({ ...prev, [selectedTier.id]: false }));
        } else if (selectedTier.id !== 'ultra') {
            setKilluBalance(prev => prev - selectedTier.cost);
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Subtle shake on the spin button
            gsap.to('.spin-btn', {
                x: "random(-2, 2)",
                duration: 0.1,
                repeat: 5,
                yoyo: true
            });

            const res = await fetch(`${API_URL}/gacha/roll`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ userId: user.id })
            });

            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                if (import.meta.env.DEV) {
                    console.warn("Backend not found, using MOCK logic");
                    const isWin = Math.random() > 0.3; // 70% win chance for testing
                    if (isWin) {
                        const winReward = selectedTier.rewards[Math.floor(Math.random() * selectedTier.rewards.length)];
                        data = {
                            success: true,
                            data: {
                                id: Date.now().toString(),
                                reward_id: winReward.id,
                                reward_name: winReward.name,
                                rarity: winReward.rarity,
                                created_at: new Date().toISOString()
                            }
                        };
                    } else {
                        data = { success: false, code: 'NO_WIN', message: '¡Casi! Inténtalo de nuevo' };
                    }
                } else {
                    const text = await res.text();
                    throw new Error(text || `Error ${res.status}`);
                }
            }

            // In our 3-reel logic, if success=false, we still "spin" to a loss position

            // Inject the final items at the stop position (45)
            reelItemsSet.forEach((reel, i) => {
                const targetReward = data.success 
                    ? VISUAL_REWARDS.find(r => r.name === data.data.reward_name) || VISUAL_REWARDS[0]
                    : VISUAL_REWARDS[(i + Math.floor(Math.random() * 5)) % VISUAL_REWARDS.length];
                
                reel[45] = targetReward;
            });

            // Reset track position
            reelRefs.forEach(ref => gsap.set(ref.current, { y: 0, filter: 'blur(0px)' }));

            const itemHeight = 160;
            const stopIndex = 45; 
            const offset = (stopIndex * itemHeight) - 80;

            const tl = gsap.timeline({
                onComplete: () => {
                    if (data.success) {
                        setReward(data.data);
                        triggerConfetti(data.data.rarity);
                        fetchHistory();
                        setTimeout(() => {
                            gsap.set(rewardCardRef.current, { display: 'flex' });
                            gsap.fromTo(rewardCardRef.current, 
                                { scale: 0, rotationY: 180, opacity: 0 },
                                { scale: 1, rotationY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
                            );
                        }, 500);
                    } else {
                        setError(data.message || 'No has ganado esta vez');
                        // Reset opening state after animation
                        setIsOpening(false);
                    }
                    if (data.success) setIsOpening(false);
                }
            });

            reelRefs.forEach((ref, i) => {
                tl.to(ref.current, {
                    y: -offset,
                    duration: 4 + (i * 1), // Staggered stops
                    ease: "power4.inOut",
                    onUpdate: function() {
                        const vel = Math.abs(gsap.getProperty(this.targets()[0], "y") as number);
                        gsap.set(this.targets()[0], { filter: `blur(${Math.min(vel/100, 4)}px)` });
                    },
                    onComplete: () => {
                        gsap.set(ref.current, { filter: 'blur(0px)' });
                    }
                }, 0);
            });

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError(errorMsg);
            setIsOpening(false);
        }
    };

    const triggerConfetti = (rarity: string) => {
        const defaults = { origin: { y: 0.7 }, zIndex: 10000 };
        if (rarity === 'legendary') {
            confetti({ ...defaults, particleCount: 150, spread: 100, colors: ['#ff8000', '#ffffff', '#ffd700'] });
        } else if (rarity === 'epic') {
            confetti({ ...defaults, particleCount: 80, spread: 70, colors: ['#a335ee', '#ffffff'] });
        } else {
            confetti({ ...defaults, particleCount: 40, spread: 50 });
        }
    };

    if (authLoading) return <div className="gacha-page"><Loader /></div>;
    if (!isAdmin) return null; // Logic handled by useEffect redirect

    return (
        <div className="gacha-page" ref={containerRef}>
            <div className="gacha-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
            </div>

            <div className="gacha-container">
                <header className="gacha-header">
                    <span className="gacha-badge"><FaStar /> CRYSTAL SLOT</span>
                    <div className="balance-display" onClick={() => setKilluBalance(prev => prev + 100000)}>
                        <FaCoins /> {killuBalance.toLocaleString()} <span>KC</span>
                    </div>
                    <h1>{t('gacha.hero_title')}</h1>
                    <p>{t('gacha.hero_subtitle')}</p>
                </header>

                <div className="gacha-main">
                    {!isLinked ? (
                        <div className="link-bridge-panel">
                            <FaExclamationTriangle size={48} color="#f59e0b" />
                            <div className="link-content">
                                <h3>{t('gacha.account_not_linked')}</h3>
                                <p>Para jugar en el Crystal Slot y sincronizar tus recompensas, debes conectar tu cuenta de Minecraft o Discord.</p>
                            </div>
                            
                            {!linkingCode ? (
                                <button className="btn-link-minecraft" onClick={generateLinkCode}>
                                    Generar Código de Vinculación
                                </button>
                            ) : (
                                <div className="link-code-box">
                                    <span>Tu código universal:</span>
                                    <div className="link-code-display">{linkingCode}</div>
                                    <p className="code-hint">Úsalo en Minecraft con `/link` o en Discord.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="tier-selector">
                                    {GACHA_TIERS.map((tier) => {
                                        const isLocked = !unlockedTiers.includes(tier.id);
                                        return (
                                    <button
                                        key={tier.id}
                                        className={`tier-btn tier-btn-${tier.id} ${selectedTier.id === tier.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                        onClick={() => !isOpening && !isLocked && setSelectedTier(tier)}
                                        style={{ '--tier-color': tier.color } as React.CSSProperties}
                                    >
                                        <img src={tier.icon} alt={tier.name} className="tier-icon" />
                                        <div className="tier-info">
                                            <span className="tier-name">{tier.name}</span>
                                            <span className="tier-cost">
                                                {freeRolls[tier.id] ? (
                                                    <span className="free-roll-badge">TIRADA GRATIS!</span>
                                                ) : tier.id === 'ultra' ? (
                                                    <span className="event-only-badge">EVENTO</span>
                                                ) : (
                                                    <>
                                                        {formatCost(tier.cost)} 
                                                        <span>KilluCoins</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                        {isLocked && <FaLock className="lock-icon" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {isLinked && (
                        <div className="gacha-game-layout">
                            <Gacha3DShowcase 
                                tierColor={selectedTier.color} 
                            />
                            
                            <div className="slot-machine-wrapper">
                                <div className="slot-machine-case">
                                    <div className="slot-machine-lights left">
                                        {[...Array(8)].map((_, i) => <div key={i} className={`led ${isOpening ? 'animating' : ''}`}></div>)}
                                    </div>
                                    <div className="slot-machine-container">
                                        <div className="slot-glass-reflection"></div>
                                        <div className="slot-selector"></div>
                                        <div className="slot-reels-container">
                                            {reelItemsSet.map((items, reelIdx) => (
                                                <div key={reelIdx} className="slot-reel" ref={reelRefs[reelIdx]}>
                                                    {items.map((item, i) => (
                                                        <div key={i} className={`slot-item rarity-${item.rarity}`}>
                                                            <div className="item-icon-wrapper" style={{ color: item.color }}>
                                                                {(() => {
                                                                    const Icon = RARITY_ICONS[item.rarity] || FaStar;
                                                                    return <Icon />;
                                                                })()}
                                                            </div>
                                                            <span className="item-name">{item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="slot-machine-lights right">
                                        {[...Array(8)].map((_, i) => <div key={i} className={`led ${isOpening ? 'animating' : ''}`}></div>)}
                                    </div>
                                </div>

                                <div className="slot-controls">
                                    <div className="lever-base">
                                        <button 
                                            className={`spin-btn ${isOpening || cooldown ? 'disabled' : ''}`}
                                            onClick={handleOpen}
                                            disabled={isOpening || cooldown}
                                        >
                                            {isOpening ? (
                                                <span className="loading-dots">{t('gacha.opening')}</span>
                                            ) : cooldown ? (
                                                t('gacha.btn_cooldown')
                                            ) : (
                                                <><FaCoins /> {t('gacha.btn_roll')}</>
                                            )}
                                        </button>
                                    </div>
                                    {cooldown && !isOpening && (
                                        <div className="cooldown-notice">
                                            <FaClock /> {t('gacha.vuelve_mañana')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <div className="gacha-error"><FaExclamationTriangle /> {error}</div>}
                </div>

                {/* Winner Card */}
                {reward && (
                    <div className="reward-overlay" ref={rewardCardRef} style={{ display: 'none' }}>
                        <div className={`reward-card rarity-${reward.rarity} tier-reward-${selectedTier.id}`}>
                            <div className="reward-shine"></div>
                            <div className="reward-rarity">{reward.rarity.toUpperCase()}</div>
                            <div className="reward-icon">
                                {(() => {
                                    const Icon = RARITY_ICONS[reward.rarity] || FaStar;
                                    return <Icon />;
                                })()}
                            </div>
                            <h3>{reward.name}</h3>
                            <p>{t('gacha.reward_delivered')}</p>
                            <button className="reward-close-btn" onClick={() => { setReward(null); setIsOpening(false); }}>
                                {t('gacha.claim_btn')} <FaCheck />
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Rewards Grid View for Selected Tier */}
                <div className="reward-list">
                    <h3>{t('gacha.possible_rewards')}</h3>
                    <div className="rewards-grid">
                        {selectedTier.rewards.map(r => (
                             <div key={r.id} className={`reward-grid-item rarity-${r.rarity}`}>
                                <div className="r-icon">
                                    {(() => {
                                        const Icon = RARITY_ICONS[r.rarity] || FaStar;
                                        return <Icon />;
                                    })()}
                                </div>
                                <span>{r.name}</span>
                             </div>
                        ))}
                    </div>
                </div>

                {/* History Drawer */}
                <div className={`history-drawer ${isHistoryOpen ? 'open' : ''}`}>
                    <button className="history-toggle" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
                        <FaHistory /> {t('gacha.history_btn')}
                    </button>
                    <div className="history-content">
                        {history.length > 0 ? (
                            history.map(item => (
                                <div key={item.id} className="history-item">
                                    <div className={`rarity-dot rarity-${item.rarity}`}></div>
                                    <div className="h-info">
                                        <div className="h-name">{item.reward_name}</div>
                                        <div className="h-date">{new Date(item.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-history">{t('gacha.no_history')}</p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .gacha-page {
                    min-height: 100vh;
                    position: relative;
                    padding: 80px 20px;
                    display: flex;
                    justify-content: center;
                    color: #fff;
                    overflow: hidden;
                    font-family: 'Outfit', sans-serif;
                }
                .gacha-background {
                    position: fixed;
                    inset: 0;
                    background: #050508;
                    z-index: -1;
                }
                .gradient-sphere {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.15;
                }
                .sphere-1 { top: -100px; right: -100px; background: #8b5cf6; }
                .sphere-2 { bottom: -100px; left: -100px; background: #0ea5e9; }

                .gacha-container {
                    width: 100%;
                    max-width: 1000px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 1;
                }

                .gacha-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .gacha-badge {
                    background: rgba(139, 92, 246, 0.1);
                    color: #a78bfa;
                    padding: 6px 16px;
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 1.5rem;
                }
                .gacha-header h1 {
                    font-size: 4rem;
                    font-weight: 950;
                    margin: 0;
                    background: linear-gradient(to bottom, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -2px;
                    text-transform: uppercase;
                }
                .gacha-header p {
                    color: #94a3b8;
                    font-size: 1.2rem;
                    margin-top: 1rem;
                    max-width: 600px;
                }

                /* Tier Selector */
                .tier-selector {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 1rem;
                }

                .tier-btn {
                    padding: 0.8rem 1.2rem;
                    background: rgba(15, 15, 25, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 14px;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(12px);
                    text-align: left;
                }
                
                .tier-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .tier-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: var(--tier-color);
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 0;
                }

                .tier-btn.active {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--tier-color);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(var(--tier-color-rgb, 139, 92, 246), 0.2);
                }

                .tier-btn.active::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: var(--tier-color);
                    box-shadow: 2px 0 10px var(--tier-color);
                }

                .tier-btn-ultra {
                    background: linear-gradient(to top, rgba(0, 100, 255, 0.1), rgba(150, 0, 255, 0.1), rgba(0, 0, 0, 0.8)) !important;
                    border: 1px solid rgba(100, 100, 255, 0.3) !important;
                    box-shadow: 0 0 20px rgba(100, 100, 255, 0.1);
                    animation: ultra-glow-new 3s infinite alternate;
                }

                @keyframes ultra-glow-new {
                    from { box-shadow: 0 0 10px rgba(0, 150, 255, 0.1); border-color: rgba(100, 100, 255, 0.3); }
                    to { box-shadow: 0 0 25px rgba(150, 0, 255, 0.3); border-color: rgba(200, 100, 255, 0.5); }
                }

                .tier-btn-ultra.active {
                    background: linear-gradient(to top, rgba(0, 50, 200, 0.4), rgba(100, 0, 200, 0.4), rgba(0, 0, 0, 0.9)) !important;
                    border-color: #8b5cf6 !important;
                    transform: scale(1.05) translateY(-5px);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.4) !important;
                }

                .tier-btn-ultra .tier-icon {
                    filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.8));
                    animation: icon-pulse-new 2s infinite ease-in-out;
                    position: relative;
                    z-index: 2;
                }

                .tier-btn-ultra::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 20%;
                    width: 40px;
                    height: 40px;
                    background: radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%);
                    transform: translate(-50%, -50%);
                    filter: blur(10px);
                    animation: aura-pulse 3s infinite alternate;
                    z-index: 1;
                }

                @keyframes aura-pulse {
                    from { transform: translate(-50%, -50%) scale(0.98); opacity: 0.5; }
                    to { transform: translate(-50%, -50%) scale(1.05); opacity: 0.7; }
                }

                @keyframes icon-pulse-new {
                    0% { transform: scale(1); filter: drop-shadow(0 0 5px #6366f1); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 20px #a855f7); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 5px #6366f1); }
                }

                .free-roll-badge {
                    background: #22c55e;
                    color: #fff;
                    font-size: 0.6rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 900;
                    letter-spacing: 0.5px;
                    animation: pulse-green 1.5s infinite;
                }

                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                .event-only-badge {
                    background: #ffd700;
                    color: #000;
                    font-size: 0.6rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 900;
                    letter-spacing: 1px;
                }

                .tier-btn-iridium.active {
                    background: linear-gradient(135deg, rgba(177, 80, 179, 0.2), rgba(66, 14, 151, 0.4)) !important;
                    border-color: #b150b3 !important;
                    box-shadow: 0 0 20px rgba(177, 80, 179, 0.3), inset 0 0 15px rgba(66, 14, 151, 0.5);
                }

                .tier-reward-iridium {
                    background: linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 100%) !important;
                    border: 2px solid #b150b3 !important;
                    box-shadow: 0 0 50px rgba(177, 80, 179, 0.4), inset 0 0 30px rgba(66, 14, 151, 0.3) !important;
                }

                .tier-reward-iridium .reward-shine {
                    background: radial-gradient(circle, #b150b3 0%, #420e97 70%) !important;
                    opacity: 0.6 !important;
                }

                .balance-display {
                    background: rgba(255, 215, 0, 0.1);
                    border: 1px solid rgba(255, 215, 0, 0.2);
                    padding: 8px 16px;
                    border-radius: 100px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #ffd700;
                    font-weight: 700;
                    font-family: monospace;
                    cursor: pointer;
                    margin-bottom: 1rem;
                    transition: all 0.3s;
                }

                .balance-display:hover {
                    background: rgba(255, 215, 0, 0.2);
                    transform: scale(1.05);
                }

                .balance-display span {
                    font-size: 0.7rem;
                    opacity: 0.7;
                }

                .tier-icon {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                    filter: drop-shadow(0 0 10px rgba(var(--tier-color-rgb, 255, 255, 255), 0.3));
                    transition: transform 0.4s;
                }

                .tier-btn:hover .tier-icon {
                    transform: scale(1.1) rotate(8deg);
                }

                .tier-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .tier-btn-ultra .tier-info {
                    align-items: flex-start;
                    margin-left: 1rem;
                }

                .tier-name {
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    color: #94a3b8;
                    text-transform: uppercase;
                }

                .tier-cost {
                    font-size: 1.1rem;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                }

                .tier-cost span {
                    font-size: 0.7rem;
                    font-weight: 500;
                    color: #64748b;
                }

                .slot-machine-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3rem;
                    flex: 1;
                }

                .gacha-game-layout {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4rem;
                    width: 100%;
                    max-width: 1200px;
                    margin: 2rem auto;
                    flex-wrap: wrap;
                }

                .tier-btn.locked {
                    filter: grayscale(1) opacity(0.5);
                    cursor: not-allowed;
                    border-color: rgba(255, 255, 255, 0.02);
                }

                .lock-icon {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .link-bridge-panel {
                    background: rgba(139, 92, 246, 0.05);
                    border: 2px dashed rgba(139, 92, 246, 0.2);
                    border-radius: 20px;
                    padding: 3rem;
                    text-align: center;
                    width: 100%;
                    max-width: 700px;
                    margin: 0 auto 3rem;
                    backdrop-filter: blur(10px);
                }

                .link-content h3 {
                    font-size: 1.8rem;
                    margin: 1rem 0 0.5rem;
                    color: #fff;
                }

                .link-content p {
                    color: #94a3b8;
                    margin-bottom: 2rem;
                }

                .link-code-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 2rem;
                    background: rgba(0,0,0,0.2);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .link-code-box span {
                    font-size: 0.9rem;
                    color: #a78bfa;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 700;
                }

                .link-code-display {
                    font-size: 3rem;
                    font-weight: 900;
                    letter-spacing: 0.5rem;
                    color: #fff;
                    font-family: 'JetBrains Mono', monospace;
                    text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
                }

                .code-hint {
                    font-size: 0.8rem;
                    color: #64748b;
                }
                .slot-machine-case {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
                    padding: 2rem;
                    border-radius: 40px;
                    border: 4px solid #2a2a4a;
                    box-shadow: 
                        0 20px 50px rgba(0,0,0,0.5),
                        inset 0 0 20px rgba(139, 92, 246, 0.2);
                    position: relative;
                }

                .roulette-track {
                    display: flex;
                    gap: 12px;
                    padding: 0 50%;
                }

                .roulette-item {
                    min-width: 150px;
                    height: 180px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: transform 0.3s;
                }

                .roulette-selector {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 50%;
                    width: 2px;
                    background: #8b5cf6;
                    z-index: 10;
                    transform: translateX(-50%);
                    box-shadow: 0 0 20px #8b5cf6;
                }
                .roulette-selector::after {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 10px solid #8b5cf6;
                }

                .spin-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .spin-btn {
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 1.2rem 4rem;
                    font-size: 1.3rem;
                    font-weight: 900;
                    border-radius: 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 10px 30px rgba(255,255,255,0.1);
                    text-transform: uppercase;
                }
                .spin-btn:hover:not(:disabled) {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(255,255,255,0.2);
                }
                .spin-btn.disabled {
                    background: #1e293b;
                    color: #64748b;
                    cursor: not-allowed;
                }

                .cooldown-notice {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #ef4444;
                    font-weight: 700;
                    font-size: 0.9rem;
                    background: rgba(239, 68, 68, 0.1);
                    padding: 8px 16px;
                    border-radius: 8px;
                }

                .item-icon-wrapper { font-size: 3rem; filter: drop-shadow(0 0 10px currentColor); }
                .item-name { font-size: 0.9rem; font-weight: 800; color: #fff; }

                .reward-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .slot-machine-container {
                    width: 500px;
                    height: 480px;
                    background: #050508;
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                    border: 2px solid rgba(255,255,255,0.05);
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.9);
                }

                .slot-reels-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    height: 100%;
                    gap: 5px;
                    padding: 0 10px;
                }

                .slot-glass-reflection {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%);
                    pointer-events: none;
                }
                .reward-card {
                    background: #0f172a;
                    width: 380px;
                    padding: 3rem;
                    border-radius: 32px;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                }
                .reward-rarity {
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 3px;
                    margin-bottom: 2rem;
                }
                .reward-icon {
                    font-size: 5rem;
                    margin-bottom: 2rem;
                    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
                }
                .reward-card h3 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 1rem 0;
                }
                .reward-card p {
                    color: #94a3b8;
                    margin-bottom: 2.5rem;
                }
                .reward-close-btn {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 1rem;
                    border-radius: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .reward-close-btn:hover {
                    background: #fff;
                    color: #000;
                }

                .rarity-common .reward-icon, .rarity-common .reward-rarity { color: #b0c3d9; }
                .rarity-rare .reward-icon, .rarity-rare .reward-rarity { color: #0070dd; }
                .rarity-epic .reward-icon, .rarity-epic .reward-rarity { color: #a335ee; }
                .rarity-legendary .reward-icon, .rarity-legendary .reward-rarity { color: #ff8000; }

                .history-drawer {
                    position: fixed;
                    right: -320px;
                    top: 0;
                    bottom: 0;
                    width: 320px;
                    background: #0a0a0f;
                    border-left: 1px solid rgba(255,255,255,0.05);
                    transition: right 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    z-index: 500;
                    padding: 120px 2rem 2rem;
                }
                .history-drawer.open { right: 0; }
                .history-toggle {
                    position: absolute;
                    left: -130px;
                    top: 150px;
                    background: #0a0a0f;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-right: none;
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 12px 0 0 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                }

                .history-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                    margin-bottom: 0.8rem;
                }
                .rarity-dot { width: 8px; height: 8px; border-radius: 50%; }
                .h-name { font-size: 0.9rem; font-weight: 600; }
                .h-date { font-size: 0.75rem; color: #555; }

                .reward-list { width: 100%; margin-top: 4rem; }
                .reward-list h3 { text-align: center; color: #64748b; font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2rem; }
                .rewards-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
                    gap: 1rem;
                    padding: 0 1rem;
                }
                .reward-grid-item {
                    background: rgba(255,255,255,0.02);
                    padding: 1.5rem;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    border: 1px solid rgba(255,255,255,0.03);
                    filter: grayscale(0.5);
                    transition: all 0.3s;
                }
                .reward-grid-item:hover { filter: grayscale(0); background: rgba(255,255,255,0.05); }
                .reward-grid-item .r-icon { font-size: 1.5rem; }
                .reward-grid-item span { font-size: 0.8rem; font-weight: 600; color: #94a3b8; }

                .link-warning {
                    background: rgba(245, 158, 11, 0.05);
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    padding: 3rem;
                    border-radius: 24px;
                    text-align: center;
                    max-width: 500px;
                    color: #f59e0b;
                }
                .link-warning h3 { font-size: 1.5rem; margin: 1rem 0; }
                .link-warning p { color: #d97706; margin-bottom: 2rem; line-height: 1.6; }
                .btn-link-minecraft {
                    display: inline-block;
                    background: #f59e0b;
                    color: #000;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-weight: 800;
                    text-decoration: none;
                    transition: transform 0.2s;
                }
                .btn-link-minecraft:hover { transform: translateY(-3px); }

                @media (max-width: 768px) {
                    .gacha-header h1 { font-size: 2.5rem; }
                    .history-drawer { width: 100%; right: -100%; }
                    .history-toggle { left: auto; right: 20px; top: 20px; border-radius: 12px; }
                }
            `}</style>
        </div>
    );
}
