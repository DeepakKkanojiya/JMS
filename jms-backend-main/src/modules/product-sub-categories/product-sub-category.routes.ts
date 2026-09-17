import { Router } from 'express';
import { productSubCategoryController } from './product-sub-category.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createProductSubCategorySchema,
  updateProductSubCategorySchema,
  productSubCategoryParamSchema,
  productSubCategoryQuerySchema,
} from './product-sub-category.validation';

const router = Router();

// All product sub-category routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/product-sub-categories
 * @desc    Create a new product sub-category
 * @access  Private (product_sub_category.create)
 */
router.post(
  '/',
  requirePermission('product_sub_category.create'),
  validate({ body: createProductSubCategorySchema }),
  productSubCategoryController.createSubCategory
);

/**
 * @route   GET /api/v1/product-sub-categories
 * @desc    Get paginated product sub-category list
 * @access  Private (product_sub_category.read)
 */
router.get(
  '/',
  requirePermission('product_sub_category.read'),
  validate({ query: productSubCategoryQuerySchema }),
  productSubCategoryController.getSubCategories
);

/**
 * @route   GET /api/v1/product-sub-categories/:id
 * @desc    Get product sub-category details by ID
 * @access  Private (product_sub_category.read)
 */
router.get(
  '/:id',
  requirePermission('product_sub_category.read'),
  validate({ params: productSubCategoryParamSchema }),
  productSubCategoryController.getSubCategoryById
);

/**
 * @route   PUT /api/v1/product-sub-categories/:id
 * @desc    Update product sub-category details
 * @access  Private (product_sub_category.update)
 */
router.put(
  '/:id',
  requirePermission('product_sub_category.update'),
  validate({ params: productSubCategoryParamSchema, body: updateProductSubCategorySchema }),
  productSubCategoryController.updateSubCategory
);

/**
 * @route   DELETE /api/v1/product-sub-categories/:id
 * @desc    Delete product sub-category
 * @access  Private (product_sub_category.delete)
 */
router.delete(
  '/:id',
  requirePermission('product_sub_category.delete'),
  validate({ params: productSubCategoryParamSchema }),
  productSubCategoryController.deleteSubCategory
);

export default router;
