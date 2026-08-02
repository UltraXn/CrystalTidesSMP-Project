import * as suggestionService from '../services/suggestionService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';
import { sendError } from '../utils/responseHandler.js';

export const createSuggestion = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { type, message } = req.body;
        const suggestionData = {
            type,
            message,
            nickname: user?.username || 'Anónimo',
            user_id: user?.id || undefined
        };

        const result = await suggestionService.createSuggestion(suggestionData);

        if ('error' in result && result.error) {
            res.status(400).json({
                error: result.message,
                isValid: false,
                engine: result.engine
            });
            return;
        }

        res.status(201).json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const getSuggestions = async (req: Request, res: Response) => {
    try {
        const data = await suggestionService.getSuggestions();
        res.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const deleteSuggestion = async (req: Request, res: Response) => {
    try {
        await suggestionService.deleteSuggestion(Number.parseInt(ensureString(req.params.id), 10));
        res.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
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

        const result = await suggestionService.updateStatus(Number.parseInt(id, 10), status);
        res.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};
