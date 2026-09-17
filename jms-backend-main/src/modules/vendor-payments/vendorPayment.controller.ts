import { Request, Response, NextFunction } from 'express';
import { vendorPaymentService } from './vendorPayment.service';

export class VendorPaymentController {
  async createVendorPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const purchaseBillId = req.params.id || req.body.purchaseBillId;
      const payload = {
        ...req.body,
        purchaseBillId,
      };
      const payment = await vendorPaymentService.createVendorPayment(payload, userId);
      res.status(201).json({
        success: true,
        message: 'Vendor payment processed successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseBillPaymentHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseBillId = req.params.id as string;
      const payments = await vendorPaymentService.getPurchaseBillPaymentHistory(purchaseBillId);
      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseBillPaymentSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseBillId = req.params.id as string;
      const summary = await vendorPaymentService.getPurchaseBillPaymentSummary(purchaseBillId);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllVendorPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vendorPaymentService.getAllVendorPayments(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVendorPaymentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const payment = await vendorPaymentService.getVendorPaymentById(id);
      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async reverseVendorPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { reversalReason } = req.body;
      const reversedPayment = await vendorPaymentService.reverseVendorPayment(id, reversalReason, userId);
      res.status(200).json({
        success: true,
        message: 'Vendor payment reversed successfully',
        data: reversedPayment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVendorPaymentHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = req.params.id as string;
      const payments = await vendorPaymentService.getVendorPaymentHistory(vendorId);
      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVendorPayableSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = req.params.id as string;
      const summary = await vendorPaymentService.getVendorPayableSummary(vendorId);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const vendorPaymentController = new VendorPaymentController();
