import { Request, Response, NextFunction } from 'express';
import { SalesReturnService } from './salesReturn.service';

export class SalesReturnController {
  private returnService: SalesReturnService;

  constructor() {
    this.returnService = new SalesReturnService();
  }

  createReturn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const salesReturn = await this.returnService.createReturn(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Sales return request created successfully',
        data: salesReturn,
      });
    } catch (error) {
      next(error);
    }
  };

  getReturns = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.returnService.getReturns(req.query as any);
      res.status(200).json({
        success: true,
        data: result.returns,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getReturnById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const salesReturn = await this.returnService.getReturnById(id);
      res.status(200).json({
        success: true,
        data: salesReturn,
      });
    } catch (error) {
      next(error);
    }
  };

  getReturnsByInvoiceId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoiceId = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;
      const returns = await this.returnService.getReturnsByInvoiceId(invoiceId);
      res.status(200).json({
        success: true,
        data: returns,
      });
    } catch (error) {
      next(error);
    }
  };

  approveReturn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const salesReturn = await this.returnService.approveReturn(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: `Sales return #${salesReturn.returnNumber} approved successfully`,
        data: salesReturn,
      });
    } catch (error) {
      next(error);
    }
  };

  processReturn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const salesReturn = await this.returnService.processReturn(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: `Sales return #${salesReturn.returnNumber} processed successfully. Items restored to available inventory.`,
        data: salesReturn,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelReturn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const salesReturn = await this.returnService.cancelReturn(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: `Sales return #${salesReturn.returnNumber} cancelled successfully`,
        data: salesReturn,
      });
    } catch (error) {
      next(error);
    }
  };

  getReturnHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const salesReturn = await this.returnService.getReturnById(id);
      const history: {
        stage: string;
        by: string | null;
        at: Date | null;
        reason: string | null;
      }[] = [
        {
          stage: 'REQUESTED',
          by: salesReturn.requestedBy,
          at: salesReturn.createdAt,
          reason: salesReturn.reason,
        },
      ];

      if (salesReturn.approvedAt) {
        history.push({
          stage: 'APPROVED',
          by: salesReturn.approvedBy,
          at: salesReturn.approvedAt,
          reason: null,
        });
      }

      if (salesReturn.processedAt) {
        history.push({
          stage: 'PROCESSED',
          by: salesReturn.processedBy,
          at: salesReturn.processedAt,
          reason: null,
        });
      }

      if (salesReturn.cancelledAt) {
        history.push({
          stage: 'CANCELLED',
          by: salesReturn.cancelledBy,
          at: salesReturn.cancelledAt,
          reason: salesReturn.cancellationReason || null,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          returnNumber: salesReturn.returnNumber,
          currentStatus: salesReturn.status,
          history,
          refunds: salesReturn.refunds,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
