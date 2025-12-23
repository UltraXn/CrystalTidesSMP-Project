import * as pollService from '../services/pollService.js';
import { Request, Response } from 'express';

export const getActivePoll = async (req: Request, res: Response) => {
    try {
        const poll = await pollService.getActivePoll();
        if(!poll) return res.status(200).json(null); // Return null if no active poll, don't 404
        res.json(poll);
    } catch (error: any) {
        // Handle "relation does not exist" gracefully as usual
        if (error.message && error.message.includes('does not exist')) {
            return res.status(200).json(null); // Return null so frontend shows nothing
        }
        res.status(500).json({ error: error.message });
    }
};

export const vote = async (req: Request, res: Response) => {
    try {
        const { pollId, optionId } = req.body;
        // Simple logic: pass to service
        const result = await pollService.votePoll(pollId, optionId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const result = await pollService.createPoll(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const close = async (req: Request, res: Response) => {
    try {
        await pollService.closePoll(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPolls = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await pollService.getPolls({ page, limit });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
