import { Request, Response, NextFunction } from 'express';
import { permissionService, PermissionService } from './permission.service';

export class PermissionController {
  constructor(private service: PermissionService = permissionService) {}

  createPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permission = await this.service.createPermission(req.body);
      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  getPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getPermissions(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getPermissionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const permission = await this.service.getPermissionById(id);
      res.status(200).json({
        success: true,
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  getPermissionsByModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const moduleName = String(req.params.module);
      const permissionKeys = await this.service.getPermissionsByModule(moduleName);
      res.status(200).json({
        success: true,
        data: permissionKeys,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.service.updatePermission(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Permission updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  deletePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const result = await this.service.deletePermission(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const permissionController = new PermissionController();
