import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { authRateLimiter, apiRateLimiter } from '../../middleware/rate-limit.middleware';
import { loginSchema, refreshTokenSchema, logoutSchema } from './auth.validation';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & return JWT tokens
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Generate new access token using refresh token
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user & destroy session
 * @access  Private
 */
router.post('/logout', authenticateToken, validate(logoutSchema), authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently logged-in user profile
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

export const authAliasRouter = Router();
authAliasRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login);
authAliasRouter.get('/me', apiRateLimiter, authenticateToken, authController.getCurrentUser);
authAliasRouter.post('/refresh', authRateLimiter, validate(refreshTokenSchema), authController.refreshToken);
authAliasRouter.post('/logout', apiRateLimiter, authenticateToken, validate(logoutSchema), authController.logout);

export default router;
