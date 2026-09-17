import { Request, Response, NextFunction } from 'express';
import { productImageService } from './productImage.service';

export class ProductImageController {
  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.productId as string;
      const file = req.file;
      const result = await productImageService.uploadImage(productId, file, req.body);

      res.status(201).json({
        success: true,
        message: 'Product image uploaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.productId as string;
      const result = await productImageService.getImages(productId);

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
      const productId = req.params.productId as string;
      const imageId = req.params.imageId as string;
      const result = await productImageService.updateImage(productId, imageId, req.body);

      res.status(200).json({
        success: true,
        message: 'Product image updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.productId as string;
      const imageId = req.params.imageId as string;
      const result = await productImageService.deleteImage(productId, imageId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const productImageController = new ProductImageController();
