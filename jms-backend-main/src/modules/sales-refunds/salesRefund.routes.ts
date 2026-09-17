import { Router } from 'express';
import { SalesRefundController } from './salesRefund.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createSalesRefundSchema,
  reverseSalesRefundSchema,
  findSalesRefundsQuerySchema,
  salesRefundIdParamSchema,
  salesReturnIdParamSchema,
} from './salesRefund.validation';

const router = Router();
const controller = new SalesRefundController();

// Global Authentication for all Sales Refund Endpoints
router.use(authenticateToken);

// Create / Issue Refund for Processed Return
router.post(
  '/',
  requirePermission('sales_refund.create'),
  validate({ body: createSalesRefundSchema }),
  controller.createRefund
);

// List Sales Refunds
router.get(
  '/',
  requirePermission('sales_refund.read'),
  validate({ query: findSalesRefundsQuerySchema }),
  controller.getRefunds
);

// Get Sales Refund by ID
router.get(
  '/:id',
  requirePermission('sales_refund.read'),
  validate({ params: salesRefundIdParamSchema }),
  controller.getRefundById
);

// Reverse Sales Refund with Audit Reason
router.post(
  '/:id/reverse',
  requirePermission('sales_refund.reverse'),
  validate({ params: salesRefundIdParamSchema, body: reverseSalesRefundSchema }),
  controller.reverseRefund
);

// Router for mounting on /api/v1/sales/returns/:id/refunds
export const returnRefundRouter = Router({ mergeParams: true });
returnRefundRouter.use(authenticateToken);
returnRefundRouter.get(
  '/:id/refunds',
  requirePermission('sales_refund.read'),
  validate({ params: salesReturnIdParamSchema }),
  controller.getRefundsByReturnId
);

export default router;
export { router as salesRefundRoutes };
