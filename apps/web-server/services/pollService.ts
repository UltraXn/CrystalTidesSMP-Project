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

interface PaginatedPollsQuery {
  page: number;
  limit: number;
}

const TABLES = {
  POLLS: 'polls',
  POLL_OPTIONS: 'poll_options',
  POLL_VOTES: 'poll_votes',
} as const;

const COLUMNS = {
  ID: 'id',
  IS_ACTIVE: 'is_active',
  CREATED_AT: 'created_at',
  POLL_ID: 'poll_id',
  VOTES: 'votes',
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
  DAYS_SUFFIX: 'días',
  HOURS_SUFFIX: 'horas',
} as const;

const ERRORS = {
  OPTION_NOT_FOUND: 'Option not found',
  INVALID_OPTION_FOR_POLL: 'Invalid option for this poll',
  POLL_NOT_FOUND: 'Poll not found',
  POLL_INACTIVE: 'La encuesta ya no está activa',
  POLL_EXPIRED: 'La encuesta ha finalizado',
  ALREADY_VOTED: 'Ya has votado en esta encuesta',
} as const;

// --- Helper Functions: Aggregations & Result Computation ---

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
  if (days > 0) return `${days} ${TIME_STRINGS.DAYS_SUFFIX}`;

  const hours = Math.floor((remainingMs / CONSTANTS.MS_PER_HOUR) % 24);
  return `${hours} ${TIME_STRINGS.HOURS_SUFFIX}`;
};

const formatClosesInById = (closesAt?: string | null): string => {
  if (!closesAt) return TIME_STRINGS.UNDEFINED;

  const remainingMs = Date.parse(closesAt) - Date.now();
  if (remainingMs <= 0) return TIME_STRINGS.FINISHED;

  const days = Math.floor(remainingMs / CONSTANTS.MS_PER_DAY);
  return `${days} ${TIME_STRINGS.DAYS_SUFFIX}`;
};

const buildEnrichedPoll = (
  poll: Poll,
  options: PollOption[] | null,
  closesInFormatter: (closesAt?: string | null) => string,
): Poll => {
  const safeOptions: PollOption[] = options || [];
  const { totalVotes, optionsWithPercent } = aggregateOptionVotes(safeOptions);
  const closesIn = closesInFormatter(poll.closes_at);

  return {
    ...poll,
    options: optionsWithPercent,
    totalVotes,
    closesIn,
  };
};

const computePollTotalVotes = (
  pollId: number,
  options: Pick<PollOption, 'poll_id' | 'votes'>[],
): number => {
  return options
    .filter((opt) => opt.poll_id === pollId)
    .reduce((acc: number, curr) => acc + (curr.votes || 0), 0);
};

// --- Helper Functions: Vote Validations & Operations ---

const validateOptionBelongsToPoll = async (pollId: number, optionId: number): Promise<void> => {
  const { data: option, error } = await supabase
    .from(TABLES.POLL_OPTIONS)
    .select('id, poll_id')
    .eq(COLUMNS.ID, optionId)
    .single();

  if (error || !option) {
    throw new Error(ERRORS.OPTION_NOT_FOUND);
  }
  if (option.poll_id !== pollId) {
    throw new Error(ERRORS.INVALID_OPTION_FOR_POLL);
  }
};

const validatePollIsActiveAndOpen = async (pollId: number): Promise<void> => {
  const { data: poll, error } = await supabase
    .from(TABLES.POLLS)
    .select('is_active, closes_at')
    .eq(COLUMNS.ID, pollId)
    .single();

  if (error || !poll) {
    throw new Error(ERRORS.POLL_NOT_FOUND);
  }
  if (!poll.is_active) {
    throw new Error(ERRORS.POLL_INACTIVE);
  }
  if (poll.closes_at && new Date(poll.closes_at) <= new Date()) {
    throw new Error(ERRORS.POLL_EXPIRED);
  }
};

const recordUserVote = async (pollId: number, optionId: number, userId: string): Promise<void> => {
  const { error: voteError } = await supabase.from(TABLES.POLL_VOTES).insert([
    {
      poll_id: pollId,
      user_id: userId,
      option_id: optionId,
    },
  ]);

  if (!voteError) return;

  if (voteError.code === CONSTANTS.PG_UNIQUE_VIOLATION) {
    throw new Error(ERRORS.ALREADY_VOTED);
  }
  throw voteError;
};

const fetchOptionVotes = async (optionId: number): Promise<number> => {
  const { data: updatedOption } = await supabase
    .from(TABLES.POLL_OPTIONS)
    .select(COLUMNS.VOTES)
    .eq(COLUMNS.ID, optionId)
    .single();

  return updatedOption?.votes || 0;
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

const upsertOptionAtIndex = async (
  pollId: number,
  optionInput: string | { label: string; label_en?: string },
  existingOption?: PollOption,
): Promise<void> => {
  const { label, label_en } = await resolveOptionLabelAndTranslation(optionInput);

  if (existingOption) {
    await supabase
      .from(TABLES.POLL_OPTIONS)
      .update({ label, label_en })
      .eq(COLUMNS.ID, existingOption.id);
    return;
  }

  await supabase.from(TABLES.POLL_OPTIONS).insert({
    poll_id: pollId,
    label,
    label_en,
    votes: 0,
  });
};

const syncPollOptions = async (
  pollId: number,
  options: (string | { label: string; label_en?: string })[],
  existingOptions: PollOption[],
): Promise<void> => {
  for (let i = 0; i < options.length; i++) {
    await upsertOptionAtIndex(pollId, options[i], existingOptions[i]);
  }

  if (existingOptions.length > options.length) {
    const toDelete = existingOptions.slice(options.length).map((o) => o.id);
    await supabase.from(TABLES.POLL_OPTIONS).delete().in(COLUMNS.ID, toDelete);
  }
};

const deactivateGlobalPolls = async (): Promise<void> => {
  await supabase
    .from(TABLES.POLLS)
    .update({ is_active: false })
    .is('thread_id', null)
    .neq(COLUMNS.ID, -1);
};

// --- Exported Service Operations ---

export const getActivePoll = async () => {
  const { data: poll, error } = await supabase
    .from(TABLES.POLLS)
    .select('*')
    .eq(COLUMNS.IS_ACTIVE, true)
    .order(COLUMNS.CREATED_AT, { ascending: false })
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
    .eq(COLUMNS.POLL_ID, poll.id)
    .order(COLUMNS.ID, { ascending: true });

  return buildEnrichedPoll(poll as Poll, options, formatClosesInActive);
};

export const getPollById = async (id: number) => {
  const { data: poll, error } = await supabase
    .from(TABLES.POLLS)
    .select('*')
    .eq(COLUMNS.ID, id)
    .single();

  if (error || !poll) return null;

  const { data: options } = await supabase
    .from(TABLES.POLL_OPTIONS)
    .select('*')
    .eq(COLUMNS.POLL_ID, poll.id);

  return buildEnrichedPoll(poll as Poll, options, formatClosesInById);
};

export const votePoll = async (pollId: number, optionId: number, userId: string) => {
  await validateOptionBelongsToPoll(pollId, optionId);
  await validatePollIsActiveAndOpen(pollId);
  await recordUserVote(pollId, optionId, userId);

  const votes = await fetchOptionVotes(optionId);
  return { success: true, votes };
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
    await deactivateGlobalPolls();
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
    .eq(COLUMNS.ID, id)
    .select()
    .single();

  if (error) throw error;

  if (options && Array.isArray(options)) {
    const { data: existingOptions } = await supabase
      .from(TABLES.POLL_OPTIONS)
      .select('*')
      .eq(COLUMNS.POLL_ID, id)
      .order(COLUMNS.ID, { ascending: true });

    await syncPollOptions(id, options, existingOptions || []);
  }

  return poll;
};

export const closePoll = async (id: number) => {
  const { error } = await supabase.from(TABLES.POLLS).update({ is_active: false }).eq(COLUMNS.ID, id);

  if (error) throw error;
  return { success: true };
};

export const deletePoll = async (id: number) => {
  await supabase.from(TABLES.POLL_OPTIONS).delete().eq(COLUMNS.POLL_ID, id);

  const { error } = await supabase.from(TABLES.POLLS).delete().eq(COLUMNS.ID, id);
  if (error) throw error;

  return { success: true };
};

export const getPolls = async ({ page = 1, limit = 10 }: PaginatedPollsQuery) => {
  const offset = (page - 1) * limit;

  const {
    data: polls,
    count,
    error,
  } = await supabase
    .from(TABLES.POLLS)
    .select('*', { count: 'exact' })
    .order(COLUMNS.CREATED_AT, { ascending: false })
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
    .in(COLUMNS.POLL_ID, pollIds);

  const safeOptions: Pick<PollOption, 'poll_id' | 'votes'>[] = options || [];

  const enrichedPolls = safePolls.map((p) => ({
    ...p,
    totalVotes: computePollTotalVotes(p.id, safeOptions),
  }));

  return {
    data: enrichedPolls,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};