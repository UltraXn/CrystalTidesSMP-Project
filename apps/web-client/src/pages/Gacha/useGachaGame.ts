import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../utils/roleUtils';
import {
  GACHA_SPIN_DURATIONS,
  reelsToImageStrips,
  type GachaSpinSync,
  type GachaSpinEase,
} from '../../components/Gacha/gachaSpinSync';
import type {
  GachaReward,
  RawGachaResult,
  MappedGachaResult,
  GachaHistoryEntry,
  GachaTier,
} from './types';
import {
  DISPLAY_GACHA_TIERS,
  SHARED_TIERS,
  computeRarityRates,
  type GachaStatusResponse,
} from './gachaDisplayUtils';
import {
  CONSTANTS,
  parseGachaResults,
  mapRawGachaResults,
  generateMockRollResults,
  createMockHistorySeed,
  generateReelsForTier,
  calculateRollCost,
  canPerformRoll,
  playSpinSequence,
  postRollRequest,
  triggerCelebration,
  runSpinTimeline,
} from './gachaGameUtils';

interface SpinAnimationParams {
  spinIdRef: React.RefObject<number>;
  setSpinSync: React.Dispatch<React.SetStateAction<GachaSpinSync | null>>;
  reelRefs: React.RefObject<HTMLDivElement | null>[];
  durations: readonly [number, number, number];
  nextReels: GachaReward[][];
  isBulk: boolean;
  ease: GachaSpinEase;
  setIsCelebrating: (v: boolean) => void;
  resolve: () => void;
}

function executeSpinStep(params: SpinAnimationParams): void {
  params.spinIdRef.current += 1;
  params.setSpinSync({
    id: params.spinIdRef.current,
    durations: params.durations,
    strips: reelsToImageStrips(params.nextReels),
    ease: params.ease,
  });

  const handleDone = () => triggerCelebration(params.setIsCelebrating, params.resolve);
  runSpinTimeline(
    params.reelRefs,
    params.durations as unknown as number[],
    params.isBulk,
    params.ease,
    handleDone,
  );
}

export function useGachaGame() {
  const { user, profile, loading: authLoading } = useAuth();
  const [mockUser, setMockUser] = useState<User | null>(null);

  const activeUser = user || mockUser;
  const userIsAdmin = useMemo(() => isAdmin(profile || activeUser), [profile, activeUser]);

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
          executeSpinStep({
            spinIdRef,
            setSpinSync,
            reelRefs,
            durations,
            nextReels,
            isBulk,
            ease,
            setIsCelebrating,
            resolve,
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

        const results: RawGachaResult[] = parseGachaResults(rollRes.data);

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

      const totalCost = calculateRollCost(selectedTier.cost, qty, {
        hasFreeRoll: hasFreeRollForTier,
      });

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

  return {
    authLoading,
    activeUser,
    mockUser,
    setMockUser,
    userIsAdmin,
    selectedTier,
    setSelectedTier,
    killuBalance,
    isOpening,
    isCelebrating,
    isLinked,
    tierStatus,
    unlockedTiers,
    devOptions,
    isDevMode,
    setIsDevMode,
    testForceResult,
    setTestForceResult,
    forceDeduction,
    setForceDeduction,
    showBulkRewards,
    setShowBulkRewards,
    bulkRewards,
    history,
    historyLoading,
    showHistory,
    setShowHistory,
    containerRef,
    devBarRef,
    reelRefs,
    reelItemsSet,
    spinSync,
    rarityRates,
    hasFreeRollForTier,
    handleAddFunds,
    handleOpen,
    fetchHistory,
  };
}
