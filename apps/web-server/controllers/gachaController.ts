import { Request, Response } from 'express';
import * as gachaService from '../services/gachaService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ADMIN_ROLES } from '../utils/roleUtils.js';
import { ensureString } from '../utils/typeUtils.js';
import { GACHA_TIERS } from '@crystaltides/shared';
import { refundGachaBalance } from '../services/gachaBalanceService.js';

export const roll = async (req: Request, res: Response) => {
    try {
        const { userId: bodyUserId, tierId, quantity, testResult, forceDeduction } = req.body;
        const user = req.user;

        if (!user) return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);

        const userRole = (user.role || '').toLowerCase();
        const isAdmin = ADMIN_ROLES.includes(userRole);

        const targetUserId = isAdmin && bodyUserId ? bodyUserId : user.id;
        const finalTestResult = isAdmin ? testResult : undefined;
        const finalForceDeduction = isAdmin ? forceDeduction : undefined;

        const reward = await gachaService.rollGacha(
            targetUserId,
            tierId,
            quantity || 1,
            isAdmin,
            finalTestResult,
            finalForceDeduction
        );
        return sendSuccess(res, reward, 'Gacha roll successful');

    } catch (error: unknown) {
        console.error('Gacha Roll Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        if (message === "ACCOUNT_NOT_LINKED") {
             return sendError(res, "Debes vincular tu cuenta de Minecraft primero para recibir premios.", "NOT_LINKED", 400);
        }
        if (message === "INSUFFICIENT_BALANCE") {
             return sendError(res, "Saldo insuficiente de KilluCoins.", "INSUFFICIENT_BALANCE", 400);
        }
        if (message === "TIER_LOCKED") {
             return sendError(res, "Este tier de gacha no está desbloqueado.", "TIER_LOCKED", 403);
        }
        if (message === "INVALID_TIER") {
             return sendError(res, "Tier de gacha inválido.", "INVALID_TIER", 400);
        }
        return sendError(res, message || "Gacha failed", "INTERNAL_ERROR", 500);
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const userId = ensureString(req.params.userId);

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

export const getStatus = async (req: Request, res: Response) => {
    try {
        const userId = ensureString(req.params.userId);

        const isAdmin = ADMIN_ROLES.includes(req.user?.role || '');
        if (req.user?.id !== userId && !isAdmin) {
            return sendError(res, "Unauthorized", "UNAUTHORIZED", 403);
        }

        const status = await gachaService.getGachaStatus(userId);
        return sendSuccess(res, status);
    } catch (error: unknown) {
        return sendError(res, error instanceof Error ? error.message : String(error));
    }
};

export const getTiers = async (_req: Request, res: Response) => {
    return sendSuccess(res, GACHA_TIERS);
};

export const addFunds = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);

        const { amount } = req.body;
        const targetUserId = user.id;
        const addAmount = Number(amount);
        if (isNaN(addAmount) || addAmount <= 0) {
            return sendError(res, "Cantidad inválida", "INVALID_AMOUNT", 400);
        }

        await refundGachaBalance(targetUserId, addAmount);

        const status = await gachaService.getGachaStatus(targetUserId);
        return sendSuccess(res, status, 'Funds added successfully');
    } catch (error: unknown) {
        console.error('Add Funds Error:', error);
        return sendError(res, error instanceof Error ? error.message : String(error));
    }
};
