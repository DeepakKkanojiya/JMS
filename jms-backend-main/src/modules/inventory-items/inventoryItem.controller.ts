import { Request, Response, NextFunction } from 'express';
import { inventoryItemService } from './inventoryItem.service';

export class InventoryItemController {
  async createInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const item = await inventoryItemService.createInventoryItem(req.body, userId);
      res.status(201).json({
        status: 'success',
        message: 'Inventory item created successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryItems(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventoryItemService.getInventoryItems(req.query as any);
      res.status(200).json({
        status: 'success',
        message: 'Inventory items retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const item = await inventoryItemService.getInventoryItemById(id);
      res.status(200).json({
        status: 'success',
        message: 'Inventory item details retrieved successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryItemHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const history = await inventoryItemService.getInventoryItemHistory(id);
      res.status(200).json({
        status: 'success',
        message: 'Inventory item history retrieved successfully',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id;
      const updatedItem = await inventoryItemService.updateInventoryItem(id, req.body, userId);
      res.status(200).json({
        status: 'success',
        message: 'Inventory item updated successfully',
        data: updatedItem,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await inventoryItemService.deleteInventoryItem(id);
      res.status(200).json({
        status: 'success',
        message: 'Inventory item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryItemController = new InventoryItemController();
