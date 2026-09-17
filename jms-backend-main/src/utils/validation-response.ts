import { Request } from 'express';
import { ZodError } from 'zod';
import { buildErrorResponse, StandardErrorResponsePayload } from './errorResponse';

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export function formatValidationError(error: ZodError, req?: Request): StandardErrorResponsePayload {
  const errors: ValidationErrorItem[] = error.issues.map((issue) => {
    let pathArray = issue.path.map((p) => String(p));
    if (pathArray.length > 1 && ['body', 'query', 'params', 'file'].includes(pathArray[0])) {
      pathArray = pathArray.slice(1);
    }
    const field = pathArray.join('.') || 'request';

    return {
      field,
      message: issue.message,
    };
  });

  return buildErrorResponse({
    statusCode: 400,
    message: 'Validation failed',
    errors,
    req,
  });
}
