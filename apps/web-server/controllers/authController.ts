import { Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../config/supabaseClient.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const AUTH_PASSWORD_RULES = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 100,
} as const;

export const AUTH_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CAPTCHA_REQUIRED: 'CAPTCHA_REQUIRED',
  CAPTCHA_FAILED: 'CAPTCHA_FAILED',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export const AUTH_MESSAGES = {
  INVALID_EMAIL: 'Invalid email format',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_TOO_LONG: 'Password too long',
  USERNAME_MIN_LENGTH: 'Username must be at least 3 characters',
  USERNAME_INVALID_CHARS: 'Username can only contain letters, numbers and underscores',
  INVALID_REGISTRATION_DATA: 'Invalid registration data',
  BOT_TOKEN_MISSING: 'Antibot verification token missing',
  BOT_VERIFICATION_FAILED: 'Antibot verification failed',
  REGISTRATION_FAILED: 'Registration failed',
  USER_REGISTERED_SUCCESS: 'User registered successfully',
  REGISTRATION_SUCCESS: 'Registration successful',
} as const;

export const TURNSTILE_VERIFY_ENDPOINT =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Checks if a string satisfies password length constraints.
 */
export const isPasswordLengthValid = (password: string): boolean => {
  return (
    typeof password === 'string' &&
    password.length >= AUTH_PASSWORD_RULES.MIN_LENGTH &&
    password.length <= AUTH_PASSWORD_RULES.MAX_LENGTH
  );
};

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates password rules and returns a structured validation result.
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  if (typeof password !== 'string' || password.length < AUTH_PASSWORD_RULES.MIN_LENGTH) {
    return { isValid: false, error: AUTH_MESSAGES.PASSWORD_MIN_LENGTH };
  }
  if (password.length > AUTH_PASSWORD_RULES.MAX_LENGTH) {
    return { isValid: false, error: AUTH_MESSAGES.PASSWORD_TOO_LONG };
  }
  return { isValid: true };
};

/**
 * Creates the reusable password validation Zod schema.
 */
export const createPasswordFieldSchema = () =>
  z
    .string()
    .min(AUTH_PASSWORD_RULES.MIN_LENGTH, AUTH_MESSAGES.PASSWORD_MIN_LENGTH)
    .max(AUTH_PASSWORD_RULES.MAX_LENGTH);

export const RegisterUserSchema = z.object({
  email: z.string().email(AUTH_MESSAGES.INVALID_EMAIL),
  password: createPasswordFieldSchema(),
  username: z
    .string()
    .min(3, AUTH_MESSAGES.USERNAME_MIN_LENGTH)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, AUTH_MESSAGES.USERNAME_INVALID_CHARS),
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
});

/**
 * Detects automated bot submissions via honeypot field inspection.
 */
export const isHoneypotTriggered = (website?: string | null): boolean => {
  return typeof website === 'string' && website.trim() !== '';
};

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
  errorCode?: (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
}

/**
 * Verifies Cloudflare Turnstile token against Cloudflare siteverify endpoint.
 * Bypasses in test environment or when TURNSTILE_SECRET_KEY is not configured.
 */
export const verifyTurnstileToken = async (
  turnstileToken?: string,
  remoteIp?: string,
): Promise<TurnstileVerificationResult> => {
  const isVerificationEnabled =
    Boolean(process.env.TURNSTILE_SECRET_KEY) && process.env.NODE_ENV !== 'test';
  if (!isVerificationEnabled) {
    return { success: true };
  }

  if (!turnstileToken) {
    return {
      success: false,
      error: AUTH_MESSAGES.BOT_TOKEN_MISSING,
      errorCode: AUTH_ERROR_CODES.CAPTCHA_REQUIRED,
    };
  }

  const verifyRes = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY ?? '',
      response: turnstileToken,
      remoteip: remoteIp || '',
    }),
  });

  const outcome = (await verifyRes.json()) as { success: boolean };
  if (!outcome.success) {
    return {
      success: false,
      error: AUTH_MESSAGES.BOT_VERIFICATION_FAILED,
      errorCode: AUTH_ERROR_CODES.CAPTCHA_FAILED,
    };
  }

  return { success: true };
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

/**
 * Public User Registration
 * Protected by sensitiveActionLimiter in app.ts and Honeypot field verification.
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const parseResult = RegisterUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues[0]?.message || AUTH_MESSAGES.INVALID_REGISTRATION_DATA;
      return sendError(
        res,
        firstError,
        AUTH_ERROR_CODES.VALIDATION_ERROR,
        400,
        parseResult.error.issues,
      );
    }

    const { email, password, username, website, turnstileToken } = parseResult.data;

    // Honeypot defense against automated bot scripts
    if (isHoneypotTriggered(website)) {
      return sendSuccess(
        res,
        { message: AUTH_MESSAGES.USER_REGISTERED_SUCCESS },
        AUTH_MESSAGES.REGISTRATION_SUCCESS,
      );
    }

    // Verify Cloudflare Turnstile token
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, req.ip);
    if (!turnstileCheck.success) {
      return sendError(
        res,
        turnstileCheck.error ?? AUTH_MESSAGES.BOT_VERIFICATION_FAILED,
        turnstileCheck.errorCode ?? AUTH_ERROR_CODES.CAPTCHA_FAILED,
        400,
      );
    }

    // Create user via Supabase Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true,
    });

    if (error) {
      return sendError(res, error.message, AUTH_ERROR_CODES.REGISTRATION_FAILED, 400);
    }

    return sendSuccess(res, { userId: data.user?.id }, AUTH_MESSAGES.USER_REGISTERED_SUCCESS);
  } catch (error) {
    const errorMessage = extractErrorMessage(error, AUTH_MESSAGES.REGISTRATION_FAILED);
    return sendError(res, errorMessage, AUTH_ERROR_CODES.SERVER_ERROR, 500);
  }
};
