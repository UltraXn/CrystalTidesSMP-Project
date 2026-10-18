import { z } from 'zod';

export const updateUserPayloadSchema = z.object({
  full_name: z.string().optional(),
  username: z.string().min(3).max(30).optional(),
  minecraft_nick: z.string().optional(),
  bio: z.string().max(500).optional(),
  social_discord: z.string().optional(),
  social_twitter: z.string().optional(),
  social_twitch: z.string().optional(),
  social_youtube: z.string().optional(),
  social_kofi: z.string().optional(),
  avatar_preference: z.enum(['minecraft', 'social']).optional(),
  profile_banner_url: z.string().optional(),
  status_message: z.string().max(100).optional(),
  notify_events: z.boolean().optional(),
  notify_mentions: z.boolean().optional(),
});

export const updateUserMetadataPayloadSchema = z.object({
  metadata: z.object({
    medals: z.array(z.number()).optional(),
    achievements: z.array(z.union([z.string(), z.number()])).optional(),
  }),
});

// Keep in sync with the profiles_role_check constraint
// (database/web-server/migrations/20261017_align_profile_roles.sql).
export const USER_ROLES = [
  'user',
  'donor',
  'founder',
  'helper',
  'staff',
  'mod',
  'moderator',
  'developer',
  'admin',
  'killu',
  'killuwu',
  'neroferno',
  'owner',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_ROLES: readonly string[] = [
  'admin',
  'neroferno',
  'killu',
  'killuwu',
  'developer',
  'owner',
] as const;

export const STAFF_ROLES: readonly string[] = [
  ...ADMIN_ROLES,
  'staff',
  'moderator',
  'mod',
  'helper',
] as const;

export const updateUserRolePayloadSchema = z.object({
  role: z.enum(USER_ROLES),
});

// Express route wrapper schemas
export const updateUserMetadataSchema = z.object({
  body: updateUserMetadataPayloadSchema,
});

export const updateUserRoleSchema = z.object({
  body: updateUserRolePayloadSchema,
});

export const voteKarmaSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid target user ID'),
  }),
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROFILE_IDENTIFIER_REGEX = /^[A-Za-z0-9_\- ]{1,64}$/;

export const profileSchema = z.object({
  params: z.object({
    username: z
      .string()
      .trim()
      .refine(
        (val) => PROFILE_IDENTIFIER_REGEX.test(val) || UUID_REGEX.test(val),
        'Invalid profile identifier format',
      ),
  }),
});

// For backward compatibility with web-client ProfileSettings
export const updateUserSchema = updateUserPayloadSchema;

// Inferred TypeScript types
export type UpdateUserPayload = z.infer<typeof updateUserPayloadSchema>;
export type UpdateUserFormValues = UpdateUserPayload;
export type UpdateUserMetadataPayload = z.infer<typeof updateUserMetadataPayloadSchema>;
export type UpdateUserRolePayload = z.infer<typeof updateUserRolePayloadSchema>;
