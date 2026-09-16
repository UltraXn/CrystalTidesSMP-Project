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

export const updateUserRolePayloadSchema = z.object({
  role: z.string().min(1, 'Role is required'),
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

export const profileSchema = z.object({
  params: z.object({
    username: z
      .string()
      .min(3)
      .max(32)
      .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Invalid username format')
      .optional(),
  }),
});

// For backward compatibility with web-client ProfileSettings
export const updateUserSchema = updateUserPayloadSchema;

// Inferred TypeScript types
export type UpdateUserPayload = z.infer<typeof updateUserPayloadSchema>;
export type UpdateUserFormValues = UpdateUserPayload;
export type UpdateUserMetadataPayload = z.infer<typeof updateUserMetadataPayloadSchema>;
export type UpdateUserRolePayload = z.infer<typeof updateUserRolePayloadSchema>;
