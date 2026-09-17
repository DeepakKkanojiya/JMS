import { Request, Response, NextFunction } from 'express';
import { purchaseService } from './purchase.service';

export class PurchaseController {
  async createPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const order = await purchaseService.createPurchaseOrder(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Purchase order created successfully in DRAFT status',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async listPurchaseOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await purchaseService.listPurchaseOrders(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const order = await purchaseService.getPurchaseOrderById(id);
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const updatedOrder = await purchaseService.updatePurchaseOrder(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Draft purchase order updated successfully',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const submittedOrder = await purchaseService.submitPurchaseOrder(id, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase order submitted for approval successfully',
        data: submittedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async approvePurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const approvedOrder = await purchaseService.approvePurchaseOrder(id, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase order approved successfully',
        data: approvedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { cancellationReason } = req.body;
      const cancelledOrder = await purchaseService.cancelPurchaseOrder(id, cancellationReason, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase order cancelled successfully',
        data: cancelledOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async receivePurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await purchaseService.receivePurchaseOrder(id, req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Purchase items received and inventory items generated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseOrderReceipts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseOrderId = req.params.id as string;
      const receipts = await purchaseService.getPurchaseOrderReceipts(purchaseOrderId);
      res.status(200).json({
        success: true,
        data: receipts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseOrderReceiptById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchaseOrderId = req.params.id as string;
      const receiptId = req.params.receiptId as string;
      const receipt = await purchaseService.getPurchaseOrderReceiptById(purchaseOrderId, receiptId);
      res.status(200).json({
        success: true,
        data: receipt,
      });
    } catch (error) {
      next(error);
    }
  }

  async listPurchaseReceipts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await purchaseService.listPurchaseReceipts(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseReceiptById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const receipt = await purchaseService.getPurchaseReceiptById(id);
      res.status(200).json({
        success: true,
        data: receipt,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const purchaseController = new PurchaseController();

