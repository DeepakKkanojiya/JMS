import { Router } from 'express';
import { girviController } from './girvi.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createGirviLoanSchema,
  updateGirviLoanSchema,
  cancelGirviLoanSchema,
  addCollateralSchema,
  girviLoanParamSchema,
  girviLoanQuerySchema,
  createGirviCollectionSchema,
  reverseGirviCollectionSchema,
  renewGirviLoanSchema,
  girviCollectionQuerySchema,
  overdueLoansQuerySchema,
  settleGirviLoanSchema,
  girviSettlementQuerySchema,
  girviReportQuerySchema,
  girviAuditQuerySchema,
} from './girvi.validation';



const router = Router();

router.use(authenticateToken);

/**
 * @route   POST /api/v1/girvi/loans
 * @desc    Create a Self Girvi loan
 * @access  Private (girvi.create)
 */
router.post(
  '/loans',
  requirePermission('girvi.create'),
  validate({ body: createGirviLoanSchema }),
  girviController.createGirviLoan
);

/**
 * @route   GET /api/v1/girvi/loans
 * @desc    List paginated Girvi loans with filters
 * @access  Private (girvi.read)
 */
router.get(
  '/loans',
  requirePermission('girvi.read'),
  validate({ query: girviLoanQuerySchema }),
  girviController.getGirviLoans
);

/**
 * @route   GET /api/v1/girvi/overdue-loans
 * @desc    List overdue and due-soon Girvi loans
 * @access  Private (girvi.read)
 */
router.get(
  '/overdue-loans',
  requirePermission('girvi.read'),
  validate({ query: overdueLoansQuerySchema }),
  girviController.getOverdueLoans
);

/**
 * @route   GET /api/v1/girvi/loans/:id
 * @desc    Get Girvi loan details by ID
 * @access  Private (girvi.read)
 */
router.get(
  '/loans/:id',
  requirePermission('girvi.read'),
  validate({ params: girviLoanParamSchema }),
  girviController.getGirviLoanById
);

/**
 * @route   PUT /api/v1/girvi/loans/:id
 * @desc    Update active/draft Girvi loan details
 * @access  Private (girvi.update)
 */
router.put(
  '/loans/:id',
  requirePermission('girvi.update'),
  validate({ params: girviLoanParamSchema, body: updateGirviLoanSchema }),
  girviController.updateGirviLoan
);

/**
 * @route   POST /api/v1/girvi/loans/:id/approve
 * @desc    Approve draft Girvi loan
 * @access  Private (girvi.approve)
 */
router.post(
  '/loans/:id/approve',
  requirePermission('girvi.approve'),
  validate({ params: girviLoanParamSchema }),
  girviController.approveGirviLoan
);

/**
 * @route   POST /api/v1/girvi/loans/:id/cancel
 * @desc    Cancel Girvi loan
 * @access  Private (girvi.cancel)
 */
router.post(
  '/loans/:id/cancel',
  requirePermission('girvi.cancel'),
  validate({ params: girviLoanParamSchema, body: cancelGirviLoanSchema }),
  girviController.cancelGirviLoan
);

/**
 * @route   POST /api/v1/girvi/loans/:id/collaterals
 * @desc    Add collateral item to Girvi loan
 * @access  Private (girvi.update)
 */
router.post(
  '/loans/:id/collaterals',
  requirePermission('girvi.update'),
  validate({ params: girviLoanParamSchema, body: addCollateralSchema }),
  girviController.addCollateral
);

// ==========================================
// PHASE 6.2: INTEREST, COLLECTIONS & RENEWAL ROUTES
// ==========================================

/**
 * @route   GET /api/v1/girvi/loans/:id/financial-summary
 * @desc    Get real-time interest accrual and financial summary
 * @access  Private (girvi.interest.read)
 */
router.get(
  '/loans/:id/financial-summary',
  requirePermission('girvi.interest.read'),
  validate({ params: girviLoanParamSchema }),
  girviController.getFinancialSummary
);

/**
 * @route   POST /api/v1/girvi/collections
 * @desc    Record Girvi interest/principal collection
 * @access  Private (girvi.collection.create)
 */
router.post(
  '/collections',
  requirePermission('girvi.collection.create'),
  validate({ body: createGirviCollectionSchema }),
  girviController.createCollection
);

/**
 * @route   GET /api/v1/girvi/collections
 * @desc    List paginated Girvi collections
 * @access  Private (girvi.collection.read)
 */
router.get(
  '/collections',
  requirePermission('girvi.collection.read'),
  validate({ query: girviCollectionQuerySchema }),
  girviController.getCollections
);

/**
 * @route   GET /api/v1/girvi/collections/:id
 * @desc    Get Girvi collection details by ID
 * @access  Private (girvi.collection.read)
 */
router.get(
  '/collections/:id',
  requirePermission('girvi.collection.read'),
  validate({ params: girviLoanParamSchema }),
  girviController.getCollectionById
);

/**
 * @route   GET /api/v1/girvi/loans/:id/collections
 * @desc    Get collection history for a Girvi loan
 * @access  Private (girvi.collection.read)
 */
router.get(
  '/loans/:id/collections',
  requirePermission('girvi.collection.read'),
  validate({ params: girviLoanParamSchema }),
  girviController.getLoanCollectionHistory
);

/**
 * @route   POST /api/v1/girvi/collections/:id/reverse
 * @desc    Reverse completed Girvi collection with reason
 * @access  Private (girvi.collection.reverse)
 */
router.post(
  '/collections/:id/reverse',
  requirePermission('girvi.collection.reverse'),
  validate({ params: girviLoanParamSchema, body: reverseGirviCollectionSchema }),
  girviController.reverseCollection
);

/**
 * @route   POST /api/v1/girvi/loans/:id/renew
 * @desc    Renew Girvi loan and extend due date
 * @access  Private (girvi.renew)
 */
router.post(
  '/loans/:id/renew',
  requirePermission('girvi.renew'),
  validate({ params: girviLoanParamSchema, body: renewGirviLoanSchema }),
  girviController.renewGirviLoan
);

// ==========================================
// PHASE 6.3: SETTLEMENT & JEWELLERY RELEASE ROUTES
// ==========================================

/**
 * @route   POST /api/v1/girvi/loans/:id/settle
 * @desc    Settle Girvi loan, record payment, and release pledged collateral jewellery
 * @access  Private (girvi.settlement.create)
 */
router.post(
  '/loans/:id/settle',
  requirePermission('girvi.settlement.create'),
  validate({ params: girviLoanParamSchema, body: settleGirviLoanSchema }),
  girviController.settleGirviLoan
);

/**
 * @route   GET /api/v1/girvi/settlements
 * @desc    List paginated Girvi settlements
 * @access  Private (girvi.settlement.read)
 */
router.get(
  '/settlements',
  requirePermission('girvi.settlement.read'),
  validate({ query: girviSettlementQuerySchema }),
  girviController.getSettlements
);

/**
 * @route   GET /api/v1/girvi/settlements/:id
 * @desc    Get Girvi settlement details by ID
 * @access  Private (girvi.settlement.read)
 */
router.get(
  '/settlements/:id',
  requirePermission('girvi.settlement.read'),
  validate({ params: girviLoanParamSchema }),
  girviController.getSettlementById
);

/**
 * @route   GET /api/v1/girvi/loans/:id/settlement
 * @desc    Get settlement record for a specific Girvi loan
 * @access  Private (girvi.settlement.read)
 */
router.get(
  '/loans/:id/settlement',
  requirePermission('girvi.settlement.read'),
  validate({ params: girviLoanParamSchema }),
  girviController.getLoanSettlement
);

/**
 * @route   GET /api/v1/girvi/loans/:id/released-collateral
 * @desc    Get released pledged collateral items for a Girvi loan
 * @access  Private (girvi.release)
 */
router.get(
  '/loans/:id/released-collateral',
  requirePermission('girvi.release'),
  validate({ params: girviLoanParamSchema }),
  girviController.getReleasedCollateral
);

/**
 * @route   GET /api/v1/girvi/loans/:id/audit-trail
 * @desc    Get complete chronological 360-degree audit trail for a Girvi loan
 * @access  Private (girvi.read)
 */
router.get(
  '/loans/:id/audit-trail',
  requirePermission('girvi.read'),
  validate({ params: girviLoanParamSchema, query: girviAuditQuerySchema }),
  girviController.getGirviAuditTrail
);

/**
 * @route   GET /api/v1/girvi/reports/portfolio
 * @desc    Get Self Girvi portfolio financial summary report
 * @access  Private (girvi.interest.read)
 */
router.get(
  '/reports/portfolio',
  requirePermission('girvi.report.read'),
  validate({ query: girviReportQuerySchema }),
  girviController.getGirviPortfolioReport
);

/**
 * @route   GET /api/v1/girvi/reports/overdue-aging
 * @desc    Get Self Girvi overdue aging analysis report (0-30, 31-60, 61-90, 90+ days)
 * @access  Private (girvi.report.read)
 */
router.get(
  '/reports/overdue-aging',
  requirePermission('girvi.report.read'),
  validate({ query: girviReportQuerySchema }),
  girviController.getGirviOverdueAgingReport
);


export default router;


