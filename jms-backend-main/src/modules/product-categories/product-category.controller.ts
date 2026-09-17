import { Request, Response, NextFunction } from 'express';
import { productCategoryService, ProductCategoryService } from './product-category.service';

export class ProductCategoryController {
  constructor(private service: ProductCategoryService = productCategoryService) {}

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'Product category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getCategories(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const category = await this.service.getCategoryById(id);
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const category = await this.service.updateCategory(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Product category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteCategory(id);
      res.status(200).json({
        success: true,
        message: 'Product category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const productCategoryController = new ProductCategoryController();
