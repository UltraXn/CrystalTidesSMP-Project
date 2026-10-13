import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../config/database.js';
import { updateUserMetadata } from '../services/userService.js';

// Centralized role and identity strings to avoid duplication
export const DISCORD_ROLES = {
  STAFF: 'Staff',
  KILLUWU: 'Killuwu',
} as const;

// Configuration & Endpoint constants
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? '';
const ANNOUNCEMENTS_CHANNEL_ID =
  process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID ?? '1297052480676560906';
const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';
const DISCORD_CDN_AVATAR_BASE_URL = 'https://cdn.discordapp.com/avatars';
const ANNOUNCEMENTS_LIMIT = 5;

// Static assets & Fallback constants
const DEFAULT_AVATAR_PATH = '/skins/kiru.png';
const FALLBACK_AVATAR_PATH = '/skins/killu.png';

// Standardized user-facing messages
const MESSAGES = {
  UNAUTHENTICATED: 'No autenticado',
  MISSING_CODE: 'Falta el código',
  INVALID_OR_EXPIRED_CODE: 'Código inválido o expirado',
  LINK_SUCCESS: 'Cuenta vinculada exitosamente',
  LINK_ERROR: 'Error al vincular cuenta',
  FALLBACK_ANNOUNCEMENT:
    'Servidor de Minecraft 1.21+ activo. ¡Conéctate en mc.crystaltidessmp.net!',
} as const;

// SQL statements
const SQL_QUERIES = {
  FIND_VERIFICATION_CODE: 'SELECT * FROM verification_codes WHERE code = ?',
  DELETE_VERIFICATION_CODE: 'DELETE FROM verification_codes WHERE code = ?',
} as const;

interface VerificationCode extends RowDataPacket {
  code: string;
  discord_id: string;
  discord_username: string;
}

interface DiscordAttachment {
  filename: string;
  url: string;
}

interface DiscordAuthor {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
}

interface DiscordMessage {
  id: string;
  content: string;
  author?: DiscordAuthor;
  timestamp: string;
  attachments?: DiscordAttachment[];
}

interface FormattedAnnouncementAuthor {
  username: string;
  avatar: string;
}

interface FormattedAttachment {
  filename: string;
  url: string;
}

interface FormattedAnnouncement {
  id: string;
  content: string;
  author: FormattedAnnouncementAuthor;
  timestamp: string;
  attachments?: FormattedAttachment[];
}

/**
 * Resolves the author's display name, falling back to username or staff role title.
 */
const resolveAuthorUsername = (author?: DiscordAuthor): string => {
  if (!author) {
    return DISCORD_ROLES.STAFF;
  }
  return author.global_name ?? author.username ?? DISCORD_ROLES.STAFF;
};

/**
 * Resolves the author's avatar URL or provides a default skin fallback.
 */
const resolveAuthorAvatar = (author?: DiscordAuthor): string => {
  if (!author?.avatar) {
    return DEFAULT_AVATAR_PATH;
  }
  return `${DISCORD_CDN_AVATAR_BASE_URL}/${author.id}/${author.avatar}.png`;
};

/**
 * Formats Discord attachments safely without nullish leaks.
 */
const formatAttachments = (attachments?: DiscordAttachment[]): FormattedAttachment[] => {
  if (!attachments || attachments.length === 0) {
    return [];
  }
  return attachments.map((att) => ({
    filename: att.filename,
    url: att.url,
  }));
};

/**
 * Transforms a raw Discord API message into the frontend announcement shape.
 */
const formatAnnouncement = (msg: DiscordMessage): FormattedAnnouncement => ({
  id: msg.id,
  content: msg.content,
  author: {
    username: resolveAuthorUsername(msg.author),
    avatar: resolveAuthorAvatar(msg.author),
  },
  timestamp: msg.timestamp,
  attachments: formatAttachments(msg.attachments),
});

/**
 * Fallback announcement payload used when Discord API is unreachable.
 */
const createFallbackAnnouncements = (): FormattedAnnouncement[] => [
  {
    id: '1',
    content: MESSAGES.FALLBACK_ANNOUNCEMENT,
    author: {
      username: DISCORD_ROLES.KILLUWU,
      avatar: FALLBACK_AVATAR_PATH,
    },
    timestamp: new Date().toISOString(),
  },
];

/**
 * Type guard validating an unknown item matches the DiscordMessage interface.
 */
const isDiscordMessage = (item: unknown): item is DiscordMessage => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'content' in item &&
    'timestamp' in item
  );
};

/**
 * Type guard for Discord API message arrays.
 */
const isDiscordMessageList = (data: unknown): data is DiscordMessage[] =>
  Array.isArray(data) && data.every(isDiscordMessage);

/**
 * Fetches recent announcements directly from Discord's REST API.
 */
const fetchRemoteAnnouncements = async (): Promise<FormattedAnnouncement[]> => {
  const endpoint = `${DISCORD_API_BASE_URL}/channels/${ANNOUNCEMENTS_CHANNEL_ID}/messages?limit=${ANNOUNCEMENTS_LIMIT}`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Discord API status ${response.status}`);
  }

  const rawData: unknown = await response.json();
  const messages = isDiscordMessageList(rawData) ? rawData : [];
  return messages.map(formatAnnouncement);
};

/**
 * Queries database for a verification code record.
 */
const findVerificationCode = async (code: string): Promise<VerificationCode | null> => {
  const [rows] = await db.query<VerificationCode[]>(SQL_QUERIES.FIND_VERIFICATION_CODE, [code]);
  return rows[0] ?? null;
};

/**
 * Removes a consumed verification code from the database.
 */
const deleteVerificationCode = async (code: string): Promise<void> => {
  await db.query(SQL_QUERIES.DELETE_VERIFICATION_CODE, [code]);
};

/**
 * Synchronizes user metadata with Supabase profiles maintaining OAuth2 identity structure.
 */
const syncUserDiscordIdentity = async (
  userId: string,
  verification: VerificationCode,
): Promise<void> => {
  await updateUserMetadata(userId, {
    discord: {
      id: verification.discord_id,
      username: verification.discord_username,
    },
    social_discord: verification.discord_username, // Legacy support
  });
};

/**
 * Links a user's Discord account via an in-game or bot verification code.
 * Maintains 100% OAuth2 identity metadata compatibility with Supabase profiles.
 */
export const linkAccount = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: MESSAGES.UNAUTHENTICATED });
    }

    if (!code) {
      return res.status(400).json({ message: MESSAGES.MISSING_CODE });
    }

    const verification = await findVerificationCode(code);
    if (!verification) {
      return res.status(404).json({ message: MESSAGES.INVALID_OR_EXPIRED_CODE });
    }

    await syncUserDiscordIdentity(userId, verification);
    await deleteVerificationCode(code);

    return res.json({
      success: true,
      message: MESSAGES.LINK_SUCCESS,
      discord: verification.discord_username,
    });
  } catch (error) {
    console.error('Link Error:', error);
    return res.status(500).json({ message: MESSAGES.LINK_ERROR });
  }
};

/**
 * Fetches recent announcements from the official Discord announcements channel.
 * Returns formatted announcements or a graceful fallback if Discord API fails.
 */
export const getDiscordAnnouncements = async (_req: Request, res: Response) => {
  try {
    const announcements = await fetchRemoteAnnouncements();
    return res.json({ success: true, announcements });
  } catch (error) {
    console.error('Error fetching Discord announcements:', error);
    return res.json({
      success: false,
      announcements: createFallbackAnnouncements(),
    });
  }
};
