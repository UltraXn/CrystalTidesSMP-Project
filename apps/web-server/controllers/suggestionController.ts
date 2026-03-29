import * as suggestionService from '../services/suggestionService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';

export const createSuggestion = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const suggestionData = {
            ...req.body,
            nickname: user?.username || req.body.nickname || 'Anónimo',
            user_id: user?.id || null
        };
        
        const result = await suggestionService.createSuggestion(suggestionData);
        res.status(201).json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const getSuggestions = async (req: Request, res: Response) => {
    try {
        const data = await suggestionService.getSuggestions();
        res.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const deleteSuggestion = async (req: Request, res: Response) => {
    try {
        await suggestionService.deleteSuggestion(parseInt(ensureString(req.params.id)));
        res.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);
        const { status } = req.body;
        
        if (!['pending', 'approved', 'rejected', 'implemented'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        const result = await suggestionService.updateStatus(parseInt(id), status);
        res.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};
