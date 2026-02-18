import * as logService from '../services/logService.js';
import { Request, Response } from 'express';

export const getLogs = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '50', source = 'all', search = '' } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const limitNum = Math.max(1, Math.min(200, parseInt(limit as string, 10) || 50));
        const offset = (pageNum - 1) * limitNum;

        if (source === 'game') {
            const gameLogs = await logService.getGameLogs({
                limit: limitNum,
                offset,
                search: search as string
            });

            return res.json({
                data: gameLogs.data || [],
                total: gameLogs.total || 0,
                page: pageNum,
                totalPages: Math.max(1, Math.ceil((gameLogs.total || 0) / limitNum))
            });
        }

        const logs = await logService.getLogs({
            limit: limitNum,
            offset,
            source: source as string,
            search: search as string
        });

        return res.json({
            data: logs.data || [],
            total: logs.total || 0,
            page: pageNum,
            totalPages: Math.max(1, Math.ceil((logs.total || 0) / limitNum))
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
};

export const createLog = async (req: Request, res: Response) => {
    try {
        const logData = req.body;
        const log = await logService.createLog(logData);
        return res.status(201).json(log);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
};

export const reportSecurityAlert = async (req: Request, res: Response) => {
    try {
        const { email, details } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        await logService.createLog({
            username: 'SYSTEM_ALERT',
            action: 'LOGIN_FAIL',
            details: `Failed login attempt for: ${email}. IP: ${ip}. ${details || ''}`,
            source: 'security'
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Security report error:', error);
        return res.status(200).json({ success: true });
    }
};
