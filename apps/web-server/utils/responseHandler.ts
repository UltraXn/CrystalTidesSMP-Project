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

export const sendSuccess = <T>(res: Response, data: T, message?: string, meta?: ApiResponse<T>['meta']) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        meta
    });
};

export const sendError = (res: Response, message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: unknown) => {
    // Sanitize details to avoid circular references and leak info
    let safeDetails = process.env.NODE_ENV === 'development' ? details : undefined;
    const safeMessage = process.env.NODE_ENV === 'development' ? message : (statusCode >= 500 ? 'Internal server error' : message);

    if (details instanceof Error && process.env.NODE_ENV === 'development') {
        safeDetails = {
            message: details.message,
            stack: details.stack
        };
    }


    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message: safeMessage,
            details: safeDetails
        }
    });
};
