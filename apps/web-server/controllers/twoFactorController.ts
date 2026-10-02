import { Request, Response } from 'express';
import { z } from 'zod';
import * as twoFactorService from '../services/twoFactorService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import supabase from '../config/supabaseClient.js';

const TWO_FACTOR_ERRORS = {
  UNAUTHORIZED: 'User not authenticated',
  SETUP_FAILED: 'Setup failed',
  INVALID_DATA: 'Invalid 2FA data',
  INVALID_TOKEN: 'Invalid Token',
  ENABLE_FAILED: 'Enable failed',
  DISABLE_FAILED: 'Disable failed',
  INVALID_FORMAT: 'Invalid token format',
  USER_FETCH_FAILED: 'User fetch failed',
  NOT_ENABLED: '2FA is not enabled for this account',
  INVALID_CODE: 'Invalid 2FA Code',
  VERIFY_FAILED: 'Verification failed',
  STATUS_FAILED: 'Status check failed',
  OTP_URL_FAILED: 'Failed to generate OTP Auth URL',
} as const;

const TWO_FACTOR_SUCCESS = {
  SETUP_INITIATED: '2FA Setup initiated',
  ENABLED: '2FA Enabled Successfully',
  DISABLED: '2FA Disabled',
  VERIFIED: 'Verified',
  SESSION_CLEARED: '2FA Session cleared',
  STATUS_FETCHED: 'Status fetched',
} as const;

const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_ENABLED: '2FA_NOT_ENABLED',
} as const;

const COOKIE_NAME = 'admin_2fa_token';

const getCookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  signed: true,
  ...(maxAge ? { maxAge } : {}),
});

const Enable2FASchema = z.object({
  token: z.string().min(6, 'Token must be at least 6 digits').max(8),
  secret: z.string().min(16, 'Invalid secret length').max(64),
});

const Verify2FASchema = z.object({
  token: z.string().min(6, 'Token must be at least 6 digits').max(8),
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    username: string;
    role: string;
  };
}

const getAuthenticatedUser = (req: Request) => {
  return (req as AuthenticatedRequest).user;
};

const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

// Setup - Generate Secret & QR (Protected by AuthenticateToken)
export const setup2FA = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }

    const email = user.email || 'user';
    const { otpauth_url, base32 } = twoFactorService.generateSecret(email);

    if (!otpauth_url) {
      throw new Error(TWO_FACTOR_ERRORS.OTP_URL_FAILED);
    }

    const qrCode = await twoFactorService.generateQRCode(otpauth_url);

    // Return secret (base32) so frontend can use it if QR fails, and current state
    return sendSuccess(res, { secret: base32, qrCode }, TWO_FACTOR_SUCCESS.SETUP_INITIATED);
  } catch (error) {
    return sendError(res, extractErrorMessage(error, TWO_FACTOR_ERRORS.SETUP_FAILED));
  }
};

// Enable - Verify token & Save Secret (Protected by AuthenticateToken)
export const enable2FA = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }

    const parseResult = Enable2FASchema.safeParse(req.body);
    if (!parseResult.success) {
      const validationMessage =
        parseResult.error.issues[0]?.message || TWO_FACTOR_ERRORS.INVALID_DATA;
      return sendError(res, validationMessage, ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const { token, secret } = parseResult.data;

    const verified = twoFactorService.verifyToken(token, secret);
    if (!verified) {
      return sendError(res, TWO_FACTOR_ERRORS.INVALID_TOKEN, ERROR_CODES.INVALID_TOKEN, 400);
    }

    await twoFactorService.updateUser2FARecord(user.id, secret, true);

    return sendSuccess(res, { enabled: true }, TWO_FACTOR_SUCCESS.ENABLED);
  } catch (error) {
    return sendError(res, extractErrorMessage(error, TWO_FACTOR_ERRORS.ENABLE_FAILED));
  }
};

// Disable (Protected by AuthenticateToken)
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }

    await twoFactorService.updateUser2FARecord(user.id, null, false);
    return sendSuccess(res, { enabled: false }, TWO_FACTOR_SUCCESS.DISABLED);
  } catch (error) {
    return sendError(res, extractErrorMessage(error, TWO_FACTOR_ERRORS.DISABLE_FAILED));
  }
};

// Verify - For Admin Access (Protected by AuthenticateToken)
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }

    const parseResult = Verify2FASchema.safeParse(req.body);
    if (!parseResult.success) {
      const validationMessage =
        parseResult.error.issues[0]?.message || TWO_FACTOR_ERRORS.INVALID_FORMAT;
      return sendError(res, validationMessage, ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const { token } = parseResult.data; // TOTP code

    // Fetch user's stored secret from Supabase Admin (app_metadata)
    const {
      data: { user: fullUser },
      error,
    } = await supabase.auth.admin.getUserById(user.id);

    if (error || !fullUser) {
      return sendError(res, TWO_FACTOR_ERRORS.USER_FETCH_FAILED, ERROR_CODES.SERVER_ERROR, 500);
    }

    const secret = fullUser.app_metadata?.two_factor_secret;
    const enabled = fullUser.app_metadata?.two_factor_enabled;

    if (!enabled || !secret) {
      return sendError(res, TWO_FACTOR_ERRORS.NOT_ENABLED, ERROR_CODES.NOT_ENABLED, 403);
    }

    const verified = twoFactorService.verifyToken(token, secret);
    if (!verified) {
      return sendError(res, TWO_FACTOR_ERRORS.INVALID_CODE, ERROR_CODES.INVALID_TOKEN, 400);
    }

    // Success -> Generate Admin Token
    const adminToken = twoFactorService.signAdminToken(user.id, user.role);

    // Security: Store 2FA verification session in HttpOnly + Signed cookie (inaccessible to JS / XSS + HMAC tampering protection)
    res.cookie(COOKIE_NAME, adminToken, getCookieOptions(15 * 60 * 1000));

    return sendSuccess(res, { adminToken }, TWO_FACTOR_SUCCESS.VERIFIED);
  } catch (error) {
    return sendError(res, extractErrorMessage(error, TWO_FACTOR_ERRORS.VERIFY_FAILED));
  }
};

// Clear 2FA Session Cookie
export const clear2FA = async (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
  return sendSuccess(res, null, TWO_FACTOR_SUCCESS.SESSION_CLEARED);
};

// Check Status - Returns if 2FA is enabled
export const get2FAStatus = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }

    const {
      data: { user: fullUser },
      error,
    } = await supabase.auth.admin.getUserById(user.id);
    if (error || !fullUser) {
      throw error || new Error(TWO_FACTOR_ERRORS.USER_FETCH_FAILED);
    }

    return sendSuccess(
      res,
      {
        enabled: !!fullUser.app_metadata?.two_factor_enabled,
      },
      TWO_FACTOR_SUCCESS.STATUS_FETCHED,
    );
  } catch (error) {
    return sendError(res, extractErrorMessage(error, TWO_FACTOR_ERRORS.STATUS_FAILED));
  }
};
