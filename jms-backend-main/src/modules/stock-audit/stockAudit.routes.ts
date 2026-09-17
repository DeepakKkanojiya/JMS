import { Router } from 'express';
import { stockAuditController } from './stockAudit.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createStockAuditSessionSchema,
  scanAuditItemSchema,
  cancelStockAuditSessionSchema,
  stockAuditSessionParamSchema,
  stockAuditSessionQuerySchema,
} from './stockAudit.validation';

const router = Router();

router.use(authenticateToken);

/**
 * @route   POST /api/v1/stock-audits
 * @desc    Create a new IN_PROGRESS Stock Audit session
 * @access  Private (stock_audit.create)
 */
router.post(
  '/',
  requirePermission('stock_audit.create'),
  validate({ body: createStockAuditSessionSchema }),
  stockAuditController.createSession
);

/**
 * @route   GET /api/v1/stock-audits
 * @desc    List paginated Stock Audit sessions with filters
 * @access  Private (stock_audit.read)
 */
router.get(
  '/',
  requirePermission('stock_audit.read'),
  validate({ query: stockAuditSessionQuerySchema }),
  stockAuditController.getAllSessions
);

/**
 * @route   GET /api/v1/stock-audits/:id
 * @desc    Get Stock Audit session details by ID
 * @access  Private (stock_audit.read)
 */
router.get(
  '/:id',
  requirePermission('stock_audit.read'),
  validate({ params: stockAuditSessionParamSchema }),
  stockAuditController.getSessionById
);

/**
 * @route   POST /api/v1/stock-audits/:id/scan
 * @desc    Scan item (Barcode / RFID EPC / ID) into audit session
 * @access  Private (stock_audit.scan)
 */
router.post(
  '/:id/scan',
  requirePermission('stock_audit.scan'),
  validate({ params: stockAuditSessionParamSchema, body: scanAuditItemSchema }),
  stockAuditController.scanItem
);

/**
 * @route   POST /api/v1/stock-audits/:id/submit
 * @desc    Submit Stock Audit session (identifies missing items)
 * @access  Private (stock_audit.submit)
 */
router.post(
  '/:id/submit',
  requirePermission('stock_audit.submit'),
  validate({ params: stockAuditSessionParamSchema }),
  stockAuditController.submitSession
);

/**
 * @route   POST /api/v1/stock-audits/:id/reconcile
 * @desc    Reconcile Stock Audit session, update missing item status & adjust weights
 * @access  Private (stock_audit.reconcile)
 */
router.post(
  '/:id/reconcile',
  requirePermission('stock_audit.reconcile'),
  validate({ params: stockAuditSessionParamSchema }),
  stockAuditController.reconcileSession
);

/**
 * @route   POST /api/v1/stock-audits/:id/cancel
 * @desc    Cancel Stock Audit session with mandatory reason
 * @access  Private (stock_audit.cancel)
 */
router.post(
  '/:id/cancel',
  requirePermission('stock_audit.cancel'),
  validate({ params: stockAuditSessionParamSchema, body: cancelStockAuditSessionSchema }),
  stockAuditController.cancelSession
);

/**
 * @route   GET /api/v1/stock-audits/:id/discrepancies
 * @desc    Get discrepancy report for Stock Audit session
 * @access  Private (stock_audit.read)
 */
router.get(
  '/:id/discrepancies',
  requirePermission('stock_audit.read'),
  validate({ params: stockAuditSessionParamSchema }),
  stockAuditController.getDiscrepancies
);

export default router;
