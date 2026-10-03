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

const CONSTANTS = {
  TIER_ULTRA: 'ultra',
  MOCK_PREFIX: 'mock-',
  CONTENT_TYPE_JSON: 'application/json',
  API_GACHA_URL: `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/gacha`,
  POWER_4_IN_OUT: 'power4.inOut',
  POWER_2_IN_OUT: 'power2.inOut',
  DEFAULT_COLOR: '#fff',
  UNKNOWN_REWARD: 'Unknown Reward',
} as const;

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

const EVENT_ONLY_TIERS = new Set<string>([CONSTANTS.TIER_ULTRA]);

const formatCost = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(0) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(0) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
  return num.toString();
};

function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

function findMatchingReward(result: RawGachaResult, rewards: GachaReward[]): GachaReward | undefined {
  return rewards.find(
    (r) =>
      (result.reward_id && r.id === result.reward_id) ||
      (result.id && r.id === result.id) ||
      (result.name && r.name === result.name) ||
      (result.name && r.name.includes(result.name)),
  );
}

function mapRawGachaResults(
  results: RawGachaResult[],
  tierRewards: GachaReward[],
): MappedGachaResult[] {
  return results.map((result) => {
    const found = findMatchingReward(result, tierRewards);
    if (found) {
      return {
        ...result,
        ...found,
        name: result.reward_name || result.name || found.name,
        image_url: found.image_url || result.image_url || '',
        color: found.color || result.color || CONSTANTS.DEFAULT_COLOR,
      } as MappedGachaResult;
    }

    return {
      ...result,
      name: result.reward_name || result.name || CONSTANTS.UNKNOWN_REWARD,
      image_url: result.image_url || '',
      color: result.color || CONSTANTS.DEFAULT_COLOR,
    } as MappedGachaResult;
  });
}

function generateMockRollResults(tier: GachaTier, qty: number): MappedGachaResult[] {
  const results: MappedGachaResult[] = [];
  const rewardsLen = tier.rewards.length;
  for (let q = 0; q < qty; q++) {
    const reward = tier.rewards[getSecureRandomInt(rewardsLen)];
    results.push({
      ...reward,
      reward_id: reward.id,
      reward_name: reward.name,
      image_url: reward.image_url || '',
      created_at: new Date().toISOString(),
    } as unknown as MappedGachaResult);
  }
  return results;
}

function createMockHistorySeed(rewards: GachaReward[]): GachaHistoryEntry[] {
  if (!rewards.length) return [];
  return Array.from({ length: 5 }, (_, i) => {
    const randomReward = rewards[getSecureRandomInt(rewards.length)];
    return {
      id: `mock-history-seed-${i}`,
      reward_id: randomReward.id,
      reward_name: randomReward.name,
      rarity: randomReward.rarity,
      created_at: new Date(Date.now() - i * 3_600_000).toISOString(),
      image_url: randomReward.image_url || undefined,
    };
  });
}

function generateReelsForTier(tier: GachaTier): (GachaReward | MappedGachaResult)[][] {
  if (!tier?.rewards || tier.rewards.length === 0) return [[], [], []];
  return [0, 1, 2].map((colIdx) => {
    const items: (GachaReward | MappedGachaResult)[] = [];
    for (let i = 0; i < 60; i++) {
      const baseReward = tier.rewards[getSecureRandomInt(tier.rewards.length)];
      items.push({
        ...baseReward,
        id: `${baseReward.id || baseReward.name}-slot-${colIdx}-${i}`,
      });
    }
    return items;
  });
}

function calculateRollCost(cost: number, qty: number, hasFreeRoll: boolean): number {
  return hasFreeRoll ? cost * Math.max(0, qty - 1) : cost * qty;
}

interface RollValidationParams {
  activeUser: User | null;
  isOpening: boolean;
  isLinked: boolean;
  selectedTier: GachaTier;
  userIsAdmin: boolean;
  unlockedTiers: string[];
  hasFreeRoll: boolean;
  killuBalance: number;
  qty: number;
}

function canPerformRoll({
  activeUser,
  isOpening,
  isLinked,
  selectedTier,
  userIsAdmin,
  unlockedTiers,
  hasFreeRoll,
  killuBalance,
  qty,
}: RollValidationParams): boolean {
  if (!activeUser || isOpening || !isLinked) return false;

  const isTierLocked =
    EVENT_ONLY_TIERS.has(selectedTier.id) &&
    !userIsAdmin &&
    !unlockedTiers.includes(selectedTier.id);

  if (isTierLocked) return false;

  const totalCost = calculateRollCost(selectedTier.cost, qty, hasFreeRoll);
  return !(killuBalance < totalCost && selectedTier.id !== CONSTANTS.TIER_ULTRA);
}

async function playSpinSequence(
  results: MappedGachaResult[],
  runSingleSpin: (item: MappedGachaResult, isBulk: boolean) => Promise<void>,
): Promise<void> {
  const isBulk = results.length > 1;
  for (let i = 0; i < results.length; i++) {
    await runSingleSpin(results[i], isBulk);
    if (i < results.length - 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}

async function postRollRequest(
  userId: string,
  tierId: string,
  qty: number,
  devOptions: { testForceResult: 'random' | 'win' | 'loss'; forceDeduction: boolean },
  isAdminUser: boolean,
  token?: string,
): Promise<RollResponse> {
  const body = {
    userId,
    tierId,
    quantity: qty,
    ...(import.meta.env.DEV && isAdminUser
      ? {
          testResult: devOptions.testForceResult,
          forceDeduction: devOptions.forceDeduction,
        }
      : {}),
  };

  const headers: Record<string, string> = {
    'Content-Type': CONSTANTS.CONTENT_TYPE_JSON,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${CONSTANTS.API_GACHA_URL}/roll`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  return res.json();
}

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
  const [devOptions, setDevOptions] = useState<{
    isDevMode: boolean;
    testForceResult: 'random' | 'win' | 'loss';
    forceDeduction: boolean;
  }>({
    isDevMode: false,
    testForceResult: 'random',
    forceDeduction: false,
  });
  const { isDevMode, testForceResult, forceDeduction } = devOptions;

  const setIsDevMode = (val: boolean | ((prev: boolean) => boolean)) =>
    setDevOptions((prev) => ({
      ...prev,
      isDevMode: typeof val === 'function' ? val(prev.isDevMode) : val,
    }));
  const setTestForceResult = (val: 'random' | 'win' | 'loss') =>
    setDevOptions((prev) => ({ ...prev, testForceResult: val }));
  const setForceDeduction = (val: boolean | ((prev: boolean) => boolean)) =>
    setDevOptions((prev) => ({
      ...prev,
      forceDeduction: typeof val === 'function' ? val(prev.forceDeduction) : val,
    }));

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
  const reelRefs = useMemo(() => [reelRef0, reelRef1, reelRef2], []);

  const fetchGachaStatus = useCallback(async () => {
    if (!activeUser) return;

    if (activeUser.id.startsWith(CONSTANTS.MOCK_PREFIX)) {
      setIsLinked(true);
      setKilluBalance((prev) => (prev === 0 ? 50000 : prev));
      setTierStatus({
        standard: { hasFreeRoll: false, cooldownHours: 0 },
        premium: { hasFreeRoll: false, cooldownHours: 0 },
        epic: { hasFreeRoll: false, cooldownHours: 0 },
        ultra: { hasFreeRoll: false, cooldownHours: 0 },
      });
      setUnlockedTiers([CONSTANTS.TIER_ULTRA]);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('minecraft_nick')
        .eq('id', activeUser.id)
        .single();

      setIsLinked(Boolean(profile?.minecraft_nick));

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${CONSTANTS.API_GACHA_URL}/status/${activeUser.id}`, {
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

  const handleAddFunds = useCallback(
    async (amount: number) => {
      if (!activeUser) return;

      if (activeUser.id.startsWith(CONSTANTS.MOCK_PREFIX)) {
        setKilluBalance((prev) => prev + amount);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch(`${CONSTANTS.API_GACHA_URL}/add-funds`, {
          method: 'POST',
          headers: {
            'Content-Type': CONSTANTS.CONTENT_TYPE_JSON,
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
    },
    [activeUser],
  );

  useEffect(() => {
    fetchGachaStatus();
  }, [fetchGachaStatus]);

  const [reelItemsSet, setReelItemsSet] = useState<(GachaReward | MappedGachaResult)[][]>(() =>
    generateReelsForTier(selectedTier || DISPLAY_GACHA_TIERS[0]),
  );
  const [prevTierId, setPrevTierId] = useState(selectedTier.id);
  if (prevTierId !== selectedTier.id) {
    setPrevTierId(selectedTier.id);
    setReelItemsSet(generateReelsForTier(selectedTier));
  }

  const [spinSync, setSpinSync] = useState<GachaSpinSync | null>(null);
  const spinIdRef = useRef(0);

  const rarityRates = useMemo(() => {
    const tierRewards = SHARED_TIERS.find((tier) => tier.id === selectedTier.id)?.rewards ?? [];
    return computeRarityRates(
      tierRewards.map((r) => ({
        id: r.id,
        name: r.name,
        rarity: r.rarity,
        chance: r.chance,
        value: r.value,
      })),
    );
  }, [selectedTier.id]);

  const fetchHistory = useCallback(async () => {
    if (!activeUser) return;

    if (activeUser.id.startsWith(CONSTANTS.MOCK_PREFIX)) {
      setHistory((currentHistory) => {
        if (currentHistory.length > 0) return currentHistory;
        return createMockHistorySeed(selectedTier.rewards);
      });
      return;
    }

    setHistoryLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${CONSTANTS.API_GACHA_URL}/history/${activeUser.id}`, {
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
  }, [activeUser, selectedTier.rewards]);

  useEffect(() => {
    if (activeUser) fetchHistory();
  }, [activeUser, fetchHistory]);

  const hasFreeRollForTier = tierStatus[selectedTier.id]?.hasFreeRoll ?? false;

  const animateSpin = useCallback(
    (item: GachaReward | MappedGachaResult, isBulk: boolean): Promise<void> => {
      return new Promise<void>((resolve) => {
        const durations = isBulk ? GACHA_SPIN_DURATIONS.bulk : GACHA_SPIN_DURATIONS.single;
        const ease = isBulk ? CONSTANTS.POWER_2_IN_OUT : CONSTANTS.POWER_4_IN_OUT;

        const nextReels = reelItemsSet.map((reel) => {
          const newReel = [...reel];
          newReel[46] = item;
          return newReel;
        });
        setReelItemsSet(nextReels);

        window.setTimeout(() => {
          spinIdRef.current += 1;
          setSpinSync({
            id: spinIdRef.current,
            durations: [...durations],
            strips: reelsToImageStrips(nextReels),
            ease,
          });

          const reelH = GACHA_SPIN_TARGET_INDEX * 160;
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
              0,
            );
          });
        }, 50);
      });
    },
    [reelItemsSet, reelRefs],
  );

  const handleMockRoll = useCallback(
    async (qty: number, totalCost: number) => {
      try {
        await new Promise((r) => setTimeout(r, 800));
        setKilluBalance((prev) => prev - totalCost);

        const results = generateMockRollResults(selectedTier, qty);
        await playSpinSequence(results, animateSpin);

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
    },
    [selectedTier, animateSpin],
  );

  const handleServerRoll = useCallback(
    async (qty: number) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const rollRes = await postRollRequest(
          activeUser!.id,
          selectedTier.id,
          qty,
          { testForceResult, forceDeduction },
          userIsAdmin,
          session?.access_token,
        );

        if (!rollRes.success) throw new Error(rollRes.code);

        const apiData = rollRes.data;
        const results: RawGachaResult[] =
          apiData && 'results' in apiData
            ? apiData.results
            : apiData
              ? [apiData as RawGachaResult]
              : [];

        const mappedResults = mapRawGachaResults(results, selectedTier.rewards);
        await playSpinSequence(mappedResults, animateSpin);

        setBulkRewards(mappedResults);
        setShowBulkRewards(true);
        setIsOpening(false);
        fetchGachaStatus();
        fetchHistory();
      } catch (e) {
        console.error(e);
        setIsOpening(false);
      }
    },
    [
      activeUser,
      selectedTier,
      testForceResult,
      forceDeduction,
      userIsAdmin,
      animateSpin,
      fetchGachaStatus,
      fetchHistory,
    ],
  );

  const handleOpen = useCallback(
    async (qty: number) => {
      const isEligible = canPerformRoll({
        activeUser,
        isOpening,
        isLinked,
        selectedTier,
        userIsAdmin,
        unlockedTiers,
        hasFreeRoll: hasFreeRollForTier,
        killuBalance,
        qty,
      });

      if (!isEligible || !activeUser) return;

      setIsOpening(true);
      const totalCost = calculateRollCost(selectedTier.cost, qty, hasFreeRollForTier);

      if (activeUser.id.startsWith(CONSTANTS.MOCK_PREFIX)) {
        await handleMockRoll(qty, totalCost);
        return;
      }

      await handleServerRoll(qty);
    },
    [
      activeUser,
      isOpening,
      isLinked,
      selectedTier,
      userIsAdmin,
      unlockedTiers,
      hasFreeRollForTier,
      killuBalance,
      handleMockRoll,
      handleServerRoll,
    ],
  );

  const renderTierCost = (tier: GachaTier, hasFreeRoll: boolean) => {
    if (hasFreeRoll) {
      return <span className="free-roll-badge">{t('gacha.free_roll')}</span>;
    }
    if (tier.id === CONSTANTS.TIER_ULTRA) {
      return <span className="event-only-badge">{t('gacha.event_only')}</span>;
    }
    return <>{formatCost(tier.cost)}</>;
  };

  if (authLoading) {
    return (
      <div className="gacha-page">
        <Loader />
      </div>
    );
  }

  if (!activeUser) {
    return (
      <GachaUnauthorized
        userRole="Guest"
        onMockLogin={(role) => {
          const appMetadata = { role };
          const userMetadata = { role };
          setMockUser({
            id: `mock-${role}-${Date.now()}`,
            email: `mock-${role}@crystaltides.local`,
            app_metadata: appMetadata,
            user_metadata: userMetadata,
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
        <div className="gradient-sphere sphere-1" />
        <div className="gradient-sphere sphere-2" />
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
              EVENT_ONLY_TIERS.has(tier.id) && !userIsAdmin && !unlockedTiers.includes(tier.id);
            const hasFreeRoll = tierStatus[tier.id]?.hasFreeRoll ?? false;
            return (
              <button
                type="button"
                key={tier.id}
                className={`tier-btn tier-btn-${tier.id} ${selectedTier.id === tier.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isOpening && !isLocked && setSelectedTier(tier)}
                style={{ '--tier-color': tier.color } as React.CSSProperties}
              >
                <img src={tier.icon} alt={tier.name} className="tier-icon" />
                <div className="tier-info">
                  <span className="tier-name">{tier.name}</span>
                  <div className="tier-value">
                    {renderTierCost(tier, hasFreeRoll)}
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
                onClick={() => handleAddFunds(5_000_000)}
                title="Click para añadir +5,000,000 KC (Modo Prueba)"
              >
                <img
                  src="/images/killucoins/coin_oro.webp"
                  alt="KilluCoins"
                  className="currency-icon"
                />
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