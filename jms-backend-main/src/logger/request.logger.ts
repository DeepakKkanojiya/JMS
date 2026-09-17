import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from './logger';
import '../types/express';

/**
 * Express Middleware: Request Logger & Request ID Generator
 *
 * 1. Generates or extracts unique Request ID for every incoming request.
 * 2. Attaches req.requestId and sets X-Request-ID response header.
 * 3. Logs incoming request details to logs/access.log.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const existingRequestId = req.headers['x-request-id'] as string;
  const requestId = existingRequestId || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Agent';
  const userId = req.user?.userId || 'Guest';

  logger.info(
    `Incoming Request: ${req.method} ${req.originalUrl} | IP: ${ipAddress} | User: ${userId} | Agent: ${userAgent}`,
    'access',
    requestId
  );

  next();
};
