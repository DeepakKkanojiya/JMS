import { Router } from 'express';
import { purchaseBillController } from './purchaseBill.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createPurchaseBillSchema,
  updatePurchaseBillSchema,
  cancelPurchaseBillSchema,
  purchaseBillParamSchema,
  purchaseBillQuerySchema,
} from './purchaseBill.validation';

const router = Router();

// All purchase bill endpoints require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/purchase-bills
 * @desc    Create a new DRAFT purchase bill
 * @access  Private (purchase_bill.create)
 */
router.post(
  '/',
  requirePermission('purchase_bill.create'),
  validate({ body: createPurchaseBillSchema }),
  purchaseBillController.createPurchaseBill
);

/**
 * @route   GET /api/v1/purchase-bills
 * @desc    Get paginated purchase bills with search, vendor, branch, PO, status, and date filters
 * @access  Private (purchase_bill.read)
 */
router.get(
  '/',
  requirePermission('purchase_bill.read'),
  validate({ query: purchaseBillQuerySchema }),
  purchaseBillController.listPurchaseBills
);

/**
 * @route   GET /api/v1/purchase-bills/:id/summary
 * @desc    Get purchase bill summary (totals & status)
 * @access  Private (purchase_bill.read)
 */
router.get(
  '/:id/summary',
  requirePermission('purchase_bill.read'),
  validate({ params: purchaseBillParamSchema }),
  purchaseBillController.getPurchaseBillSummary
);

/**
 * @route   GET /api/v1/purchase-bills/:id
 * @desc    Get single purchase bill details with line items, vendor, branch, PO
 * @access  Private (purchase_bill.read)
 */
router.get(
  '/:id',
  requirePermission('purchase_bill.read'),
  validate({ params: purchaseBillParamSchema }),
  purchaseBillController.getPurchaseBillById
);

/**
 * @route   PUT /api/v1/purchase-bills/:id
 * @desc    Update a DRAFT purchase bill
 * @access  Private (purchase_bill.update)
 */
router.put(
  '/:id',
  requirePermission('purchase_bill.update'),
  validate({ params: purchaseBillParamSchema, body: updatePurchaseBillSchema }),
  purchaseBillController.updatePurchaseBill
);

/**
 * @route   POST /api/v1/purchase-bills/:id/submit
 * @desc    Submit a DRAFT purchase bill (DRAFT -> SUBMITTED)
 * @access  Private (purchase_bill.submit)
 */
router.post(
  '/:id/submit',
  requirePermission('purchase_bill.submit'),
  validate({ params: purchaseBillParamSchema }),
  purchaseBillController.submitPurchaseBill
);

/**
 * @route   POST /api/v1/purchase-bills/:id/approve
 * @desc    Approve a SUBMITTED purchase bill (SUBMITTED -> APPROVED)
 * @access  Private (purchase_bill.approve)
 */
router.post(
  '/:id/approve',
  requirePermission('purchase_bill.approve'),
  validate({ params: purchaseBillParamSchema }),
  purchaseBillController.approvePurchaseBill
);

/**
 * @route   POST /api/v1/purchase-bills/:id/cancel
 * @desc    Cancel a DRAFT or SUBMITTED purchase bill with mandatory reason
 * @access  Private (purchase_bill.cancel)
 */
router.post(
  '/:id/cancel',
  requirePermission('purchase_bill.cancel'),
  validate({ params: purchaseBillParamSchema, body: cancelPurchaseBillSchema }),
  purchaseBillController.cancelPurchaseBill
);

export default router;

// Helper router for /api/v1/purchases/:id/bills
export const poPurchaseBillRouter = Router();
poPurchaseBillRouter.use(authenticateToken);
poPurchaseBillRouter.get(
  '/:id/bills',
  requirePermission('purchase_bill.read'),
  validate({ params: purchaseBillParamSchema }),
  purchaseBillController.getPurchaseBillsByPO
);

// Helper router for /api/v1/vendors/:id/purchase-bills
export const vendorPurchaseBillRouter = Router();
vendorPurchaseBillRouter.use(authenticateToken);
vendorPurchaseBillRouter.get(
  '/:id/purchase-bills',
  requirePermission('purchase_bill.read'),
  validate({ params: purchaseBillParamSchema }),
  purchaseBillController.getPurchaseBillsByVendor
);
