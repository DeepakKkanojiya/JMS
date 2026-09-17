import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { formatValidationError } from '../utils/validation-response';

export interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  file?: ZodSchema;
}

export type ValidationInput = ZodSchema | ValidationTargets;

/**
 * Express middleware for centralized request validation.
 * Supports validating request body, query parameters, path parameters, and uploaded files.
 *
 * Usage Examples:
 *   router.post('/login', validate(loginSchema));
 *   router.get('/users/:id', validate({ params: uuidParamSchema, query: paginationQuerySchema }));
 */
export const validate = (schemaOrTargets: ValidationInput) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let targets: ValidationTargets;

      if (isZodSchema(schemaOrTargets)) {
        targets = { body: schemaOrTargets };
      } else {
        targets = schemaOrTargets;
      }

      // Check for empty body when body schema is present
      if (targets.body && (!req.body || Object.keys(req.body).length === 0)) {
        const isOptionalBody = targets.body.safeParse(undefined).success;
        if (!isOptionalBody) {
          const parsed = await targets.body.safeParseAsync({});
          if (!parsed.success) {
            res.status(400).json(formatValidationError(parsed.error, req));
            return;
          }
        }
      }

      // 1. Validate Body
      if (targets.body) {
        const parsedBody = await targets.body.safeParseAsync(req.body);
        if (!parsedBody.success) {
          res.status(400).json(formatValidationError(parsedBody.error, req));
          return;
        }
        req.body = parsedBody.data;
      }

      // 2. Validate Params
      if (targets.params) {
        const parsedParams = await targets.params.safeParseAsync(req.params);
        if (!parsedParams.success) {
          res.status(400).json(formatValidationError(parsedParams.error, req));
          return;
        }
        if (req.params && typeof req.params === 'object') {
          Object.assign(req.params, parsedParams.data);
        }
      }

      // 3. Validate Query
      if (targets.query) {
        const parsedQuery = await targets.query.safeParseAsync(req.query);
        if (!parsedQuery.success) {
          res.status(400).json(formatValidationError(parsedQuery.error, req));
          return;
        }
        if (req.query && typeof req.query === 'object') {
          Object.assign(req.query, parsedQuery.data);
        }
      }

      // 4. Validate File
      if (targets.file) {
        const fileTarget = req.file || (req as any).files;
        const parsedFile = await targets.file.safeParseAsync(fileTarget);
        if (!parsedFile.success) {
          res.status(400).json(formatValidationError(parsedFile.error, req));
          return;
        }
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json(formatValidationError(err, req));
        return;
      }
      next(err);
    }
  };
};

function isZodSchema(input: any): input is ZodSchema {
  return input && typeof input.safeParseAsync === 'function';
}

export const validateRequest = validate;
