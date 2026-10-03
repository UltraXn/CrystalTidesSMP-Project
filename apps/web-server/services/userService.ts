import supabase from './supabaseService.js';
import { User } from '@supabase/supabase-js';

export interface WebUser {
  id: string;
  email?: string;
  username: string;
  role: string;
  medals: unknown[];
  avatar_url?: string;
  discord: { id: string; username: string } | null;
  twitch: { id: string; username: string } | null;
  created_at: string;
  last_sign_in?: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  minecraft_nick?: string;
  original_username?: string;
  full_name?: string;
  role: string;
  medals: unknown[];
  avatar_url?: string;
  profile_banner_url?: string;
  created_at: string;
  public_stats: boolean;
  bio?: string;
  reputation: number;
  social_discord?: string;
  social_twitter?: string;
  social_twitch?: string;
  social_youtube?: string;
  minecraft_uuid?: string;
  social_avatar_url?: string;
  avatar_preference: string;
}

interface ConnectedIdentity {
  id: string;
  username: string;
}

interface IdentifierVariants {
  space: string;
  underscore: string;
  dash: string;
  raw: string;
}

const CONSTANTS = {
  DEFAULT_ROLE: 'user',
  DEFAULT_DISPLAY_NAME: 'Usuario',
  FALLBACK_NICKNAME: 'Sin Nick',
  DEFAULT_AVATAR_PREF: 'minecraft',
  PG_UNIQUE_VIOLATION: '23505',
  KARMA_TABLE: 'karma_votes',
  PROVIDER_DISCORD: 'discord',
  PROVIDER_TWITCH: 'twitch',
} as const;

const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  ALREADY_VOTED: 'Ya le has dado karma a este usuario',
} as const;

/**
 * Resolves Discord identity metadata for a Supabase auth user.
 */
const resolveDiscordIdentity = (user: User): ConnectedIdentity | null => {
  const identity = user.identities?.find((i) => i.provider === CONSTANTS.PROVIDER_DISCORD);
  if (!identity) return null;

  const data = identity.identity_data;
  const username =
    (data?.full_name as string | undefined) ||
    (data?.name as string | undefined) ||
    (data?.custom_claims?.global_name as string | undefined) ||
    '';

  return { id: identity.id, username };
};

/**
 * Resolves Twitch identity metadata for a Supabase auth user.
 */
const resolveTwitchIdentity = (user: User): ConnectedIdentity | null => {
  const identity = user.identities?.find((i) => i.provider === CONSTANTS.PROVIDER_TWITCH);
  if (!identity) return null;

  const data = identity.identity_data;
  const username =
    (data?.full_name as string | undefined) ||
    (data?.name as string | undefined) ||
    (data?.preferred_username as string | undefined) ||
    '';

  return { id: identity.id, username };
};

/**
 * Maps a Supabase user into the API's WebUser representation.
 */
const mapUserToWebUser = (u: User): WebUser => {
  const meta = u.user_metadata || {};
  const username =
    (meta.username as string | undefined) ||
    (meta.full_name as string | undefined) ||
    CONSTANTS.FALLBACK_NICKNAME;

  return {
    id: u.id,
    email: u.email,
    username,
    role: (meta.role as string | undefined) || CONSTANTS.DEFAULT_ROLE,
    medals: (meta.medals as unknown[] | undefined) || [],
    avatar_url: meta.avatar_url as string | undefined,
    discord: resolveDiscordIdentity(u),
    twitch: resolveTwitchIdentity(u),
    created_at: u.created_at,
    last_sign_in: u.last_sign_in_at,
  };
};

/**
 * Evaluates whether a user matches a case-insensitive query string.
 */
const matchesQuery = (u: User, query: string): boolean => {
  const q = query.toLowerCase();
  const emailMatches = Boolean(u.email?.toLowerCase().includes(q));
  const usernameMatches = Boolean(u.user_metadata?.username?.toLowerCase().includes(q));
  const fullNameMatches = Boolean(u.user_metadata?.full_name?.toLowerCase().includes(q));

  return emailMatches || usernameMatches || fullNameMatches;
};

/**
 * Normalizes an identifier string into space, underscore, and dash variants.
 */
const buildIdentifierVariants = (identifier: string): IdentifierVariants => {
  const lower = identifier.toLowerCase();
  return {
    raw: identifier,
    space: lower.replace(/[-_]/g, ' '),
    underscore: lower.replaceAll(' ', '_'),
    dash: lower.replaceAll(' ', '-'),
  };
};

/**
 * Checks whether a Supabase user matches any variant of an identifier.
 */
const userMatchesIdentifier = (user: User, variants: IdentifierVariants): boolean => {
  const meta = user.user_metadata || {};
  if (meta.minecraft_uuid && meta.minecraft_uuid === variants.raw) {
    return true;
  }

  const candidates = [
    (meta.username || '').toLowerCase(),
    (meta.full_name || '').toLowerCase(),
    (meta.minecraft_nick || '').toLowerCase(),
  ];

  return candidates.some(
    (field) => field === variants.space || field === variants.underscore || field === variants.dash,
  );
};

/**
 * Builds the public profile representation from a Supabase auth user.
 */
const buildPublicProfile = (target: User): PublicProfile => {
  const meta = target.user_metadata || {};
  const displayName =
    (meta.minecraft_nick as string | undefined) ||
    (meta.username as string | undefined) ||
    (meta.full_name as string | undefined) ||
    CONSTANTS.DEFAULT_DISPLAY_NAME;

  return {
    id: target.id,
    username: displayName,
    minecraft_nick: meta.minecraft_nick as string | undefined,
    original_username: meta.username as string | undefined,
    full_name: meta.full_name as string | undefined,
    role: (meta.role as string | undefined) || CONSTANTS.DEFAULT_ROLE,
    medals: (meta.medals as unknown[] | undefined) || [],
    avatar_url: meta.avatar_url as string | undefined,
    profile_banner_url: meta.profile_banner_url as string | undefined,
    created_at: target.created_at,
    public_stats: (meta.public_stats as boolean | undefined) || false,
    bio: meta.bio as string | undefined,
    reputation: (meta.reputation as number | undefined) || 0,
    social_discord:
      (meta.social_discord as string | undefined) || (meta.discord as string | undefined),
    social_twitter: meta.social_twitter as string | undefined,
    social_twitch: meta.social_twitch as string | undefined,
    social_youtube: meta.social_youtube as string | undefined,
    minecraft_uuid: meta.minecraft_uuid as string | undefined,
    social_avatar_url:
      (meta.picture as string | undefined) || (meta.avatar_url as string | undefined),
    avatar_preference:
      (meta.avatar_preference as string | undefined) || CONSTANTS.DEFAULT_AVATAR_PREF,
  };
};

/**
 * Synchronizes denormalized reputation count in the user's metadata cache.
 */
const syncReputationCache = async (user: User, reputation: number): Promise<void> => {
  const cleanMetadata = { ...user.user_metadata };
  delete cleanMetadata.voters;

  await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...cleanMetadata, reputation },
  });
};

/**
 * Get Staff Users from Database (Stubbed - Legacy)
 */
export const getStaffUsers = async (): Promise<WebUser[]> => {
  return [];
};

/**
 * Get all users from Supabase Auth (Requires Service Role)
 */
export const getAllUsers = async (query = ''): Promise<WebUser[]> => {
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();
  if (error) throw error;

  let filtered = users || [];
  if (query) {
    filtered = filtered.filter((u) => matchesQuery(u, query));
  }

  return filtered.map(mapUserToWebUser);
};

/**
 * Update user role in user_metadata
 */
export const updateUserRole = async (userId: string, newRole: string): Promise<User | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: newRole },
  });

  if (error) throw error;
  return user;
};

/**
 * Update any user metadata (e.g. medals)
 */
export const updateUserMetadata = async (
  userId: string,
  metadata: Record<string, unknown>,
): Promise<User | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.updateUserById(userId, { user_metadata: metadata });

  if (error) throw error;
  return user;
};

/**
 * Get public profile by username, nickname, or Minecraft UUID
 */
export const getPublicProfile = async (identifier: string): Promise<PublicProfile | null> => {
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();
  if (error) throw error;

  const variants = buildIdentifierVariants(identifier);
  const target = users?.find((u) => userMatchesIdentifier(u, variants));

  if (!target) return null;

  return buildPublicProfile(target);
};

/**
 * Give Karma to a user.
 *
 * Race-safe design: the `karma_votes` table (PK user_id+voter_id) is the
 * source of truth, so concurrent duplicate votes are rejected atomically by
 * the database (23505). The `reputation` counter in user_metadata is kept as
 * a denormalized cache for read paths; it is recomputed as COUNT(*) after
 * every vote and self-heals on the next one.
 */
export const giveKarma = async (userId: string, voterId: string): Promise<number> => {
  const {
    data: { user },
    error: fetchError,
  } = await supabase.auth.admin.getUserById(userId);
  if (fetchError || !user) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const { error: insertError } = await supabase
    .from(CONSTANTS.KARMA_TABLE)
    .insert({ user_id: userId, voter_id: voterId });

  if (insertError) {
    if (insertError.code === CONSTANTS.PG_UNIQUE_VIOLATION) {
      throw new Error(ERROR_MESSAGES.ALREADY_VOTED);
    }
    throw insertError;
  }

  const { count, error: countError } = await supabase
    .from(CONSTANTS.KARMA_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    throw countError;
  }

  const newReputation = count ?? 1;
  await syncReputationCache(user, newReputation);

  return newReputation;
};
