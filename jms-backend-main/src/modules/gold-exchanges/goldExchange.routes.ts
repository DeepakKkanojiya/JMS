import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { validate } from '../../middleware/validation.middleware';
import { goldExchangeController } from './goldExchange.controller';
import {
  createGoldExchangeSchema,
  goldExchangeIdParamSchema,
  invoiceIdParamSchema,
  findGoldExchangesQuerySchema,
} from './goldExchange.validation';

const router = Router();
export const invoiceGoldExchangeRouter = Router();

router.use(authenticateToken);
invoiceGoldExchangeRouter.use(authenticateToken);

// Invoice-nested endpoints mounted at /api/v1/sales/invoices
invoiceGoldExchangeRouter.post(
  '/:invoiceId/gold-exchanges',
  requirePermission('gold_exchange.create'),
  validate({ params: invoiceIdParamSchema, body: createGoldExchangeSchema }),
  goldExchangeController.createExchange
);

invoiceGoldExchangeRouter.get(
  '/:invoiceId/gold-exchanges',
  requirePermission('gold_exchange.read'),
  validate({ params: invoiceIdParamSchema }),
  goldExchangeController.getInvoiceExchanges
);

// Main gold exchanges collection endpoints (/api/v1/gold-exchanges)
router.get(
  '/',
  requirePermission('gold_exchange.read'),
  validate({ query: findGoldExchangesQuerySchema }),
  goldExchangeController.getAllExchanges
);

router.get(
  '/:id',
  requirePermission('gold_exchange.read'),
  validate({ params: goldExchangeIdParamSchema }),
  goldExchangeController.getExchangeById
);

router.post(
  '/:id/value',
  requirePermission('gold_exchange.value'),
  validate({ params: goldExchangeIdParamSchema }),
  goldExchangeController.valueExchange
);

router.post(
  '/:id/apply',
  requirePermission('gold_exchange.apply'),
  validate({ params: goldExchangeIdParamSchema }),
  goldExchangeController.applyExchange
);

router.post(
  '/:id/cancel',
  requirePermission('gold_exchange.cancel'),
  validate({ params: goldExchangeIdParamSchema }),
  goldExchangeController.cancelExchange
);

router.get(
  '/:id/history',
  requirePermission('gold_exchange.read'),
  validate({ params: goldExchangeIdParamSchema }),
  goldExchangeController.getExchangeHistory
);

export const goldExchangeRoutes = router;
