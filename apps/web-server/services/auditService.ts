import { createLog } from './logService.js';
import { Request } from 'express';

export enum AuditAction {
    LOGIN_SUCCESS = 'AUTH/LOGIN_SUCCESS',
    LOGIN_FAILURE = 'AUTH/LOGIN_FAILURE',
    UNAUTHORIZED_ACCESS = 'SECURITY/UNAUTHORIZED_ACCESS',
    FORBIDDEN_ACTION = 'SECURITY/FORBIDDEN_ACTION',
    ADMIN_ACTION = 'ADMIN/ACTION_EXECUTED',
    FILE_UPLOAD = 'ADMIN/FILE_UPLOADED',
    IDOR_ATTEMPT = 'SECURITY/IDOR_DETECTION',
    WHITELIST_CHANGE = 'SECURITY/WHITELIST_MODIFIED'
}

interface AuditEntry {
    userId?: string;
    username?: string;
    action: AuditAction;
    details: Record<string, unknown>;
    ip?: string;
}

/**
 * Logs a security event to the audit system.
 */
export const logSecurityEvent = async ({ userId, username, action, details, ip }: AuditEntry) => {
    return await createLog({
        user_id: userId,
        username: username,
        action: action,
        details: {
            ...details,
            ip,
            timestamp: new Date().toISOString()
        },
        source: 'security-auditor'
    });
};

/**
 * Specifically logs authorization failures (403).
 */
export const logAuthFailure = async (req: Request, details: string) => {
    const user = req.user;
    return await logSecurityEvent({
        userId: user?.id,
        username: user?.username || 'Guest',
        action: AuditAction.FORBIDDEN_ACTION,
        details: {
            path: req.path,
            method: req.method,
            reason: details,
            userAgent: req.get('user-agent')
        },
        ip: req.ip
    });
};
