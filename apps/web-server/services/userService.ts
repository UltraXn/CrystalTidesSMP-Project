import supabase from './supabaseService.js';
import pool from '../config/database.js';
import { User } from '@supabase/supabase-js';
import type { RowDataPacket } from 'mysql2';

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

interface TrustedProfileFields {
  role: string;
  reputation: number;
}

interface LinkedUuidRow extends RowDataPacket {
  minecraft_uuid: string | null;
}

const CONSTANTS = {
  DEFAULT_ROLE: 'user',
  DEFAULT_DISPLAY_NAME: 'Usuario',
  FALLBACK_NICKNAME: 'Sin Nick',
  DEFAULT_AVATAR_PREF: 'minecraft',
  PG_UNIQUE_VIOLATION: '23505',
  PG_CHECK_VIOLATION: '23514',
  KARMA_TABLE: 'karma_votes',
  PROFILES_TABLE: 'profiles',
  PROVIDER_DISCORD: 'discord',
  PROVIDER_TWITCH: 'twitch',
  USERS_PAGE_SIZE: 1000,
  ROLE_LOOKUP_BATCH: 100,
} as const;

const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  ALREADY_VOTED: 'Ya le has dado karma a este usuario',
} as const;

/** The database rejected the role (profiles_role_check). */
export class InvalidRoleError extends Error {
  constructor(role: string) {
    super(`Role "${role}" is not allowed`);
    this.name = 'InvalidRoleError';
  }
}

/**
 * Resolves Discord identity metadata for a Supabase auth user.
 */
const resolveDiscordIdentity = (user: User): ConnectedIdentity | null => {
  const identity = user.identities?.find((i) => i.provider === CONSTANTS.PROVIDER_DISCORD);
  if (!identity) return null;

  const data = identity.identity_data;
  const username =
    (data?.full_name as string | undefined) ??
    (data?.name as string | undefined) ??
    (data?.custom_claims?.global_name as string | undefined) ??
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
    (data?.full_name as string | undefined) ??
    (data?.name as string | undefined) ??
    (data?.preferred_username as string | undefined) ??
    '';

  return { id: identity.id, username };
};

/**
 * Maps a Supabase user into the API's WebUser representation.
 */
const mapUserToWebUser = (u: User, role: string): WebUser => {
  const meta = u.user_metadata ?? {};
  const username =
    (meta.username as string | undefined) ??
    (meta.full_name as string | undefined) ??
    CONSTANTS.FALLBACK_NICKNAME;

  return {
    id: u.id,
    email: u.email,
    username,
    role,
    medals: (meta.medals as unknown[] | undefined) ?? [],
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
const buildPublicProfile = (target: User, trusted: TrustedProfileFields): PublicProfile => {
  const meta = target.user_metadata ?? {};
  const displayName =
    (meta.minecraft_nick as string | undefined) ??
    (meta.username as string | undefined) ??
    (meta.full_name as string | undefined) ??
    CONSTANTS.DEFAULT_DISPLAY_NAME;

  return {
    id: target.id,
    username: displayName,
    minecraft_nick: meta.minecraft_nick as string | undefined,
    original_username: meta.username as string | undefined,
    full_name: meta.full_name as string | undefined,
    role: trusted.role,
    medals: (meta.medals as unknown[] | undefined) ?? [],
    avatar_url: meta.avatar_url as string | undefined,
    profile_banner_url: meta.profile_banner_url as string | undefined,
    created_at: target.created_at,
    public_stats: (meta.public_stats as boolean | undefined) ?? false,
    bio: meta.bio as string | undefined,
    reputation: trusted.reputation,
    social_discord:
      (meta.social_discord as string | undefined) ?? (meta.discord as string | undefined),
    social_twitter: meta.social_twitter as string | undefined,
    social_twitch: meta.social_twitch as string | undefined,
    social_youtube: meta.social_youtube as string | undefined,
    minecraft_uuid: meta.minecraft_uuid as string | undefined,
    social_avatar_url:
      (meta.picture as string | undefined) ?? (meta.avatar_url as string | undefined),
    avatar_preference:
      (meta.avatar_preference as string | undefined) ?? CONSTANTS.DEFAULT_AVATAR_PREF,
  };
};

/**
 * Supabase pages admin.listUsers (50 per page by default), so walk every page.
 */
const listAllAuthUsers = async (): Promise<User[]> => {
  const users: User[] = [];
  let page = 1;
  let pageSize: number = CONSTANTS.USERS_PAGE_SIZE;

  while (pageSize === CONSTANTS.USERS_PAGE_SIZE) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: CONSTANTS.USERS_PAGE_SIZE,
    });
    if (error) throw error;
    users.push(...data.users);
    pageSize = data.users.length;
    page += 1;
  }

  return users;
};

/**
 * profiles.role is the only role source the API trusts: user_metadata can be
 * rewritten by its owner through supabase.auth.updateUser().
 */
const fetchProfileRoles = async (userIds: string[]): Promise<Map<string, string>> => {
  const roles = new Map<string, string>();

  for (let i = 0; i < userIds.length; i += CONSTANTS.ROLE_LOOKUP_BATCH) {
    const batch = userIds.slice(i, i + CONSTANTS.ROLE_LOOKUP_BATCH);
    const { data, error } = await supabase
      .from(CONSTANTS.PROFILES_TABLE)
      .select('id, role')
      .in('id', batch);
    if (error) throw error;

    for (const row of (data ?? []) as { id: string; role: string | null }[]) {
      roles.set(row.id, row.role ?? CONSTANTS.DEFAULT_ROLE);
    }
  }

  return roles;
};

export const getProfileRole = async (userId: string): Promise<string> => {
  const roles = await fetchProfileRoles([userId]);
  return roles.get(userId) ?? CONSTANTS.DEFAULT_ROLE;
};

/** Reputation is derived from karma_votes (one row per voter), never from metadata. */
const countReputation = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from(CONSTANTS.KARMA_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count ?? 0;
};

/**
 * The game database link is authoritative; user_metadata.minecraft_uuid is
 * user-editable and must not decide whose wallet is shown.
 */
export const getLinkedMinecraftUuid = async (webUserId: string): Promise<string | null> => {
  try {
    const [rows] = await pool.execute<LinkedUuidRow[]>(
      'SELECT minecraft_uuid FROM linked_accounts WHERE web_user_id = ? LIMIT 1',
      [webUserId],
    );
    return rows[0]?.minecraft_uuid ?? null;
  } catch (error) {
    console.error('[UserService] Linked account lookup failed:', error);
    return null;
  }
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
  const users = await listAllAuthUsers();
  const filtered = query ? users.filter((u) => matchesQuery(u, query)) : users;
  const roles = await fetchProfileRoles(filtered.map((u) => u.id));

  return filtered.map((u) => mapUserToWebUser(u, roles.get(u.id) ?? CONSTANTS.DEFAULT_ROLE));
};

/**
 * Writes the authoritative role to profiles. The metadata copies only keep the
 * current web-client in sync, which still reads user_metadata.role for its UI.
 */
export const updateUserRole = async (userId: string, newRole: string): Promise<User | null> => {
  const { data: updatedProfiles, error: profileError } = await supabase
    .from(CONSTANTS.PROFILES_TABLE)
    .update({ role: newRole })
    .eq('id', userId)
    .select('id');

  if (profileError?.code === CONSTANTS.PG_CHECK_VIOLATION) throw new InvalidRoleError(newRole);
  if (profileError) throw profileError;
  if (!updatedProfiles?.length) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

  const {
    data: { user },
    error,
  } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: newRole },
    app_metadata: { role: newRole },
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
  const users = await listAllAuthUsers();

  const variants = buildIdentifierVariants(identifier);
  const target = users.find((u) => userMatchesIdentifier(u, variants));

  if (!target) return null;

  const [role, reputation] = await Promise.all([
    getProfileRole(target.id),
    countReputation(target.id),
  ]);
  return buildPublicProfile(target, { role, reputation });
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

  const newReputation = await countReputation(userId);
  await syncReputationCache(user, newReputation);

  return newReputation;
};
