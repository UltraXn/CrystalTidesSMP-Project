import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabaseClient.js';
import { sendError } from '../utils/responseHandler.js';
import { logSecurityFailure } from '../services/auditService.js';
import { ADMIN_ROLES, SERVICE_ROLE } from '../utils/roleUtils.js';

type CachedUser = NonNullable<Express.Request['user']>;

interface ProfileRecord {
  username?: string | null;
  role?: string | null;
  avatar_url?: string | null;
}

interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: unknown;
  };
  app_metadata: Record<string, unknown>;
}

const AUTH_CONSTANTS = {
  CACHE_TTL_MS: 60_000,
  DEFAULT_ROLE: 'user',
  DEFAULT_USERNAME: 'Unknown',
  BOT_SYSTEM_ID: 'bot_system_id',
  BOT_EMAIL: 'bot@crystaltidessmp.net',
  BOT_USERNAME: 'CrystalBot',
  ADMIN_2FA_COOKIE: 'admin_2fa_token',
  ADMIN_TOKEN_HEADER: 'x-admin-token',
  AUTH_HEADER: 'authorization',
} as const;

const ERROR_MESSAGES = {
  NO_TOKEN: 'No authentication token provided',
  UNAUTHORIZED: 'Unauthorized',
  AUTH_FAILED: 'Auth failed',
  AUTH_REQUIRED: 'Authentication required',
  TWO_FA_REQUIRED: '2FA Verification Required',
  TWO_FA_INVALID: 'Invalid or Expired 2FA Session',
  SECURITY_LOG_FAILED: 'Failed to log security event:',
  UNKNOWN_ERROR: 'Unknown error',
} as const;

const ERROR_CODES = {
  AUTH_ERROR: 'AUTH_ERROR',
  AUTH_UNEXPECTED: 'AUTH_UNEXPECTED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  TWO_FA_REQUIRED: '2FA_REQUIRED',
} as const;

// 60s in-memory token cache to eliminate Supabase HTTP roundtrip on repeated requests
const tokenCache = new Map<string, { user: CachedUser; exp: number }>();

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers[AUTH_CONSTANTS.AUTH_HEADER];
  if (typeof authHeader !== 'string') {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return token || null;
}

function isBotApiKey(token: string): boolean {
  const botApiKey = process.env.BOT_API_KEY ?? process.env.SERVER_API_KEY;
  if (!botApiKey || !token) {
    return false;
  }
  const tokenBuf = Buffer.from(token);
  const keyBuf = Buffer.from(botApiKey);
  if (tokenBuf.length !== keyBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(tokenBuf, keyBuf);
}

function createBotUser(): CachedUser {
  return {
    id: AUTH_CONSTANTS.BOT_SYSTEM_ID,
    email: AUTH_CONSTANTS.BOT_EMAIL,
    username: AUTH_CONSTANTS.BOT_USERNAME,
    // Not an admin: routes must grant SERVICE_ROLE explicitly (see roleUtils).
    role: SERVICE_ROLE,
    avatar_url: '',
    app_metadata: { two_factor_enabled: false },
  };
}

function getCachedUser(token: string): CachedUser | null {
  const cached = tokenCache.get(token);
  if (!cached) {
    return null;
  }
  if (cached.exp <= Date.now()) {
    tokenCache.delete(token);
    return null;
  }
  return cached.user;
}

function setCachedUser(token: string, user: CachedUser): void {
  tokenCache.set(token, {
    user,
    exp: Date.now() + AUTH_CONSTANTS.CACHE_TTL_MS,
  });
}

async function fetchProfile(userId: string): Promise<ProfileRecord | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role, avatar_url')
    .eq('id', userId)
    .single();

  return profile as ProfileRecord | null;
}

function buildCachedUser(user: SupabaseAuthUser, profile: ProfileRecord | null): CachedUser {
  const username =
    profile?.username ??
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    AUTH_CONSTANTS.DEFAULT_USERNAME;

  return {
    id: user.id,
    email: user.email,
    username,
    role: profile?.role ?? AUTH_CONSTANTS.DEFAULT_ROLE,
    avatar_url: profile?.avatar_url ?? '',
    app_metadata: user.app_metadata,
  };
}

function logSecurityEvent(req: Request, message: string, isSuspicious: boolean): void {
  logSecurityFailure(req, message, isSuspicious).catch((err: unknown) => {
    console.error(ERROR_MESSAGES.SECURITY_LOG_FAILED, err);
  });
}

function extractAdminToken(req: Request): string | null {
  const signedToken = req.signedCookies?.[AUTH_CONSTANTS.ADMIN_2FA_COOKIE];
  if (typeof signedToken === 'string') {
    return signedToken;
  }

  const cookieToken = req.cookies?.[AUTH_CONSTANTS.ADMIN_2FA_COOKIE];
  if (typeof cookieToken === 'string') {
    return cookieToken;
  }

  const headerToken = req.headers[AUTH_CONSTANTS.ADMIN_TOKEN_HEADER];
  if (typeof headerToken === 'string') {
    return headerToken;
  }

  return null;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  const token = extractBearerToken(req);

  if (!token) {
    logSecurityEvent(req, ERROR_MESSAGES.NO_TOKEN, false);
    return sendError(res, ERROR_MESSAGES.NO_TOKEN, ERROR_CODES.AUTH_ERROR, 401);
  }

  try {
    if (isBotApiKey(token)) {
      req.user = createBotUser();
      return next();
    }

    const cachedUser = getCachedUser(token);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth error:', error);
      logSecurityEvent(req, ERROR_MESSAGES.UNAUTHORIZED, false);
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, ERROR_CODES.AUTH_ERROR, 401, error);
    }

    const profile = await fetchProfile(user.id);
    const resolvedUser = buildCachedUser(user as SupabaseAuthUser, profile);

    req.user = resolvedUser;
    setCachedUser(token, resolvedUser);
    next();
  } catch (err: unknown) {
    const errorDetail = err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR;
    console.error('Unexpected auth error:', errorDetail);
    logSecurityEvent(req, ERROR_MESSAGES.AUTH_FAILED, true);
    return sendError(res, ERROR_MESSAGES.AUTH_FAILED, ERROR_CODES.AUTH_UNEXPECTED, 403, err);
  }
};

export const require2FA = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  const user = req.user;
  if (!user) {
    logSecurityEvent(req, ERROR_MESSAGES.AUTH_REQUIRED, false);
    return sendError(res, ERROR_MESSAGES.AUTH_REQUIRED, ERROR_CODES.AUTH_REQUIRED, 401);
  }

  const is2FAEnabled = Boolean(user.app_metadata?.two_factor_enabled);
  const userRole = (user.role || '').toLowerCase();
  const isStaffOrAdmin = ADMIN_ROLES.includes(userRole);

  if (isStaffOrAdmin && !is2FAEnabled) {
    logSecurityEvent(req, '2FA Enrollment Required for Admin Action', true);
    return sendError(
      res,
      '2FA Enrollment Required for Admin Action',
      ERROR_CODES.TWO_FA_REQUIRED,
      403,
    );
  }

  if (!is2FAEnabled) {
    return next();
  }

  const adminToken = extractAdminToken(req);
  if (!adminToken) {
    logSecurityEvent(req, ERROR_MESSAGES.TWO_FA_REQUIRED, true);
    return sendError(res, ERROR_MESSAGES.TWO_FA_REQUIRED, ERROR_CODES.TWO_FA_REQUIRED, 403);
  }

  const twoFactorService = await import('../services/twoFactorService.js');
  const payload = twoFactorService.verifyAdminToken(adminToken);

  if (!payload || payload.sub !== user.id) {
    logSecurityEvent(req, ERROR_MESSAGES.TWO_FA_INVALID, true);
    return sendError(res, ERROR_MESSAGES.TWO_FA_INVALID, ERROR_CODES.TWO_FA_REQUIRED, 403);
  }

  next();
};

/**
 * Optional authentication: Populates req.user if a valid token is present,
 * but DOES NOT fail if the token is missing or invalid.
 */
export const optionalAuthenticateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (!error && user) {
      const profile = await fetchProfile(user.id);
      req.user = buildCachedUser(user as SupabaseAuthUser, profile);
    }
    next();
  } catch {
    // Silently continue for optional auth
    next();
  }
};
