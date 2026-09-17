import { Request } from 'express';

export interface StandardErrorResponsePayload {
  success: false;
  statusCode: number;
  message: string;
  errors?: any[];
  timestamp: string;
  path: string;
  stack?: string;
}

export interface ErrorResponseOptions {
  statusCode: number;
  message: string;
  errors?: any[];
  req?: Request;
  stack?: string;
}

/**
 * Utility function to build standardized application error responses.
 */
export function buildErrorResponse(options: ErrorResponseOptions): StandardErrorResponsePayload {
  const { statusCode, message, errors, req, stack } = options;

  const path = req ? req.originalUrl || req.url : '/';
  const timestamp = new Date().toISOString();

  const payload: StandardErrorResponsePayload = {
    success: false,
    statusCode,
    message,
    errors: errors || [],
    timestamp,
    path,
  };

  if (stack) {
    payload.stack = stack;
  }

  return payload;
}
