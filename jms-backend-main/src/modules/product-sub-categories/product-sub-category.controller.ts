import { Request, Response, NextFunction } from 'express';
import { productSubCategoryService, ProductSubCategoryService } from './product-sub-category.service';

export class ProductSubCategoryController {
  constructor(private service: ProductSubCategoryService = productSubCategoryService) {}

  createSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subCategory = await this.service.createSubCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'Product sub-category created successfully',
        data: subCategory,
      });
    } catch (error) {
      next(error);
    }
  };

  getSubCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getSubCategories(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getSubCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const subCategory = await this.service.getSubCategoryById(id);
      res.status(200).json({
        success: true,
        data: subCategory,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const subCategory = await this.service.updateSubCategory(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Product sub-category updated successfully',
        data: subCategory,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteSubCategory(id);
      res.status(200).json({
        success: true,
        message: 'Product sub-category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const productSubCategoryController = new ProductSubCategoryController();
