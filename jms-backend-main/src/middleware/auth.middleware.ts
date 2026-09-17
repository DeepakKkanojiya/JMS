import '../types/express';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUserPayload } from '../modules/auth/auth.types';
import { UnauthorizedError } from '../errors';

/**
 * Authentication Middleware
 * Verifies JWT Access Token from Authorization: Bearer <token>
 */
export const authenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch {
    return next(new UnauthorizedError('Token expired or invalid'));
  }
};
