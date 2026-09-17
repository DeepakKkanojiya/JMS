import { Request, Response, NextFunction } from 'express';
import '../../types/express';

/**
 * Granular Permission Checking Middleware (for future custom permission matrix)
 */
export const checkPermission = (permissionKey: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Default permission pass for administrative roles
    if (req.user.role === 'ADMIN' || req.user.role === 'OWNER') {
      next();
      return;
    }

    // Extendable for fine-grained module permission checks
    console.log(`[INFO] Checking permission '${permissionKey}' for user ${req.user.userId}`);
    next();
  };
};
