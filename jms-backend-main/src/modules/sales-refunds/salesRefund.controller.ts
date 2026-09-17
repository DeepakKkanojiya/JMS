import { Request, Response, NextFunction } from 'express';
import { SalesRefundService } from './salesRefund.service';

export class SalesRefundController {
  private refundService: SalesRefundService;

  constructor() {
    this.refundService = new SalesRefundService();
  }

  createRefund = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const refund = await this.refundService.createRefund(req.body, userId);
      res.status(201).json({
        success: true,
        message: `Sales refund #${refund.refundNumber} issued successfully`,
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  };

  getRefunds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.refundService.getRefunds(req.query as any);
      res.status(200).json({
        success: true,
        data: result.refunds,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getRefundById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const refund = await this.refundService.getRefundById(id);
      res.status(200).json({
        success: true,
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  };

  getRefundsByReturnId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const refunds = await this.refundService.getRefundsByReturnId(id);
      res.status(200).json({
        success: true,
        data: refunds,
      });
    } catch (error) {
      next(error);
    }
  };

  reverseRefund = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const refund = await this.refundService.reverseRefund(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: `Sales refund #${refund.refundNumber} reversed successfully`,
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  };
}
