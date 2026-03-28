import { Request, Response } from 'express';
import * as ruleService from '../services/ruleService.js';
import * as logService from '../services/logService.js';
import { translateText } from '../services/translationService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ensureString } from '../utils/typeUtils.js';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
    };
}

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return String(error);
};

export const getRules = async (req: Request, res: Response) => {
    try {
        const rules = await ruleService.getAllRules();
        // Agrupar por categorías si el frontend lo prefiere plano o no.
        // Lo mandamos plano y que el front decida cómo renderizar.
        return sendSuccess(res, rules);
    } catch (error) {
        console.error("Error in getRules:", error);
        const message = getErrorMessage(error);
        if (message.includes('relation "public.server_rules" does not exist')) {
            return sendSuccess(res, [], 'Rules table not created yet');
        }
        return sendError(res, message, 'FETCH_ERROR', 500, error);
    }
};

export const createRule = async (req: Request, res: Response) => {
    try {
        const { category, title, content, sort_order, title_en, content_en } = req.body;

        if (!category || !title || !content) {
            return sendError(res, 'Missing required fields: category, title, content', 'MISSING_FIELDS', 400);
        }

        // Auto translation
        let finalTitleEn = title_en;
        let finalContentEn = content_en;

        try {
            if (!finalTitleEn && title) {
                finalTitleEn = await translateText(title, 'en');
            }
            if (!finalContentEn && content) {
                finalContentEn = await translateText(content, 'en');
            }
        } catch (err) {
            console.error("Auto-translation failed:", err);
            // Fallback to original text or empty if everything fails
            finalTitleEn = finalTitleEn || title;
            finalContentEn = finalContentEn || content;
        }

        const newRule = await ruleService.createRule({
            category,
            title,
            title_en: finalTitleEn,
            content,
            content_en: finalContentEn,
            sort_order: sort_order || 0
        });

        // Audit Log
        const editor = (req as AuthenticatedRequest).user;
        logService.createLog({
            user_id: editor?.id || undefined,
            username: editor?.username || 'Admin',
            action: 'CREATE_RULE',
            details: `Created rule: ${title} (${category})`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, newRule, 'Rule created successfully');
    } catch (error) {
        console.error("Error in createRule:", error);
        const message = getErrorMessage(error);
        return sendError(res, message, 'CREATE_ERROR', 500, error);
    }
};

export const updateRule = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);
        const updates = req.body;

        const updatedRule = await ruleService.updateRule(parseInt(id), {
            category: updates.category,
            title: updates.title,
            title_en: updates.title_en,
            content: updates.content,
            content_en: updates.content_en,
            sort_order: updates.sort_order
        });

        // Audit Log
        const editor = (req as AuthenticatedRequest).user;
        logService.createLog({
            user_id: editor?.id || undefined,
            username: editor?.username || 'Admin',
            action: 'UPDATE_RULE',
            details: `Updated rule #${id}: ${updatedRule.title}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, updatedRule, 'Rule updated successfully');
    } catch (error) {
        console.error("Error in updateRule:", error);
        const message = getErrorMessage(error);
        return sendError(res, message, 'UPDATE_ERROR', 500, error);
    }
};

export const deleteRule = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);

        await ruleService.deleteRule(parseInt(id));

        // Audit Log
        const editor = (req as AuthenticatedRequest).user;
        logService.createLog({
            user_id: editor?.id || undefined,
            username: editor?.username || 'Admin',
            action: 'DELETE_RULE',
            details: `Deleted rule #${id}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, null, 'Rule deleted successfully');
    } catch (error) {
        console.error("Error in deleteRule:", error);
        const message = getErrorMessage(error);
        return sendError(res, message, 'DELETE_ERROR', 500, error);
    }
};
