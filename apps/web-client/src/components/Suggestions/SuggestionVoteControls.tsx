import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { VoteDirection } from './types';

interface SuggestionVoteControlsProps {
  id: string | number;
  upvotes: number;
  downvotes: number;
  userVote?: VoteDirection;
  onVote: (id: string | number, direction: VoteDirection) => void;
}

export default function SuggestionVoteControls({
  id,
  upvotes,
  downvotes,
  userVote,
  onVote,
}: Readonly<SuggestionVoteControlsProps>) {
  const upBtnClass =
    userVote === 'up'
      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10';

  const downBtnClass =
    userVote === 'down'
      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
      : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10';

  return (
    <div className="flex items-center gap-4 border-t border-white/5 pt-2">
      <button
        aria-label="Voto a favor"
        type="button"
        onClick={() => onVote(id, 'up')}
        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors active:scale-90 ${upBtnClass}`}
      >
        <ThumbsUp size={12} />
        <span>{upvotes}</span>
      </button>
      <button
        aria-label="Voto en contra"
        type="button"
        onClick={() => onVote(id, 'down')}
        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors active:scale-90 ${downBtnClass}`}
      >
        <ThumbsDown size={12} />
        <span>{downvotes}</span>
      </button>
    </div>
  );
}
