import { Request, Response } from 'express';
import * as gachaService from '../services/gachaService.js';
import { refundGachaBalance } from '../services/gachaBalanceService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ADMIN_ROLES } from '../utils/roleUtils.js';
import { ensureString } from '../utils/typeUtils.js';
import { GACHA_TIERS, type RollGachaPayload, type AddFundsPayload } from '@crystaltides/shared';

// ============================================================================
// Constants & Error Codes (Deduplicated Strings)
// ============================================================================
export const ERROR_CODE_UNAUTHORIZED = 'UNAUTHORIZED';
export const ERROR_CODE_INVALID_AMOUNT = 'INVALID_AMOUNT';
export const ERROR_CODE_INTERNAL = 'INTERNAL_ERROR';

export const MSG_UNAUTHORIZED = 'Unauthorized';
export const MSG_HISTORY_UNAUTHORIZED = 'Unauthorized: You can only view your own history';
export const MSG_INVALID_AMOUNT = 'Cantidad inválida';
export const MSG_GACHA_FAILED = 'Gacha failed';
export const MSG_ROLL_SUCCESS = 'Gacha roll successful';
export const MSG_FUNDS_ADDED = 'Funds added successfully';

export const DEFAULT_PITY_THRESHOLD = 80;

const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_INTERNAL_ERROR = 500;

const LOG_GACHA_ROLL_ERROR = 'Gacha Roll Error:';
const LOG_ADD_FUNDS_ERROR = 'Add Funds Error:';

const VALID_TEST_RESULT_MODES: ReadonlySet<string> = new Set<TestResultMode>([
  'win',
  'loss',
  'random',
]);

// ============================================================================
// Types & Interfaces
// ============================================================================
export type TestResultMode = 'win' | 'loss' | 'random';

export interface PityCalculation {
  readonly currentPity: number;
  readonly pityThreshold: number;
  readonly isGuaranteed: boolean;
  readonly remainingUntilGuaranteed: number;
}

interface ResolvedRollParams {
  readonly targetUserId: string;
  readonly tierId?: string;
  readonly quantity: number;
  readonly testResult?: TestResultMode;
  readonly forceDeduction?: boolean;
}

interface GachaErrorDefinition {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
}

// ============================================================================
// Error Mappings (Lookup Map for Cognitive Complexity <= 15)
// ============================================================================
const GACHA_ERROR_MAP: Readonly<Record<string, GachaErrorDefinition>> = {
  ACCOUNT_NOT_LINKED: {
    statusCode: HTTP_STATUS_BAD_REQUEST,
    code: 'NOT_LINKED',
    message: 'Debes vincular tu cuenta de Minecraft primero para recibir premios.',
  },
  INSUFFICIENT_BALANCE: {
    statusCode: HTTP_STATUS_BAD_REQUEST,
    code: 'INSUFFICIENT_BALANCE',
    message: 'Saldo insuficiente de KilluCoins.',
  },
  TIER_LOCKED: {
    statusCode: HTTP_STATUS_FORBIDDEN,
    code: 'TIER_LOCKED',
    message: 'Este tier de gacha no está desbloqueado.',
  },
  INVALID_TIER: {
    statusCode: HTTP_STATUS_BAD_REQUEST,
    code: 'INVALID_TIER',
    message: 'Tier de gacha inválido.',
  },
};

// ============================================================================
// Pure Helpers
// ============================================================================

/**
 * Normalizes roll count and pity threshold to safe positive integers.
 */
export const normalizePityInputs = (
  rollCount: number,
  pityThreshold: number,
): { rolls: number; threshold: number } => ({
  rolls: Math.max(0, Math.floor(rollCount)),
  threshold: Math.max(1, Math.floor(pityThreshold)),
});

/**
 * Calculates remaining rolls before a guaranteed high-rarity reward.
 */
export const computeRemainingUntilGuaranteed = (currentPity: number, threshold: number): number => {
  const isGuaranteed = currentPity >= threshold - 1;
  return isGuaranteed ? 0 : threshold - currentPity;
};

/**
 * Calculates current pity progression and guarantee status.
 *
 * @param rollCount Total banner or lifetime pulls since last highest-rarity item
 * @param pityThreshold Hard pity threshold (defaults to 80)
 */
export const calculatePity = (
  rollCount: number,
  pityThreshold: number = DEFAULT_PITY_THRESHOLD,
): PityCalculation => {
  const { rolls, threshold } = normalizePityInputs(rollCount, pityThreshold);
  const currentPity = rolls % threshold;
  const isGuaranteed = currentPity >= threshold - 1;
  const remainingUntilGuaranteed = computeRemainingUntilGuaranteed(currentPity, threshold);

  return {
    currentPity,
    pityThreshold: threshold,
    isGuaranteed,
    remainingUntilGuaranteed,
  };
};

export const isUserAdmin = (role?: string): boolean => {
  if (!role) {
    return false;
  }
  return ADMIN_ROLES.includes(role.toLowerCase());
};

export const canAccessUserData = (user: Express.Request['user'], targetUserId: string): boolean => {
  if (!user) {
    return false;
  }
  return user.id === targetUserId || isUserAdmin(user.role);
};

export const parseTestResult = (value: unknown): TestResultMode | undefined => {
  if (typeof value === 'string' && VALID_TEST_RESULT_MODES.has(value)) {
    return value as TestResultMode;
  }
  return undefined;
};

export const parsePositiveAmount = (value: unknown): number | null => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return amount;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

const resolveRollQuantity = (rawQuantity: unknown): number => {
  const quantity = Number(rawQuantity);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
};

const resolveAdminOverrides = (
  isAdmin: boolean,
  body: Partial<RollGachaPayload>,
): {
  readonly overrideUserId?: string;
  readonly testResult?: TestResultMode;
  readonly forceDeduction?: boolean;
} => {
  if (!isAdmin) {
    return {};
  }
  return {
    overrideUserId: body.userId,
    testResult: parseTestResult(body.testResult),
    forceDeduction: body.forceDeduction,
  };
};

export const resolveRollParams = (
  user: NonNullable<Express.Request['user']>,
  isAdmin: boolean,
  body: Partial<RollGachaPayload>,
): ResolvedRollParams => {
  const adminOverrides = resolveAdminOverrides(isAdmin, body);

  return {
    targetUserId: adminOverrides.overrideUserId ?? user.id,
    tierId: body.tierId,
    quantity: resolveRollQuantity(body.quantity),
    testResult: adminOverrides.testResult,
    forceDeduction: adminOverrides.forceDeduction,
  };
};

const handleRollError = (res: Response, error: unknown): Response => {
  console.error(LOG_GACHA_ROLL_ERROR, error);
  const message = getErrorMessage(error);
  const mapped = GACHA_ERROR_MAP[message];

  if (mapped) {
    return sendError(res, mapped.message, mapped.code, mapped.statusCode);
  }

  return sendError(
    res,
    message || MSG_GACHA_FAILED,
    ERROR_CODE_INTERNAL,
    HTTP_STATUS_INTERNAL_ERROR,
  );
};

// ============================================================================
// Controllers
// ============================================================================

export const roll = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, MSG_UNAUTHORIZED, ERROR_CODE_UNAUTHORIZED, HTTP_STATUS_UNAUTHORIZED);
    }

    const isAdmin = isUserAdmin(user.role);
    const params = resolveRollParams(user, isAdmin, req.body as Partial<RollGachaPayload>);

    const reward = await gachaService.rollGacha(
      params.targetUserId,
      params.tierId,
      params.quantity,
      isAdmin,
      params.testResult,
      params.forceDeduction,
    );

    return sendSuccess(res, reward, MSG_ROLL_SUCCESS);
  } catch (error: unknown) {
    return handleRollError(res, error);
  }
};

export const getHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = ensureString(req.params.userId);

    if (!canAccessUserData(req.user, userId)) {
      return sendError(
        res,
        MSG_HISTORY_UNAUTHORIZED,
        ERROR_CODE_UNAUTHORIZED,
        HTTP_STATUS_FORBIDDEN,
      );
    }

    const history = await gachaService.getHistory(userId);
    return sendSuccess(res, history);
  } catch (error: unknown) {
    return sendError(res, getErrorMessage(error));
  }
};

export const getStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = ensureString(req.params.userId);

    if (!canAccessUserData(req.user, userId)) {
      return sendError(res, MSG_UNAUTHORIZED, ERROR_CODE_UNAUTHORIZED, HTTP_STATUS_FORBIDDEN);
    }

    const status = await gachaService.getGachaStatus(userId);
    return sendSuccess(res, status);
  } catch (error: unknown) {
    return sendError(res, getErrorMessage(error));
  }
};

export const getTiers = async (_req: Request, res: Response): Promise<Response> => {
  return sendSuccess(res, GACHA_TIERS);
};

export const addFunds = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, MSG_UNAUTHORIZED, ERROR_CODE_UNAUTHORIZED, HTTP_STATUS_UNAUTHORIZED);
    }

    const payload = req.body as Partial<AddFundsPayload> | undefined;
    const addAmount = parsePositiveAmount(payload?.amount);
    if (addAmount === null) {
      return sendError(res, MSG_INVALID_AMOUNT, ERROR_CODE_INVALID_AMOUNT, HTTP_STATUS_BAD_REQUEST);
    }

    const targetUserId = user.id;
    await refundGachaBalance(targetUserId, addAmount);

    const status = await gachaService.getGachaStatus(targetUserId);
    return sendSuccess(res, status, MSG_FUNDS_ADDED);
  } catch (error: unknown) {
    console.error(LOG_ADD_FUNDS_ERROR, error);
    return sendError(res, getErrorMessage(error));
  }
};
