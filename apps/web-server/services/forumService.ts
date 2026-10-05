import supabase from './supabaseService.js';
import * as pollService from './pollService.js';
import * as discordService from './discordService.js';
import { STAFF_ROLES } from '../utils/roleUtils.js';

interface Requestor {
  id: string;
  role: string;
}

export interface ForumThread {
  id: number;
  category_id: number;
  user_id: string;
  author_name: string;
  author_avatar: string;
  author_role: string;
  title: string;
  content: string;
  slug: string;
  views: number;
  pinned: boolean;
  poll_id?: number | null;
  created_at: string;
  reply_count?: number;
  forum_posts?: { count: number }[];
}

export interface ForumPost {
  id: number;
  thread_id: number;
  user_id: string;
  author_name: string;
  author_avatar: string;
  author_role: string;
  content: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
  status_message: string;
  avatar_preference: string;
  community_pref: string;
  minecraft_uuid: string;
  minecraft_nick: string;
  social_discord: string;
  social_avatar_url: string;
}

interface CreateThreadData {
  category_id: number;
  title: string;
  content: string;
  user_data: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  poll_data?: {
    enabled: boolean;
    question?: string;
    options?: string[];
    closes_at?: string;
    discord_link?: string;
  };
}

interface CategoryActivity {
  user: string;
  date: string;
}

interface CategoryStat {
  id: number;
  topics: number;
  posts: number;
  lastPost: CategoryActivity;
}

interface ThreadActivityItem {
  author_name: string;
  created_at: string;
}

interface ThreadWithCountRelation extends ForumThread {
  forum_posts?: { count: number }[];
}

interface ThreadOwnershipRecord {
  id: number;
  user_id: string;
  poll_id?: number | null;
}

const TABLES = {
  FORUM_THREADS: 'forum_threads',
  FORUM_POSTS: 'forum_posts',
  PROFILES: 'profiles',
  NEWS: 'news',
} as const;

const COLUMNS = {
  ID: 'id',
  SLUG: 'slug',
  CATEGORY_ID: 'category_id',
  USER_ID: 'user_id',
  THREAD_ID: 'thread_id',
  STATUS: 'status',
  PINNED: 'pinned',
} as const;

const CONSTANTS = {
  CREATED_AT: 'created_at',
  PUBLISHED: 'Published',
  DEFAULT_AUTHOR: 'Staff',
  DASH: '-',
} as const;

const ERRORS = {
  THREAD_NOT_FOUND: 'Thread not found',
  POST_NOT_FOUND: 'Post not found',
  FORBIDDEN_THREAD: 'Forbidden: You do not own this thread',
  FORBIDDEN_POST: 'Forbidden: You do not own this post',
} as const;

const THREAD_POST_COUNT_SELECT = '*, forum_posts(count)' as const;
const AUTHOR_ACTIVITY_SELECT = 'author_name, created_at' as const;
const EXACT_COUNT_CONFIG = { count: 'exact', head: true } as const;

const BASE_PROFILE_FIELDS =
  'username, full_name, avatar_url, role, status_message, avatar_preference, community_pref, minecraft_uuid, minecraft_nick, social_discord, social_avatar_url' as const;
const PROFILE_SELECT_FIELDS = `id, ${BASE_PROFILE_FIELDS}` as const;

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const isNumericString = (value: string): boolean => /^\d+$/.test(value);

const formatDate = (isoDate: string): string => new Date(isoDate).toLocaleDateString();

const isStaffUser = (role: string): boolean => STAFF_ROLES.includes(role.toLowerCase());

const assertThreadOwnership = (userId: string, requestor: Requestor): void => {
  if (userId !== requestor.id && !isStaffUser(requestor.role)) {
    throw new Error(ERRORS.FORBIDDEN_THREAD);
  }
};

const assertPostOwnership = (userId: string, requestor: Requestor): void => {
  if (userId !== requestor.id && !isStaffUser(requestor.role)) {
    throw new Error(ERRORS.FORBIDDEN_POST);
  }
};

const mapThreadReplyCount = (thread: ThreadWithCountRelation): ForumThread => {
  const replyCount = thread.forum_posts?.[0]?.count ?? 0;
  const threadWithoutRelation: ForumThread = {
    ...thread,
    reply_count: replyCount,
  };
  delete threadWithoutRelation.forum_posts;
  return threadWithoutRelation;
};

const resolveThreadId = async (idOrSlug: number | string): Promise<number | null> => {
  if (typeof idOrSlug === 'number') {
    return idOrSlug;
  }
  if (isNumericString(idOrSlug)) {
    return Number.parseInt(idOrSlug, 10);
  }

  const { data: thread } = await supabase
    .from(TABLES.FORUM_THREADS)
    .select(COLUMNS.ID)
    .eq(COLUMNS.SLUG, idOrSlug)
    .maybeSingle();

  return thread?.id ?? null;
};

const getThreadForModification = async (
  idOrSlug: number | string,
  requestor: Requestor,
): Promise<ThreadOwnershipRecord> => {
  const isNumeric = typeof idOrSlug === 'number' || isNumericString(String(idOrSlug));
  const query = supabase.from(TABLES.FORUM_THREADS).select('id, user_id, poll_id');

  const { data: thread, error } = isNumeric
    ? await query.eq(COLUMNS.ID, idOrSlug).maybeSingle()
    : await query.eq(COLUMNS.SLUG, idOrSlug).maybeSingle();

  if (error || !thread) {
    throw new Error(ERRORS.THREAD_NOT_FOUND);
  }

  assertThreadOwnership(thread.user_id, requestor);
  return thread;
};

const getPostForModification = async (
  id: number,
  requestor: Requestor,
): Promise<{ user_id: string }> => {
  const { data: post } = await supabase
    .from(TABLES.FORUM_POSTS)
    .select(COLUMNS.USER_ID)
    .eq(COLUMNS.ID, id)
    .single();

  if (!post) {
    throw new Error(ERRORS.POST_NOT_FOUND);
  }

  assertPostOwnership(post.user_id, requestor);
  return post;
};

const fetchAuthorProfilesMap = async (userIds: string[]): Promise<Map<string, UserProfile>> => {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data: profiles } = await supabase
    .from(TABLES.PROFILES)
    .select(PROFILE_SELECT_FIELDS)
    .in(COLUMNS.ID, uniqueIds);

  return new Map(
    ((profiles ?? []) as unknown as UserProfile[]).map((profile) => [profile.id, profile]),
  );
};

const attachPollToThread = async (
  threadId: number,
  title: string,
  pollData: NonNullable<CreateThreadData['poll_data']>,
): Promise<void> => {
  const poll = await pollService.createPoll({
    thread_id: threadId,
    title: `${title} - Encuesta`,
    question: pollData.question || 'Encuesta externa',
    options: pollData.options || [],
    closes_at: pollData.closes_at,
    discord_link: pollData.discord_link,
  });

  await supabase.from(TABLES.FORUM_THREADS).update({ poll_id: poll.id }).eq(COLUMNS.ID, threadId);
};

const resolveLastActivity = (
  latestThread: ThreadActivityItem | null,
  latestReply: ThreadActivityItem | null,
): ThreadActivityItem | null => {
  if (!latestThread) return latestReply;
  if (!latestReply) return latestThread;
  return new Date(latestThread.created_at) > new Date(latestReply.created_at)
    ? latestThread
    : latestReply;
};

const fetchLatestForumActivity = async (
  catId: number,
  threadIds: number[],
): Promise<CategoryActivity> => {
  const { data: latestThread } = await supabase
    .from(TABLES.FORUM_THREADS)
    .select(AUTHOR_ACTIVITY_SELECT)
    .eq(COLUMNS.CATEGORY_ID, catId)
    .order(CONSTANTS.CREATED_AT, { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: latestReply } = await supabase
    .from(TABLES.FORUM_POSTS)
    .select(AUTHOR_ACTIVITY_SELECT)
    .in(COLUMNS.THREAD_ID, threadIds)
    .order(CONSTANTS.CREATED_AT, { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastActivity = resolveLastActivity(latestThread, latestReply);
  if (!lastActivity) {
    return { user: CONSTANTS.DASH, date: CONSTANTS.DASH };
  }

  return {
    user: lastActivity.author_name,
    date: formatDate(lastActivity.created_at),
  };
};

const getNewsCategoryStats = async (): Promise<CategoryStat> => {
  const { count: newsCount } = await supabase
    .from(TABLES.NEWS)
    .select('*', EXACT_COUNT_CONFIG)
    .eq(COLUMNS.STATUS, CONSTANTS.PUBLISHED);

  const { data: latestNews } = await supabase
    .from(TABLES.NEWS)
    .select('author, created_at')
    .eq(COLUMNS.STATUS, CONSTANTS.PUBLISHED)
    .order(CONSTANTS.CREATED_AT, { ascending: false })
    .limit(1)
    .maybeSingle();

  const newsLastPost: CategoryActivity = latestNews
    ? {
        user: latestNews.author || CONSTANTS.DEFAULT_AUTHOR,
        date: formatDate(latestNews.created_at),
      }
    : { user: CONSTANTS.DEFAULT_AUTHOR, date: CONSTANTS.DASH };

  const totalNews = newsCount ?? 0;
  return {
    id: 1,
    topics: totalNews,
    posts: totalNews,
    lastPost: newsLastPost,
  };
};

const countCategoryThreads = async (catId: number): Promise<number> => {
  const { count } = await supabase
    .from(TABLES.FORUM_THREADS)
    .select('*', EXACT_COUNT_CONFIG)
    .eq(COLUMNS.CATEGORY_ID, catId);

  return count ?? 0;
};

const fetchCategoryThreadIds = async (catId: number): Promise<number[]> => {
  const { data: threads } = await supabase
    .from(TABLES.FORUM_THREADS)
    .select(COLUMNS.ID)
    .eq(COLUMNS.CATEGORY_ID, catId);

  return threads ? threads.map((thread) => thread.id) : [];
};

const countThreadReplies = async (threadIds: number[]): Promise<number> => {
  if (threadIds.length === 0) return 0;

  const { count } = await supabase
    .from(TABLES.FORUM_POSTS)
    .select('*', EXACT_COUNT_CONFIG)
    .in(COLUMNS.THREAD_ID, threadIds);

  return count ?? 0;
};

const getForumCategoryStats = async (catId: number): Promise<CategoryStat> => {
  const threadCount = await countCategoryThreads(catId);
  const threadIds = await fetchCategoryThreadIds(catId);

  if (threadIds.length === 0) {
    return {
      id: catId,
      topics: threadCount,
      posts: 0,
      lastPost: { user: CONSTANTS.DASH, date: CONSTANTS.DASH },
    };
  }

  const [replyCount, lastPostData] = await Promise.all([
    countThreadReplies(threadIds),
    fetchLatestForumActivity(catId, threadIds),
  ]);

  return {
    id: catId,
    topics: threadCount,
    posts: replyCount,
    lastPost: lastPostData,
  };
};

const fetchThreadPoll = async (pollId: number | null | undefined) => {
  if (!pollId) return null;
  return pollService.getPollById(pollId);
};

const fetchFreshAuthorProfile = async (userId: string) => {
  const { data: profile } = await supabase
    .from(TABLES.PROFILES)
    .select(BASE_PROFILE_FIELDS)
    .eq(COLUMNS.ID, userId)
    .maybeSingle();

  return profile;
};

const attachAuthorProfilesToPosts = async (posts: ForumPost[]) => {
  const profileMap = await fetchAuthorProfilesMap(posts.map((post) => post.user_id));

  return posts.map((post) => ({
    ...post,
    author_data_fresh: profileMap.get(post.user_id) ?? null,
  }));
};

const cleanupThreadPoll = async (pollId?: number | null): Promise<void> => {
  if (!pollId) return;

  try {
    await pollService.deletePoll(pollId);
  } catch (err) {
    console.error('Error cleaning up poll:', err);
  }
};

export const getThreads = async (categoryId: number): Promise<ForumThread[]> => {
  const { data, error } = await supabase
    .from(TABLES.FORUM_THREADS)
    .select(THREAD_POST_COUNT_SELECT)
    .eq(COLUMNS.CATEGORY_ID, categoryId)
    .order(COLUMNS.PINNED, { ascending: false })
    .order(CONSTANTS.CREATED_AT, { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as ThreadWithCountRelation[]).map(mapThreadReplyCount);
};

export const getUserThreads = async (userId: string): Promise<ForumThread[]> => {
  const { data, error } = await supabase
    .from(TABLES.FORUM_THREADS)
    .select(THREAD_POST_COUNT_SELECT)
    .eq(COLUMNS.USER_ID, userId)
    .order(CONSTANTS.CREATED_AT, { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as ThreadWithCountRelation[]).map(mapThreadReplyCount);
};

export const getThread = async (id: number | string) => {
  const isNumeric = isNumericString(String(id));
  const query = supabase.from(TABLES.FORUM_THREADS).select('*');

  const { data: thread, error } = isNumeric
    ? await query.eq(COLUMNS.ID, id).single()
    : await query.eq(COLUMNS.SLUG, id).single();

  if (error) throw error;

  const [poll, authorProfile] = await Promise.all([
    fetchThreadPoll(thread.poll_id),
    fetchFreshAuthorProfile(thread.user_id),
  ]);

  return { ...thread, poll, author_data_fresh: authorProfile };
};

export const createThread = async ({
  category_id,
  title,
  content,
  user_data,
  poll_data,
}: CreateThreadData) => {
  const slug = slugify(title);

  const { data: thread, error } = await supabase
    .from(TABLES.FORUM_THREADS)
    .insert([
      {
        category_id,
        user_id: user_data.id,
        author_name: user_data.name,
        author_avatar: user_data.avatar,
        author_role: user_data.role,
        title,
        content,
        slug,
        views: 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  if (poll_data?.enabled) {
    await attachPollToThread(thread.id, title, poll_data);
  }

  discordService.notifyNewThread(thread).catch(console.error);

  return thread;
};

export const getPosts = async (threadIdOrSlug: number | string) => {
  const threadId = await resolveThreadId(threadIdOrSlug);
  if (threadId === null) {
    return [];
  }

  const { data: posts, error } = await supabase
    .from(TABLES.FORUM_POSTS)
    .select('*')
    .eq(COLUMNS.THREAD_ID, threadId)
    .order(CONSTANTS.CREATED_AT, { ascending: true });

  if (error) {
    console.error('Error fetching posts for thread:', threadId, error);
    throw error;
  }

  if (!posts || posts.length === 0) {
    return [];
  }

  return attachAuthorProfilesToPosts(posts as unknown as ForumPost[]);
};

export const createPost = async ({
  thread_id,
  content,
  user_data,
}: {
  thread_id: number | string;
  content: string;
  user_data: { id: string; name: string; avatar: string; role: string };
}) => {
  const resolvedThreadId = await resolveThreadId(thread_id);
  if (resolvedThreadId === null) {
    throw new Error(ERRORS.THREAD_NOT_FOUND);
  }

  const { data, error } = await supabase
    .from(TABLES.FORUM_POSTS)
    .insert([
      {
        thread_id: resolvedThreadId,
        content,
        user_id: user_data.id,
        author_name: user_data.name,
        author_avatar: user_data.avatar,
        author_role: user_data.role,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCategoryStats = async (): Promise<CategoryStat[]> => {
  const forumCategoryIds = [2, 3, 4];
  const newsStats = await getNewsCategoryStats();
  const forumStats = await Promise.all(forumCategoryIds.map(getForumCategoryStats));
  return [newsStats, ...forumStats];
};

export const updateThread = async (
  idOrSlug: number | string,
  updates: Partial<ForumThread>,
  requestor: Requestor,
) => {
  const thread = await getThreadForModification(idOrSlug, requestor);

  const { data, error } = await supabase
    .from(TABLES.FORUM_THREADS)
    .update(updates)
    .eq(COLUMNS.ID, thread.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteThread = async (
  idOrSlug: number | string,
  requestor: Requestor,
): Promise<void> => {
  const thread = await getThreadForModification(idOrSlug, requestor);

  await cleanupThreadPoll(thread.poll_id);
  await supabase.from(TABLES.FORUM_POSTS).delete().eq(COLUMNS.THREAD_ID, thread.id);

  const { error } = await supabase.from(TABLES.FORUM_THREADS).delete().eq(COLUMNS.ID, thread.id);
  if (error) throw error;
};

export const updatePost = async (
  id: number,
  updates: { content: string },
  requestor: Requestor,
) => {
  await getPostForModification(id, requestor);

  const { data, error } = await supabase
    .from(TABLES.FORUM_POSTS)
    .update({ content: updates.content })
    .eq(COLUMNS.ID, id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePost = async (id: number, requestor: Requestor): Promise<void> => {
  await getPostForModification(id, requestor);

  const { error } = await supabase.from(TABLES.FORUM_POSTS).delete().eq(COLUMNS.ID, id);
  if (error) throw error;
};
