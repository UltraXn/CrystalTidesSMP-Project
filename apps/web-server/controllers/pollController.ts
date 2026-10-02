import { Request, Response } from 'express';
import * as pollService from '../services/pollService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ensureString } from '../utils/typeUtils.js';

export const POLL_MESSAGES = {
  USER_ID_NOT_FOUND: 'User ID not found in token',
  ALREADY_VOTED_DEVICE: 'Ya has emitido tu voto en esta encuesta desde este dispositivo',
  VOTE_RECORDED: 'Vote recorded',
  CREATED: 'Poll created successfully',
  UPDATED: 'Poll updated successfully',
  CLOSED: 'Poll closed successfully',
  DELETED: 'Poll deleted successfully',
  INVALID_ID: 'Invalid poll ID',
  INVALID_PAGINATION: 'Invalid pagination values',
  TABLES_MISSING: 'Tables missing, no poll returned',
  UNKNOWN_ERROR: 'Unknown error',
} as const;

export const POLL_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  ALREADY_VOTED: 'ALREADY_VOTED',
  INVALID_ID: 'INVALID_ID',
  INVALID_PAGINATION: 'INVALID_PAGINATION',
} as const;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const VOTE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: THIRTY_DAYS_MS,
  signed: true,
};

export const getVoteCookieKey = (pollId: string | number): string => `voted_poll_${pollId}`;

export interface PollOptionItem {
  id?: number;
  poll_id?: number;
  label?: string;
  votes?: number | null;
  [key: string]: unknown;
}

export interface TalliedOptionItem<T extends PollOptionItem = PollOptionItem> {
  option: T;
  votes: number;
  percent: number;
}

export interface VoteTallyResult<T extends PollOptionItem = PollOptionItem> {
  totalVotes: number;
  optionsWithPercent: Array<T & { percent: number; votes: number }>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface OptionValidationResult {
  isValid: boolean;
  error?: string;
}

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : POLL_MESSAGES.UNKNOWN_ERROR;
};

export const parsePollId = (idParam: unknown): number | null => {
  const id = Number.parseInt(ensureString(idParam), 10);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
};

export const parsePaginationParams = (
  rawPage: unknown,
  rawLimit: unknown,
): PaginationParams | null => {
  const pageStr = ensureString(rawPage).trim();
  const limitStr = ensureString(rawLimit).trim();

  let page = 1;
  let limit = 10;

  if (pageStr.length > 0) {
    page = Number.parseInt(pageStr, 10);
    if (Number.isNaN(page) || page < 1) {
      return null;
    }
  }

  if (limitStr.length > 0) {
    limit = Number.parseInt(limitStr, 10);
    if (Number.isNaN(limit) || limit < 1) {
      return null;
    }
  }

  return { page, limit };
};

export const calculateTotalVotes = (options: readonly PollOptionItem[]): number => {
  return options.reduce((sum, opt) => sum + (Number(opt.votes) || 0), 0);
};

export const calculateOptionPercentages = <T extends PollOptionItem>(
  options: readonly T[],
  totalVotes: number,
): Array<T & { percent: number; votes: number }> => {
  return options.map((opt) => {
    const votes = Number(opt.votes) || 0;
    const percent = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
    return {
      ...opt,
      votes,
      percent,
    };
  });
};

export const tallyVotes = <T extends PollOptionItem>(options: readonly T[]): VoteTallyResult<T> => {
  const totalVotes = calculateTotalVotes(options);
  const optionsWithPercent = calculateOptionPercentages(options, totalVotes);
  return { totalVotes, optionsWithPercent };
};

export const validatePollOptions = (options: unknown): OptionValidationResult => {
  if (!Array.isArray(options)) {
    return { isValid: false, error: 'Options must be an array' };
  }
  if (options.length < 2) {
    return { isValid: false, error: 'At least two options are required' };
  }
  for (const opt of options) {
    const isString = typeof opt === 'string' && opt.trim().length > 0;
    const isObject =
      typeof opt === 'object' &&
      opt !== null &&
      (('label' in opt && typeof opt.label === 'string' && opt.label.trim().length > 0) ||
        ('text' in opt && typeof opt.text === 'string' && opt.text.trim().length > 0));

    if (!isString && !isObject) {
      return { isValid: false, error: 'Each option must contain a non-empty label or text' };
    }
  }
  return { isValid: true };
};

export const validateVoteSelection = (
  pollId: unknown,
  optionId: unknown,
): { isValid: boolean; parsedPollId?: number; parsedOptionId?: number; error?: string } => {
  const pId = Number.parseInt(ensureString(pollId), 10);
  const oId = Number.parseInt(ensureString(optionId), 10);

  if (Number.isNaN(pId) || pId <= 0) {
    return { isValid: false, error: 'Invalid poll ID' };
  }
  if (Number.isNaN(oId) || oId <= 0) {
    return { isValid: false, error: 'Invalid option ID' };
  }

  return { isValid: true, parsedPollId: pId, parsedOptionId: oId };
};

export const getActivePoll = async (req: Request, res: Response) => {
  try {
    const poll = await pollService.getActivePoll();
    return sendSuccess(res, poll);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message.includes('does not exist')) {
      return sendSuccess(res, null, POLL_MESSAGES.TABLES_MISSING);
    }
    return sendError(res, message);
  }
};

export const vote = async (req: Request, res: Response) => {
  try {
    const { pollId, optionId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, POLL_MESSAGES.USER_ID_NOT_FOUND, POLL_ERROR_CODES.UNAUTHORIZED, 401);
    }

    const cookieKey = getVoteCookieKey(pollId);
    const hasVotedDevice = Boolean(req.signedCookies && req.signedCookies[cookieKey]);
    if (hasVotedDevice) {
      return sendError(
        res,
        POLL_MESSAGES.ALREADY_VOTED_DEVICE,
        POLL_ERROR_CODES.ALREADY_VOTED,
        400,
      );
    }

    const result = await pollService.votePoll(pollId, optionId, userId);

    res.cookie(cookieKey, 'true', VOTE_COOKIE_OPTIONS);

    return sendSuccess(res, result, POLL_MESSAGES.VOTE_RECORDED);
  } catch (error: unknown) {
    return sendError(res, getErrorMessage(error));
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const result = await pollService.createPoll(req.body);
    return sendSuccess(res, result, POLL_MESSAGES.CREATED);
  } catch (error: unknown) {
    return sendError(res, getErrorMessage(error));
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parsePollId(req.params.id);
    if (id === null) {
      return sendError(res, POLL_MESSAGES.INVALID_ID, POLL_ERROR_CODES.INVALID_ID, 400);
    }

    const result = await pollService.updatePoll(id, req.body);
    return sendSuccess(res, result, POLL_MESSAGES.UPDATED);
  } catch (error: unknown) {
    return sendError(res, getErrorMessage(error));
  }
};

export const close = async (req: Request, res: Response) => {
  try {
    const id = parsePollId(req.params.id);
    if (id === null) {
      return sendError(res, POLL_MESSAGES.INVALID_ID, POLL_ERROR_CODES.INVALID_ID, 400);
    }

    await pollService.closePoll(id);
    return sendSuccess(res, null, POLL_MESSAGES.CLOSED);
  } catch (error: unknown) {
    return sendError(res, getErrorMessage(error));
  }
};

export const deletePoll = async (req: Request, res: Response) => {
  try {
    const id = parsePollId(req.params.id);
    if (id === null) {
      return sendError(res, POLL_MESSAGES.INVALID_ID, POLL_ERROR_CODES.INVALID_ID, 400);
    }

    await pollService.deletePoll(id);
    return sendSuccess(res, null, POLL_MESSAGES.DELETED);
  } catch (error: unknown) {
    return sendError(res, getErrorMessage(error));
  }
};

export const getPolls = async (req: Request, res: Response) => {
  try {
    const pagination = parsePaginationParams(req.query.page, req.query.limit);
    if (!pagination) {
      return sendError(
        res,
        POLL_MESSAGES.INVALID_PAGINATION,
        POLL_ERROR_CODES.INVALID_PAGINATION,
        400,
      );
    }

    const result = await pollService.getPolls(pagination);
    return sendSuccess(res, result);
  } catch (error: unknown) {
    return sendError(res, getErrorMessage(error));
  }
};
