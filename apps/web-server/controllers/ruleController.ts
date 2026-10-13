import { Request, Response } from 'express';
import * as ruleService from '../services/ruleService.js';
import * as logService from '../services/logService.js';
import { translateText } from '../services/translationService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ensureString } from '../utils/typeUtils.js';

interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface CreateRuleBody {
  category: string;
  title: string;
  content: string;
  sort_order?: number;
  title_en?: string;
  content_en?: string;
}

interface UpdateRuleBody {
  category?: string;
  title?: string;
  content?: string;
  sort_order?: number;
  title_en?: string;
  content_en?: string;
}

interface TranslationInput {
  title: string;
  content: string;
  title_en?: string;
  content_en?: string;
}

interface ResolvedTranslations {
  finalTitleEn: string;
  finalContentEn: string;
}

const AUDIT_SOURCE = 'web';
const DEFAULT_AUDIT_USER = 'Admin';
const TARGET_LANGUAGE = 'en';

const ACTIONS = {
  CREATE_RULE: 'CREATE_RULE',
  UPDATE_RULE: 'UPDATE_RULE',
  DELETE_RULE: 'DELETE_RULE',
} as const;

const ERROR_CODES = {
  FETCH: 'FETCH_ERROR',
  CREATE: 'CREATE_ERROR',
  UPDATE: 'UPDATE_ERROR',
  DELETE: 'DELETE_ERROR',
  MISSING_FIELDS: 'MISSING_FIELDS',
} as const;

const MESSAGES = {
  RELATION_NOT_FOUND: 'relation "public.server_rules" does not exist',
  TABLE_NOT_CREATED: 'Rules table not created yet',
  MISSING_FIELDS: 'Missing required fields: category, title, content',
  CREATED_SUCCESS: 'Rule created successfully',
  UPDATED_SUCCESS: 'Rule updated successfully',
  DELETED_SUCCESS: 'Rule deleted successfully',
} as const;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
};

const recordAuditLog = (req: Request, action: string, details: string): void => {
  const editor = (req as AuthenticatedRequest).user;
  logService
    .createLog({
      user_id: editor?.id ?? undefined,
      username: editor?.username ?? DEFAULT_AUDIT_USER,
      action,
      details,
      source: AUDIT_SOURCE,
    })
    .catch(console.error);
};

const resolveTranslations = async ({
  title,
  content,
  title_en,
  content_en,
}: TranslationInput): Promise<ResolvedTranslations> => {
  let resolvedTitleEn = title_en;
  let resolvedContentEn = content_en;

  try {
    if (!resolvedTitleEn && title) {
      resolvedTitleEn = await translateText(title, TARGET_LANGUAGE);
    }
    if (!resolvedContentEn && content) {
      resolvedContentEn = await translateText(content, TARGET_LANGUAGE);
    }
  } catch (err) {
    console.error('Auto-translation failed:', err);
  }

  return {
    finalTitleEn: resolvedTitleEn ?? title,
    finalContentEn: resolvedContentEn ?? content,
  };
};

export const getRules = async (_req: Request, res: Response) => {
  try {
    const rules = await ruleService.getAllRules();
    return sendSuccess(res, rules);
  } catch (error) {
    console.error('Error in getRules:', error);
    const message = getErrorMessage(error);
    if (message.includes(MESSAGES.RELATION_NOT_FOUND)) {
      return sendSuccess(res, [], MESSAGES.TABLE_NOT_CREATED);
    }
    return sendError(res, message, ERROR_CODES.FETCH, 500, error);
  }
};

export const createRule = async (req: Request, res: Response) => {
  try {
    const { category, title, content, sort_order, title_en, content_en } =
      req.body as CreateRuleBody;

    if (!category || !title || !content) {
      return sendError(res, MESSAGES.MISSING_FIELDS, ERROR_CODES.MISSING_FIELDS, 400);
    }

    const { finalTitleEn, finalContentEn } = await resolveTranslations({
      title,
      content,
      title_en,
      content_en,
    });

    const newRule = await ruleService.createRule({
      category,
      title,
      title_en: finalTitleEn,
      content,
      content_en: finalContentEn,
      sort_order: sort_order ?? 0,
    });

    recordAuditLog(req, ACTIONS.CREATE_RULE, `Created rule: ${title} (${category})`);

    return sendSuccess(res, newRule, MESSAGES.CREATED_SUCCESS);
  } catch (error) {
    console.error('Error in createRule:', error);
    const message = getErrorMessage(error);
    return sendError(res, message, ERROR_CODES.CREATE, 500, error);
  }
};

export const updateRule = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const updates = req.body as UpdateRuleBody;

    const updatedRule = await ruleService.updateRule(Number.parseInt(id, 10), {
      category: updates.category,
      title: updates.title,
      title_en: updates.title_en,
      content: updates.content,
      content_en: updates.content_en,
      sort_order: updates.sort_order,
    });

    recordAuditLog(req, ACTIONS.UPDATE_RULE, `Updated rule #${id}: ${updatedRule.title}`);

    return sendSuccess(res, updatedRule, MESSAGES.UPDATED_SUCCESS);
  } catch (error) {
    console.error('Error in updateRule:', error);
    const message = getErrorMessage(error);
    return sendError(res, message, ERROR_CODES.UPDATE, 500, error);
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);

    await ruleService.deleteRule(Number.parseInt(id, 10));

    recordAuditLog(req, ACTIONS.DELETE_RULE, `Deleted rule #${id}`);

    return sendSuccess(res, null, MESSAGES.DELETED_SUCCESS);
  } catch (error) {
    console.error('Error in deleteRule:', error);
    const message = getErrorMessage(error);
    return sendError(res, message, ERROR_CODES.DELETE, 500, error);
  }
};
