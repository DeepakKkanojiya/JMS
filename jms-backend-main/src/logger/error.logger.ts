import { logger } from './logger';

export interface ErrorLogContext {
  statusCode?: number;
  method?: string;
  url?: string;
  userId?: string;
  requestId?: string;
  stack?: string;
}

export class ErrorLogger {
  public logError(message: string, context: ErrorLogContext = {}): void {
    const { statusCode = 500, method, url, userId, requestId, stack } = context;
    const reqStr = method && url ? ` | Request: ${method} ${url}` : '';
    const userStr = userId ? ` | User: ${userId}` : '';

    logger.error(
      `RUNTIME_ERROR | Status: ${statusCode}${reqStr}${userStr} | Message: ${message}`,
      'error',
      requestId,
      stack ? { stack } : undefined
    );
  }
}

export const errorLogger = new ErrorLogger();
