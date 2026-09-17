import { Router } from 'express';
import { productCategoryController } from './product-category.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createProductCategorySchema,
  updateProductCategorySchema,
  productCategoryParamSchema,
  productCategoryQuerySchema,
} from './product-category.validation';

const router = Router();

// All product category routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/product-categories
 * @desc    Create a new product category
 * @access  Private (product_category.create)
 */
router.post(
  '/',
  requirePermission('product_category.create'),
  validate({ body: createProductCategorySchema }),
  productCategoryController.createCategory
);

/**
 * @route   GET /api/v1/product-categories
 * @desc    Get paginated product category list
 * @access  Private (product_category.read)
 */
router.get(
  '/',
  requirePermission('product_category.read'),
  validate({ query: productCategoryQuerySchema }),
  productCategoryController.getCategories
);

/**
 * @route   GET /api/v1/product-categories/:id
 * @desc    Get product category profile by ID
 * @access  Private (product_category.read)
 */
router.get(
  '/:id',
  requirePermission('product_category.read'),
  validate({ params: productCategoryParamSchema }),
  productCategoryController.getCategoryById
);

/**
 * @route   PUT /api/v1/product-categories/:id
 * @desc    Update product category profile
 * @access  Private (product_category.update)
 */
router.put(
  '/:id',
  requirePermission('product_category.update'),
  validate({ params: productCategoryParamSchema, body: updateProductCategorySchema }),
  productCategoryController.updateCategory
);

/**
 * @route   DELETE /api/v1/product-categories/:id
 * @desc    Delete product category
 * @access  Private (product_category.delete)
 */
router.delete(
  '/:id',
  requirePermission('product_category.delete'),
  validate({ params: productCategoryParamSchema }),
  productCategoryController.deleteCategory
);

export default router;
