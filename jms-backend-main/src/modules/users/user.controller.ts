import { Request, Response, NextFunction } from 'express';
import { userService, UserService } from './user.service';

export class UserController {
  constructor(private service: UserService = userService) {}

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as any).user?.userId;
      const user = await this.service.createUser(req.body, currentUserId);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getUsers(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const profile = await this.service.getUserProfile(userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const user = await this.service.getUserById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const currentUserId = (req as any).user?.userId;
      const updated = await this.service.updateUser(id, req.body, currentUserId);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const currentUserId = (req as any).user?.userId;
      const result = await this.service.deleteUser(id, currentUserId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  activateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const currentUserId = (req as any).user?.userId;
      const user = await this.service.activateUser(id, currentUserId);
      res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const currentUserId = (req as any).user?.userId;
      const user = await this.service.deactivateUser(id, currentUserId);
      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  changeUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { roleId } = req.body;
      const currentUserId = (req as any).user?.userId;
      const user = await this.service.changeUserRole(id, roleId, currentUserId);
      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as any).user?.userId;
      const result = await this.service.changePassword(currentUserId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const adminUserId = (req as any).user?.userId;
      const result = await this.service.resetPassword(id, req.body, adminUserId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
