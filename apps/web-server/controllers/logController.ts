import * as logService from '../services/logService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';

export const getLogs = async (req: Request, res: Response) => {
    try {
        const page = ensureString(req.query.page, '1');
        const limit = ensureString(req.query.limit, '50');
        const source = ensureString(req.query.source, 'web');
        const search = ensureString(req.query.search, '');
        const offset = (parseInt(page) - 1) * parseInt(limit);

        if (source === 'game') {
            const data = await logService.getGameLogs({ limit: parseInt(limit), offset, search });
            return res.json(data);
        }
    
        const data = await logService.getLogs({ limit: parseInt(limit), offset, source, search });
        res.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
    }
};

export const createLog = async (req: Request, res: Response) => {
    try {
        const logData = req.body;
        const log = await logService.createLog(logData);
        res.status(201).json(log);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
    }
};

export const reportSecurityAlert = async (req: Request, res: Response) => {
    try {
        const { email, details } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Create a SECURITY log
        await logService.createLog({
            username: 'SYSTEM_ALERT',
            action: 'LOGIN_FAIL',
            details: `Failed login attempt for: ${email}. IP: ${ip}. ${details || ''}`,
            source: 'security'
        });

        // Always return success to not leak info to attacker
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Security Report Error:", error);
        res.status(200).json({ success: true }); // Silent fail
    }
};
