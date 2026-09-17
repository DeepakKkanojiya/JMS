import { Request, Response, NextFunction } from 'express';
import { purchaseBillService } from './purchaseBill.service';

export class PurchaseBillController {
  async createPurchaseBill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const bill = await purchaseBillService.createPurchaseBill(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Purchase bill created successfully in DRAFT status',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  async listPurchaseBills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await purchaseBillService.listPurchaseBills(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseBillById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const bill = await purchaseBillService.getPurchaseBillById(id);
      res.status(200).json({
        success: true,
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePurchaseBill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const updatedBill = await purchaseBillService.updatePurchaseBill(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Draft purchase bill updated successfully',
        data: updatedBill,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitPurchaseBill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const bill = await purchaseBillService.submitPurchaseBill(id, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase bill submitted successfully',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  async approvePurchaseBill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const bill = await purchaseBillService.approvePurchaseBill(id, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase bill approved successfully',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelPurchaseBill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { cancellationReason } = req.body;
      const bill = await purchaseBillService.cancelPurchaseBill(id, cancellationReason, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase bill cancelled successfully',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseBillsByPO(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseOrderId = req.params.id as string;
      const bills = await purchaseBillService.getPurchaseBillsByPO(purchaseOrderId);
      res.status(200).json({
        success: true,
        data: bills,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseBillsByVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = req.params.id as string;
      const bills = await purchaseBillService.getPurchaseBillsByVendor(vendorId);
      res.status(200).json({
        success: true,
        data: bills,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseBillSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const summary = await purchaseBillService.getPurchaseBillSummary(id);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const purchaseBillController = new PurchaseBillController();
