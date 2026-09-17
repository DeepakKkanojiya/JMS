import { Request, Response, NextFunction } from 'express';
import { masterService, MasterService } from './master.service';

export class MasterController {
  constructor(private service: MasterService = masterService) {}

  getDropdowns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getDropdowns();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getStatuses();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getBranches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branches = await this.service.getBranches();
      res.status(200).json({
        success: true,
        data: branches,
      });
    } catch (error) {
      next(error);
    }
  };

  getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.service.getRoles();
      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const masterController = new MasterController();
