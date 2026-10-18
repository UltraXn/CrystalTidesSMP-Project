import { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodType } from 'zod';

function applyValidatedValues(req: Request, res: Response, parsed: Record<string, unknown>): void {
  if (res.locals) {
    res.locals.validated = parsed;
  }

  if (parsed.body !== undefined) {
    req.body = parsed.body;
  }
  if (parsed.params !== undefined) {
    req.params = parsed.params as typeof req.params;
  }
  // In Express 5, req.query is dynamically computed from URL on access.
  // Validated and coerced query values are accessible via res.locals.validated.
}

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    }) as Record<string, unknown>;

    if (parsed && typeof parsed === 'object') {
      applyValidatedValues(req, res, parsed);
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
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
