import * as donationService from '../services/donationService.js';
import { Request, Response } from 'express';

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await donationService.getMonthlyStats();
        res.json(stats);
    } catch (error: any) {
        // If table doesn't exist, return 0s instead of crashing
        if (error.message && error.message.includes('relation "public.donations" does not exist')) {
             return res.json({ currentMonth: "0.00", previousMonth: "0.00", percentChange: "0.0" });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getDonations = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = (req.query.search as string) || '';
        
        const result = await donationService.getDonations({ page, limit, search });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createDonation = async (req: Request, res: Response) => {
    try {
        const result = await donationService.createDonation(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateDonation = async (req: Request, res: Response) => {
    try {
        const result = await donationService.updateDonation(parseInt(req.params.id), req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDonation = async (req: Request, res: Response) => {
    try {
        await donationService.deleteDonation(parseInt(req.params.id));
        res.json({ message: 'Donation deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
