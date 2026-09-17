import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from './auth.service';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  /**
   * POST /api/v1/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');
      const result = await this.service.login(req.body, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/refresh
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.refreshToken(req.body);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      await this.service.logout(req.body, userId);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/auth/me
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const userProfile = await this.service.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
