import { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodType } from 'zod';

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    }) as Record<string, unknown>;

    if (parsed && typeof parsed === 'object') {
      if ('body' in parsed && parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if ('query' in parsed && parsed.query !== undefined) {
        req.query = parsed.query as typeof req.query;
      }
      if ('params' in parsed && parsed.params !== undefined) {
        req.params = parsed.params as typeof req.params;
      }
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // ZodError by default has an 'errors' property
      return res.status(400).json({
        error: 'Validation Error',
        details: error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    return res.status(500).json({ error: 'Internal Server Error during validation' });
  }
};
