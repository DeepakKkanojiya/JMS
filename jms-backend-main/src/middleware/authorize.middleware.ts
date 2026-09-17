import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database';
import { ForbiddenError, UnauthorizedError } from '../errors';

/**
 * Authorization Middleware Factory (RBAC)
 * Verifies that the authenticated user has the required permission key(s)
 * @param requiredPermissions List of permission keys (e.g. 'customer.create', 'user.read')
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user || !user.userId) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      // Bypass permission check ONLY for super-admin OWNER role
      if (user.role === 'OWNER') {
        return next();
      }

      // Query database for user's role permissions
      const rolePermissions = await prisma.rolePermission.findMany({
        where: {
          roleId: user.roleId,
        },
        include: {
          permission: true,
        },
      });

      const userPermissionKeys = new Set(
        rolePermissions.map((rp) => rp.permission.permissionKey)
      );

      // Check if user has ALL required permissions
      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPermissionKeys.has(perm)
      );

      if (!hasAllPermissions) {
        return next(
          new ForbiddenError('You do not have permission to perform this action.')
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to restrict route strictly to ADMIN / SUPER_ADMIN / OWNER roles.
 */
export const requireAdminRole = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user || !user.userId) {
        return next(new UnauthorizedError('Unauthorized'));
      }
      const adminRoles = ['OWNER', 'SUPER_ADMIN', 'ADMIN'];
      if (!adminRoles.includes(user.role)) {
        return next(new ForbiddenError('Access restricted: Only Admin accounts can view live market prices.'));
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Convenience alias for single or role check
 */
export const authorizePermission = requirePermission;
