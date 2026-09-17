import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  cancelPurchaseOrderSchema,
  purchaseOrderParamSchema,
  purchaseOrderQuerySchema,
  purchaseReceiveSchema,
  purchaseReceiptParamSchema,
} from './purchase.validation';

const router = Router();

// All purchase order endpoints require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/purchases
 * @desc    Create a new DRAFT purchase order
 * @access  Private (purchase.create)
 */
router.post(
  '/',
  requirePermission('purchase.create'),
  validate({ body: createPurchaseOrderSchema }),
  purchaseController.createPurchaseOrder
);

/**
 * @route   GET /api/v1/purchases
 * @desc    Get paginated purchase orders with search, vendor, branch, status, and date filters
 * @access  Private (purchase.read)
 */
router.get(
  '/',
  requirePermission('purchase.read'),
  validate({ query: purchaseOrderQuerySchema }),
  purchaseController.listPurchaseOrders
);

/**
 * @route   GET /api/v1/purchases/:id
 * @desc    Get single purchase order details with line items, vendor, and branch
 * @access  Private (purchase.read)
 */
router.get(
  '/:id',
  requirePermission('purchase.read'),
  validate({ params: purchaseOrderParamSchema }),
  purchaseController.getPurchaseOrderById
);

/**
 * @route   PUT /api/v1/purchases/:id
 * @route   PATCH /api/v1/purchases/:id
 * @desc    Update a DRAFT purchase order
 * @access  Private (purchase.update)
 */
router.put(
  '/:id',
  requirePermission('purchase.update'),
  validate({ params: purchaseOrderParamSchema, body: updatePurchaseOrderSchema }),
  purchaseController.updatePurchaseOrder
);

router.patch(
  '/:id',
  requirePermission('purchase.update'),
  validate({ params: purchaseOrderParamSchema, body: updatePurchaseOrderSchema }),
  purchaseController.updatePurchaseOrder
);

/**
 * @route   POST /api/v1/purchases/:id/submit
 * @desc    Submit a DRAFT purchase order for managerial approval (DRAFT -> SUBMITTED)
 * @access  Private (purchase.submit)
 */
router.post(
  '/:id/submit',
  requirePermission('purchase.submit'),
  validate({ params: purchaseOrderParamSchema }),
  purchaseController.submitPurchaseOrder
);

/**
 * @route   POST /api/v1/purchases/:id/approve
 * @desc    Approve a SUBMITTED purchase order (SUBMITTED -> APPROVED)
 * @access  Private (purchase.approve)
 */
router.post(
  '/:id/approve',
  requirePermission('purchase.approve'),
  validate({ params: purchaseOrderParamSchema }),
  purchaseController.approvePurchaseOrder
);

/**
 * @route   POST /api/v1/purchases/:id/cancel
 * @desc    Cancel a purchase order (DRAFT/SUBMITTED/APPROVED -> CANCELLED)
 * @access  Private (purchase.cancel)
 */
router.post(
  '/:id/cancel',
  requirePermission('purchase.cancel'),
  validate({ params: purchaseOrderParamSchema, body: cancelPurchaseOrderSchema }),
  purchaseController.cancelPurchaseOrder
);

/**
 * @route   POST /api/v1/purchases/:id/receive
 * @desc    Receive items against an APPROVED/RECEIVING purchase order
 * @access  Private (purchase.receive)
 */
router.post(
  '/:id/receive',
  requirePermission('purchase.receive'),
  validate({ params: purchaseOrderParamSchema, body: purchaseReceiveSchema }),
  purchaseController.receivePurchaseOrder
);

/**
 * @route   GET /api/v1/purchases/:id/receipts
 * @desc    Get receipts for a specific purchase order
 * @access  Private (purchase.receipt.read)
 */
router.get(
  '/:id/receipts',
  requirePermission('purchase.receipt.read'),
  validate({ params: purchaseOrderParamSchema }),
  purchaseController.getPurchaseOrderReceipts
);

/**
 * @route   GET /api/v1/purchases/:id/receipts/:receiptId
 * @desc    Get details of a specific receipt for a purchase order
 * @access  Private (purchase.receipt.read)
 */
router.get(
  '/:id/receipts/:receiptId',
  requirePermission('purchase.receipt.read'),
  validate({ params: purchaseReceiptParamSchema }),
  purchaseController.getPurchaseOrderReceiptById
);

export default router;
