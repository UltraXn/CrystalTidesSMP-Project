import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validateResource.js';

describe('validateResource Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  const testSchema = z.object({
    body: z.object({
      title: z.string().min(3, 'Title too short'),
      count: z.number().int().positive(),
    }),
    params: z.object({
      id: z.string().optional(),
    }),
  });

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  it('calls next() when request data conforms to Zod schema', () => {
    // Arrange
    mockReq.body = { title: 'Valhalla', count: 5 };
    const middleware = validate(testSchema);

    // Act
    middleware(mockReq as Request, mockRes as Response, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('returns 400 and structured error details when payload is invalid', () => {
    // Arrange
    mockReq.body = { title: 'AB', count: -1 }; // title too short and count negative
    const middleware = validate(testSchema);

    // Act
    middleware(mockReq as Request, mockRes as Response, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({ field: 'body.title', message: 'Title too short' }),
        ]),
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('handles unexpected non-Zod exceptions with 500 status', () => {
    // Arrange
    const brokenSchema = {
      parse: () => {
        throw new Error('Fatal schema crash');
      },
    } as unknown as z.ZodSchema;

    const middleware = validate(brokenSchema);

    // Act
    middleware(mockReq as Request, mockRes as Response, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error during validation' });
  });
});
