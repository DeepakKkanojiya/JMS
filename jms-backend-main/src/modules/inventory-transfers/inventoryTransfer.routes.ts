import { Router } from 'express';
import { inventoryTransferController } from './inventoryTransfer.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createTransferSchema,
  rejectTransferSchema,
  transferParamSchema,
  transferQuerySchema,
} from './inventoryTransfer.validation';

const router = Router();

// Require authentication for all branch transfer routes
router.use(authenticateToken);

/**
 * @route   POST /api/v1/inventory-transfers
 * @desc    Create a new branch stock transfer request
 * @access  Private (inventory_transfer.create)
 */
router.post(
  '/',
  requirePermission('inventory_transfer.create'),
  validate({ body: createTransferSchema }),
  inventoryTransferController.createTransfer
);

/**
 * @route   GET /api/v1/inventory-transfers
 * @desc    Get paginated inventory transfer requests list with filters and search
 * @access  Private (inventory_transfer.read)
 */
router.get(
  '/',
  requirePermission('inventory_transfer.read'),
  validate({ query: transferQuerySchema }),
  inventoryTransferController.getTransfers
);

/**
 * @route   GET /api/v1/inventory-transfers/:id
 * @desc    Get transfer request details by ID
 * @access  Private (inventory_transfer.read)
 */
router.get(
  '/:id',
  requirePermission('inventory_transfer.read'),
  validate({ params: transferParamSchema }),
  inventoryTransferController.getTransferById
);

/**
 * @route   POST /api/v1/inventory-transfers/:id/approve
 * @desc    Approve a pending transfer request
 * @access  Private (inventory_transfer.approve)
 */
router.post(
  '/:id/approve',
  requirePermission('inventory_transfer.approve'),
  validate({ params: transferParamSchema }),
  inventoryTransferController.approveTransfer
);

/**
 * @route   POST /api/v1/inventory-transfers/:id/reject
 * @desc    Reject a pending transfer request with reason
 * @access  Private (inventory_transfer.reject)
 */
router.post(
  '/:id/reject',
  requirePermission('inventory_transfer.reject'),
  validate({ params: transferParamSchema, body: rejectTransferSchema }),
  inventoryTransferController.rejectTransfer
);

/**
 * @route   POST /api/v1/inventory-transfers/:id/dispatch
 * @desc    Dispatch an approved transfer request (sets item in-transit & logs StockMovement)
 * @access  Private (inventory_transfer.dispatch)
 */
router.post(
  '/:id/dispatch',
  requirePermission('inventory_transfer.dispatch'),
  validate({ params: transferParamSchema }),
  inventoryTransferController.dispatchTransfer
);

/**
 * @route   POST /api/v1/inventory-transfers/:id/receive
 * @desc    Receive a dispatched transfer request (updates item branchId & restores status to AVAILABLE)
 * @access  Private (inventory_transfer.receive)
 */
router.post(
  '/:id/receive',
  requirePermission('inventory_transfer.receive'),
  validate({ params: transferParamSchema }),
  inventoryTransferController.receiveTransfer
);

export default router;
