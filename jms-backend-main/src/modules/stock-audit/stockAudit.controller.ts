import { Request, Response, NextFunction } from 'express';
import { stockAuditService } from './stockAudit.service';

export class StockAuditController {
  async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await stockAuditService.createSession(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Stock audit session created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await stockAuditService.getAllSessions(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await stockAuditService.getSessionById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async scanItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await stockAuditService.scanItem(id, req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Audit item scanned successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await stockAuditService.submitSession(id, userId);
      res.status(200).json({
        success: true,
        message: 'Stock audit session submitted for review',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async reconcileSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await stockAuditService.reconcileSession(id, userId);
      res.status(200).json({
        success: true,
        message: 'Stock audit session reconciled and inventory adjusted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { cancellationReason } = req.body;
      const result = await stockAuditService.cancelSession(id, cancellationReason, userId);
      res.status(200).json({
        success: true,
        message: 'Stock audit session cancelled successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDiscrepancies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await stockAuditService.getDiscrepancies(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const stockAuditController = new StockAuditController();
