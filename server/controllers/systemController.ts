import { Request, Response } from 'express';

export const getStatus = (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'CrystalTides Backend API is online',
        timestamp: new Date().toISOString()
    });
};
