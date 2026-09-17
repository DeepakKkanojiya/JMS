import { Router } from 'express';
import { stockMovementController } from './stockMovement.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createStockMovementSchema,
  stockMovementParamSchema,
  stockMovementQuerySchema,
} from './stockMovement.validation';

const router = Router();

// All stock movement routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/stock-movements
 * @desc    Record a new physical stock movement (immutable ledger record)
 * @access  Private (stock_movement.create)
 */
router.post(
  '/',
  requirePermission('stock_movement.create'),
  validate({ body: createStockMovementSchema }),
  stockMovementController.createStockMovement
);

/**
 * @route   GET /api/v1/stock-movements
 * @desc    Get paginated stock movements ledger with search and filters
 * @access  Private (stock_movement.read)
 */
router.get(
  '/',
  requirePermission('stock_movement.read'),
  validate({ query: stockMovementQuerySchema }),
  stockMovementController.getStockMovements
);

/**
 * @route   GET /api/v1/stock-movements/:id
 * @desc    Get single stock movement audit details
 * @access  Private (stock_movement.read)
 */
router.get(
  '/:id',
  requirePermission('stock_movement.read'),
  validate({ params: stockMovementParamSchema }),
  stockMovementController.getStockMovementById
);

export default router;
