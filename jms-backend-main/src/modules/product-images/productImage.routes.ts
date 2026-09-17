import { Router } from 'express';
import { productImageController } from './productImage.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { uploadSingleImage } from '../../middleware/upload.middleware';
import { productImageParamSchema, updateProductImageSchema } from './productImage.validation';

const router = Router({ mergeParams: true });

// All product image routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/products/:productId/images
 * @desc    Upload generic jewellery design/master image
 * @access  Private (product_image.create)
 */
router.post(
  '/',
  requirePermission('product_image.create'),
  uploadSingleImage,
  validate({ params: productImageParamSchema }),
  productImageController.uploadImage
);

/**
 * @route   GET /api/v1/products/:productId/images
 * @desc    Get all design images for a product
 * @access  Private (product_image.read)
 */
router.get(
  '/',
  requirePermission('product_image.read'),
  validate({ params: productImageParamSchema }),
  productImageController.getImages
);

/**
 * @route   PUT /api/v1/products/:productId/images/:imageId
 * @desc    Update product image metadata (altText, isPrimary, sortOrder)
 * @access  Private (product_image.update)
 */
router.put(
  '/:imageId',
  requirePermission('product_image.update'),
  validate({ params: productImageParamSchema, body: updateProductImageSchema }),
  productImageController.updateImage
);

/**
 * @route   DELETE /api/v1/products/:productId/images/:imageId
 * @desc    Delete product image record & storage file
 * @access  Private (product_image.delete)
 */
router.delete(
  '/:imageId',
  requirePermission('product_image.delete'),
  validate({ params: productImageParamSchema }),
  productImageController.deleteImage
);

export default router;
