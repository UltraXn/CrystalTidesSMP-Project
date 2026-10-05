import type { SuggestionItem, VoteDirection } from './types';

let tempIdCounter = 0;

export function nextTempSuggestionId(): string {
  tempIdCounter += 1;
  return `temp-${tempIdCounter}`;
}

export function resetTempSuggestionIdCounter(): void {
  tempIdCounter = 0;
}

export function updateVoteCounts(
  currentUps: number,
  currentDowns: number,
  direction: VoteDirection,
  previousVote?: VoteDirection,
): { upvotes: number; downvotes: number } {
  let ups = currentUps;
  let downs = currentDowns;

  if (direction === 'up') {
    ups += 1;
    if (previousVote === 'down') downs -= 1;
  } else {
    downs += 1;
    if (previousVote === 'up') ups -= 1;
  }

  return { upvotes: ups, downvotes: downs };
}

export function calculateOptimisticVotes(
  suggestions: SuggestionItem[],
  targetId: string | number,
  direction: VoteDirection,
  currentVote?: VoteDirection,
): SuggestionItem[] {
  return suggestions.map((item) => {
    if (item.id !== targetId) return item;
    const { upvotes, downvotes } = updateVoteCounts(
      item.upvotes,
      item.downvotes,
      direction,
      currentVote,
    );
    return { ...item, upvotes, downvotes };
  });
}
