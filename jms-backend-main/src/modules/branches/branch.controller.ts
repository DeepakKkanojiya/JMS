import { Request, Response, NextFunction } from 'express';
import { branchService, BranchService } from './branch.service';

export class BranchController {
  constructor(private service: BranchService = branchService) {}

  createBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branch = await this.service.createBranch(req.body);
      res.status(201).json({
        success: true,
        message: 'Branch created successfully',
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  };

  getBranches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getBranches(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getBranchById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const branch = await this.service.getBranchById(id);
      res.status(200).json({
        success: true,
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  };

  updateBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const branch = await this.service.updateBranch(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Branch updated successfully',
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteBranch(id);
      res.status(200).json({
        success: true,
        message: 'Branch deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const branchController = new BranchController();
