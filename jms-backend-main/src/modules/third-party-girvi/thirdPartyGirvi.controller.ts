import { Request, Response, NextFunction } from 'express';
import { thirdPartyGirviService } from './thirdPartyGirvi.service';

export class ThirdPartyGirviController {
  // ==========================================
  // LENDER CONTROLLERS
  // ==========================================

  async createLender(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await thirdPartyGirviService.createLender(req.body);
      res.status(201).json({
        success: true,
        message: 'Third-party lender created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLenders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.query.companyId as string;
      const search = req.query.search as string;
      const result = await thirdPartyGirviService.listLenders(companyId, search);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // THIRD-PARTY GIRVI CONTROLLERS
  // ==========================================

  async createThirdPartyGirvi(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await thirdPartyGirviService.createThirdPartyGirvi(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Third-party Girvi record created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGirviById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await thirdPartyGirviService.getGirviById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGirvis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await thirdPartyGirviService.listGirvis(req.query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateThirdPartyGirvi(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await thirdPartyGirviService.updateThirdPartyGirvi(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Third-party Girvi record updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveThirdPartyGirvi(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await thirdPartyGirviService.approveThirdPartyGirvi(id, userId);
      res.status(200).json({
        success: true,
        message: 'Third-party Girvi record approved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async closeThirdPartyGirvi(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await thirdPartyGirviService.closeThirdPartyGirvi(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Third-party Girvi record closed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelThirdPartyGirvi(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await thirdPartyGirviService.cancelThirdPartyGirvi(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Third-party Girvi record cancelled successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addCollateral(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await thirdPartyGirviService.addCollateral(id, req.body);
      res.status(201).json({
        success: true,
        message: 'Collateral item added successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async releaseCollateral(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collateralId = req.params.collateralId as string;
      const userId = req.user?.userId;
      const result = await thirdPartyGirviService.releaseCollateral(collateralId, userId);
      res.status(200).json({
        success: true,
        message: 'Collateral item released successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const thirdPartyGirviController = new ThirdPartyGirviController();
