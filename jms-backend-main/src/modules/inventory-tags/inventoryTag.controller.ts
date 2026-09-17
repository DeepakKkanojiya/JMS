import { Request, Response, NextFunction } from 'express';
import { inventoryTagService } from './inventoryTag.service';

export class InventoryTagController {
  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const inventoryItemId = req.params.id as string;
      const tag = await inventoryTagService.createOrAssignTag(inventoryItemId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Inventory tag created successfully',
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTagByInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const inventoryItemId = req.params.id as string;
      const tag = await inventoryTagService.getTagByInventoryItem(inventoryItemId);
      res.status(200).json({
        status: 'success',
        message: 'Inventory tag details retrieved successfully',
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTag(req: Request, res: Response, next: NextFunction) {
    try {
      const inventoryItemId = req.params.id as string;
      const updatedTag = await inventoryTagService.updateTag(inventoryItemId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Inventory tag updated successfully',
        data: updatedTag,
      });
    } catch (error) {
      next(error);
    }
  }

  async regenerateTag(req: Request, res: Response, next: NextFunction) {
    try {
      const inventoryItemId = req.params.id as string;
      const tag = await inventoryTagService.regenerateTag(inventoryItemId);
      res.status(200).json({
        status: 'success',
        message: 'Inventory tag regenerated successfully',
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTagStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const inventoryItemId = req.params.id as string;
      const { isActive } = req.body;
      const tag = await inventoryTagService.updateTagStatus(inventoryItemId, isActive);
      res.status(200).json({
        status: 'success',
        message: `Inventory tag ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }



  async getByBarcode(req: Request, res: Response, next: NextFunction) {
    try {
      const barcode = req.params.barcode as string;
      const tag = await inventoryTagService.getTagByBarcode(barcode);
      res.status(200).json({
        status: 'success',
        message: 'Inventory tag details retrieved by barcode successfully',
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadBarcode(req: Request, res: Response, next: NextFunction) {
    try {
      const barcode = req.params.barcode as string;
      const downloadData = await inventoryTagService.generateBarcodeDownload(barcode);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="barcode-${barcode}.svg"`);
      res.status(200).send(downloadData);
    } catch (error) {
      next(error);
    }
  }

  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventoryTagService.getTags(req.query as any);
      res.status(200).json({
        status: 'success',
        message: 'Inventory tags retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryTagController = new InventoryTagController();
