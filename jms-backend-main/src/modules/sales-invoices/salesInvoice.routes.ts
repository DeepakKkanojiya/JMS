import { Router } from 'express';
import { salesInvoiceController } from './salesInvoice.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createSalesInvoiceSchema,
  updateSalesInvoiceSchema,
  salesInvoiceParamSchema,
  salesInvoiceQuerySchema,
} from './salesInvoice.validation';

const router = Router();

// All sales invoice endpoints require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/sales/invoices
 * @desc    Create a new DRAFT sales invoice
 * @access  Private (sales_invoice.create)
 */
router.post(
  '/',
  requirePermission('sales_invoice.create'),
  validate({ body: createSalesInvoiceSchema }),
  salesInvoiceController.createSalesInvoice
);

/**
 * @route   GET /api/v1/sales/invoices
 * @desc    Get paginated sales invoices with filters and search
 * @access  Private (sales_invoice.read)
 */
router.get(
  '/',
  requirePermission('sales_invoice.read'),
  validate({ query: salesInvoiceQuerySchema }),
  salesInvoiceController.getSalesInvoices
);

/**
 * @route   GET /api/v1/sales/invoices/:id
 * @desc    Get single sales invoice details with line items, customer, branch, and salesperson
 * @access  Private (sales_invoice.read)
 */
router.get(
  '/:id',
  requirePermission('sales_invoice.read'),
  validate({ params: salesInvoiceParamSchema }),
  salesInvoiceController.getSalesInvoiceById
);

/**
 * @route   GET /api/v1/sales/invoices/:id/items
 * @desc    Get line items for a sales invoice
 * @access  Private (sales_invoice.read)
 */
router.get(
  '/:id/items',
  requirePermission('sales_invoice.read'),
  validate({ params: salesInvoiceParamSchema }),
  salesInvoiceController.getSalesInvoiceItems
);

/**
 * @route   PUT /api/v1/sales/invoices/:id
 * @route   PATCH /api/v1/sales/invoices/:id
 * @desc    Update a DRAFT sales invoice
 * @access  Private (sales_invoice.update)
 */
router.put(
  '/:id',
  requirePermission('sales_invoice.update'),
  validate({ params: salesInvoiceParamSchema, body: updateSalesInvoiceSchema }),
  salesInvoiceController.updateSalesInvoice
);

router.patch(
  '/:id',
  requirePermission('sales_invoice.update'),
  validate({ params: salesInvoiceParamSchema, body: updateSalesInvoiceSchema }),
  salesInvoiceController.updateSalesInvoice
);

/**
 * @route   POST /api/v1/sales/invoices/:id/confirm
 * @desc    Confirm a DRAFT sales invoice (DRAFT -> CONFIRMED)
 * @access  Private (sales_invoice.confirm)
 */
router.post(
  '/:id/confirm',
  requirePermission('sales_invoice.confirm'),
  validate({ params: salesInvoiceParamSchema }),
  salesInvoiceController.confirmSalesInvoice
);

/**
 * @route   POST /api/v1/sales/invoices/:id/cancel
 * @desc    Cancel a sales invoice (DRAFT -> CANCELLED or CONFIRMED -> CANCELLED)
 * @access  Private (sales_invoice.cancel)
 */
router.post(
  '/:id/cancel',
  requirePermission('sales_invoice.cancel'),
  validate({ params: salesInvoiceParamSchema }),
  salesInvoiceController.cancelSalesInvoice
);

/**
 * Router extension for POS available inventory item scanning lookup
 */
export const posLookupRouter = Router();
posLookupRouter.use(authenticateToken);

/**
 * @route   GET /api/v1/sales/pos/inventory/:identifier
 * @desc    Lookup AVAILABLE inventory item by itemCode, barcode, qrCode, or ID
 * @access  Private (sales_invoice.read)
 */
posLookupRouter.get(
  '/inventory/:identifier',
  requirePermission('sales_invoice.read'),
  salesInvoiceController.getPosAvailableInventoryItem
);

export default router;
