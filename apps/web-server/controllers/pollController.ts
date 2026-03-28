import * as pollService from '../services/pollService.js';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ensureString } from '../utils/typeUtils.js';

export const getActivePoll = async (req: Request, res: Response) => {
    try {
        const poll = await pollService.getActivePoll();
        return sendSuccess(res, poll); // Can be null, that's fine
    } catch (error: unknown) {
        // Handle "relation does not exist" gracefully as usual
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (message.includes('does not exist')) {
            return sendSuccess(res, null, 'Tables missing, no poll returned');
        }
        return sendError(res, message);
    }
};

export const vote = async (req: Request, res: Response) => {
    try {
        const { pollId, optionId } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
            return sendError(res, 'User ID not found in token', 'UNAUTHORIZED', 401);
        }

        const result = await pollService.votePoll(pollId, optionId, userId);
        return sendSuccess(res, result, 'Vote recorded');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const result = await pollService.createPoll(req.body);
        return sendSuccess(res, result, 'Poll created successfully');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const id = parseInt(ensureString(req.params.id));
        if (isNaN(id)) return sendError(res, 'Invalid poll ID', 'INVALID_ID', 400);
        const result = await pollService.updatePoll(id, req.body);
        return sendSuccess(res, result, 'Poll updated successfully');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};

export const close = async (req: Request, res: Response) => {
    try {
        const id = parseInt(ensureString(req.params.id));
        if (isNaN(id)) return sendError(res, 'Invalid poll ID', 'INVALID_ID', 400);
        await pollService.closePoll(id);
        return sendSuccess(res, null, 'Poll closed successfully');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};

export const deletePoll = async (req: Request, res: Response) => {
    try {
        const id = parseInt(ensureString(req.params.id));
        if (isNaN(id)) return sendError(res, 'Invalid poll ID', 'INVALID_ID', 400);
        await pollService.deletePoll(id);
        return sendSuccess(res, null, 'Poll deleted successfully');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};

export const getPolls = async (req: Request, res: Response) => {
    try {
        const page = parseInt(ensureString(req.query.page)) || 1;
        const limit = parseInt(ensureString(req.query.limit)) || 10;
        if (isNaN(page) || isNaN(limit)) return sendError(res, 'Invalid pagination values', 'INVALID_PAGINATION', 400);
        const result = await pollService.getPolls({ page, limit });
        return sendSuccess(res, result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return sendError(res, message);
    }
};
