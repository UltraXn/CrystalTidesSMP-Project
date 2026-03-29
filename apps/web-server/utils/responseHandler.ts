import { Request, Response } from 'express';
import { logSecurityEvent, AuditAction } from '../services/auditService.js';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, meta?: ApiResponse<T>['meta']) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        meta
    });
};

export const sendError = (res: Response, message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: unknown, req?: Request) => {
    // Sanitize details to avoid circular references and leak info
    let safeDetails = process.env.NODE_ENV === 'development' ? details : undefined;
    const safeMessage = process.env.NODE_ENV === 'development' ? message : (statusCode >= 500 ? 'Internal server error' : message);

    if (details instanceof Error && process.env.NODE_ENV === 'development') {
        safeDetails = {
            message: details.message,
            stack: details.stack
        };
    }

    // Auto-Audit Security Failures
    if (req && (statusCode === 401 || statusCode === 403)) {
        logSecurityEvent({
            userId: req.user?.id,
            username: req.user?.username || 'Guest',
            action: statusCode === 401 ? AuditAction.UNAUTHORIZED_ACCESS : AuditAction.FORBIDDEN_ACTION,
            details: {
                path: req.path,
                method: req.method,
                reason: message,
                code: code,
                ip: req.ip,
                userAgent: req.get('user-agent') || 'Unknown'
            },
            ip: req.ip
        }).catch(err => console.error('Failed to log security event:', err));
    }

    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message: safeMessage,
            details: safeDetails
        }
    });
};
