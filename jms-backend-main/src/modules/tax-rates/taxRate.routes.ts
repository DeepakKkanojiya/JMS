import { Router } from 'express';
import { taxRateController } from './taxRate.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createTaxRateSchema,
  updateTaxRateSchema,
  taxRateParamSchema,
  taxRateQuerySchema,
} from './taxRate.validation';

const router = Router();

router.use(authenticateToken);

router.post(
  '/',
  requirePermission('tax_rate.create'),
  validate(createTaxRateSchema),
  taxRateController.createTaxRate
);

router.get(
  '/current',
  requirePermission('tax_rate.read'),
  taxRateController.getCurrentTaxRate
);

router.get(
  '/history',
  requirePermission('tax_rate.read'),
  taxRateController.getTaxRateHistory
);

router.get(
  '/',
  requirePermission('tax_rate.read'),
  validate({ query: taxRateQuerySchema }),
  taxRateController.getAllTaxRates
);

router.get(
  '/:id',
  requirePermission('tax_rate.read'),
  validate({ params: taxRateParamSchema }),
  taxRateController.getTaxRateById
);

router.put(
  '/:id',
  requirePermission('tax_rate.update'),
  validate({ params: taxRateParamSchema, body: updateTaxRateSchema }),
  taxRateController.updateTaxRate
);

router.post(
  '/:id/deactivate',
  requirePermission('tax_rate.update'),
  validate({ params: taxRateParamSchema }),
  taxRateController.deactivateTaxRate
);

export const taxRateRoutes = router;
