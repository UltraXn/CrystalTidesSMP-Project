import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

interface DeviceIdentifiableRequest extends Request {
  deviceId?: string;
}

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
  useClientKey?: boolean;
}

const DEFAULT_IP = '127.0.0.1';

const COOKIE_KEYS = {
  DEVICE_ID: 'device_id',
} as const;

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

const getClientKey = (req: Request): string => {
  const customReq = req as DeviceIdentifiableRequest;
  const deviceId = customReq.deviceId ?? customReq.signedCookies?.[COOKIE_KEYS.DEVICE_ID];
  if (deviceId) {
    return deviceId;
  }
  return ipKeyGenerator(req.ip ?? DEFAULT_IP);
};

const createLimiter = ({
  windowMs,
  max,
  errorCode,
  errorMessage,
  useClientKey = true,
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
    ...(useClientKey
      ? {
          keyGenerator: getClientKey,
          validate: { keyGeneratorIpFallback: false },
        }
      : {}),
  });
};

/**
 * General API Limiter - 100 requests per minute per device
 */
export const apiLimiter = createLimiter({
  windowMs: WINDOW_MS.ONE_MINUTE,
  max: 100,
  errorCode: ERROR_CODES.TOO_MANY_REQUESTS,
  errorMessage: 'Too many requests from this device, please try again after a minute',
});

/**
 * Strict Auth/Sensitive Limiter - 10 requests per 10 minutes per device
 */
export const sensitiveActionLimiter = createLimiter({
  windowMs: WINDOW_MS.TEN_MINUTES,
  max: 10,
  errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  errorMessage: 'Too many sensitive actions from this device. Please try again later.',
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
 * Inbound Webhook Limiter - 30 requests per minute
 * Webhooks use IP because external servers (Ko-Fi / Discord) don't send client cookies.
 */
export const webhookLimiter = createLimiter({
  windowMs: WINDOW_MS.ONE_MINUTE,
  max: 30,
  errorCode: ERROR_CODES.WEBHOOK_RATE_LIMIT_EXCEEDED,
  errorMessage: 'Too many webhook calls.',
  useClientKey: false,
});
