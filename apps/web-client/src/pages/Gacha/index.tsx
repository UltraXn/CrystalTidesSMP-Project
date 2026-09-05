import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Lock, Gem, Trophy, Crown, Sparkles } from 'lucide-react';
import gsap from 'gsap';

import './GachaStyles.css';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { User } from '@supabase/supabase-js';
import Loader from '../../components/UI/Loader';
import { isAdmin } from '../../utils/roleUtils';

import { GachaUnauthorized } from './GachaUnauthorized';
import { GachaHeader } from './GachaHeader';
import { GachaMachine } from './GachaMachine';
import { GachaControls } from './GachaControls';
import { GachaRewardsOverlay } from './GachaRewardsOverlay';
import { GachaHistory } from './GachaHistory';
import Gacha3DShowcase from '../../components/Gacha/Gacha3DShowcase';
import {
    GACHA_SPIN_DURATIONS,
    GACHA_SPIN_TARGET_INDEX,
    reelsToImageStrips,
    type GachaSpinSync,
} from '../../components/Gacha/gachaSpinSync';

import {
    GachaReward,
    RawGachaResult,
    MappedGachaResult,
    GachaHistoryEntry,
    GachaTier,
    RollResponse,
} from './types';
import {
    DISPLAY_GACHA_TIERS,
    SHARED_TIERS,
    computeRarityRates,
    type GachaStatusResponse,
} from './gachaDisplayUtils';

const RARITY_COLORS: Record<string, string> = {
    common: '#b0c3d9',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000',
    mythic: '#ffcc00',
};

const RARITY_ICONS: Record<string, React.ElementType> = {
    common: Star,
    rare: Sparkles,
    epic: Gem,
    legendary: Trophy,
    mythic: Crown,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const EVENT_ONLY_TIERS = new Set(['ultra']);

const formatCost = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(0) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
};

export const Gacha = () => {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const [mockUser, setMockUser] = useState<User | null>(null);

    const activeUser = user || mockUser;
    const userIsAdmin = useMemo(() => isAdmin(activeUser), [activeUser]);

    const [selectedTier, setSelectedTier] = useState<GachaTier>(DISPLAY_GACHA_TIERS[0]);
    const [killuBalance, setKilluBalance] = useState(0);
    const [isOpening, setIsOpening] = useState(false);
    const [isCelebrating, setIsCelebrating] = useState(false);
    const [isLinked, setIsLinked] = useState(true);
    const [tierStatus, setTierStatus] = useState<GachaStatusResponse['tiers']>({});
    const [unlockedTiers, setUnlockedTiers] = useState<string[]>([]);
    const [devOptions, setDevOptions] = useState<{ isDevMode: boolean; testForceResult: 'random' | 'win' | 'loss'; forceDeduction: boolean }>({
        isDevMode: false,
        testForceResult: 'random',
        forceDeduction: false
    });
    const { isDevMode, testForceResult, forceDeduction } = devOptions;
    const setIsDevMode = (val: boolean | ((prev: boolean) => boolean)) => 
        setDevOptions(prev => ({ ...prev, isDevMode: typeof val === 'function' ? val(prev.isDevMode) : val }));
    const setTestForceResult = (val: 'random' | 'win' | 'loss') => 
        setDevOptions(prev => ({ ...prev, testForceResult: val }));
    const setForceDeduction = (val: boolean | ((prev: boolean) => boolean)) => 
        setDevOptions(prev => ({ ...prev, forceDeduction: typeof val === 'function' ? val(prev.forceDeduction) : val }));
    const [showBulkRewards, setShowBulkRewards] = useState(false);
    const [bulkRewards, setBulkRewards] = useState<MappedGachaResult[] | null>(null);
    const [history, setHistory] = useState<GachaHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const devBarRef = useRef<HTMLDivElement>(null);
    const reelRef0 = useRef<HTMLDivElement>(null);
    const reelRef1 = useRef<HTMLDivElement>(null);
    const reelRef2 = useRef<HTMLDivElement>(null);
    const reelRefs = useMemo(
        () => [reelRef0, reelRef1, reelRef2],
        []
    );

    const fetchGachaStatus = useCallback(async () => {
        if (!activeUser) return;

        if (activeUser.id.startsWith('mock-')) {
            setIsLinked(true);
            setKilluBalance((prev) => (prev === 0 ? 50000 : prev));
            setTierStatus({
                standard: { hasFreeRoll: false, cooldownHours: 0 },
                premium: { hasFreeRoll: false, cooldownHours: 0 },
                epic: { hasFreeRoll: false, cooldownHours: 0 },
                ultra: { hasFreeRoll: false, cooldownHours: 0 },
            });
            setUnlockedTiers(['ultra']);
            return;
        }

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('minecraft_nick')
                .eq('id', activeUser.id)
                .single();

            setIsLinked(Boolean(profile?.minecraft_nick));

            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/gacha/status/${activeUser.id}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (!res.ok) return;
            const json = await res.json();

            if (json.success && json.data) {
                const status = json.data as GachaStatusResponse;
                setKilluBalance(Number(status.balance ?? 0));
                setTierStatus(status.tiers ?? {});
                setUnlockedTiers(status.unlockedTiers ?? []);
            }
        } catch (e) {
            console.error(e);
        }
    }, [activeUser]);

    const handleAddFunds = useCallback(async (amount: number) => {
        if (!activeUser) return;

        if (activeUser.id.startsWith('mock-')) {
            setKilluBalance((prev) => prev + amount);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/gacha/add-funds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ amount }),
            });
            if (!res.ok) return;
            const json = await res.json();

            if (json.success && json.data) {
                const status = json.data as GachaStatusResponse;
                setKilluBalance(Number(status.balance ?? 0));
                setTierStatus(status.tiers ?? {});
                setUnlockedTiers(status.unlockedTiers ?? []);
            }
        } catch (e) {
            console.error('[AddFunds] Error:', e);
        }
    }, [activeUser]);

    useEffect(() => {
        fetchGachaStatus();
    }, [fetchGachaStatus]);

    const generateReelsForTier = useCallback((tier: GachaTier) => {
        if (!tier || !tier.rewards || tier.rewards.length === 0) return [[], [], []];
        return [0, 1, 2].map(() => {
            const items = [];
            for (let i = 0; i < 60; i++) {
                items.push(tier.rewards[Math.floor(Math.random() * tier.rewards.length)]);
            }
            return items;
        });
    }, []);

    const generateReels = useCallback(() => {
        return generateReelsForTier(selectedTier);
    }, [generateReelsForTier, selectedTier]);

    const [reelItemsSet, setReelItemsSet] = useState<(GachaReward | MappedGachaResult)[][]>(() =>
        generateReelsForTier(DISPLAY_GACHA_TIERS[0])
    );
    const [spinSync, setSpinSync] = useState<GachaSpinSync | null>(null);
    const spinIdRef = useRef(0);

    useEffect(() => {
        setReelItemsSet(generateReels());
    }, [generateReels]);

    const rarityRates = useMemo(() => {
        const tierRewards = SHARED_TIERS.find((t) => t.id === selectedTier.id)?.rewards ?? [];
        return computeRarityRates(
            tierRewards.map((r) => ({
                id: r.id,
                name: r.name,
                rarity: r.rarity,
                chance: r.chance,
                value: r.value,
            }))
        );
    }, [selectedTier.id]);

    const fetchHistory = useCallback(async () => {
        if (!activeUser) return;

        if (activeUser.id.startsWith('mock-')) {
            setHistory((currentHistory) => {
                if (currentHistory.length > 0) return currentHistory;
                return Array.from({ length: 5 }, (_, i) => {
                    const randomReward =
                        selectedTier.rewards[Math.floor(Math.random() * selectedTier.rewards.length)];
                    return {
                        id: `mock-history-seed-${i}`,
                        reward_id: randomReward.id,
                        reward_name: randomReward.name,
                        rarity: randomReward.rarity,
                        created_at: new Date(Date.now() - i * 3600000).toISOString(),
                        image_url: randomReward.image_url || undefined,
                    };
                });
            });
            return;
        }

        setHistoryLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/gacha/history/${activeUser.id}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            const data = await res.json();
            if (data.success) {
                setHistory(data.data || []);
            }
        } catch (e) {
            console.error('Error fetching history:', e);
        } finally {
            setHistoryLoading(false);
        }
    }, [activeUser, selectedTier]);

    useEffect(() => {
        if (activeUser) fetchHistory();
    }, [activeUser, fetchHistory]);

    const hasFreeRollForTier = tierStatus[selectedTier.id]?.hasFreeRoll ?? false;

    const handleOpen = useCallback(async (qty: number) => {
        if (!activeUser || isOpening || !isLinked) return;

        const isTierLocked =
            EVENT_ONLY_TIERS.has(selectedTier.id) &&
            !userIsAdmin &&
            !unlockedTiers.includes(selectedTier.id);

        if (isTierLocked) return;

        const totalCost = hasFreeRollForTier
            ? selectedTier.cost * (qty - 1)
            : selectedTier.cost * qty;

        if (killuBalance < totalCost && selectedTier.id !== 'ultra') return;

        setIsOpening(true);

        const animateSpin = (item: GachaReward | MappedGachaResult, isBulk: boolean) => {
            return new Promise<void>((resolve) => {
                const runAnimation = async () => {
                    const durations = isBulk ? GACHA_SPIN_DURATIONS.bulk : GACHA_SPIN_DURATIONS.single;
                    const ease = isBulk ? 'power2.inOut' : 'power4.inOut';

                    const nextReels = reelItemsSet.map((reel) => {
                        const newReel = [...reel];
                        newReel[46] = item;
                        return newReel;
                    });
                    setReelItemsSet(nextReels);

                    await new Promise((r) => setTimeout(r, 50));

                    setSpinSync({
                        id: ++spinIdRef.current,
                        durations: [...durations],
                        strips: reelsToImageStrips(nextReels),
                        ease,
                    });

                    const targetIdx = GACHA_SPIN_TARGET_INDEX;
                    const reelH = targetIdx * 160;
                    const tl = gsap.timeline({
                        onComplete: () => {
                            setIsCelebrating(true);
                            window.setTimeout(() => setIsCelebrating(false), 2200);
                            resolve();
                        },
                    });

                    const baseDuration = durations[0];
                    const stagger = isBulk ? 0.2 : 1;

                    reelRefs.forEach((ref, i) => {
                        const currentReel = ref.current;
                        if (!currentReel) return;
                        gsap.set(currentReel, { y: 0 });
                        tl.to(
                            currentReel,
                            {
                                y: -reelH,
                                duration: baseDuration + i * stagger,
                                ease,
                            },
                            0
                        );
                    });
                };
                runAnimation();
            });
        };

        // Mock bypass
        if (activeUser.id.startsWith('mock-')) {
            try {
                // Simulate delay
                await new Promise((r) => setTimeout(r, 800));

                // Deduct balance
                setKilluBalance((prev) => prev - totalCost);

                // Generate mock rewards based on active tier's rewards list
                const results: MappedGachaResult[] = [];
                for (let q = 0; q < qty; q++) {
                    const reward = selectedTier.rewards[Math.floor(Math.random() * selectedTier.rewards.length)];
                    results.push({
                        ...reward,
                        reward_id: reward.id,
                        reward_name: reward.name,
                        image_url: reward.image_url || '',
                        created_at: new Date().toISOString(),
                    } as unknown as MappedGachaResult);
                }

                for (let i = 0; i < results.length; i++) {
                    const currentItem = results[i];
                    await animateSpin(currentItem, results.length > 1);

                    if (i < results.length - 1) {
                        await new Promise((r) => setTimeout(r, 100));
                    }
                }

                setBulkRewards(results);
                setShowBulkRewards(true);
                setIsOpening(false);
                setHistory((prev) => [
                    ...results.map((r, idx) => ({
                        id: `mock-history-${Date.now()}-${idx}`,
                        reward_id: r.id,
                        reward_name: r.name,
                        rarity: r.rarity,
                        created_at: r.created_at,
                        image_url: r.image_url || undefined,
                    })),
                    ...prev,
                ]);
            } catch (err) {
                console.error(err);
                setIsOpening(false);
            }
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/gacha/roll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    userId: activeUser.id,
                    tierId: selectedTier.id,
                    quantity: qty,
                    ...(import.meta.env.DEV && userIsAdmin ? {
                        testResult: testForceResult,
                        forceDeduction: forceDeduction,
                    } : {}),
                }),
            });
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            const rollRes: RollResponse = await res.json();
            if (!rollRes.success) throw new Error(rollRes.code);

            const apiData = rollRes.data;
            const results: RawGachaResult[] =
                apiData && 'results' in apiData
                    ? apiData.results
                    : apiData
                      ? [apiData as RawGachaResult]
                      : [];

            const mappedResults: MappedGachaResult[] = results.map((result) => {
                const found = selectedTier.rewards.find(
                    (r) =>
                        (result.reward_id && r.id === result.reward_id) ||
                        (result.id && r.id === result.id) ||
                        (result.name && r.name === result.name) ||
                        (result.name && r.name.includes(result.name))
                );

                if (found) {
                    return {
                        ...result,
                        ...found,
                        name: result.reward_name || result.name || found.name,
                        image_url: found.image_url || result.image_url || '',
                        color: found.color || result.color || '#fff',
                    } as MappedGachaResult;
                }

                return {
                    ...result,
                    name: result.reward_name || result.name || 'Unknown Reward',
                    image_url: result.image_url || '',
                    color: result.color || '#fff',
                } as MappedGachaResult;
            });

            for (let i = 0; i < mappedResults.length; i++) {
                const currentItem = mappedResults[i];
                await animateSpin(currentItem, mappedResults.length > 1);

                if (i < mappedResults.length - 1) {
                    await new Promise((r) => setTimeout(r, 100));
                }
            }

            setBulkRewards(mappedResults);
            setShowBulkRewards(true);
            setIsOpening(false);
            fetchGachaStatus();
            fetchHistory();
        } catch (e) {
            console.error(e);
            setIsOpening(false);
        }
    }, [
        activeUser,
        isOpening,
        isLinked,
        hasFreeRollForTier,
        selectedTier,
        killuBalance,
        userIsAdmin,
        testForceResult,
        forceDeduction,
        unlockedTiers,
        reelRefs,
        reelItemsSet,
        fetchGachaStatus,
        fetchHistory,
    ]);

    if (authLoading) return <div className="gacha-page"><Loader /></div>;
    if (!activeUser) {
        return (
            <GachaUnauthorized 
                userRole="Guest" 
                onMockLogin={(role) => {
                    const app_metadata = { role };
                    const user_metadata = { role };
                    setMockUser({
                        id: `mock-${role}-${Date.now()}`,
                        email: `mock-${role}@crystaltides.local`,
                        app_metadata,
                        user_metadata,
                    } as unknown as User);
                }}
            />
        );
    }

    return (
        <div
            id="gacha_viewport"
            className={`gacha-page tier-${selectedTier.id}`}
            ref={containerRef}
            style={{ '--tier-color': selectedTier.color } as React.CSSProperties}
        >
            <div className="gacha-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
            </div>

            <div className="gacha-container">
                <GachaHeader
                    canAccessDev={userIsAdmin}
                    isDevMode={isDevMode}
                    setIsDevMode={setIsDevMode}
                    testForceResult={testForceResult}
                    setTestForceResult={setTestForceResult}
                    forceDeduction={forceDeduction}
                    setForceDeduction={setForceDeduction}
                    addFunds={handleAddFunds}
                    devBarRef={devBarRef}
                    GACHA_TIERS={DISPLAY_GACHA_TIERS}
                    selectedTier={selectedTier}
                    setSelectedTier={setSelectedTier}
                    isOpening={isOpening}
                />
                
                <div className="tier-selector">
                    {DISPLAY_GACHA_TIERS.map((tier) => {
                        const isLocked =
                            EVENT_ONLY_TIERS.has(tier.id) &&
                            !userIsAdmin &&
                            !unlockedTiers.includes(tier.id);
                        const hasFreeRoll = tierStatus[tier.id]?.hasFreeRoll ?? false;
                        return (
                            <button type="button"
                                key={tier.id}
                                className={`tier-btn tier-btn-${tier.id} ${selectedTier.id === tier.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                onClick={() => !isOpening && !isLocked && setSelectedTier(tier)}
                                style={{ '--tier-color': tier.color } as React.CSSProperties}
                            >
                                <img src={tier.icon} alt={tier.name} className="tier-icon" />
                                <div className="tier-info">
                                    <span className="tier-name">{tier.name}</span>
                                    <div className="tier-value">
                                        {hasFreeRoll ? (
                                            <span className="free-roll-badge">{t('gacha.free_roll')}</span>
                                        ) : tier.id === 'ultra' ? (
                                            <span className="event-only-badge">{t('gacha.event_only')}</span>
                                        ) : (
                                            <>{formatCost(tier.cost)}</>
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
                        <Gacha3DShowcase
                            tierId={selectedTier.id}
                            tierColor={selectedTier.color}
                            isOpening={isOpening}
                            isCelebrating={isCelebrating}
                            spinSync={spinSync}
                            reelItemsSet={reelItemsSet}
                        />
                    </div>

                    <div id="gacha_machine_area" className="gacha-game-layout">
                        <GachaMachine
                            reelItemsSet={reelItemsSet}
                            reelRefs={reelRefs as unknown as React.RefObject<HTMLDivElement>[]}
                            isOpening={isOpening}
                            RARITY_ICONS={RARITY_ICONS}
                            selectedTier={selectedTier}
                        />

                        <div className="gacha-balance-area">
                            <button
                                type="button"
                                className="gacha-balance-chip clickable"
                                id="gacha_nav_currency"
                                onClick={() => handleAddFunds(5000000)}
                                title="Click para añadir +5,000,000 KC (Modo Prueba)"
                            >
                                <img src="/images/killucoins/coin_oro.webp" alt="KilluCoins" className="currency-icon" />
                                <span id="gacha_nav_currency_txt">{formatCost(killuBalance)} KC</span>
                            </button>
                        </div>

                        <GachaControls
                            isOpening={isOpening}
                            selectedTier={selectedTier}
                            killuBalance={killuBalance}
                            rollGacha={handleOpen}
                            formatCost={formatCost}
                            hasFreeRoll={hasFreeRollForTier}
                        />
                    </div>

                    <div id="gacha_side" className="gacha-side-panel">
                        <div id="gacha_rates_card" className="gacha-side-card rates-card">
                            <h3>{t('gacha.probability_rates')}</h3>
                            <div className="rates-list">
                                {rarityRates.map((row) => (
                                    <div key={row.key} className={`rate-item ${row.key}`}>
                                        <span className="rarity-dot" />
                                        <span className="rarity-name">{row.label}</span>
                                        <span className="rarity-value">{row.pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            <GachaRewardsOverlay
                showBulkRewards={showBulkRewards}
                bulkRewards={bulkRewards}
                selectedTier={selectedTier}
                setShowBulkRewards={setShowBulkRewards}
            />

            <GachaHistory
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onOpen={() => {
                    setShowHistory(true);
                    fetchHistory();
                }}
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
