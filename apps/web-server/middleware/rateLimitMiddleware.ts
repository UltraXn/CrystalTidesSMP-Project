import { rateLimit } from 'express-rate-limit';

/**
 * General API Limiter - 100 requests per minute
 */
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, 
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests from this IP, please try again after a minute'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict Auth/Sensitive Limiter - 10 requests per 10 minutes
 */
export const sensitiveActionLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many sensitive actions. Please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = sensitiveActionLimiter;

/**
 * Admin Upload Limiter - 20 requests per hour
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
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
