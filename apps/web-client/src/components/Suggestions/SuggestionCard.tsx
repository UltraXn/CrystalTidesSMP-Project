import { formatDate } from '../../utils/date';
import { DEFAULT_AVATAR } from './constants';
import type { SuggestionItem, VoteDirection } from './types';
import SuggestionVoteControls from './SuggestionVoteControls';

interface SuggestionCardProps {
  item: SuggestionItem;
  userVote?: VoteDirection;
  onVote: (id: string | number, direction: VoteDirection) => void;
}

export default function SuggestionCard({ item, userVote, onVote }: Readonly<SuggestionCardProps>) {
  return (
    <div className="group flex flex-col gap-4 rounded-3xl border border-white/5 bg-black/30 p-6 transition-colors duration-300 hover:border-white/10 hover:bg-white/5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={`https://mc-heads.net/avatar/${item.nickname}/64`}
            alt={item.nickname}
            className="size-8 shrink-0 rounded-lg border border-white/10"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
          <div className="flex flex-col">
            <span className="text-xs font-black text-white">{item.nickname}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">
              {formatDate(item.created_at)}
            </span>
          </div>
        </div>
        <span className="text-(--accent) rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest">
          {item.type}
        </span>
      </div>

      <p className="text-sm/relaxed font-medium italic text-gray-300">"{item.message}"</p>

      <SuggestionVoteControls
        id={item.id}
        upvotes={item.upvotes}
        downvotes={item.downvotes}
        userVote={userVote}
        onVote={onVote}
      />
    </div>
  );
}
