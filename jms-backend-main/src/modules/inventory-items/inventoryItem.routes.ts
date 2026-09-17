import { Router } from 'express';
import { inventoryItemController } from './inventoryItem.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  inventoryItemParamSchema,
  inventoryItemQuerySchema,
} from './inventoryItem.validation';

const router = Router();

// All inventory item routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/inventory-items
 * @desc    Create a new physical inventory item and tag
 * @access  Private (inventory_item.create)
 */
router.post(
  '/',
  requirePermission('inventory_item.create'),
  validate({ body: createInventoryItemSchema }),
  inventoryItemController.createInventoryItem
);

/**
 * @route   GET /api/v1/inventory-items
 * @desc    Get paginated inventory items with filters and search
 * @access  Private (inventory_item.read)
 */
router.get(
  '/',
  requirePermission('inventory_item.read'),
  validate({ query: inventoryItemQuerySchema }),
  inventoryItemController.getInventoryItems
);

/**
 * @route   GET /api/v1/inventory-items/:id/history
 * @desc    Get inventory item stock movements and adjustments audit log
 * @access  Private (inventory_item.read)
 */
router.get(
  '/:id/history',
  requirePermission('inventory_item.read'),
  validate({ params: inventoryItemParamSchema }),
  inventoryItemController.getInventoryItemHistory
);

/**
 * @route   GET /api/v1/inventory-items/:id
 * @desc    Get single inventory item details with tag and product
 * @access  Private (inventory_item.read)
 */
router.get(
  '/:id',
  requirePermission('inventory_item.read'),
  validate({ params: inventoryItemParamSchema }),
  inventoryItemController.getInventoryItemById
);

/**
 * @route   PUT /api/v1/inventory-items/:id
 * @desc    Update inventory item attributes/status
 * @access  Private (inventory_item.update)
 */
router.put(
  '/:id',
  requirePermission('inventory_item.update'),
  validate({ params: inventoryItemParamSchema, body: updateInventoryItemSchema }),
  inventoryItemController.updateInventoryItem
);

/**
 * @route   DELETE /api/v1/inventory-items/:id
 * @desc    Delete inventory item (audit-protected)
 * @access  Private (inventory_item.delete)
 */
router.delete(
  '/:id',
  requirePermission('inventory_item.delete'),
  validate({ params: inventoryItemParamSchema }),
  inventoryItemController.deleteInventoryItem
);

export default router;
