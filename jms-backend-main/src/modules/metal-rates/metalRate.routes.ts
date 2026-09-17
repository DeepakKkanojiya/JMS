import { Router } from 'express';
import { metalRateController } from './metalRate.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission, requireAdminRole } from '../../middleware/authorize.middleware';
import {
  createMetalRateSchema,
  updateMetalRateSchema,
  metalRateParamSchema,
  metalRateQuerySchema,
  currentMetalRateQuerySchema,
  calculateMetalRateSchema,
  lockMetalRateParamSchema,
  syncLiveRatesSchema,
  bulkUpdateRatesSchema,
} from './metalRate.validation';

const router = Router();

// All metal rate endpoints require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/metal-rates/live
 * @desc    Get free real-time live market benchmark metal prices (Gold 24K/22K/18K/14K, Silver, Platinum)
 * @access  Private (Admin Only - OWNER, SUPER_ADMIN, ADMIN)
 */
router.get(
  '/live',
  requireAdminRole(),
  metalRateController.getLiveMarketMetalRates
);

/**
 * @route   POST /api/v1/metal-rates/sync-live
 * @desc    Synchronize live market rates into company daily active selling rates (Owner / Super Admin)
 * @access  Private (metal_rate.update)
 */
router.post(
  '/sync-live',
  requirePermission('metal_rate.update'),
  validate({ body: syncLiveRatesSchema }),
  metalRateController.syncLiveRatesToCompany
);

/**
 * @route   POST /api/v1/metal-rates/bulk-update
 * @desc    Bulk update multiple company metal rates in a single atomic transaction (Owner / Super Admin)
 * @access  Private (metal_rate.update)
 */
router.post(
  '/bulk-update',
  requirePermission('metal_rate.update'),
  validate({ body: bulkUpdateRatesSchema }),
  metalRateController.bulkUpdateCompanyRates
);

/**
 * @route   POST /api/v1/metal-rates
 * @desc    Create a new metal rate record
 * @access  Private (metal_rate.create)
 */
router.post(
  '/',
  requirePermission('metal_rate.create'),
  validate({ body: createMetalRateSchema }),
  metalRateController.createMetalRate
);

/**
 * @route   GET /api/v1/metal-rates
 * @desc    Get paginated metal rates with search & filters
 * @access  Private (metal_rate.read)
 */
router.get(
  '/',
  requirePermission('metal_rate.read'),
  validate({ query: metalRateQuerySchema }),
  metalRateController.getMetalRates
);

/**
 * @route   GET /api/v1/metal-rates/history
 * @desc    Get historical metal rate records
 * @access  Private (metal_rate.read)
 */
router.get(
  '/history',
  requirePermission('metal_rate.read'),
  validate({ query: metalRateQuerySchema }),
  metalRateController.getMetalRateHistory
);

/**
 * @route   GET /api/v1/metal-rates/current
 * @desc    Get current active metal rate for company, metalType, and purity
 * @access  Private (metal_rate.read)
 */
router.get(
  '/current',
  requirePermission('metal_rate.read'),
  validate({ query: currentMetalRateQuerySchema }),
  metalRateController.getCurrentRate
);

/**
 * @route   POST /api/v1/metal-rates/calculate
 * @desc    Calculate metal value = netWeight * ratePerGram
 * @access  Private (metal_rate.read)
 */
router.post(
  '/calculate',
  requirePermission('metal_rate.read'),
  validate({ body: calculateMetalRateSchema }),
  metalRateController.calculateMetalValue
);

/**
 * @route   GET /api/v1/metal-rates/:id
 * @desc    Get single metal rate details by ID
 * @access  Private (metal_rate.read)
 */
router.get(
  '/:id',
  requirePermission('metal_rate.read'),
  validate({ params: metalRateParamSchema }),
  metalRateController.getMetalRateById
);

/**
 * @route   PUT /api/v1/metal-rates/:id
 * @desc    Update metal rate values or closing date
 * @access  Private (metal_rate.update)
 */
router.put(
  '/:id',
  requirePermission('metal_rate.update'),
  validate({ params: metalRateParamSchema, body: updateMetalRateSchema }),
  metalRateController.updateMetalRate
);

/**
 * @route   POST /api/v1/metal-rates/:id/deactivate
 * @desc    Soft-deactivate a metal rate (isActive = false)
 * @access  Private (metal_rate.update)
 */
router.post(
  '/:id/deactivate',
  requirePermission('metal_rate.update'),
  validate({ params: metalRateParamSchema }),
  metalRateController.deactivateMetalRate
);

/**
 * Router extension for sales invoice rate locking endpoints
 */
export const salesInvoiceRateLockRouter = Router();
salesInvoiceRateLockRouter.use(authenticateToken);

/**
 * @route   POST /api/v1/sales/invoices/:id/lock-metal-rate
 * @desc    Lock metal rate snapshot on DRAFT sales invoice
 * @access  Private (sales_invoice.update)
 */
salesInvoiceRateLockRouter.post(
  '/:id/lock-metal-rate',
  requirePermission('sales_invoice.update'),
  validate({ params: lockMetalRateParamSchema }),
  metalRateController.lockSalesInvoiceMetalRate
);

/**
 * @route   GET /api/v1/sales/invoices/:id/metal-rate
 * @desc    Get locked metal rate snapshot for sales invoice
 * @access  Private (sales_invoice.read)
 */
salesInvoiceRateLockRouter.get(
  '/:id/metal-rate',
  requirePermission('sales_invoice.read'),
  validate({ params: lockMetalRateParamSchema }),
  metalRateController.getSalesInvoiceMetalRate
);

export default router;
