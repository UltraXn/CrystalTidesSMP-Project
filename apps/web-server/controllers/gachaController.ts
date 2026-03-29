import { Request, Response } from 'express';
import * as gachaService from '../services/gachaService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ADMIN_ROLES } from '../utils/roleUtils.js';
import { ensureString } from '../utils/typeUtils.js';

export const roll = async (req: Request, res: Response) => {
    try {
        const { userId: bodyUserId, tierId, quantity, testResult, forceDeduction } = req.body;
        const user = req.user;

        if (!user) return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);

        const userRole = (user.role || '').toLowerCase();
        const isAdmin = ADMIN_ROLES.includes(userRole);

        // Security: IDOR Protection
        // If not admin, force userId to be the authenticated user's ID
        const targetUserId = isAdmin && bodyUserId ? bodyUserId : user.id;

        // Security: Block debug/test parameters for non-admins
        const finalTestResult = isAdmin ? testResult : undefined;
        const finalForceDeduction = isAdmin ? forceDeduction : undefined;

        const reward = await gachaService.rollGacha(targetUserId, tierId, quantity || 1, isAdmin, finalTestResult, finalForceDeduction);
        return sendSuccess(res, reward, 'Gacha roll successful');

    } catch (error: unknown) {
        console.error('Gacha Roll Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        if (message === "COOLDOWN_ACTIVE") {
             return sendError(res, "You can only roll once every 24 hours!", "COOLDOWN", 429);
        }
        if (message === "ACCOUNT_NOT_LINKED") {
             return sendError(res, "Debes vincular tu cuenta de Minecraft primero para recibir premios.", "NOT_LINKED", 400);
        }
        return sendError(res, message || "Gacha failed", "INTERNAL_ERROR", 500);
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const userId = ensureString(req.params.userId);

        // Security Check: User can only see their own history unless they are admin
        const isAdmin = ADMIN_ROLES.includes(req.user?.role || '');
        if (req.user?.id !== userId && !isAdmin) {
             return sendError(res, "Unauthorized: You can only view your own history", "UNAUTHORIZED", 403);
        }

        const history = await gachaService.getHistory(userId);
        return sendSuccess(res, history);
    } catch (error: unknown) {
        return sendError(res, error instanceof Error ? error.message : String(error));
    }
};
