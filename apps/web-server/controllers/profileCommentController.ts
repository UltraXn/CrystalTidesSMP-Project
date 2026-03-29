import { Request, Response } from 'express';
import * as commentService from '../services/profileCommentService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ensureString } from '../utils/typeUtils.js';

export const getComments = async (req: Request, res: Response) => {
    try {
        const profileId = ensureString(req.params.profileId);
        const comments = await commentService.getCommentsByProfile(profileId);
        return sendSuccess(res, comments);
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error fetching comments');
    }
};

export const postComment = async (req: Request, res: Response) => {
    try {
        const profileId = ensureString(req.params.profileId);
        const { content } = req.body;
        const user = req.user;

        if (!user) return sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
        if (!content) return sendError(res, 'Content is required', 'MISSING_FIELDS', 400);

        const comment = await commentService.createComment(profileId, user.id, content);
        return sendSuccess(res, comment, 'Comment posted');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error posting comment');
    }
};

export const removeComment = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);
        const user = req.user;
        if (!user) return sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
        
        await commentService.deleteComment(parseInt(id), { id: user.id, role: user.role });
        return sendSuccess(res, null, 'Comment deleted');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Error deleting comment');
    }
};
