import { Request, Response, NextFunction } from 'express';
import { securityConfig } from '../config/security';
import { buildErrorResponse } from '../utils/errorResponse';
import { logger } from '../logger';
import '../types/express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Helper to clean up expired rate limit records periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

export function resetRateLimitStore() {
  rateLimitStore.clear();
}

export function createRateLimiter(options: { windowMs: number; max: number; message: string; keyPrefix: string }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
      return next();
    }
    // Authenticated API requests with Bearer token bypass IP rate limiting
    if (options.keyPrefix === 'api' && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return next();
    }
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const key = `${options.keyPrefix}:${ip}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      rateLimitStore.set(key, record);
    } else {
      record.count += 1;
    }

    if (record.count > options.max) {
      logger.warn(
        `Rate limit exceeded | Key: ${key} | Count: ${record.count} | Max: ${options.max}`,
        'access',
        req.requestId
      );

      const errorPayload = buildErrorResponse({
        statusCode: 429,
        message: options.message,
        errors: [{ field: 'rate_limit', message: options.message }],
        req,
      });

      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      res.status(429).json(errorPayload);
      return;
    }

    next();
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: securityConfig.rateLimit.auth.windowMs,
  max: securityConfig.rateLimit.auth.max,
  message: securityConfig.rateLimit.auth.message,
  keyPrefix: 'auth',
});

export const apiRateLimiter = createRateLimiter({
  windowMs: securityConfig.rateLimit.general.windowMs,
  max: securityConfig.rateLimit.general.max,
  message: securityConfig.rateLimit.general.message,
  keyPrefix: 'api',
});
