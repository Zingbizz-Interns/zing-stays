import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Central Express error middleware.
 * Maps typed errors to HTTP status codes; logs unexpected errors.
 *
 * Register as the LAST middleware in the Express chain:
 *   app.use(errorHandler);
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
}
