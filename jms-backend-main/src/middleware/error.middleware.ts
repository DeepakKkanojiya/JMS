import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { buildErrorResponse } from '../utils/errorResponse';
import { formatValidationError } from '../utils/validation-response';
import { errorLogger } from '../logger';
import { config } from '../config';
import '../types/express';

/**
 * Global Error Handling Middleware
 *
 * Catch-all middleware for Express application errors.
 * Formats custom AppErrors, Zod Validation errors, Prisma Database errors,
 * JWT errors, and unhandled system exceptions into a uniform JSON response.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] = [];
  let stack: string | undefined = undefined;

  // 1. Custom Application Errors (AppError and subclasses)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  }
  // 2. Zod Validation Errors
  else if (err instanceof ZodError) {
    const formatted = formatValidationError(err, req);
    errorLogger.logError('Validation failed', {
      statusCode: 400,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.userId,
      requestId: req.requestId,
    });
    res.status(400).json(formatted);
    return;
  }
  // 3. JWT Tokens Errors (jsonwebtoken)
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Unauthorized';
  }
  // 4. Prisma ORM Database Errors
  else if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      statusCode = 409;
      const targetFields = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      message = targetFields.includes('email') ? 'Email already exists' : `${targetFields} already exists`;
      errors = [{ field: targetFields, message: `${targetFields} already exists` }];
    } else if (err.code === 'P2003') {
      statusCode = 409;
      message = 'Cannot delete or modify this record because it is referenced by other existing data (such as inventory items, sales invoices, or branches). Please remove or reassign related records first.';
      errors = [{ message }];
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else if (['P1001', 'P1002', 'P1008', 'P1017'].includes(err.code)) {
      statusCode = 500;
      message = 'Database unavailable';
    } else {
      statusCode = 500;
      message = 'Database operation failed';
    }
  }
  // 5. Explicit Database Connection / Offline Error
  else if (err.message && (err.message.includes('Database unavailable') || err.message.includes('ECONNREFUSED'))) {
    statusCode = 500;
    message = 'Database unavailable';
  }
  // 6. Generic Native Errors
  else if (err instanceof Error) {
    message = err.message || 'Internal server error';
    if (config.server.isDevelopment) {
      stack = err.stack;
    }
  }

  // Log error via errorLogger to logs/error.log
  errorLogger.logError(message, {
    statusCode,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.userId,
    requestId: req.requestId,
    stack: err.stack,
  });

  const responsePayload = buildErrorResponse({
    statusCode,
    message,
    errors,
    req,
    stack: config.server.isDevelopment ? stack || err.stack : undefined,
  });

  res.status(statusCode).json(responsePayload);
};
