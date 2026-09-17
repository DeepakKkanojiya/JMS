import { Router } from 'express';
import { salesPaymentController } from './salesPayment.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createSalesPaymentSchema,
  reverseSalesPaymentSchema,
  salesPaymentParamSchema,
  salesInvoiceParamSchema,
  salesPaymentQuerySchema,
} from './salesPayment.validation';

const router = Router();

router.use(authenticateToken);

// 1. Create Payment
router.post(
  '/',
  requirePermission('sales_payment.create'),
  validate(createSalesPaymentSchema),
  salesPaymentController.createPayment
);

// 2. List Payments
router.get(
  '/',
  requirePermission('sales_payment.read'),
  validate({ query: salesPaymentQuerySchema }),
  salesPaymentController.getAllPayments
);

// 3. Get Payment by ID
router.get(
  '/:id',
  requirePermission('sales_payment.read'),
  validate({ params: salesPaymentParamSchema }),
  salesPaymentController.getPaymentById
);

// 4. Reverse Payment
router.post(
  '/:id/reverse',
  requirePermission('sales_payment.reverse'),
  validate({ params: salesPaymentParamSchema, body: reverseSalesPaymentSchema }),
  salesPaymentController.reversePayment
);

export const salesPaymentRoutes = router;

// Invoice-nested payment history & summary routes
const invoicePaymentRouter = Router();
invoicePaymentRouter.use(authenticateToken);

invoicePaymentRouter.get(
  '/:id/payments',
  requirePermission('sales_payment.read'),
  validate({ params: salesInvoiceParamSchema, query: salesPaymentQuerySchema }),
  salesPaymentController.getInvoicePaymentHistory
);

invoicePaymentRouter.get(
  '/:id/payment-summary',
  requirePermission('sales_payment.read'),
  validate({ params: salesInvoiceParamSchema }),
  salesPaymentController.getInvoicePaymentSummary
);

export { invoicePaymentRouter };
