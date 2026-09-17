import { Router } from 'express';
import { productController } from './product.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productParamSchema,
  productQuerySchema,
} from './product.validation';

const router = Router();

// All product routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product profile
 * @access  Private (product.create)
 */
router.post(
  '/',
  requirePermission('product.create'),
  validate({ body: createProductSchema }),
  productController.createProduct
);

/**
 * @route   GET /api/v1/products
 * @desc    Get paginated product list
 * @access  Private (product.read)
 */
router.get(
  '/',
  requirePermission('product.read'),
  validate({ query: productQuerySchema }),
  productController.getProducts
);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product details by ID
 * @access  Private (product.read)
 */
router.get(
  '/:id',
  requirePermission('product.read'),
  validate({ params: productParamSchema }),
  productController.getProductById
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product details
 * @access  Private (product.update)
 */
router.put(
  '/:id',
  requirePermission('product.update'),
  validate({ params: productParamSchema, body: updateProductSchema }),
  productController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private (product.delete)
 */
router.delete(
  '/:id',
  requirePermission('product.delete'),
  validate({ params: productParamSchema }),
  productController.deleteProduct
);

export default router;
