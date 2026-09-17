import { Request, Response, NextFunction } from 'express';
import { girviService } from './girvi.service';

export class GirviController {
  async createGirviLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await girviService.createGirviLoan(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Girvi loan created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGirviLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await girviService.listGirviLoans(req.query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGirviLoanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await girviService.getGirviLoanById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateGirviLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await girviService.updateGirviLoan(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Girvi loan updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveGirviLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await girviService.approveGirviLoan(id, userId);
      res.status(200).json({
        success: true,
        message: 'Girvi loan approved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelGirviLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await girviService.cancelGirviLoan(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Girvi loan cancelled successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addCollateral(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await girviService.addCollateral(id, req.body);
      res.status(201).json({
        success: true,
        message: 'Collateral added successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PHASE 6.2 CONTROLLER ENDPOINTS
  // ==========================================

  async getFinancialSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate as string) : new Date();
      const result = await girviService.getLoanFinancialSummary(id, asOfDate);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await girviService.createCollection(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Girvi collection payment recorded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCollectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await girviService.getCollectionById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await girviService.listCollections(req.query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLoanCollectionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await girviService.getLoanCollectionHistory(id);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async reverseCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await girviService.reverseCollection(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Girvi collection reversed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async renewGirviLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await girviService.renewGirviLoan(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Girvi loan renewed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOverdueLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await girviService.listOverdueLoans(req.query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PHASE 6.3 CONTROLLER ENDPOINTS
  // ==========================================

  async settleGirviLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await girviService.settleGirviLoan(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Girvi loan settled and collateral jewellery released successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettlementById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await girviService.getSettlementById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLoanSettlement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await girviService.getLoanSettlement(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettlements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await girviService.listSettlements(req.query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReleasedCollateral(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await girviService.getReleasedCollateral(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PHASE 6.5 CONTROLLER ENDPOINTS
  // ==========================================

  async getGirviAuditTrail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
      const result = await girviService.getGirviAuditTrail(id, sortOrder);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGirviPortfolioReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.query.companyId as string;
      const branchId = req.query.branchId as string;
      const result = await girviService.getGirviPortfolioReport(companyId, branchId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGirviOverdueAgingReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.query.companyId as string;
      const branchId = req.query.branchId as string;
      const result = await girviService.getGirviOverdueAgingReport(companyId, branchId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const girviController = new GirviController();


