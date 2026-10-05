import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart2 } from 'lucide-react';
import Section from '../components/Layout/Section';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import {
  API_URL,
  JSON_HEADERS,
  QUERY_KEYS,
  SEED_SUGGESTIONS,
  calculateOptimisticVotes,
  SuggestionForm,
  SuggestionsWall,
  PollWidget,
  type Poll,
  type SuggestionItem,
  type VoteDirection,
} from '../components/Suggestions';
import FaqSection from '../components/Home/FaqSection';

export default function Suggestions() {
  const { t } = useTranslation();
  const [voted, setVoted] = useState(false);
  const queryClient = useQueryClient();

  const [suggestionsOverride, setSuggestionsOverride] = useState<SuggestionItem[] | null>(null);
  const [votedSuggestions, setVotedSuggestions] = useState<Record<string | number, VoteDirection>>(
    {},
  );

  const { data: pollData, isLoading: loadingPoll } = useQuery({
    queryKey: QUERY_KEYS.ACTIVE_POLL,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/polls/active`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.success ? (data.data as Poll) : null;
    },
    staleTime: 30_000,
  });
  const poll = pollData ?? null;

  const { data: suggestionsFromQuery = SEED_SUGGESTIONS } = useQuery<SuggestionItem[]>({
    queryKey: QUERY_KEYS.SUGGESTIONS,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/suggestions`);
      if (!res.ok) return SEED_SUGGESTIONS;
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? (data as SuggestionItem[]) : SEED_SUGGESTIONS;
    },
    staleTime: 30_000,
  });
  const suggestions = suggestionsOverride ?? suggestionsFromQuery;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.suggestion-column, .polls-column',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' },
      );
    });
    return () => ctx.revert();
  }, []);

  const handleVote = async (optionId: number) => {
    if (voted || !poll) return;

    try {
      const res = await fetch(`${API_URL}/polls/vote`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ pollId: poll.id, optionId }),
      });

      if (res.ok) {
        setVoted(true);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_POLL });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggestionCreated = (newSuggestion: SuggestionItem) => {
    setSuggestionsOverride((prev) => [newSuggestion, ...(prev ?? suggestions)]);
  };

  const handleVoteSuggestion = (id: string | number, direction: VoteDirection) => {
    const currentVote = votedSuggestions[id];
    if (currentVote === direction) return;

    setSuggestionsOverride((prev) =>
      calculateOptimisticVotes(prev ?? suggestions, id, direction, currentVote),
    );
    setVotedSuggestions((prev) => ({ ...prev, [id]: direction }));
  };

  return (
    <Section title={t('suggestions.title')}>
      <Section>
        <div className="max-w-350 mx-auto grid grid-cols-1 gap-12 px-4 lg:grid-cols-5">
          {/* IZQUIERDA: FORMULARIO Y MURO (3/5) */}
          <div className="suggestion-column flex flex-col gap-12 lg:col-span-3">
            <SuggestionForm onSuggestionCreated={handleSuggestionCreated} />
            <SuggestionsWall
              suggestions={suggestions}
              votedSuggestions={votedSuggestions}
              onVoteSuggestion={handleVoteSuggestion}
            />
          </div>

          {/* DERECHA: VOTACIONES Y FAQ (2/5) */}
          <div className="polls-column flex flex-col gap-10 lg:col-span-2">
            {(poll || loadingPoll) && (
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 flex size-12 items-center justify-center rounded-2xl border text-xl">
                    <BarChart2 />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
                    {t('suggestions.poll_title')}
                  </h3>
                </div>

                <PollWidget poll={poll} isLoading={loadingPoll} voted={voted} onVote={handleVote} />
              </div>
            )}

            <FaqSection embedded />
          </div>
        </div>
      </Section>
    </Section>
  );
}
