import * as coreProtectService from '../services/coreProtectService.js';
import { Request, Response } from 'express';

export const getCommandLogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = (req.query.search as string) || '';

        const logs = await coreProtectService.getCommandLogs({ page, limit, search });
        
        res.json(logs);
    } catch (error: any) {
        console.error('CoreProtect Error:', error);
        res.status(500).json({ error: 'Failed to fetch command logs', details: error.message });
    }
};
