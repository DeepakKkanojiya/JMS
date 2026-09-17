import { Router } from 'express';
import { inventoryItemImageController } from './inventoryItemImage.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { uploadSingleImage } from '../../middleware/upload.middleware';
import { inventoryItemImageParamSchema, updateInventoryItemImageSchema } from './inventoryItemImage.validation';

const router = Router({ mergeParams: true });

// All inventory item image routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/inventory-items/:inventoryItemId/images
 * @desc    Upload physical jewellery item photograph
 * @access  Private (inventory_item_image.create)
 */
router.post(
  '/',
  requirePermission('inventory_item_image.create'),
  uploadSingleImage,
  validate({ params: inventoryItemImageParamSchema }),
  inventoryItemImageController.uploadImage
);

/**
 * @route   GET /api/v1/inventory-items/:inventoryItemId/images
 * @desc    Get all physical item photographs
 * @access  Private (inventory_item_image.read)
 */
router.get(
  '/',
  requirePermission('inventory_item_image.read'),
  validate({ params: inventoryItemImageParamSchema }),
  inventoryItemImageController.getImages
);

/**
 * @route   PUT /api/v1/inventory-items/:inventoryItemId/images/:imageId
 * @desc    Update inventory item image metadata (altText, isPrimary, sortOrder)
 * @access  Private (inventory_item_image.update)
 */
router.put(
  '/:imageId',
  requirePermission('inventory_item_image.update'),
  validate({ params: inventoryItemImageParamSchema, body: updateInventoryItemImageSchema }),
  inventoryItemImageController.updateImage
);

/**
 * @route   DELETE /api/v1/inventory-items/:inventoryItemId/images/:imageId
 * @desc    Delete inventory item image record & storage file
 * @access  Private (inventory_item_image.delete)
 */
router.delete(
  '/:imageId',
  requirePermission('inventory_item_image.delete'),
  validate({ params: inventoryItemImageParamSchema }),
  inventoryItemImageController.deleteImage
);

export default router;
