import React from 'react';
import { Star, Sparkles, Gem, Trophy, Crown } from 'lucide-react';
import { gsap } from 'gsap';
import { User } from '@supabase/supabase-js';
import { GACHA_SPIN_TARGET_INDEX } from '../../components/Gacha/gachaSpinSync';
import type {
  GachaReward,
  RawGachaResult,
  MappedGachaResult,
  GachaHistoryEntry,
  GachaTier,
  RollResponse,
} from './types';

export const CONSTANTS = {
  TIER_ULTRA: 'ultra',
  MOCK_PREFIX: 'mock-',
  CONTENT_TYPE_JSON: 'application/json',
  API_GACHA_URL: `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/gacha`,
  POWER_4_IN_OUT: 'power4.inOut',
  POWER_2_IN_OUT: 'power2.inOut',
  DEFAULT_COLOR: '#fff',
  UNKNOWN_REWARD: 'Unknown Reward',
} as const;

export const RARITY_COLORS: Record<string, string> = {
  common: '#b0c3d9',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
  mythic: '#ffcc00',
};

export const RARITY_ICONS: Record<string, React.ElementType> = {
  common: Star,
  rare: Sparkles,
  epic: Gem,
  legendary: Trophy,
  mythic: Crown,
};

export const EVENT_ONLY_TIERS = new Set<string>([CONSTANTS.TIER_ULTRA]);

export const formatCost = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(0) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(0) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
  return num.toString();
};

export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

export function parseGachaResults(apiData: unknown): RawGachaResult[] {
  if (!apiData) return [];
  if (
    typeof apiData === 'object' &&
    'results' in apiData &&
    Array.isArray((apiData as { results: unknown }).results)
  ) {
    return (apiData as { results: RawGachaResult[] }).results;
  }
  return [apiData as RawGachaResult];
}

export function findMatchingReward(
  result: RawGachaResult,
  rewards: GachaReward[],
): GachaReward | undefined {
  return rewards.find(
    (r) =>
      (result.reward_id && r.id === result.reward_id) ||
      (result.id && r.id === result.id) ||
      (result.name && r.name === result.name) ||
      (result.name && r.name.includes(result.name)),
  );
}

export function mapRawGachaResults(
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

export function generateMockRollResults(tier: GachaTier, qty: number): MappedGachaResult[] {
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

export function createMockHistorySeed(rewards: GachaReward[]): GachaHistoryEntry[] {
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

export function generateReelsForTier(tier: GachaTier): (GachaReward | MappedGachaResult)[][] {
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

export function calculateRollCost(cost: number, qty: number, hasFreeRoll: boolean): number {
  return hasFreeRoll ? cost * Math.max(0, qty - 1) : cost * qty;
}

export interface RollValidationParams {
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

export function canPerformRoll({
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

export async function playSpinSequence(
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

export type TestForceResult = 'random' | 'win' | 'loss';

export interface DevRollOptions {
  testForceResult: TestForceResult;
  forceDeduction: boolean;
}

export async function postRollRequest(
  userId: string,
  tierId: string,
  qty: number,
  devOptions: DevRollOptions,
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

export function triggerCelebration(
  setIsCelebrating: (v: boolean) => void,
  onComplete?: () => void,
) {
  setIsCelebrating(true);
  window.setTimeout(() => setIsCelebrating(false), 2200);
  onComplete?.();
}

export function runSpinTimeline(
  reelRefs: React.RefObject<HTMLDivElement | null>[],
  durations: readonly number[],
  isBulk: boolean,
  ease: string,
  onComplete: () => void,
) {
  const reelH = GACHA_SPIN_TARGET_INDEX * 160;
  const tl = gsap.timeline({ onComplete });
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
}
