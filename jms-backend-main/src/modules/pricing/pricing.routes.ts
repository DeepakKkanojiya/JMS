import { Router } from 'express';
import { pricingController } from './pricing.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { calculatePricingBodySchema, invoiceParamSchema } from './pricing.validation';

const router = Router();

router.use(authenticateToken);

router.post(
  '/invoices/:id/calculate-pricing',
  requirePermission('sales_invoice.update'),
  validate({ params: invoiceParamSchema, body: calculatePricingBodySchema }),
  pricingController.calculateInvoicePricing
);

router.get(
  '/invoices/:id/pricing',
  requirePermission('sales_invoice.read'),
  validate({ params: invoiceParamSchema }),
  pricingController.getInvoicePricing
);

export const pricingRoutes = router;
