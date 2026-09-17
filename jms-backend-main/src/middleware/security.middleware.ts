import { Request, Response, NextFunction } from 'express';
import { securityConfig } from '../config/security';

/**
 * Express Middleware: Custom HTTP Security Headers
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  if (securityConfig.headers.hidePoweredBy) {
    res.removeHeader('X-Powered-By');
  }

  res.setHeader('X-Frame-Options', securityConfig.headers.frameOptions);
  res.setHeader('X-Content-Type-Options', securityConfig.headers.contentTypeOptions);
  res.setHeader(
    'Strict-Transport-Security',
    `max-age=${securityConfig.headers.hstsMaxAge}; includeSubDomains`
  );
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
};
