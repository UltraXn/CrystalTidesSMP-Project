import supabase from './supabaseService.js';
import { translateText } from './translationService.js';

interface PollOption {
  id: number;
  poll_id: number;
  label: string;
  label_en?: string | null;
  votes?: number;
}

interface OptionWithPercent extends PollOption {
  percent: number;
}

interface Poll {
  id: number;
  title: string;
  title_en?: string | null;
  question: string;
  question_en?: string | null;
  is_active: boolean;
  closes_at?: string | null;
  created_at?: string;
  thread_id?: number | null;
  discord_link?: string | null;
  options?: PollOption[];
  totalVotes?: number;
  closesIn?: string;
}

interface CreatePollDTO {
  title: string;
  title_en?: string;
  question: string;
  question_en?: string;
  options: (string | { label: string; label_en?: string })[];
  closes_at?: string;
  thread_id?: number;
  discord_link?: string;
}

interface UpdatePollDTO {
  title: string;
  title_en?: string;
  question: string;
  question_en?: string;
  options: (string | { label: string; label_en?: string })[];
  closes_at?: string;
}

const TABLES = {
  POLLS: 'polls',
  POLL_OPTIONS: 'poll_options',
  POLL_VOTES: 'poll_votes',
} as const;

const CONSTANTS = {
  DEFAULT_LOCALE: 'en',
  PG_UNIQUE_VIOLATION: '23505',
  MS_PER_HOUR: 1000 * 60 * 60,
  MS_PER_DAY: 1000 * 60 * 60 * 24,
} as const;

const TIME_STRINGS = {
  UNDEFINED: 'Indefinido',
  FINISHED: 'Finalizada',
} as const;

const ERRORS = {
  OPTION_NOT_FOUND: 'Option not found',
  INVALID_OPTION_FOR_POLL: 'Invalid option for this poll',
  POLL_NOT_FOUND: 'Poll not found',
  POLL_INACTIVE: 'La encuesta ya no está activa',
  POLL_EXPIRED: 'La encuesta ha finalizado',
  ALREADY_VOTED: 'Ya has votado en esta encuesta',
} as const;

// --- Helper Functions: Aggregations & Time Formatting ---

interface AggregatedPollOptions {
  totalVotes: number;
  optionsWithPercent: OptionWithPercent[];
}

const aggregateOptionVotes = (options: PollOption[]): AggregatedPollOptions => {
  const totalVotes = options.reduce((sum: number, opt: PollOption) => sum + (opt.votes || 0), 0);
  const optionsWithPercent: OptionWithPercent[] = options.map((opt: PollOption) => ({
    ...opt,
    percent: totalVotes === 0 ? 0 : Math.round(((opt.votes || 0) / totalVotes) * 100),
  }));

  return { totalVotes, optionsWithPercent };
};

const formatClosesInActive = (closesAt?: string | null): string => {
  if (!closesAt) return TIME_STRINGS.UNDEFINED;

  const remainingMs = Date.parse(closesAt) - Date.now();
  if (remainingMs <= 0) return TIME_STRINGS.FINISHED;

  const days = Math.floor(remainingMs / CONSTANTS.MS_PER_DAY);
  if (days > 0) return `${days} días`;

  const hours = Math.floor((remainingMs / CONSTANTS.MS_PER_HOUR) % 24);
  return `${hours} horas`;
};

const formatClosesInById = (closesAt?: string | null): string => {
  if (!closesAt) return TIME_STRINGS.UNDEFINED;

  const remainingMs = Date.parse(closesAt) - Date.now();
  if (remainingMs <= 0) return TIME_STRINGS.FINISHED;

  const days = Math.floor(remainingMs / CONSTANTS.MS_PER_DAY);
  return `${days} días`;
};

// --- Helper Functions: Vote Validations ---

const validateOptionBelongsToPoll = async (pollId: number, optionId: number): Promise<void> => {
  const { data: option, error } = await supabase
    .from(TABLES.POLL_OPTIONS)
    .select('id, poll_id')
    .eq('id', optionId)
    .single();

  if (error || !option) throw new Error(ERRORS.OPTION_NOT_FOUND);
  if (option.poll_id !== pollId) throw new Error(ERRORS.INVALID_OPTION_FOR_POLL);
};

const validatePollIsActiveAndOpen = async (pollId: number): Promise<void> => {
  const { data: poll, error } = await supabase
    .from(TABLES.POLLS)
    .select('is_active, closes_at')
    .eq('id', pollId)
    .single();

  if (error || !poll) throw new Error(ERRORS.POLL_NOT_FOUND);
  if (!poll.is_active) throw new Error(ERRORS.POLL_INACTIVE);
  if (poll.closes_at && new Date(poll.closes_at) <= new Date()) {
    throw new Error(ERRORS.POLL_EXPIRED);
  }
};

// --- Helper Functions: Translation & Option Synchronization ---

const resolveLocalizedText = async (
  text: string,
  existingTranslation?: string | null,
): Promise<string> => {
  if (existingTranslation) {
    return existingTranslation;
  }
  return translateText(text, CONSTANTS.DEFAULT_LOCALE);
};

const resolveOptionLabelAndTranslation = async (
  opt: string | { label: string; label_en?: string },
): Promise<{ label: string; label_en: string }> => {
  if (typeof opt === 'string') {
    const label_en = await translateText(opt, CONSTANTS.DEFAULT_LOCALE);
    return { label: opt, label_en };
  }

  const label_en = opt.label_en
    ? opt.label_en
    : await translateText(opt.label, CONSTANTS.DEFAULT_LOCALE);
  return { label: opt.label, label_en };
};

const prepareOptionsForInsert = async (
  pollId: number,
  options: (string | { label: string; label_en?: string })[],
) => {
  return Promise.all(
    options.map(async (opt) => {
      const { label, label_en } = await resolveOptionLabelAndTranslation(opt);
      return {
        poll_id: pollId,
        label,
        label_en,
        votes: 0,
      };
    }),
  );
};

const syncPollOptions = async (
  pollId: number,
  options: (string | { label: string; label_en?: string })[],
  existingOptions: PollOption[],
): Promise<void> => {
  for (let i = 0; i < options.length; i++) {
    const { label, label_en } = await resolveOptionLabelAndTranslation(options[i]);

    if (i < existingOptions.length) {
      await supabase
        .from(TABLES.POLL_OPTIONS)
        .update({ label, label_en })
        .eq('id', existingOptions[i].id);
    } else {
      await supabase.from(TABLES.POLL_OPTIONS).insert({
        poll_id: pollId,
        label,
        label_en,
        votes: 0,
      });
    }
  }

  if (existingOptions.length > options.length) {
    const toDelete = existingOptions.slice(options.length).map((o) => o.id);
    await supabase.from(TABLES.POLL_OPTIONS).delete().in('id', toDelete);
  }
};

// --- Exported Service Operations ---

export const getActivePoll = async () => {
  const { data: poll, error } = await supabase
    .from(TABLES.POLLS)
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active poll:', error);
    return null;
  }
  if (!poll) return null;

  const { data: options } = await supabase
    .from(TABLES.POLL_OPTIONS)
    .select('*')
    .eq('poll_id', poll.id)
    .order('id', { ascending: true });

  const safeOptions: PollOption[] = options || [];
  const { totalVotes, optionsWithPercent } = aggregateOptionVotes(safeOptions);
  const closesIn = formatClosesInActive(poll.closes_at);

  return {
    ...poll,
    options: optionsWithPercent,
    totalVotes,
    closesIn,
  };
};

export const getPollById = async (id: number) => {
  const { data: poll, error } = await supabase.from(TABLES.POLLS).select('*').eq('id', id).single();

  if (error || !poll) return null;

  const { data: options } = await supabase
    .from(TABLES.POLL_OPTIONS)
    .select('*')
    .eq('poll_id', poll.id);

  const safeOptions: PollOption[] = options || [];
  const { totalVotes, optionsWithPercent } = aggregateOptionVotes(safeOptions);
  const closesIn = formatClosesInById(poll.closes_at);

  return { ...poll, options: optionsWithPercent, totalVotes, closesIn };
};

export const votePoll = async (pollId: number, optionId: number, userId: string) => {
  await validateOptionBelongsToPoll(pollId, optionId);
  await validatePollIsActiveAndOpen(pollId);

  const { error: voteError } = await supabase.from(TABLES.POLL_VOTES).insert([
    {
      poll_id: pollId,
      user_id: userId,
      option_id: optionId,
    },
  ]);

  if (voteError) {
    if (voteError.code === CONSTANTS.PG_UNIQUE_VIOLATION) {
      throw new Error(ERRORS.ALREADY_VOTED);
    }
    throw voteError;
  }

  const { data: updatedOption } = await supabase
    .from(TABLES.POLL_OPTIONS)
    .select('votes')
    .eq('id', optionId)
    .single();

  return { success: true, votes: updatedOption?.votes || 0 };
};

export const createPoll = async ({
  title,
  title_en,
  question,
  question_en,
  options,
  closes_at,
  thread_id,
  discord_link,
}: CreatePollDTO) => {
  if (!thread_id) {
    await supabase
      .from(TABLES.POLLS)
      .update({ is_active: false })
      .is('thread_id', null)
      .neq('id', -1);
  }

  const finalTitleEn = await resolveLocalizedText(title, title_en);
  const finalQuestionEn = await resolveLocalizedText(question, question_en);

  const { data: poll, error } = await supabase
    .from(TABLES.POLLS)
    .insert([
      {
        title,
        question,
        title_en: finalTitleEn,
        question_en: finalQuestionEn,
        is_active: true,
        closes_at,
        thread_id: thread_id || null,
        discord_link: discord_link || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  if (options && options.length > 0) {
    const optionsData = await prepareOptionsForInsert(poll.id, options);
    const { error: optError } = await supabase.from(TABLES.POLL_OPTIONS).insert(optionsData);
    if (optError) throw optError;
  }

  return poll;
};

export const updatePoll = async (
  id: number,
  { title, title_en, question, question_en, options, closes_at }: UpdatePollDTO,
) => {
  const finalTitleEn = await resolveLocalizedText(title, title_en);
  const finalQuestionEn = await resolveLocalizedText(question, question_en);

  const { data: poll, error } = await supabase
    .from(TABLES.POLLS)
    .update({
      title,
      title_en: finalTitleEn,
      question,
      question_en: finalQuestionEn,
      closes_at,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (options && Array.isArray(options)) {
    const { data: existingOptions } = await supabase
      .from(TABLES.POLL_OPTIONS)
      .select('*')
      .eq('poll_id', id)
      .order('id', { ascending: true });

    const safeExisting: PollOption[] = existingOptions || [];
    await syncPollOptions(id, options, safeExisting);
  }

  return poll;
};

export const closePoll = async (id: number) => {
  const { error } = await supabase.from(TABLES.POLLS).update({ is_active: false }).eq('id', id);

  if (error) throw error;
  return { success: true };
};

export const deletePoll = async (id: number) => {
  await supabase.from(TABLES.POLL_OPTIONS).delete().eq('poll_id', id);

  const { error } = await supabase.from(TABLES.POLLS).delete().eq('id', id);
  if (error) throw error;

  return { success: true };
};

export const getPolls = async ({ page = 1, limit = 10 }: { page: number; limit: number }) => {
  const offset = (page - 1) * limit;

  const {
    data: polls,
    count,
    error,
  } = await supabase
    .from(TABLES.POLLS)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  if (!polls || polls.length === 0) {
    return { data: [], total: 0, page, totalPages: 0 };
  }

  const safePolls: Poll[] = polls as Poll[];
  const pollIds = safePolls.map((p) => p.id);

  const { data: options } = await supabase
    .from(TABLES.POLL_OPTIONS)
    .select('poll_id, votes')
    .in('poll_id', pollIds);

  const safeOptions: Partial<PollOption>[] = options || [];

  const enrichedPolls = safePolls.map((p) => {
    const pOptions = safeOptions.filter((o) => o.poll_id === p.id);
    const totalVotes = pOptions.reduce(
      (acc: number, curr: Partial<PollOption>) => acc + (curr.votes || 0),
      0,
    );
    return { ...p, totalVotes };
  });

  return {
    data: enrichedPolls,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};
