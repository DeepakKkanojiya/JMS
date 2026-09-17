import { Router } from 'express';
import { purchaseReturnController } from './purchaseReturn.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createPurchaseReturnSchema,
  updatePurchaseReturnSchema,
  cancelPurchaseReturnSchema,
  purchaseReturnParamSchema,
  purchaseReturnQuerySchema,
  debitNoteQuerySchema,
} from './purchaseReturn.validation';

const router = Router();

router.use(authenticateToken);

/**
 * @route   POST /api/v1/purchase-returns
 * @desc    Create a draft purchase return
 * @access  Private (purchase_return.create)
 */
router.post(
  '/',
  requirePermission('purchase_return.create'),
  validate({ body: createPurchaseReturnSchema }),
  purchaseReturnController.createPurchaseReturn
);

/**
 * @route   GET /api/v1/purchase-returns
 * @desc    List paginated purchase returns
 * @access  Private (purchase_return.read)
 */
router.get(
  '/',
  requirePermission('purchase_return.read'),
  validate({ query: purchaseReturnQuerySchema }),
  purchaseReturnController.getAllPurchaseReturns
);

/**
 * @route   GET /api/v1/purchase-returns/:id
 * @desc    Get purchase return details by ID
 * @access  Private (purchase_return.read)
 */
router.get(
  '/:id',
  requirePermission('purchase_return.read'),
  validate({ params: purchaseReturnParamSchema }),
  purchaseReturnController.getPurchaseReturnById
);

/**
 * @route   PUT /api/v1/purchase-returns/:id
 * @desc    Update draft purchase return
 * @access  Private (purchase_return.update)
 */
router.put(
  '/:id',
  requirePermission('purchase_return.update'),
  validate({ params: purchaseReturnParamSchema, body: updatePurchaseReturnSchema }),
  purchaseReturnController.updatePurchaseReturn
);

/**
 * @route   POST /api/v1/purchase-returns/:id/submit
 * @desc    Submit draft purchase return for review
 * @access  Private (purchase_return.submit)
 */
router.post(
  '/:id/submit',
  requirePermission('purchase_return.submit'),
  validate({ params: purchaseReturnParamSchema }),
  purchaseReturnController.submitPurchaseReturn
);

/**
 * @route   POST /api/v1/purchase-returns/:id/approve
 * @desc    Approve submitted purchase return
 * @access  Private (purchase_return.approve)
 */
router.post(
  '/:id/approve',
  requirePermission('purchase_return.approve'),
  validate({ params: purchaseReturnParamSchema }),
  purchaseReturnController.approvePurchaseReturn
);

/**
 * @route   POST /api/v1/purchase-returns/:id/process
 * @desc    Process approved purchase return, update inventory stock, issue Vendor Debit Note
 * @access  Private (purchase_return.process)
 */
router.post(
  '/:id/process',
  requirePermission('purchase_return.process'),
  validate({ params: purchaseReturnParamSchema }),
  purchaseReturnController.processPurchaseReturn
);

/**
 * @route   POST /api/v1/purchase-returns/:id/cancel
 * @desc    Cancel purchase return with mandatory reason
 * @access  Private (purchase_return.cancel)
 */
router.post(
  '/:id/cancel',
  requirePermission('purchase_return.cancel'),
  validate({ params: purchaseReturnParamSchema, body: cancelPurchaseReturnSchema }),
  purchaseReturnController.cancelPurchaseReturn
);

export default router;

// Debit Notes router
export const debitNoteRouter = Router();
debitNoteRouter.use(authenticateToken);

/**
 * @route   GET /api/v1/vendor-debit-notes
 * @desc    List vendor debit notes with filters and pagination
 * @access  Private (debit_note.read)
 */
debitNoteRouter.get(
  '/',
  requirePermission('debit_note.read'),
  validate({ query: debitNoteQuerySchema }),
  purchaseReturnController.getAllDebitNotes
);

/**
 * @route   GET /api/v1/vendor-debit-notes/:id
 * @desc    Get single vendor debit note details
 * @access  Private (debit_note.read)
 */
debitNoteRouter.get(
  '/:id',
  requirePermission('debit_note.read'),
  validate({ params: purchaseReturnParamSchema }),
  purchaseReturnController.getDebitNoteById
);

// Vendor Debit Notes sub-router for /api/v1/vendors/:id/debit-notes
export const vendorDebitNoteRouter = Router();
vendorDebitNoteRouter.use(authenticateToken);

/**
 * @route   GET /api/v1/vendors/:id/debit-notes
 * @desc    Get debit notes for a vendor
 * @access  Private (debit_note.read)
 */
vendorDebitNoteRouter.get(
  '/:id/debit-notes',
  requirePermission('debit_note.read'),
  validate({ params: purchaseReturnParamSchema }),
  purchaseReturnController.getDebitNotesByVendor
);
