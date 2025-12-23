import * as suggestionService from '../services/suggestionService.js';
import { Request, Response } from 'express';

export const createSuggestion = async (req: Request, res: Response) => {
    try {
        const result = await suggestionService.createSuggestion(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSuggestions = async (req: Request, res: Response) => {
    try {
        const data = await suggestionService.getSuggestions();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteSuggestion = async (req: Request, res: Response) => {
    try {
        await suggestionService.deleteSuggestion(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
