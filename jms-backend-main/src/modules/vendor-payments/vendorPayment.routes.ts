import { Router } from 'express';
import { vendorPaymentController } from './vendorPayment.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createVendorPaymentSchema,
  reverseVendorPaymentSchema,
  vendorPaymentParamSchema,
  vendorPaymentQuerySchema,
} from './vendorPayment.validation';

const router = Router();

// All vendor payment endpoints require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/vendor-payments
 * @desc    List vendor payments with filters and pagination
 * @access  Private (vendor_payment.read)
 */
router.get(
  '/',
  requirePermission('vendor_payment.read'),
  validate({ query: vendorPaymentQuerySchema }),
  vendorPaymentController.getAllVendorPayments
);

/**
 * @route   GET /api/v1/vendor-payments/:id
 * @desc    Get single vendor payment details by ID
 * @access  Private (vendor_payment.read)
 */
router.get(
  '/:id',
  requirePermission('vendor_payment.read'),
  validate({ params: vendorPaymentParamSchema }),
  vendorPaymentController.getVendorPaymentById
);

/**
 * @route   POST /api/v1/vendor-payments/:id/reverse
 * @desc    Reverse a completed vendor payment with mandatory reason
 * @access  Private (vendor_payment.reverse)
 */
router.post(
  '/:id/reverse',
  requirePermission('vendor_payment.reverse'),
  validate({ params: vendorPaymentParamSchema, body: reverseVendorPaymentSchema }),
  vendorPaymentController.reverseVendorPayment
);

export default router;

// Sub-router for /api/v1/purchase-bills/:id/...
export const billVendorPaymentRouter = Router();
billVendorPaymentRouter.use(authenticateToken);

/**
 * @route   POST /api/v1/purchase-bills/:id/payments
 * @desc    Create a vendor payment against a purchase bill
 * @access  Private (vendor_payment.create)
 */
billVendorPaymentRouter.post(
  '/:id/payments',
  requirePermission('vendor_payment.create'),
  validate({ params: vendorPaymentParamSchema, body: createVendorPaymentSchema }),
  vendorPaymentController.createVendorPayment
);

/**
 * @route   GET /api/v1/purchase-bills/:id/payments
 * @desc    Get payment history for a purchase bill
 * @access  Private (vendor_payment.read)
 */
billVendorPaymentRouter.get(
  '/:id/payments',
  requirePermission('vendor_payment.read'),
  validate({ params: vendorPaymentParamSchema }),
  vendorPaymentController.getPurchaseBillPaymentHistory
);

/**
 * @route   GET /api/v1/purchase-bills/:id/payment-summary
 * @desc    Get payment summary for a purchase bill (method totals, total paid, outstanding)
 * @access  Private (vendor_payment.read)
 */
billVendorPaymentRouter.get(
  '/:id/payment-summary',
  requirePermission('vendor_payment.read'),
  validate({ params: vendorPaymentParamSchema }),
  vendorPaymentController.getPurchaseBillPaymentSummary
);

// Sub-router for /api/v1/vendors/:id/...
export const vendorPayableRouter = Router();
vendorPayableRouter.use(authenticateToken);

/**
 * @route   GET /api/v1/vendors/:id/payments
 * @desc    Get payment history for a vendor
 * @access  Private (vendor_payment.read)
 */
vendorPayableRouter.get(
  '/:id/payments',
  requirePermission('vendor_payment.read'),
  validate({ params: vendorPaymentParamSchema }),
  vendorPaymentController.getVendorPaymentHistory
);

/**
 * @route   GET /api/v1/vendors/:id/payable-summary
 * @desc    Get vendor payable summary (approved bills, paid, outstanding, overdue)
 * @access  Private (vendor_payment.read)
 */
vendorPayableRouter.get(
  '/:id/payable-summary',
  requirePermission('vendor_payment.read'),
  validate({ params: vendorPaymentParamSchema }),
  vendorPaymentController.getVendorPayableSummary
);
