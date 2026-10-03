import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';
import Section from '../components/Layout/Section';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSuggestionSchema, CreateSuggestionFormValues } from '../schemas/suggestion';
import { gsap } from 'gsap';

interface PollOption {
  id: number;
  label: string;
  votes: number;
  percent: number;
}

interface Poll {
  id: number;
  title: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  closesIn: string;
}

interface SuggestionItem {
  id: string | number;
  nickname: string;
  type: string;
  message: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
}

interface SuggestionApiResponse {
  id?: string | number;
  error?: string;
  kc_awarded?: number;
}

type VoteDirection = 'up' | 'down';
type FormStatus = 'idle' | 'sending' | 'success' | 'error';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_AVATAR = 'https://mc-heads.net/avatar/Steeve/64';
const SELECT_OPTION_CLASS = 'bg-[#0a0a0a]';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const QUERY_KEYS = {
  ACTIVE_POLL: ['activePoll'] as const,
  SUGGESTIONS: ['suggestions'] as const,
};

// Seed Suggestions in case database is empty or offline
const SEED_SUGGESTIONS: SuggestionItem[] = [
  {
    id: 'seed-1',
    nickname: 'pixiesixer',
    type: 'General',
    message:
      'Sería genial tener un mercado de agricultores en el spawn los domingos donde podamos vender cultivos por CrystalCoins.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    upvotes: 34,
    downvotes: 3,
  },
  {
    id: 'seed-2',
    nickname: 'Zeta',
    type: 'Mod',
    message:
      'Propongo agregar el mod de decoración "Supplementaries" para darle más vida a nuestras construcciones medievales.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    upvotes: 56,
    downvotes: 4,
  },
  {
    id: 'seed-3',
    nickname: 'Neroferno',
    type: 'Bug',
    message:
      'El comando /spawn a veces te teletransporta un bloque por debajo del suelo y sufres daño por sofocación.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    upvotes: 18,
    downvotes: 1,
  },
];

let tempIdCounter = 0;

function updateVoteCounts(
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

function calculateOptimisticVotes(
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

function NicknameAvatar({ nickname }: { nickname?: string }) {
  if (!nickname || nickname.length < 3) {
    return <div className="text-lg font-black text-white/25">?</div>;
  }

  return (
    <img
      src={`https://mc-heads.net/avatar/${nickname}/64`}
      alt={nickname}
      className="h-10 w-10 object-contain"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
      }}
    />
  );
}

function SuggestionCard({
  item,
  userVote,
  onVote,
}: {
  item: SuggestionItem;
  userVote?: VoteDirection;
  onVote: (id: string | number, direction: VoteDirection) => void;
}) {
  const upBtnClass =
    userVote === 'up'
      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10';

  const downBtnClass =
    userVote === 'down'
      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
      : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10';

  return (
    <div className="group flex flex-col gap-4 rounded-3xl border border-white/5 bg-black/30 p-6 transition-colors duration-300 hover:border-white/10 hover:bg-white/5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={`https://mc-heads.net/avatar/${item.nickname}/64`}
            alt={item.nickname}
            className="h-8 w-8 shrink-0 rounded-lg border border-white/10"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
          <div className="flex flex-col">
            <span className="text-xs font-black text-white">{item.nickname}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <span className="text-(--accent) rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest">
          {item.type}
        </span>
      </div>

      <p className="text-sm font-medium italic leading-relaxed text-gray-300">"{item.message}"</p>

      <div className="flex items-center gap-4 border-t border-white/5 pt-2">
        <button
          aria-label="Action"
          type="button"
          onClick={() => onVote(item.id, 'up')}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors active:scale-90 ${upBtnClass}`}
        >
          <ThumbsUp size={12} />
          <span>{item.upvotes}</span>
        </button>
        <button
          aria-label="Action"
          type="button"
          onClick={() => onVote(item.id, 'down')}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors active:scale-90 ${downBtnClass}`}
        >
          <ThumbsDown size={12} />
          <span>{item.downvotes}</span>
        </button>
      </div>
    </div>
  );
}

function PollWidget({
  poll,
  isLoading,
  voted,
  onVote,
}: {
  poll: Poll | null;
  isLoading: boolean;
  voted: boolean;
  onVote: (optionId: number) => void;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-white/10 bg-white/5 p-12">
        <Loader2 className="animate-spin text-white/20" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {t('suggestions.loading_poll')}
        </p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-12 text-center opacity-50">
        <AlertTriangle size={48} className="text-white/10" />
        <p className="max-w-50 text-sm font-bold uppercase leading-relaxed tracking-widest text-gray-400">
          {t('suggestions.no_active_poll')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-10">
      <div>
        <div className="text-(--accent) mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-(--accent) h-1.5 w-1.5 animate-pulse rounded-full" />
          {poll.title}
        </div>
        <h4 className="text-2xl font-black uppercase leading-tight tracking-tight text-white">
          {poll.question}
        </h4>
      </div>

      <div className="flex flex-col gap-4">
        {(poll.options || []).map((option: PollOption) => {
          const widthStyle = voted ? `${option.percent}%` : '0%';
          const optionBtnClass = voted
            ? 'cursor-default'
            : 'cursor-pointer hover:bg-white/10 hover:border-white/20 active:scale-95';
          const labelClass = voted ? 'text-white' : 'text-gray-400 group-hover:text-white';

          return (
            <button
              key={option.id}
              type="button"
              disabled={voted}
              className={`group relative h-14 w-full overflow-hidden rounded-2xl border border-white/5 bg-white/5 text-left transition-colors ${optionBtnClass}`}
              onClick={() => onVote(option.id)}
            >
              <div
                className="bg-linear-to-r absolute inset-y-0 left-0 from-cyan-500/35 via-blue-500/25 to-indigo-500/35 transition-colors duration-1000 ease-out"
                style={{ width: widthStyle }}
              >
                {voted && option.percent > 0 && (
                  <div className="absolute bottom-0 right-0 top-0 w-1 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
                )}
              </div>

              <div className="pointer-events-none relative z-10 flex h-full items-center justify-between px-6">
                <span
                  className={`text-sm font-black uppercase tracking-widest transition-colors ${labelClass}`}
                >
                  {option.label}
                </span>
                {voted && (
                  <span className="text-(--accent) font-mono font-bold">
                    {poll.totalVotes > 0 ? `${option.percent}%` : '0%'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
        <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <span>Total: {poll.totalVotes} votos</span>
          <span>Cierra en: {poll.closesIn}</span>
        </div>
        {voted && (
          <p className="animate-bounce text-center text-xs font-black uppercase tracking-widest text-emerald-400">
            {t('suggestions.thanks_vote')}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Suggestions() {
  const { t } = useTranslation();
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [rewardSuccessMsg, setRewardSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateSuggestionFormValues>({
    resolver: zodResolver(createSuggestionSchema),
    defaultValues: {
      nickname: '',
      type: 'General',
      message: '',
    },
  });

  const watchNickname = useWatch({ control, name: 'nickname', defaultValue: '' });

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
    gsap.fromTo(
      '.suggestion-column, .polls-column',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' },
    );
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

  const onSubmit = async (data: CreateSuggestionFormValues) => {
    setFormStatus('sending');
    setValidationError(null);
    setRewardSuccessMsg(null);

    try {
      const res = await fetch(`${API_URL}/suggestions`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(data),
      });

      const json: SuggestionApiResponse = await res.json();

      if (res.ok && !json.error) {
        setFormStatus('success');
        setRewardSuccessMsg(
          json.kc_awarded
            ? `🤖 ¡Propuesta validada por la IA! Recompensado con +${json.kc_awarded} KilluCoins 🎉`
            : '¡Sugerencia enviada con éxito!',
        );

        const newSuggestion: SuggestionItem = {
          id: json.id || `temp-${++tempIdCounter}`,
          nickname: data.nickname || 'Anónimo',
          type: data.type,
          message: data.message,
          created_at: new Date().toISOString(),
          upvotes: 1,
          downvotes: 0,
        };
        setSuggestionsOverride((prev) => [newSuggestion, ...(prev ?? suggestions)]);
        reset();
      } else {
        setFormStatus('error');
        setValidationError(json.error || 'No se pudo enviar la sugerencia.');
      }
    } catch {
      setFormStatus('error');
      setValidationError('Error de conexión al servidor.');
    }
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
            {/* FORMULARIO */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 flex h-12 w-12 items-center justify-center rounded-2xl border text-xl">
                  <Send />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
                  {t('suggestions.form_title')}
                </h3>
              </div>

              <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-10">
                {formStatus === 'success' ? (
                  <div className="py-10 text-center">
                    <CheckCircle
                      size={60}
                      className="mx-auto mb-6 animate-bounce text-emerald-400"
                    />
                    <h4 className="mb-3 text-3xl font-black uppercase tracking-tight text-white">
                      {t('suggestions.form.received')}
                    </h4>
                    <p className="mx-auto mb-8 max-w-md font-medium leading-relaxed text-gray-400">
                      {t('suggestions.form.success_msg')}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormStatus('idle')}
                      className="hover:bg-(--accent) rounded-full bg-white px-10 py-4 text-sm font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-105 active:scale-95"
                    >
                      {t('suggestions.form.send_another')}
                    </button>
                  </div>
                ) : (
                  <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="focus-within:border-(--accent) flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-colors">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          <NicknameAvatar nickname={watchNickname} />
                        </div>
                        <div className="flex grow flex-col">
                          <label
                            htmlFor="suggestion-nickname"
                            className="text-[9px] font-black uppercase tracking-widest text-gray-500"
                          >
                            {t('suggestions.form.nick')}
                          </label>
                          <input
                            id="suggestion-nickname"
                            type="text"
                            className="mt-0.5 w-full bg-transparent text-sm font-bold text-white placeholder:text-white/20 focus:outline-none"
                            placeholder={t('suggestions.form.nick_placeholder')}
                            {...register('nickname')}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="suggestion-type"
                          className="mb-1 ml-4 text-[9px] font-black uppercase tracking-widest text-gray-500"
                        >
                          {t('suggestions.form.type')}
                        </label>
                        <select
                          id="suggestion-type"
                          className="focus:border-(--accent) h-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-black/20 px-6 py-4 text-sm font-bold text-white transition-colors focus:outline-none"
                          {...register('type')}
                        >
                          <option value="General" className={SELECT_OPTION_CLASS}>
                            {t('suggestions.form.options.general')}
                          </option>
                          <option value="Bug" className={SELECT_OPTION_CLASS}>
                            {t('suggestions.form.options.bug')}
                          </option>
                          <option value="Mod" className={SELECT_OPTION_CLASS}>
                            {t('suggestions.form.options.mod')}
                          </option>
                          <option value="Complaint" className={SELECT_OPTION_CLASS}>
                            {t('suggestions.form.options.complaint')}
                          </option>
                          <option value="Poll" className={SELECT_OPTION_CLASS}>
                            {t('suggestions.form.options.poll')}
                          </option>
                        </select>
                      </div>
                    </div>

                    {errors.nickname && (
                      <span className="-mt-3 ml-4 text-[10px] font-bold uppercase text-red-500">
                        {errors.nickname.message}
                      </span>
                    )}

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="suggestion-message"
                        className="ml-4 text-[9px] font-black uppercase tracking-widest text-gray-500"
                      >
                        {t('suggestions.form.msg')}
                      </label>
                      <textarea
                        id="suggestion-message"
                        className="focus:border-(--accent) min-h-37.5 resize-none rounded-3xl border border-white/10 bg-black/20 px-6 py-4 text-sm font-medium leading-relaxed text-white transition-colors placeholder:text-white/10 focus:outline-none"
                        placeholder={t('suggestions.form.msg_placeholder')}
                        {...register('message')}
                      />
                      {errors.message && (
                        <span className="ml-4 text-[10px] font-bold uppercase text-red-500">
                          {errors.message.message}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="hover:bg-(--accent) mt-2 rounded-2xl bg-white py-5 font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      disabled={isSubmitting || formStatus === 'sending'}
                    >
                      {isSubmitting || formStatus === 'sending' ? (
                        <span className="flex items-center justify-center gap-3">
                          <Loader2 className="animate-spin" /> Validando propuesta por IA...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <Send className="text-xs" /> {t('suggestions.form.submit')}
                        </span>
                      )}
                    </button>

                    {rewardSuccessMsg && (
                      <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-emerald-400">
                        {rewardSuccessMsg}
                      </p>
                    )}

                    {formStatus === 'error' && (
                      <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-red-400">
                        {validationError || t('suggestions.form.error_msg')}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* MURO DE SUGERENCIAS */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 flex h-12 w-12 items-center justify-center rounded-2xl border text-xl">
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
                    onVote={handleVoteSuggestion}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* DERECHA: VOTACIONES (2/5) */}
          <div className="polls-column lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 flex h-12 w-12 items-center justify-center rounded-2xl border text-xl">
                <BarChart2 />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
                {t('suggestions.poll_title')}
              </h3>
            </div>

            <PollWidget poll={poll} isLoading={loadingPoll} voted={voted} onVote={handleVote} />
          </div>
        </div>
      </Section>
    </Section>
  );
}
