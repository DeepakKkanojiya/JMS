import { Request, Response, NextFunction } from 'express';
import { inventoryItemImageService } from './inventoryItemImage.service';

export class InventoryItemImageController {
  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const inventoryItemId = req.params.inventoryItemId as string;
      const file = req.file;
      const result = await inventoryItemImageService.uploadImage(inventoryItemId, file, req.body);

      res.status(201).json({
        success: true,
        message: 'Inventory item image uploaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const inventoryItemId = req.params.inventoryItemId as string;
      const result = await inventoryItemImageService.getImages(inventoryItemId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const inventoryItemId = req.params.inventoryItemId as string;
      const imageId = req.params.imageId as string;
      const result = await inventoryItemImageService.updateImage(inventoryItemId, imageId, req.body);

      res.status(200).json({
        success: true,
        message: 'Inventory item image updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const inventoryItemId = req.params.inventoryItemId as string;
      const imageId = req.params.imageId as string;
      const result = await inventoryItemImageService.deleteImage(inventoryItemId, imageId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const inventoryItemImageController = new InventoryItemImageController();
