import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import '../types/express';

/**
 * Express Middleware: Response Logger
 *
 * Hooks into response completion to record HTTP status code and latency (ms) in logs/access.log.
 */
export const responseLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';

    logger.log(
      level,
      `Completed Request: ${req.method} ${req.originalUrl} | Status: ${statusCode} | Duration: ${duration}ms`,
      'access',
      req.requestId
    );
  });

  next();
};
