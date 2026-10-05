import { MessageSquare } from 'lucide-react';
import SuggestionCard from './SuggestionCard';
import type { SuggestionItem, VoteDirection } from './types';

interface SuggestionsWallProps {
  suggestions: SuggestionItem[];
  votedSuggestions: Record<string | number, VoteDirection>;
  onVoteSuggestion: (id: string | number, direction: VoteDirection) => void;
}

export default function SuggestionsWall({
  suggestions,
  votedSuggestions,
  onVoteSuggestion,
}: Readonly<SuggestionsWallProps>) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 flex size-12 items-center justify-center rounded-2xl border text-xl">
          <MessageSquare />
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
          Sugerencias Recientes
        </h3>
      </div>

      <div className="max-h-137.5 custom-scrollbar flex flex-col gap-6 overflow-y-auto pr-2">
        {suggestions.map((item) => (
          <SuggestionCard
            key={item.id}
            item={item}
            userVote={votedSuggestions[item.id]}
            onVote={onVoteSuggestion}
          />
        ))}
      </div>
    </div>
  );
}
