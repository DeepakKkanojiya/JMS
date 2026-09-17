import { Request, Response, NextFunction } from 'express';

const HTML_TAGS_REGEX = /<[^>]*>?/gm;
const SCRIPT_INJECTION_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

/**
 * Sanitize a single input value recursively
 */
function sanitizeValue(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    let sanitized = value.trim();
    sanitized = sanitized.replace(SCRIPT_INJECTION_REGEX, '');
    sanitized = sanitized.replace(HTML_TAGS_REGEX, '');
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitizedObj[key] = sanitizeValue(val);
    }
    return sanitizedObj;
  }

  return value;
}

/**
 * Express Middleware: Input Sanitization
 *
 * Cleans req.body, req.query, and req.params before reaching validation and controller layers.
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitizeValue(req.query);
    Object.assign(req.query, sanitizedQuery);
  }

  if (req.params && typeof req.params === 'object') {
    const sanitizedParams = sanitizeValue(req.params);
    Object.assign(req.params, sanitizedParams);
  }

  next();
};
