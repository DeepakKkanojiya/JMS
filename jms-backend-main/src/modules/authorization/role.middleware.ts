import { Request, Response, NextFunction } from 'express';
import '../../types/express';
import { ROLES } from './roles.constants';
import { UnauthorizedError, ForbiddenError } from '../../errors';

/**
 * Authorization Middleware: Restrict access to specific roles.
 * OWNER role always retains administrative access.
 */
export const allowRoles = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Unauthorized'));
    }

    const userRole = req.user.role;
    const hasPermission = allowedRoles.includes(userRole) || userRole === ROLES.OWNER;

    if (!hasPermission) {
      return next(new ForbiddenError('Forbidden'));
    }

    next();
  };
};

export const requireRoles = allowRoles;
