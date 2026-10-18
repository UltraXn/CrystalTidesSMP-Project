import crypto from 'node:crypto';
import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import * as minecraftService from '../services/minecraftService.js';
import * as skinService from '../services/skinService.js';
import pool from '../config/database.js';
import { ensureString } from '../utils/typeUtils.js';

// --- CONSTANTS ---
/**
 * Official Microsoft Xbox Live RelyingParty audience URI.
 * NOTE: Must literally be 'http://auth.xboxlive.com' per Xbox Live User Authentication protocol spec.
 * This is an audience identifier, not an active network endpoint (requests go to https://user.auth.xboxlive.com).
 */
// eslint-disable-next-line
const XBOX_AUTH_RELYING_PARTY = 'http://auth.xboxlive.com'; // NOSONAR
const CLIENT_ID_AZURE = process.env.MICROSOFT_CLIENT_ID ?? '';
const CLIENT_ID_LIVE = process.env.MICROSOFT_LIVE_CLIENT_ID ?? '';
const XBOX_SCOPE = 'XboxLive.SignIn XboxLive.offline_access';

const SOURCES = {
  MINECRAFT: 'minecraft',
  DISCORD: 'discord',
  WEB: 'web',
} as const;

const URLS = {
  LIVE_DEVICE_CODE: 'https://login.live.com/oauth20_connect.srf',
  LIVE_TOKEN: 'https://login.live.com/oauth20_token.srf',
  AZURE_DEVICE_CODE: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode',
  AZURE_TOKEN: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token',
  XBOX_USER_AUTH: 'https://user.auth.xboxlive.com/user/authenticate',
  XSTS_AUTH: 'https://xsts.auth.xboxlive.com/xsts/authorize',
  MC_LOGIN_XBOX: 'https://api.minecraftservices.com/authentication/login_with_xbox',
  MC_PROFILE: 'https://api.minecraftservices.com/minecraft/profile',
  FALLBACK_MINOTAR_SKIN: 'https://minotar.net/skin',
} as const;

const HEADERS = {
  URLENCODED: { 'Content-Type': 'application/x-www-form-urlencoded' },
  JSON: { 'Content-Type': 'application/json', Accept: 'application/json' },
} as const;

const SQL = {
  CLEANUP_EMPTY_LINKS:
    'DELETE FROM linked_accounts WHERE web_user_id = ? AND minecraft_uuid IS NULL AND discord_id IS NULL',
  SELECT_LINK_BY_WEB_ID: 'SELECT * FROM linked_accounts WHERE web_user_id = ?',
  CLEAR_DISCORD_BY_DISCORD_ID:
    'UPDATE linked_accounts SET discord_id = NULL, discord_tag = NULL WHERE discord_id = ?',
  UPDATE_DISCORD_BY_WEB_ID:
    'UPDATE linked_accounts SET discord_id = ?, discord_tag = ? WHERE web_user_id = ?',
  DELETE_UNIVERSAL_CODE: 'DELETE FROM universal_links WHERE code = ?',
  DELETE_BY_MINECRAFT_UUID: 'DELETE FROM linked_accounts WHERE minecraft_uuid = ?',
  DELETE_BY_WEB_USER_ID: 'DELETE FROM linked_accounts WHERE web_user_id = ?',
  INSERT_FULL_LINK:
    'INSERT INTO linked_accounts (minecraft_uuid, minecraft_name, web_user_id, discord_id, discord_tag, gacha_balance, unlocked_tiers) VALUES (?, ?, ?, ?, ?, ?, ?)',
  INSERT_BASIC_LINK:
    'INSERT INTO linked_accounts (minecraft_uuid, minecraft_name, web_user_id) VALUES (?, ?, ?)',
  SELECT_UNIVERSAL_LINK:
    'SELECT source, source_id, player_name, avatar_url, expires_at FROM universal_links WHERE code = ?',
  INSERT_OR_UPDATE_UNIVERSAL_LINK:
    'INSERT INTO universal_links (code, source, source_id, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE expires_at = ?',
  SELECT_MC_NAME: 'SELECT minecraft_name FROM linked_accounts WHERE web_user_id = ?',
  CLEAR_MC_BY_WEB_ID:
    'UPDATE linked_accounts SET minecraft_uuid = NULL, minecraft_name = NULL WHERE web_user_id = ?',
  CLEAR_DISCORD_BY_WEB_ID:
    'UPDATE linked_accounts SET discord_id = NULL, discord_tag = NULL WHERE web_user_id = ?',
  INSERT_PENDING_COMMAND: 'INSERT INTO web_pending_commands (command) VALUES (?)',
} as const;

const ERRORS = {
  USER_ID_REQUIRED: 'UserId required',
  UNAUTHORIZED: 'Unauthorized',
  SUPABASE_UNCONFIGURED: 'Server configuration error (Supabase)',
  AUTH_PENDING: 'authorization_pending',
} as const;

// --- SUPABASE CLIENT SETUP ---
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// --- INTERFACES & TYPES ---
type AuthenticatedRequest = Request;

interface MetadataSync {
  minecraft_uuid?: string | null;
  minecraft_nick?: string | null;
  discord_id?: string | null;
  discord_tag?: string | null;
  discord_avatar?: string | null;
  gacha_balance?: number | string | null;
  social_discord?: string | null;
}

interface LinkedAccountRecord extends RowDataPacket {
  minecraft_uuid: string | null;
  minecraft_name: string | null;
  web_user_id: string;
  discord_id: string | null;
  discord_tag: string | null;
  gacha_balance: number | null;
  unlocked_tiers: string | null;
}

interface UniversalLinkRecord extends RowDataPacket {
  code: string;
  source: string;
  source_id: string;
  player_name: string;
  avatar_url: string | null;
  expires_at: number;
}

interface XboxAuthResponse {
  Token: string;
  DisplayClaims?: {
    xui?: Array<{ uhs?: string }>;
  };
}

interface XstsAuthResponse {
  Token: string;
  XErr?: number;
}

interface MinecraftAuthResult {
  error?: string;
  profile?: Record<string, unknown>;
}

// --- PURE / SERVICE HELPERS ---
const extractAuthToken = (req: Request): string | undefined => {
  return req.headers.authorization?.split(' ')[1];
};

const getAuthUserId = (req: AuthenticatedRequest): string | undefined => {
  return req.user?.id;
};

async function syncSupabaseMetadata(
  userId: string,
  _token: string | undefined,
  metadata: MetadataSync,
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });
    if (error) {
      console.error('Supabase Sync Error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase Sync Exception:', err);
    return false;
  }
}

async function syncMinecraftLink(
  sourceId: string,
  playerName: string,
  targetUserId: string,
): Promise<void> {
  await pool.execute(SQL.DELETE_BY_MINECRAFT_UUID, [sourceId]);

  const [existing] = await pool.execute<LinkedAccountRecord[]>(SQL.SELECT_LINK_BY_WEB_ID, [
    targetUserId,
  ]);

  if (existing.length > 0) {
    const oldRow = existing[0];
    await pool.execute(SQL.DELETE_BY_WEB_USER_ID, [targetUserId]);
    await pool.execute(SQL.INSERT_FULL_LINK, [
      sourceId,
      playerName,
      targetUserId,
      oldRow.discord_id,
      oldRow.discord_tag,
      oldRow.gacha_balance,
      oldRow.unlocked_tiers ?? null,
    ]);
  } else {
    await pool.execute(SQL.INSERT_BASIC_LINK, [sourceId, playerName, targetUserId]);
  }
}

async function syncDiscordLink(
  sourceId: string,
  playerName: string,
  targetUserId: string,
): Promise<void> {
  await pool.execute(SQL.CLEAR_DISCORD_BY_DISCORD_ID, [sourceId]);
  await pool.execute(SQL.UPDATE_DISCORD_BY_WEB_ID, [sourceId, playerName, targetUserId]);
}

async function syncDatabaseLink(
  source: string,
  sourceId: string,
  playerName: string,
  targetUserId: string,
): Promise<void> {
  if (source === SOURCES.MINECRAFT) {
    await syncMinecraftLink(sourceId, playerName, targetUserId);
    return;
  }

  if (source === SOURCES.DISCORD) {
    await syncDiscordLink(sourceId, playerName, targetUserId);
  }
}

async function clearSupabaseMetadata(
  userId: string,
  token: string | undefined,
  metadataToClear: Record<string, null>,
): Promise<void> {
  const sbUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const sbAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (token && sbUrl && sbAnonKey) {
    const userSupabase = createClient(sbUrl, sbAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    await userSupabase.auth.updateUser({ data: metadataToClear });
    return;
  }

  if (supabase) {
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadataToClear,
    });
  }
}

// --- MICROSOFT / XBOX AUTH PIPELINE ---
async function fetchXboxLiveToken(
  accessToken: string,
): Promise<{ token: string; userHash: string } | null> {
  const rpsTicket =
    accessToken.startsWith('Ew') || accessToken.startsWith('d=') ? accessToken : `d=${accessToken}`;

  const requestAuth = (ticket: string) =>
    fetch(URLS.XBOX_USER_AUTH, {
      method: 'POST',
      headers: HEADERS.JSON,
      body: JSON.stringify({
        Properties: {
          AuthMethod: 'RPS',
          SiteName: 'user.auth.xboxlive.com',
          RpsTicket: ticket,
        },
        RelyingParty: XBOX_AUTH_RELYING_PARTY,
        TokenType: 'JWT',
      }),
    });

  let response = await requestAuth(rpsTicket);
  if (!response.ok) {
    response = await requestAuth(`t=${accessToken}`);
    if (!response.ok) return null;
  }

  const xblData = (await response.json()) as XboxAuthResponse;
  const token = xblData.Token;
  const userHash = xblData.DisplayClaims?.xui?.[0]?.uhs ?? '';
  return { token, userHash };
}

async function fetchXstsToken(xblToken: string): Promise<{ token?: string; error?: string }> {
  const response = await fetch(URLS.XSTS_AUTH, {
    method: 'POST',
    headers: HEADERS.JSON,
    body: JSON.stringify({
      Properties: {
        SandboxId: 'RETAIL',
        UserTokens: [xblToken],
      },
      RelyingParty: 'rp://api.minecraftservices.com/',
      TokenType: 'JWT',
    }),
  });

  const xstsData = (await response.json()) as XstsAuthResponse;
  if (!response.ok) {
    if (xstsData.XErr === 2148916028) {
      return { error: 'Esta cuenta de Microsoft no posee un perfil de Minecraft comprado.' };
    }
    return { error: `Error XSTS (${xstsData.XErr ?? 'desconocido'})` };
  }

  return { token: xstsData.Token };
}

async function authenticateMinecraftWithToken(accessToken: string): Promise<MinecraftAuthResult> {
  const xboxAuth = await fetchXboxLiveToken(accessToken);
  if (!xboxAuth) {
    return { error: 'Fallo la autenticación con Xbox Live' };
  }

  const xstsAuth = await fetchXstsToken(xboxAuth.token);
  if (xstsAuth.error || !xstsAuth.token) {
    return { error: xstsAuth.error ?? 'Error al obtener token XSTS' };
  }

  const mcLoginRes = await fetch(URLS.MC_LOGIN_XBOX, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identityToken: `XBL3.0 x=${xboxAuth.userHash};${xstsAuth.token}`,
    }),
  });
  const mcAuthData = (await mcLoginRes.json()) as { access_token?: string };
  if (!mcLoginRes.ok || !mcAuthData.access_token) {
    return { error: 'Fallo el inicio de sesión en los servicios de Minecraft' };
  }

  const profileRes = await fetch(URLS.MC_PROFILE, {
    headers: { Authorization: `Bearer ${mcAuthData.access_token}` },
  });
  const profile = (await profileRes.json()) as Record<string, unknown> & {
    error?: string;
    errorMessage?: string;
  };

  if (!profileRes.ok || profile.error) {
    return { error: profile.errorMessage ?? 'No se pudo obtener el perfil de Minecraft' };
  }

  return { profile };
}

// --- DISCORD SYNC HELPER ---
function extractDiscordIdentity(user: User) {
  const identity = user.identities?.find((i) => i.provider === SOURCES.DISCORD);
  if (!identity) return null;

  const data = identity.identity_data;
  const tag = data?.full_name || data?.name || data?.custom_claims?.global_name || data?.user_name;
  const avatar = data?.avatar_url || data?.image_url || data?.picture;

  return {
    id: identity.id,
    tag: typeof tag === 'string' ? tag : null,
    avatar: typeof avatar === 'string' ? avatar : null,
  };
}

async function handleDiscordAutoSync(
  userId: string,
  userToken: string | undefined,
  currentRows: RowDataPacket[],
): Promise<void> {
  if (!supabase) return;
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) return;

    const discord = extractDiscordIdentity(user);
    if (!discord) return;

    if (currentRows.length > 0) {
      const link = currentRows[0];
      if (link.discord_id !== discord.id || link.discord_tag !== discord.tag) {
        await pool.execute(SQL.CLEAR_DISCORD_BY_DISCORD_ID, [discord.id]);
        await pool.execute(SQL.UPDATE_DISCORD_BY_WEB_ID, [discord.id, discord.tag, userId]);

        const [newRows] = await pool.execute<RowDataPacket[]>(SQL.SELECT_LINK_BY_WEB_ID, [userId]);
        if (newRows.length > 0) {
          currentRows[0] = newRows[0];
        }
      }
    }

    if (discord.avatar) {
      await syncSupabaseMetadata(userId, userToken, {
        discord_id: discord.id,
        discord_tag: discord.tag,
        discord_avatar: discord.avatar,
      });
    }
  } catch (syncError) {
    console.error('Discord auto-sync non-fatal error:', syncError);
  }
}

// --- CONTROLLER ACTIONS ---

export const getStatus = async (req: Request, res: Response) => {
  try {
    const host = process.env.MC_SERVER_HOST ?? 'localhost';
    const port = Number.parseInt(process.env.MC_SERVER_PORT ?? '25565', 10);

    const status = await minecraftService.getServerStatus(host, port);
    res.json(status);
  } catch (error) {
    console.error('[Minecraft Status CRITICAL 500]:', error);
    let details: string | undefined;
    if (process.env.NODE_ENV === 'development') {
      details = error instanceof Error ? error.message : String(error);
    }

    res.status(500).json({
      online: false,
      error: 'Internal server error fetching status',
      details,
    });
  }
};

export const getSkin = async (req: Request, res: Response) => {
  const username = ensureString(req.params.username);
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    const skinData = await skinService.getSkinUrl(username);
    res.json(skinData);
  } catch (error) {
    console.error('Error fetching skin:', error);
    res.json({
      url: `${URLS.FALLBACK_MINOTAR_SKIN}/${username}`,
      source: 'fallback',
    });
  }
};

export const verifyLinkCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const authUserId = getAuthUserId(req as AuthenticatedRequest);
    const userRole = (req as AuthenticatedRequest).user?.role?.toLowerCase();
    const isStaff = Boolean(
      userRole && ['admin', 'owner', 'developer', 'moderator', 'staff'].includes(userRole),
    );
    const targetUserId = authUserId ?? (isStaff ? req.body.userId : undefined);

    if (!code || !targetUserId) {
      return res.status(400).json({ error: 'Code and Authentication required' });
    }

    if (!supabase) {
      return res.status(503).json({ error: ERRORS.SUPABASE_UNCONFIGURED });
    }

    const upperCode = code.toUpperCase();
    const [rows] = await pool.execute<UniversalLinkRecord[]>(SQL.SELECT_UNIVERSAL_LINK, [
      upperCode,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Código inválido o inexistente.' });
    }

    const verification = rows[0];
    if (Date.now() > Number(verification.expires_at)) {
      await pool.execute(SQL.DELETE_UNIVERSAL_CODE, [upperCode]);
      return res.status(400).json({ error: 'El código ha expirado.' });
    }

    const {
      source,
      source_id: sourceId,
      player_name: playerName,
      avatar_url: avatarUrl,
    } = verification;

    await syncDatabaseLink(source, sourceId, playerName, targetUserId);
    await pool.execute(SQL.DELETE_UNIVERSAL_CODE, [upperCode]);

    const token = extractAuthToken(req);
    if (source === SOURCES.MINECRAFT) {
      await syncSupabaseMetadata(targetUserId, token, {
        minecraft_uuid: sourceId,
        minecraft_nick: playerName,
      });
    } else if (source === SOURCES.DISCORD) {
      await syncSupabaseMetadata(targetUserId, token, {
        discord_id: sourceId,
        discord_tag: playerName,
        discord_avatar: avatarUrl,
      });
    }

    res.json({ success: true, source, linked: true, playerName });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      error: 'Error al procesar la vinculación.',
      details: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal Server Error',
    });
  }
};

export const initWebLink = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req as AuthenticatedRequest);
    const userRole = (req as AuthenticatedRequest).user?.role?.toLowerCase();
    const isStaff = Boolean(
      userRole && ['admin', 'owner', 'developer', 'moderator', 'staff'].includes(userRole),
    );
    const userId = (isStaff && req.body.userId) || authUserId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: ERRORS.USER_ID_REQUIRED });
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(crypto.randomInt(0, chars.length));
    }

    const expiresAt = Date.now() + 15 * 60 * 1000;

    await pool.execute(SQL.INSERT_OR_UPDATE_UNIVERSAL_LINK, [
      code,
      SOURCES.WEB,
      userId,
      expiresAt,
      expiresAt,
    ]);

    res.json({ success: true, code });
  } catch (error) {
    console.error('Init Web Link Error:', error);
    res.status(500).json({ error: 'Error al generar código de vinculación.' });
  }
};

export const checkLinkStatus = async (req: Request, res: Response) => {
  try {
    const userId = ensureString(req.query.userId);
    if (!userId) {
      return res.status(400).json({ error: ERRORS.USER_ID_REQUIRED });
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(SQL.SELECT_LINK_BY_WEB_ID, [userId]);
    const token = extractAuthToken(req);

    await handleDiscordAutoSync(userId, token, rows);

    if (rows.length === 0) {
      return res.json({ linked: false });
    }

    const link = rows[0];
    let existingAvatar: string | null = null;
    try {
      const {
        data: { user: userData },
      } = await supabase.auth.admin.getUserById(userId);
      existingAvatar = (userData?.user_metadata?.discord_avatar as string) || null;
    } catch {
      /* ignore */
    }

    await syncSupabaseMetadata(userId, token, {
      minecraft_uuid: link.minecraft_uuid,
      minecraft_nick: link.minecraft_name,
      discord_id: link.discord_id,
      discord_tag: link.discord_tag,
      discord_avatar: existingAvatar,
      gacha_balance: link.gacha_balance,
    });

    return res.json({
      linked: true,
      minecraft: { uuid: link.minecraft_uuid, name: link.minecraft_name },
      discord: { id: link.discord_id, tag: link.discord_tag },
      balance: link.gacha_balance,
    });
  } catch (error) {
    console.error('Check Link Status Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
};

export const unlinkAccount = async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req as AuthenticatedRequest);
    const token = extractAuthToken(req);

    if (!userId) {
      return res.status(401).json({ error: ERRORS.UNAUTHORIZED });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(SQL.SELECT_MC_NAME, [userId]);
    const minecraftName = (rows[0]?.minecraft_name as string) || null;

    await pool.execute(SQL.CLEAR_MC_BY_WEB_ID, [userId]);
    await pool.execute(SQL.CLEANUP_EMPTY_LINKS, [userId]);

    try {
      await clearSupabaseMetadata(userId, token, {
        minecraft_uuid: null,
        minecraft_nick: null,
      });
    } catch (metaError) {
      console.error('Error updating Supabase metadata (non-fatal):', metaError);
    }

    if (minecraftName) {
      try {
        await pool.execute(SQL.INSERT_PENDING_COMMAND, [`crystalcore sync ${minecraftName}`]);
      } catch (dbError) {
        console.error(
          'Warning: Could not insert sync command (Plugin likely not updated or table missing):',
          dbError,
        );
      }
    }

    res.json({ success: true, message: 'Minecraft account unlinked successfully' });
  } catch (error) {
    console.error('Unlink Account Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
      // @ts-expect-error sqlMessage exists on MySQL errors but not standard Error
      if (error.sqlMessage) console.error('SQL Message:', error.sqlMessage);
    }
    res.status(500).json({ error: 'Error al desvincular la cuenta.' });
  }
};

export const unlinkDiscord = async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req as AuthenticatedRequest);
    const token = extractAuthToken(req);

    if (!userId) {
      return res.status(401).json({ error: ERRORS.UNAUTHORIZED });
    }

    await pool.execute(SQL.CLEAR_DISCORD_BY_WEB_ID, [userId]);
    await pool.execute(SQL.CLEANUP_EMPTY_LINKS, [userId]);

    try {
      await clearSupabaseMetadata(userId, token, {
        discord_id: null,
        discord_tag: null,
        discord_avatar: null,
        social_discord: null,
      });
    } catch (metaError) {
      console.error('Error updating Supabase metadata (non-fatal):', metaError);
    }

    res.json({ success: true, message: 'Discord account unlinked successfully' });
  } catch (error) {
    console.error('Unlink Discord Error:', error);
    res.status(500).json({ error: 'Error al desvincular Discord.' });
  }
};

export const requestMsDeviceCode = async (_req: Request, res: Response) => {
  try {
    if (!CLIENT_ID_LIVE && !CLIENT_ID_AZURE) {
      return res.status(500).json({
        error:
          'Las credenciales de autenticación con Microsoft no están configuradas en el servidor.',
      });
    }

    let dataLive: Record<string, unknown> & {
      user_code?: string;
      device_code?: string;
      verification_uri?: string;
      interval?: number;
      expires_in?: number;
      error_description?: string;
      error?: string;
    } = {};

    if (CLIENT_ID_LIVE) {
      const bodyLive = new URLSearchParams({
        client_id: CLIENT_ID_LIVE,
        scope: 'service::user.auth.xboxlive.com::MBI_SSL',
        response_type: 'device_code',
      });

      const rLive = await fetch(URLS.LIVE_DEVICE_CODE, {
        method: 'POST',
        headers: HEADERS.URLENCODED,
        body: bodyLive.toString(),
      });

      dataLive = (await rLive.json()) as typeof dataLive;

      if (rLive.ok && dataLive.user_code && dataLive.device_code) {
        return res.json({
          user_code: dataLive.user_code,
          device_code: dataLive.device_code,
          verification_uri: dataLive.verification_uri ?? 'https://www.microsoft.com/link',
          interval: dataLive.interval ?? 5,
          expires_in: dataLive.expires_in ?? 900,
          isLive: true,
        });
      }
    }

    const bodyAzure = new URLSearchParams({
      client_id: CLIENT_ID_AZURE,
      scope: XBOX_SCOPE,
    });

    const rAzure = await fetch(URLS.AZURE_DEVICE_CODE, {
      method: 'POST',
      headers: HEADERS.URLENCODED,
      body: bodyAzure.toString(),
    });

    const dataAzure = (await rAzure.json()) as Record<string, unknown> & {
      device_code?: string;
      error_description?: string;
      error?: string;
    };

    if (rAzure.ok && dataAzure.device_code) {
      return res.json({ ...dataAzure, isLive: false });
    }

    return res.status(400).json({
      error:
        dataLive.error_description ??
        dataLive.error ??
        dataAzure.error_description ??
        dataAzure.error ??
        'Error al solicitar código de Microsoft',
    });
  } catch (err: unknown) {
    console.error('msDeviceCode error:', err);
    res.status(500).json({ error: 'Error al solicitar el código de dispositivo de Microsoft.' });
  }
};

async function queryDeviceToken(
  deviceCode: string,
  isLive: boolean,
): Promise<{ accessToken: string | null; authError: Record<string, unknown> | null }> {
  const clientId = isLive ? CLIENT_ID_LIVE : CLIENT_ID_AZURE;
  if (!clientId) {
    return {
      accessToken: null,
      authError: {
        error: 'microsoft_auth_not_configured',
        error_description: 'Microsoft Client ID no está configurado en el servidor.',
      },
    };
  }

  const url = isLive ? URLS.LIVE_TOKEN : URLS.AZURE_TOKEN;

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    device_code: deviceCode,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: HEADERS.URLENCODED,
    body: body.toString(),
  });

  const data = (await response.json()) as Record<string, unknown> & {
    access_token?: string;
    error?: string;
  };

  return {
    accessToken: data.access_token ?? null,
    authError: data.error ? data : null,
  };
}

export const pollMsDeviceToken = async (req: Request, res: Response) => {
  try {
    const { deviceCode, isLive } = req.body;
    if (!deviceCode) {
      return res.status(400).json({ error: 'deviceCode is required' });
    }

    const { accessToken, authError } = await queryDeviceToken(deviceCode, isLive !== false);

    if (accessToken) {
      const authResult = await authenticateMinecraftWithToken(accessToken);
      if (authResult.error) {
        return res.status(400).json({ error: authResult.error });
      }
      return res.json({ success: true, profile: authResult.profile });
    }

    return res.json(authError ?? { error: ERRORS.AUTH_PENDING });
  } catch (err: unknown) {
    console.error('pollMsDeviceToken error:', err);
    res.status(500).json({ error: 'Error al verificar la autorización con Microsoft.' });
  }
};

export const exchangeMsAuthCode = async (req: Request, res: Response) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code || !redirectUri) {
      return res.status(400).json({ error: 'Code and redirectUri are required' });
    }

    try {
      const parsedUri = new URL(redirectUri);
      const isAllowed =
        parsedUri.protocol === 'https:' ||
        parsedUri.protocol === 'tauri:' ||
        parsedUri.hostname === 'localhost' ||
        parsedUri.hostname === '127.0.0.1';
      if (!isAllowed) {
        return res.status(400).json({ error: 'Invalid redirectUri' });
      }
    } catch {
      return res.status(400).json({ error: 'Malformed redirectUri' });
    }

    if (!CLIENT_ID_AZURE) {
      return res.status(500).json({
        error:
          'El Client ID de Microsoft Azure (MICROSOFT_CLIENT_ID) no está configurado en el servidor.',
      });
    }

    const tokenParams: Record<string, string> = {
      client_id: CLIENT_ID_AZURE,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      scope: XBOX_SCOPE,
    };

    if (process.env.MICROSOFT_CLIENT_SECRET) {
      tokenParams.client_secret = process.env.MICROSOFT_CLIENT_SECRET;
    }

    const body = new URLSearchParams(tokenParams);

    const rMs = await fetch(URLS.AZURE_TOKEN, {
      method: 'POST',
      headers: HEADERS.URLENCODED,
      body: body.toString(),
    });

    const msData = (await rMs.json()) as Record<string, unknown> & {
      access_token?: string;
      error_description?: string;
      error?: string;
    };

    if (!rMs.ok || !msData.access_token) {
      return res.status(400).json({
        error:
          msData.error_description ??
          msData.error ??
          'Error al canjear el código de autorización de Microsoft',
      });
    }

    const authResult = await authenticateMinecraftWithToken(msData.access_token);
    if (authResult.error) {
      return res.status(400).json({ error: authResult.error });
    }

    return res.json({ success: true, profile: authResult.profile });
  } catch (err: unknown) {
    console.error('exchangeMsAuthCode error:', err);
    res.status(500).json({ error: 'Error al autenticar con Microsoft.' });
  }
};
