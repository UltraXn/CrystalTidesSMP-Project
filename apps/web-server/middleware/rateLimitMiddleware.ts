import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

const getClientKey = (req: Request): string => {
    return req.deviceId || (req.signedCookies && req.signedCookies['device_id']) || ipKeyGenerator(req.ip || '127.0.0.1');
};

/**
 * General API Limiter - 100 requests per minute per device
 */
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, 
    keyGenerator: getClientKey,
    validate: { keyGeneratorIpFallback: false },
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests from this device, please try again after a minute'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict Auth/Sensitive Limiter - 10 requests per 10 minutes per device
 */
export const sensitiveActionLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    keyGenerator: getClientKey,
    validate: { keyGeneratorIpFallback: false },
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many sensitive actions from this device. Please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Admin Upload Limiter - 20 requests per hour
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    keyGenerator: getClientKey,
    validate: { keyGeneratorIpFallback: false },
    message: {
        success: false,
        error: {
            code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
            message: 'Too many upload attempts. Please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * User Image Upload Limiter - 30 requests per hour
 * Separate from uploadLimiter so user traffic can't exhaust the admin quota.
 */
export const imageUploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30,
    keyGenerator: getClientKey,
    validate: { keyGeneratorIpFallback: false },
    message: {
        success: false,
        error: {
            code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
            message: 'Too many image uploads. Please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Inbound Webhook Limiter - 30 requests per minute
 * Webhooks use IP because external servers (Ko-Fi / Discord) don't send client cookies.
 */
export const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        error: {
            code: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
            message: 'Too many webhook calls.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});
