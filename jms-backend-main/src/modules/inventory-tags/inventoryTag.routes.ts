import { Router } from 'express';
import { inventoryTagController } from './inventoryTag.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createInventoryTagSchema,
  updateInventoryTagSchema,
  updateTagStatusSchema,
  inventoryTagParamSchema,
  inventoryTagBarcodeParamSchema,
  inventoryTagQuerySchema,
} from './inventoryTag.validation';

const router = Router();

// All inventory tag routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/inventory-tags
 * @desc    Get paginated inventory tags list with filters and search
 * @access  Private (inventory_tag.read)
 */
router.get(
  '/',
  requirePermission('inventory_tag.read'),
  validate({ query: inventoryTagQuerySchema }),
  inventoryTagController.getTags
);

/**
 * @route   GET /api/v1/inventory-tags/barcode/:barcode
 * @desc    Direct lookup inventory item and product details by barcode
 * @access  Private (inventory_tag.read)
 */
router.get(
  '/barcode/:barcode',
  requirePermission('inventory_tag.read'),
  validate({ params: inventoryTagBarcodeParamSchema }),
  inventoryTagController.getByBarcode
);

/**
 * @route   GET /api/v1/inventory-tags/barcode/:barcode/download
 * @desc    Download vector SVG printable barcode tag for inventory item
 * @access  Private (inventory_tag.read)
 */
router.get(
  '/barcode/:barcode/download',
  requirePermission('inventory_tag.read'),
  validate({ params: inventoryTagBarcodeParamSchema }),
  inventoryTagController.downloadBarcode
);

export default router;

/**
 * Sub-router for /inventory-items/:id/tag routes
 */
export const itemTagRouter = Router();

itemTagRouter.use(authenticateToken);

/**
 * @route   POST /api/v1/inventory-items/:id/tag
 * @desc    Create or assign barcode/QR tag to inventory item
 * @access  Private (inventory_tag.create)
 */
itemTagRouter.post(
  '/:id/tag',
  requirePermission('inventory_tag.create'),
  validate({ params: inventoryTagParamSchema, body: createInventoryTagSchema }),
  inventoryTagController.createTag
);

/**
 * @route   GET /api/v1/inventory-items/:id/tag
 * @desc    Get tag details by inventory item ID
 * @access  Private (inventory_tag.read)
 */
itemTagRouter.get(
  '/:id/tag',
  requirePermission('inventory_tag.read'),
  validate({ params: inventoryTagParamSchema }),
  inventoryTagController.getTagByInventoryItem
);

/**
 * @route   PUT /api/v1/inventory-items/:id/tag
 * @desc    Update tag attributes (barcode, qrCode, rfidEpc, isActive)
 * @access  Private (inventory_tag.update)
 */
itemTagRouter.put(
  '/:id/tag',
  requirePermission('inventory_tag.update'),
  validate({ params: inventoryTagParamSchema, body: updateInventoryTagSchema }),
  inventoryTagController.updateTag
);

/**
 * @route   POST /api/v1/inventory-items/:id/tag/regenerate
 * @desc    Regenerate new barcode and QR code for inventory item
 * @access  Private (inventory_tag.update)
 */
itemTagRouter.post(
  '/:id/tag/regenerate',
  requirePermission('inventory_tag.update'),
  validate({ params: inventoryTagParamSchema }),
  inventoryTagController.regenerateTag
);

/**
 * @route   PATCH /api/v1/inventory-items/:id/tag/status
 * @desc    Activate or deactivate tag
 * @access  Private (inventory_tag.update)
 */
itemTagRouter.patch(
  '/:id/tag/status',
  requirePermission('inventory_tag.update'),
  validate({ params: inventoryTagParamSchema, body: updateTagStatusSchema }),
  inventoryTagController.updateTagStatus
);
