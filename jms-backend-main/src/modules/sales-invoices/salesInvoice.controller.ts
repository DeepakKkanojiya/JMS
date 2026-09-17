import { Request, Response, NextFunction } from 'express';
import { salesInvoiceService } from './salesInvoice.service';

export class SalesInvoiceController {
  async createSalesInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const invoice = await salesInvoiceService.createSalesInvoice(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Sales invoice created successfully in DRAFT status',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await salesInvoiceService.getSalesInvoices(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesInvoiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const invoice = await salesInvoiceService.getSalesInvoiceById(id);
      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesInvoiceItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const items = await salesInvoiceService.getSalesInvoiceItems(id);
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSalesInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const updatedInvoice = await salesInvoiceService.updateSalesInvoice(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Draft sales invoice updated successfully',
        data: updatedInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmSalesInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const confirmedInvoice = await salesInvoiceService.confirmSalesInvoice(id, userId);
      res.status(200).json({
        success: true,
        message: 'Sales invoice confirmed successfully',
        data: confirmedInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSalesInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const cancelledInvoice = await salesInvoiceService.cancelSalesInvoice(id, userId);
      res.status(200).json({
        success: true,
        message: 'Sales invoice cancelled successfully',
        data: cancelledInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPosAvailableInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = (req.params.identifier || req.params.id) as string;
      const item = await salesInvoiceService.getPosAvailableInventoryItem(identifier);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const salesInvoiceController = new SalesInvoiceController();
