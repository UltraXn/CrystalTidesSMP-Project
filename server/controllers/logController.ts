import * as logService from '../services/logService.js';
import { Request, Response } from 'express';

export const getLogs = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '50', source = 'web', search = '' } = req.query;
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        if (source === 'game') {
            const data = await logService.getGameLogs({ limit: parseInt(limit as string), offset, search: search as string });
            return res.json(data);
        }

        const data = await logService.getLogs({ limit: parseInt(limit as string), offset, source: source as string, search: search as string });
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createLog = async (req: Request, res: Response) => {
    try {
        const logData = req.body;
        const log = await logService.createLog(logData);
        res.status(201).json(log);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
