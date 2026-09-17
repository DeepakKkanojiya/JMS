import { Request, Response, NextFunction } from 'express';
import { purchaseReturnService } from './purchaseReturn.service';

export class PurchaseReturnController {
  async createPurchaseReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await purchaseReturnService.createPurchaseReturn(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Purchase return draft created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPurchaseReturns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await purchaseReturnService.getAllPurchaseReturns(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseReturnById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await purchaseReturnService.getPurchaseReturnById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePurchaseReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await purchaseReturnService.updatePurchaseReturn(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase return updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitPurchaseReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await purchaseReturnService.submitPurchaseReturn(id, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase return submitted for approval',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approvePurchaseReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await purchaseReturnService.approvePurchaseReturn(id, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase return approved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async processPurchaseReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await purchaseReturnService.processPurchaseReturn(id, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase return processed, inventory updated, and Debit Note generated successfully',
        data: result.purchaseReturn,
        debitNote: result.debitNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelPurchaseReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { cancellationReason } = req.body;
      const result = await purchaseReturnService.cancelPurchaseReturn(id, cancellationReason, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase return cancelled successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- DEBIT NOTE CONTROLLER METHODS ---

  async getAllDebitNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await purchaseReturnService.getAllDebitNotes(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDebitNoteById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await purchaseReturnService.getDebitNoteById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDebitNotesByVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = req.params.id as string;
      const result = await purchaseReturnService.getDebitNotesByVendor(vendorId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const purchaseReturnController = new PurchaseReturnController();
