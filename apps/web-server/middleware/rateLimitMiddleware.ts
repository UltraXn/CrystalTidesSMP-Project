import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';
import { getClientIp } from '../utils/clientIp.js';
import { SERVICE_ROLE } from '../utils/roleUtils.js';

interface RateLimitErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

interface LimiterConfig {
  windowMs: number;
  max: number;
  errorCode: string;
  errorMessage: string;
  keyBy?: 'ip' | 'userOrIp';
  /** One budget per route instead of one shared by every route the limiter is mounted on. */
  perRoute?: boolean;
  skip?: (req: Request) => boolean;
}

const DEFAULT_IP = '127.0.0.1';

const WINDOW_MS = {
  ONE_MINUTE: 1 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
} as const;

const ERROR_CODES = {
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UPLOAD_RATE_LIMIT_EXCEEDED: 'UPLOAD_RATE_LIMIT_EXCEEDED',
  WEBHOOK_RATE_LIMIT_EXCEEDED: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
} as const;

export const clientIpKey = (req: Request): string => ipKeyGenerator(getClientIp(req) || DEFAULT_IP);

/**
 * Authenticated callers are limited per account, anonymous ones per client IP.
 * Never key on a value the client picks (cookies, headers): a fresh value per
 * request would mean a fresh bucket per request.
 */
export const userOrIpKey = (req: Request): string =>
  req.user?.id ? `user:${req.user.id}` : clientIpKey(req);

/**
 * "POST /api/ai/newspaper/:id/like": the route pattern, not the concrete URL, so
 * changing an id in the path does not open a new bucket.
 */
export const routeOf = (req: Request): string => {
  const pattern: unknown = req.route?.path;
  return `${req.method} ${req.baseUrl}${typeof pattern === 'string' ? pattern : ''}`;
};

const createLimiter = ({
  windowMs,
  max,
  errorCode,
  errorMessage,
  keyBy = 'userOrIp',
  perRoute = false,
  skip,
}: LimiterConfig) => {
  const responsePayload: RateLimitErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
    },
  };

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: responsePayload,
    keyGenerator: (req: Request) => {
      const clientKey = keyBy === 'ip' ? clientIpKey(req) : userOrIpKey(req);
      return perRoute ? `${routeOf(req)}|${clientKey}` : clientKey;
    },
    ...(skip ? { skip } : {}),
  });
};

/**
 * General API Limiter - 100 requests per minute per client IP
 */
export const apiLimiter = createLimiter({
  windowMs: WINDOW_MS.ONE_MINUTE,
  max: 100,
  errorCode: ERROR_CODES.TOO_MANY_REQUESTS,
  errorMessage: 'Too many requests, please try again after a minute',
  keyBy: 'ip',
});

/**
 * Strict Auth/Sensitive Limiter - 10 requests per 10 minutes per account (or IP)
 * on each route it is mounted on: likes do not use up the registration or 2FA
 * budget. Apply it to specific write/expensive routes, never to whole routers.
 */
export const sensitiveActionLimiter = createLimiter({
  windowMs: WINDOW_MS.TEN_MINUTES,
  max: 10,
  perRoute: true,
  errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  errorMessage: 'Too many sensitive actions. Please try again later.',
});

/**
 * Gacha Roll Limiter - 30 rolls per 10 minutes per account
 */
export const gachaRollLimiter = createLimiter({
  windowMs: WINDOW_MS.TEN_MINUTES,
  max: 30,
  errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  errorMessage: 'Too many rolls. Please try again in a few minutes.',
});

/**
 * Admin Console Limiter - 60 queued commands per 10 minutes per admin.
 * The Discord chat bridge (service role) relays every message, so it is only
 * bound by the general limiter.
 */
export const adminCommandLimiter = createLimiter({
  windowMs: WINDOW_MS.TEN_MINUTES,
  max: 60,
  errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  errorMessage: 'Too many queued commands. Please try again later.',
  skip: (req) => req.user?.role === SERVICE_ROLE,
});

/**
 * Admin Upload Limiter - 20 requests per hour
 */
export const uploadLimiter = createLimiter({
  windowMs: WINDOW_MS.ONE_HOUR,
  max: 20,
  errorCode: ERROR_CODES.UPLOAD_RATE_LIMIT_EXCEEDED,
  errorMessage: 'Too many upload attempts. Please try again later.',
});

/**
 * User Image Upload Limiter - 30 requests per hour
 * Separate from uploadLimiter so user traffic can't exhaust the admin quota.
 */
export const imageUploadLimiter = createLimiter({
  windowMs: WINDOW_MS.ONE_HOUR,
  max: 30,
  errorCode: ERROR_CODES.UPLOAD_RATE_LIMIT_EXCEEDED,
  errorMessage: 'Too many image uploads. Please try again later.',
});

/**
 * Security Report Limiter - 20 reports per 10 minutes per client IP.
 * Its own budget: failed logins must not use up the registration allowance.
 */
export const securityReportLimiter = createLimiter({
  windowMs: WINDOW_MS.TEN_MINUTES,
  max: 20,
  errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  errorMessage: 'Too many reports. Please try again later.',
  keyBy: 'ip',
});

/**
 * Inbound Webhook Limiter - 30 requests per minute per client IP
 */
export const webhookLimiter = createLimiter({
  windowMs: WINDOW_MS.ONE_MINUTE,
  max: 30,
  errorCode: ERROR_CODES.WEBHOOK_RATE_LIMIT_EXCEEDED,
  errorMessage: 'Too many webhook calls.',
  keyBy: 'ip',
});
