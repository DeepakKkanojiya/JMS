import { Request, Response, NextFunction } from 'express';
import { stockMovementService } from './stockMovement.service';

export class StockMovementController {
  async createStockMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const movement = await stockMovementService.createStockMovement(req.body, userId);
      res.status(201).json({
        status: 'success',
        message: 'Stock movement recorded successfully',
        data: movement,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await stockMovementService.getStockMovements(req.query as any);
      res.status(200).json({
        status: 'success',
        message: 'Stock movements retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockMovementById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const movement = await stockMovementService.getStockMovementById(id);
      res.status(200).json({
        status: 'success',
        message: 'Stock movement details retrieved successfully',
        data: movement,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const stockMovementController = new StockMovementController();
