import { Request, Response } from 'express';
import * as twoFactorService from '../services/twoFactorService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { MemoryRateLimiter } from '../utils/rateLimiter.js';
import type { Enable2FAPayload, Verify2FAPayload } from '@crystaltides/shared';

const TWO_FACTOR_ERRORS = {
  UNAUTHORIZED: 'User not authenticated',
  SETUP_FAILED: 'Setup failed',
  INVALID_TOKEN: 'Invalid Token',
  ENABLE_FAILED: 'Enable failed',
  DISABLE_FAILED: 'Disable failed',
  NOT_ENABLED: '2FA is not enabled for this account',
  INVALID_CODE: 'Invalid 2FA Code',
  VERIFY_FAILED: 'Verification failed',
  STATUS_FAILED: 'Status check failed',
  OTP_URL_FAILED: 'Failed to generate OTP Auth URL',
  ALREADY_ENABLED:
    '2FA is already enabled. Disable it with a valid code before setting it up again.',
  SETUP_REQUIRED: 'Start the 2FA setup before enabling it',
  NOT_CONFIGURED: '2FA is temporarily unavailable',
  TOO_MANY_ATTEMPTS: 'Too many 2FA attempts. Try again later.',
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
  INVALID_TOKEN: 'INVALID_TOKEN',
  NOT_ENABLED: '2FA_NOT_ENABLED',
  ALREADY_ENABLED: '2FA_ALREADY_ENABLED',
  SETUP_REQUIRED: '2FA_SETUP_REQUIRED',
  NOT_CONFIGURED: '2FA_NOT_CONFIGURED',
  TOO_MANY_ATTEMPTS: '2FA_TOO_MANY_ATTEMPTS',
} as const;

const COOKIE_NAME = 'admin_2fa_token';

// Per-user budget for code checks: a stolen session must not be able to brute-force 6 digits.
const codeAttemptLimiter = new MemoryRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 });

const getCookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  signed: true,
  ...(maxAge ? { maxAge } : {}),
});

const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

const sendFailure = (res: Response, error: unknown, fallbackMessage: string) => {
  if (error instanceof twoFactorService.TwoFactorConfigError) {
    console.error('[2FA]', error.message);
    return sendError(res, TWO_FACTOR_ERRORS.NOT_CONFIGURED, ERROR_CODES.NOT_CONFIGURED, 503);
  }
  return sendError(res, extractErrorMessage(error, fallbackMessage));
};

const isCodeAttemptAllowed = (userId: string) => codeAttemptLimiter.check(`2fa:${userId}`).allowed;

const sendTooManyAttempts = (res: Response) =>
  sendError(res, TWO_FACTOR_ERRORS.TOO_MANY_ATTEMPTS, ERROR_CODES.TOO_MANY_ATTEMPTS, 429);

// Setup - Generate Secret & QR (Protected by AuthenticateToken)
export const setup2FA = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }

    // Replacing an active factor must go through disable, which requires a valid code.
    if (await twoFactorService.isEnrolled(user.id)) {
      return sendError(res, TWO_FACTOR_ERRORS.ALREADY_ENABLED, ERROR_CODES.ALREADY_ENABLED, 409);
    }

    const email = user.email ?? 'user';
    const { otpauth_url, base32 } = twoFactorService.generateSecret(email);

    if (!otpauth_url) {
      throw new Error(TWO_FACTOR_ERRORS.OTP_URL_FAILED);
    }

    await twoFactorService.savePendingSecret(user.id, base32);
    const qrCode = await twoFactorService.generateQRCode(otpauth_url);

    // Return secret (base32) so frontend can use it if QR fails
    return sendSuccess(res, { secret: base32, qrCode }, TWO_FACTOR_SUCCESS.SETUP_INITIATED);
  } catch (error) {
    return sendFailure(res, error, TWO_FACTOR_ERRORS.SETUP_FAILED);
  }
};

// Enable - Verify token against the pending secret (Protected by AuthenticateToken)
export const enable2FA = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }
    if (!isCodeAttemptAllowed(user.id)) {
      return sendTooManyAttempts(res);
    }

    // Any `secret` sent by the client is ignored: only the server-generated pending one counts.
    const { token } = req.body as Enable2FAPayload;
    const result = await twoFactorService.activatePendingSecret(user.id, token);

    if (result === 'not_enrolled') {
      return sendError(res, TWO_FACTOR_ERRORS.SETUP_REQUIRED, ERROR_CODES.SETUP_REQUIRED, 400);
    }
    if (result === 'invalid') {
      return sendError(res, TWO_FACTOR_ERRORS.INVALID_TOKEN, ERROR_CODES.INVALID_TOKEN, 400);
    }

    return sendSuccess(res, { enabled: true }, TWO_FACTOR_SUCCESS.ENABLED);
  } catch (error) {
    return sendFailure(res, error, TWO_FACTOR_ERRORS.ENABLE_FAILED);
  }
};

// Disable - Requires a valid code from the active factor (Protected by AuthenticateToken)
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }
    if (!isCodeAttemptAllowed(user.id)) {
      return sendTooManyAttempts(res);
    }

    const { token } = req.body as Verify2FAPayload;
    const result = await twoFactorService.verifyActiveCode(user.id, token);

    // 'not_enrolled' covers legacy accounts whose secret lived in app_metadata:
    // there is no server-side factor to prove, so only the flag is cleared.
    if (result === 'invalid') {
      return sendError(res, TWO_FACTOR_ERRORS.INVALID_CODE, ERROR_CODES.INVALID_TOKEN, 400);
    }

    await twoFactorService.removeTotp(user.id);
    res.clearCookie(COOKIE_NAME, getCookieOptions());
    return sendSuccess(res, { enabled: false }, TWO_FACTOR_SUCCESS.DISABLED);
  } catch (error) {
    return sendFailure(res, error, TWO_FACTOR_ERRORS.DISABLE_FAILED);
  }
};

// Verify - For Admin Access (Protected by AuthenticateToken)
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }
    if (!isCodeAttemptAllowed(user.id)) {
      return sendTooManyAttempts(res);
    }

    const { token } = req.body as Verify2FAPayload;
    const result = await twoFactorService.verifyActiveCode(user.id, token);

    if (result === 'not_enrolled') {
      return sendError(res, TWO_FACTOR_ERRORS.NOT_ENABLED, ERROR_CODES.NOT_ENABLED, 403);
    }
    if (result === 'invalid') {
      return sendError(res, TWO_FACTOR_ERRORS.INVALID_CODE, ERROR_CODES.INVALID_TOKEN, 400);
    }

    // Success -> Generate Admin Token
    const adminToken = twoFactorService.signAdminToken(user.id, user.role);

    // Security: Store 2FA verification session in HttpOnly + Signed cookie (inaccessible to JS / XSS + HMAC tampering protection)
    res.cookie(COOKIE_NAME, adminToken, getCookieOptions(15 * 60 * 1000));

    return sendSuccess(res, { adminToken }, TWO_FACTOR_SUCCESS.VERIFIED);
  } catch (error) {
    return sendFailure(res, error, TWO_FACTOR_ERRORS.VERIFY_FAILED);
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
    const user = req.user;
    if (!user) {
      return sendError(res, TWO_FACTOR_ERRORS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 401);
    }

    const enabled = await twoFactorService.isEnrolled(user.id);
    return sendSuccess(res, { enabled }, TWO_FACTOR_SUCCESS.STATUS_FETCHED);
  } catch (error) {
    return sendFailure(res, error, TWO_FACTOR_ERRORS.STATUS_FAILED);
  }
};
