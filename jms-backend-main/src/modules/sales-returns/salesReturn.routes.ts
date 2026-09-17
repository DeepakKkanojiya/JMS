import { Router } from 'express';
import { SalesReturnController } from './salesReturn.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createSalesReturnSchema,
  approveSalesReturnSchema,
  processSalesReturnSchema,
  cancelSalesReturnSchema,
  findSalesReturnsQuerySchema,
  salesReturnIdParamSchema,
  invoiceIdParamSchema,
} from './salesReturn.validation';

const router = Router();
const controller = new SalesReturnController();

// Global Authentication for all Sales Return Endpoints
router.use(authenticateToken);

// Create Sales Return Request
router.post(
  '/',
  requirePermission('sales_return.create'),
  validate({ body: createSalesReturnSchema }),
  controller.createReturn
);

// List Sales Returns
router.get(
  '/',
  requirePermission('sales_return.read'),
  validate({ query: findSalesReturnsQuerySchema }),
  controller.getReturns
);

// Get Sales Return by ID
router.get(
  '/:id',
  requirePermission('sales_return.read'),
  validate({ params: salesReturnIdParamSchema }),
  controller.getReturnById
);

// Get Return Audit History
router.get(
  '/:id/history',
  requirePermission('sales_return.read'),
  validate({ params: salesReturnIdParamSchema }),
  controller.getReturnHistory
);

// Approve Sales Return
router.post(
  '/:id/approve',
  requirePermission('sales_return.approve'),
  validate({ params: salesReturnIdParamSchema, body: approveSalesReturnSchema }),
  controller.approveReturn
);

// Process Sales Return (Restores Inventory & Creates SALE_RETURN Stock Movement)
router.post(
  '/:id/process',
  requirePermission('sales_return.process'),
  validate({ params: salesReturnIdParamSchema, body: processSalesReturnSchema }),
  controller.processReturn
);

// Cancel Sales Return
router.post(
  '/:id/cancel',
  requirePermission('sales_return.cancel'),
  validate({ params: salesReturnIdParamSchema, body: cancelSalesReturnSchema }),
  controller.cancelReturn
);

// Router for mounting on /api/v1/sales/invoices/:invoiceId/returns
export const invoiceReturnRouter = Router({ mergeParams: true });
invoiceReturnRouter.use(authenticateToken);
invoiceReturnRouter.get(
  '/:invoiceId/returns',
  requirePermission('sales_return.read'),
  validate({ params: invoiceIdParamSchema }),
  controller.getReturnsByInvoiceId
);

export default router;
export { router as salesReturnRoutes };
