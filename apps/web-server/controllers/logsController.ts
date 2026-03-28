import { Request, Response } from 'express';

// Stubbed for now as CoreProtect is no longer used
export const getCommandLogs = async (req: Request, res: Response) => {
    try {
        // Returning empty list to prevent 500s and "Module not found" errors
        res.json({
            data: [],
            total: 0,
            page: 1,
            totalPages: 0
        });
    } catch (error) {
        console.error('Logs Controller Error:', error);
        res.status(500).json({ error: 'Failed to fetch command logs' });
    }
};
