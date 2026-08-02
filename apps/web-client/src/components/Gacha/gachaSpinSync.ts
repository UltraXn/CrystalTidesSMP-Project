import { isLossReward, resolveRewardImage } from '../../pages/Gacha/gachaDisplayUtils';

export const GACHA_SPIN_TARGET_INDEX = 45;

export const GACHA_SPIN_DURATIONS = {
  single: [4, 5, 6] as const,
  bulk: [0.8, 1.0, 1.2] as const,
};

export type GachaSpinEase = 'power4.inOut' | 'power2.inOut';

export type GachaSpinSync = {
  id: number;
  durations: readonly [number, number, number];
  strips: [string[], string[], string[]];
  ease: GachaSpinEase;
};

const LOSS_FALLBACK = '/images/items/Barrier_(held)_JE2_BE2.png';
const DEFAULT_FALLBACK = '/images/items/Diamond_JE3_BE3.png';

export function reelSlotImageUrl(item: {
  name: string;
  image_url?: string | null;
  id?: string;
}): string {
  const loss = isLossReward(item);
  return (
    resolveRewardImage(item.name, item.image_url) ||
    (loss ? LOSS_FALLBACK : DEFAULT_FALLBACK)
  );
}

export function reelsToImageStrips(
  reels: { name: string; image_url?: string | null; id?: string }[][]
): [string[], string[], string[]] {
  return reels.map((reel) => reel.map(reelSlotImageUrl)) as [string[], string[], string[]];
}

export function easePower4InOut(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function easePower2InOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function applySpinEase(ease: GachaSpinEase, t: number): number {
  return ease === 'power2.inOut' ? easePower2InOut(t) : easePower4InOut(t);
}
