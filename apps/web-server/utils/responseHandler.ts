import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  meta?: ApiResponse<T>['meta'],
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const sendError = (
  res: Response,
  message: string,
  code: string = 'INTERNAL_ERROR',
  statusCode: number = 500,
  details?: unknown,
) => {
  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}] code=${code}:`, details ?? message);
  }

  // In production-ready systems, 5xx errors MUST NEVER leak internal messages, stacks, or database details to clients
  const safeMessage = statusCode >= 500 ? 'Internal server error' : message;
  const safeDetails = statusCode >= 500 ? undefined : details;

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: safeMessage,
      details: safeDetails,
    },
  });
};

export const sendInternalError = (res: Response, err?: unknown) => {
  return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500, err);
};
