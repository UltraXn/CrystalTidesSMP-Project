import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHandler.js';

interface HttpError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
  type?: string;
  expose?: boolean;
}

/**
 * Global centralized error handling middleware.
 * Intercepts uncaught errors, body-parser syntax errors (malformed JSON),
 * and unexpected exceptions to prevent HTML leaks and guarantee standard JSON responses.
 */
export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  // Express identifies error middleware by arity === 4, so next must be declared
  _next: NextFunction,
): Response | void => {
  if (res.headersSent) {
    return;
  }

  // Handle body-parser JSON parse errors
  const isBadJson =
    err.type === 'entity.parse.failed' ||
    (err instanceof SyntaxError && 'body' in err && (err.status === 400 || err.statusCode === 400));

  if (isBadJson) {
    return sendError(res, 'JSON inválido', 'INVALID_JSON', 400);
  }

  const rawStatus = Number(err.statusCode ?? err.status);
  const statusCode =
    Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599 ? rawStatus : 500;

  if (statusCode >= 500) {
    console.error('[Unhandled]', req.method, req.path, err);
  }

  const errorCode = statusCode >= 500 ? 'INTERNAL_ERROR' : (err.code ?? 'BAD_REQUEST');
  const message = err.message || 'Error interno del servidor';

  return sendError(res, message, errorCode, statusCode, err);
};

/**
 * 404 Not Found fallback middleware for unmapped routes.
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
  return sendError(res, `Ruta no encontrada: ${req.method} ${req.path}`, 'NOT_FOUND', 404);
};
