import { Router } from 'express';
import { approvalController } from './approval.controller';
import { approvalReportController } from './approvalReport.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createApprovalSchema,
  updateApprovalSchema,
  approvalParamSchema,
  approvalQuerySchema,
  createApprovalDepositSchema,
  returnApprovalSchema,
  purchaseApprovalSchema,
} from './approval.validation';
import {
  approvalReportQuerySchema,
  customerReportParamSchema,
  approvalAuditParamSchema,
} from './approvalReport.validation';

const router = Router();

router.use(authenticateToken);

/**
 * @route   POST /api/v1/approvals
 * @desc    Create Sell on Approval slip
 * @access  Private (approval.create)
 */
router.post(
  '/',
  requirePermission('approval.create'),
  validate({ body: createApprovalSchema }),
  approvalController.createApproval
);

/**
 * @route   GET /api/v1/approvals
 * @desc    List Sell on Approval slips
 * @access  Private (approval.read)
 */
router.get(
  '/',
  requirePermission('approval.read'),
  validate({ query: approvalQuerySchema }),
  approvalController.getApprovals
);

// ==========================================
// PHASE 7.5 APPROVAL REPORT ROUTES (Placed BEFORE /:id)
// ==========================================

/**
 * @route   GET /api/v1/approvals/reports/summary
 * @desc    Get aggregated summary metrics for approvals
 * @access  Private (approval.report.read)
 */
router.get(
  '/reports/summary',
  requirePermission('approval.report.read'),
  approvalReportController.getSummaryReport
);

/**
 * @route   GET /api/v1/approvals/reports/register
 * @desc    Get paginated and filterable approval register report
 * @access  Private (approval.report.read)
 */
router.get(
  '/reports/register',
  requirePermission('approval.report.read'),
  validate({ query: approvalReportQuerySchema }),
  approvalReportController.getRegisterReport
);

/**
 * @route   GET /api/v1/approvals/reports/inventory
 * @desc    Get physical jewellery locked on approval report
 * @access  Private (approval.report.read)
 */
router.get(
  '/reports/inventory',
  requirePermission('approval.report.read'),
  validate({ query: approvalReportQuerySchema }),
  approvalReportController.getInventoryReport
);

/**
 * @route   GET /api/v1/approvals/reports/deposits
 * @desc    Get deposit and payment report (includes completed and reversed deposits)
 * @access  Private (approval.report.read)
 */
router.get(
  '/reports/deposits',
  requirePermission('approval.report.read'),
  validate({ query: approvalReportQuerySchema }),
  approvalReportController.getDepositsReport
);

/**
 * @route   GET /api/v1/approvals/reports/returns-purchases
 * @desc    Get return vs purchase comparison report with conversion rates
 * @access  Private (approval.report.read)
 */
router.get(
  '/reports/returns-purchases',
  requirePermission('approval.report.read'),
  validate({ query: approvalReportQuerySchema }),
  approvalReportController.getReturnVsPurchaseReport
);

/**
 * @route   GET /api/v1/approvals/reports/customer/:customerId
 * @desc    Get customer 360 approval history report
 * @access  Private (approval.report.read)
 */
router.get(
  '/reports/customer/:customerId',
  requirePermission('approval.report.read'),
  validate({ params: customerReportParamSchema }),
  approvalReportController.getCustomerHistoryReport
);

/**
 * @route   GET /api/v1/approvals/reports/ageing
 * @desc    Get overdue and ageing bucket report for active approvals
 * @access  Private (approval.report.read)
 */
router.get(
  '/reports/ageing',
  requirePermission('approval.report.read'),
  validate({ query: approvalReportQuerySchema }),
  approvalReportController.getAgeingReport
);

// ==========================================
// INDIVIDUAL APPROVAL ROUTES (/:id)
// ==========================================

/**
 * @route   GET /api/v1/approvals/:id/audit-trail
 * @desc    Get 360-degree chronological audit trail for a specific approval slip
 * @access  Private (approval.report.read)
 */
router.get(
  '/:id/audit-trail',
  requirePermission('approval.report.read'),
  validate({ params: approvalAuditParamSchema }),
  approvalReportController.getAuditTrail
);

/**
 * @route   GET /api/v1/approvals/:id
 * @desc    Get Sell on Approval slip details by ID
 * @access  Private (approval.read)
 */
router.get(
  '/:id',
  requirePermission('approval.read'),
  validate({ params: approvalParamSchema }),
  approvalController.getApprovalById
);

/**
 * @route   PUT /api/v1/approvals/:id
 * @desc    Update draft Sell on Approval slip
 * @access  Private (approval.update)
 */
router.put(
  '/:id',
  requirePermission('approval.update'),
  validate({ params: approvalParamSchema, body: updateApprovalSchema }),
  approvalController.updateApproval
);

/**
 * @route   POST /api/v1/approvals/:id/issue
 * @desc    Issue Sell on Approval slip to customer
 * @access  Private (approval.issue)
 */
router.post(
  '/:id/issue',
  requirePermission('approval.issue'),
  validate({ params: approvalParamSchema }),
  approvalController.issueApproval
);

/**
 * @route   POST /api/v1/approvals/:id/cancel
 * @desc    Cancel draft Sell on Approval slip
 * @access  Private (approval.cancel)
 */
router.post(
  '/:id/cancel',
  requirePermission('approval.cancel'),
  validate({ params: approvalParamSchema }),
  approvalController.cancelApproval
);

// ==========================================
// PHASE 7.4 RETURN & PURCHASE ROUTES
// ==========================================

/**
 * @route   POST /api/v1/approvals/:id/return
 * @desc    Process customer jewellery return (ON_APPROVAL -> AVAILABLE)
 * @access  Private (approval.return)
 */
router.post(
  '/:id/return',
  requirePermission('approval.return'),
  validate({ params: approvalParamSchema, body: returnApprovalSchema }),
  approvalController.returnApproval
);

/**
 * @route   POST /api/v1/approvals/:id/purchase
 * @desc    Convert approval slip into completed purchase invoice (ON_APPROVAL -> SOLD)
 * @access  Private (approval.purchase)
 */
router.post(
  '/:id/purchase',
  requirePermission('approval.purchase'),
  validate({ params: approvalParamSchema, body: purchaseApprovalSchema }),
  approvalController.purchaseApproval
);

// ==========================================
// PHASE 7.3 APPROVAL DEPOSIT ROUTES
// ==========================================

/**
 * @route   POST /api/v1/approvals/:id/deposits
 * @desc    Create security deposit payment for approval slip
 * @access  Private (approval.deposit.create)
 */
router.post(
  '/:id/deposits',
  requirePermission('approval.deposit.create'),
  validate({ params: approvalParamSchema, body: createApprovalDepositSchema }),
  approvalController.createDeposit
);

/**
 * @route   GET /api/v1/approvals/:id/deposits
 * @desc    List all deposits for an approval slip
 * @access  Private (approval.deposit.read)
 */
router.get(
  '/:id/deposits',
  requirePermission('approval.deposit.read'),
  validate({ params: approvalParamSchema }),
  approvalController.listDepositsForApproval
);

/**
 * @route   GET /api/v1/approvals/:id/deposit-summary
 * @desc    Get deposit financial summary for an approval slip
 * @access  Private (approval.deposit.read)
 */
router.get(
  '/:id/deposit-summary',
  requirePermission('approval.deposit.read'),
  validate({ params: approvalParamSchema }),
  approvalController.getDepositSummary
);

export default router;
