import { Request, Response, NextFunction } from 'express';
import { roleService, RoleService } from './role.service';

export class RoleController {
  constructor(private service: RoleService = roleService) {}

  createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.service.createRole(req.body);
      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getRoles(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getRoleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const role = await this.service.getRoleById(id);
      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.service.updateRole(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const result = await this.service.deleteRole(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getRolePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const permissions = await this.service.getRolePermissions(id);
      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  };

  assignPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const result = await this.service.assignPermissions(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  removeSinglePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roleId = String(req.params.roleId);
      const permissionId = String(req.params.permissionId);
      const result = await this.service.removeSinglePermission(roleId, permissionId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllPermissions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permissions = await this.service.getAllPermissions();
      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const roleController = new RoleController();
