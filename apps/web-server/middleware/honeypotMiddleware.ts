import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

// Configuration
const DISCORD_SECURITY_WEBHOOK_URL = process.env.DISCORD_SECURITY_WEBHOOK_URL;
const CANARY_HEADER_NAME = 'x-debug-canary-token';
const CANARY_TOKEN_VAL = 'canary_key_crystaltides_9918';

interface HoneypotLogDetails {
    reason: string;
    ip: string;
    userAgent: string;
    path: string;
    method: string;
    delayMs: number;
    payload?: unknown;
}

/**
 * Triggers a Honeypot response:
 * 1. Logs security incident to console & audit stream
 * 2. Sends a Discord Webhook alert if configured
 * 3. Applies randomized tarpitting delay (1500ms - 4000ms)
 * 4. Returns standard realistic error response to avoid detection
 */
export const triggerHoneypot = async (
    reason: string,
    req: Request,
    res: Response,
    customDelayMs?: number
): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';
    const path = req.originalUrl || req.url;
    const method = req.method;

    // Cryptographically secure jittered tarpitting delay between 1500ms and 4000ms
    const delayMs = customDelayMs ?? crypto.randomInt(1500, 4000);

    const details: HoneypotLogDetails = {
        reason,
        ip,
        userAgent,
        path,
        method,
        delayMs,
        payload: req.body && Object.keys(req.body).length > 0 ? req.body : undefined
    };

    console.warn(`[HONEYPOT_TRIGGERED] ${reason} | IP: ${ip} | Path: ${method} ${path} | Agent: ${userAgent}`);

    // Asynchronously notify Discord Security Webhook (Non-blocking)
    if (DISCORD_SECURITY_WEBHOOK_URL && process.env.NODE_ENV !== 'test') {
        sendDiscordSecurityAlert(details).catch((err) => {
            console.error(`[HONEYPOT_DISCORD_ERROR] Failed to send webhook alert: ${err.message}`);
        });
    }

    // Apply Tarpitting Delay before responding
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    if (!res.headersSent) {
        if (method === 'GET') {
            res.status(404).json({ error: 'Not Found', message: 'The requested resource does not exist' });
        } else {
            res.status(400).json({ error: 'Bad Request', message: 'Invalid request parameters' });
        }
    }
};

/**
 * Sends formatted alert to Discord #security-alerts channel via Webhook
 */
const sendDiscordSecurityAlert = async (details: HoneypotLogDetails): Promise<void> => {
    const embed = {
        title: '🚨 ¡BOT CAÍDO EN TRAMPA DE SEGURIDAD (HONEYPOT)!',
        color: 0xef4444, // Red
        fields: [
            { name: '📍 Ruta Afectada', value: `\`${details.method} ${details.path}\``, inline: true },
            { name: '🌐 Dirección IP', value: `\`${details.ip}\``, inline: true },
            { name: '⏱️ Retardo (Tarpitting)', value: `\`${details.delayMs}ms\``, inline: true },
            { name: '🕵️ Motivo de Detección', value: details.reason, inline: false },
            { name: '📱 User-Agent', value: `\`\`\`${details.userAgent.substring(0, 200)}\`\`\``, inline: false }
        ],
        footer: { text: 'CrystalTides SMP Security Engine • Zero False Positives' },
        timestamp: new Date().toISOString()
    };

    try {
        await fetch(DISCORD_SECURITY_WEBHOOK_URL!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (err) {
        console.error('[HONEYPOT_DISCORD_FETCH_FAILED]', err);
    }
};

/**
 * Express Middleware: Inspects hidden honeypot form fields (e.g. 'confirm_email', 'user_website').
 * If populated by a bot, triggers Honeypot trap.
 */
export const checkFormHoneypot = (fieldName = 'confirm_email') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (req.body?.[fieldName]) {
            const fieldValue = String(req.body[fieldName]);
            if (fieldValue.trim().length > 0) {
                triggerHoneypot(`Form Honeypot Field Activated ('${fieldName}')`, req, res);
                return;
            }
        }
        next();
    };
};

/**
 * Express Middleware: Inspects incoming headers for decoy canary tokens (e.g. 'x-debug-canary-token').
 * If present, triggers Honeypot trap.
 */
export const checkCanaryToken = (req: Request, res: Response, next: NextFunction): void => {
    const canaryToken = req.headers[CANARY_HEADER_NAME];
    if (canaryToken && String(canaryToken).toLowerCase() === CANARY_TOKEN_VAL) {
        triggerHoneypot(`Canary Token Probe Detected ('${CANARY_HEADER_NAME}')`, req, res);
        return;
    }
    next();
};
