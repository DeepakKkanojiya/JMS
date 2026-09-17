import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  purchaseReceiptParamSchema,
  purchaseReceiptQuerySchema,
  purchaseOrderParamSchema,
} from './purchase.validation';

const router = Router();

router.use(authenticateToken);

/**
 * @route   GET /api/v1/purchase-receipts
 * @desc    List all purchase receipts
 * @access  Private (purchase.receipt.read)
 */
router.get(
  '/',
  requirePermission('purchase.receipt.read'),
  validate({ query: purchaseReceiptQuerySchema }),
  purchaseController.listPurchaseReceipts
);

/**
 * @route   GET /api/v1/purchase-receipts/:id
 * @desc    Get single purchase receipt by ID
 * @access  Private (purchase.receipt.read)
 */
router.get(
  '/:id',
  requirePermission('purchase.receipt.read'),
  validate({ params: purchaseOrderParamSchema }),
  purchaseController.getPurchaseReceiptById
);

export default router;
