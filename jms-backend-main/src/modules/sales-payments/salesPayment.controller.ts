import { Request, Response, NextFunction } from 'express';
import { salesPaymentService } from './salesPayment.service';

export class SalesPaymentController {
  createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const receivedByUserId = req.user?.userId;
      const result = await salesPaymentService.createPayment(req.body, receivedByUserId);
      res.status(201).json({
        success: true,
        message: 'Sales payment recorded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const result = await salesPaymentService.getPaymentById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await salesPaymentService.getAllPayments(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getInvoicePaymentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const salesInvoiceId = req.params.id as string;
      const result = await salesPaymentService.getInvoicePaymentHistory(salesInvoiceId, req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getInvoicePaymentSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const salesInvoiceId = req.params.id as string;
      const result = await salesPaymentService.getInvoicePaymentSummary(salesInvoiceId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  reversePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentId = req.params.id as string;
      const reversedByUserId = req.user?.userId || 'system';
      const result = await salesPaymentService.reversePayment(paymentId, req.body, reversedByUserId);
      res.status(200).json({
        success: true,
        message: 'Sales payment reversed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const salesPaymentController = new SalesPaymentController();
