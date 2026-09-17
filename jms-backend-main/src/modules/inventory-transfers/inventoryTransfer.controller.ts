import { Request, Response, NextFunction } from 'express';
import { inventoryTransferService } from './inventoryTransfer.service';

export class InventoryTransferController {
  async createTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || (req as any).user?.userId;
      const transfer = await inventoryTransferService.createTransfer(req.body, userId);
      res.status(201).json({
        status: 'success',
        message: 'Branch stock transfer request created successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventoryTransferService.getTransfers(req.query as any);
      res.status(200).json({
        status: 'success',
        message: 'Inventory transfers retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransferById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const transfer = await inventoryTransferService.getTransferById(id);
      res.status(200).json({
        status: 'success',
        message: 'Inventory transfer details retrieved successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id || (req as any).user?.userId;
      const transfer = await inventoryTransferService.approveTransfer(id, userId);
      res.status(200).json({
        status: 'success',
        message: 'Inventory transfer request approved successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id || (req as any).user?.userId;
      const transfer = await inventoryTransferService.rejectTransfer(id, req.body, userId);
      res.status(200).json({
        status: 'success',
        message: 'Inventory transfer request rejected successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }

  async dispatchTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id || (req as any).user?.userId;
      const transfer = await inventoryTransferService.dispatchTransfer(id, userId);
      res.status(200).json({
        status: 'success',
        message: 'Inventory transfer dispatched and in transit successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }

  async receiveTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id || (req as any).user?.userId;
      const transfer = await inventoryTransferService.receiveTransfer(id, userId);
      res.status(200).json({
        status: 'success',
        message: 'Inventory transfer received and added to destination branch stock successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryTransferController = new InventoryTransferController();
