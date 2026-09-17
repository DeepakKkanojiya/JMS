import { Router } from 'express';
import { thirdPartyGirviController } from './thirdPartyGirvi.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createThirdPartyLenderSchema,
  createThirdPartyGirviSchema,
  updateThirdPartyGirviSchema,
  closeThirdPartyGirviSchema,
  cancelThirdPartyGirviSchema,
  thirdPartyCollateralSchema,
  thirdPartyGirviParamSchema,
  thirdPartyGirviQuerySchema,
} from './thirdPartyGirvi.validation';

const router = Router();

router.use(authenticateToken);

/**
 * @route   POST /api/v1/girvi/third-party/lenders
 * @desc    Create a Third-Party Lender
 * @access  Private (third_party_girvi.create)
 */
router.post(
  '/third-party/lenders',
  requirePermission('third_party_girvi.create'),
  validate({ body: createThirdPartyLenderSchema }),
  thirdPartyGirviController.createLender
);

/**
 * @route   GET /api/v1/girvi/third-party/lenders
 * @desc    List Third-Party Lenders
 * @access  Private (third_party_girvi.read)
 */
router.get(
  '/third-party/lenders',
  requirePermission('third_party_girvi.read'),
  thirdPartyGirviController.getLenders
);

/**
 * @route   POST /api/v1/girvi/third-party/loans
 * @desc    Create a Third-Party Girvi record
 * @access  Private (third_party_girvi.create)
 */
router.post(
  '/third-party/loans',
  requirePermission('third_party_girvi.create'),
  validate({ body: createThirdPartyGirviSchema }),
  thirdPartyGirviController.createThirdPartyGirvi
);

/**
 * @route   GET /api/v1/girvi/third-party/loans
 * @desc    List paginated Third-Party Girvis
 * @access  Private (third_party_girvi.read)
 */
router.get(
  '/third-party/loans',
  requirePermission('third_party_girvi.read'),
  validate({ query: thirdPartyGirviQuerySchema }),
  thirdPartyGirviController.getGirvis
);

/**
 * @route   GET /api/v1/girvi/third-party/loans/:id
 * @desc    Get Third-Party Girvi details by ID
 * @access  Private (third_party_girvi.read)
 */
router.get(
  '/third-party/loans/:id',
  requirePermission('third_party_girvi.read'),
  validate({ params: thirdPartyGirviParamSchema }),
  thirdPartyGirviController.getGirviById
);

/**
 * @route   PUT /api/v1/girvi/third-party/loans/:id
 * @desc    Update draft Third-Party Girvi
 * @access  Private (third_party_girvi.update)
 */
router.put(
  '/third-party/loans/:id',
  requirePermission('third_party_girvi.update'),
  validate({ params: thirdPartyGirviParamSchema, body: updateThirdPartyGirviSchema }),
  thirdPartyGirviController.updateThirdPartyGirvi
);

/**
 * @route   POST /api/v1/girvi/third-party/loans/:id/approve
 * @desc    Approve Third-Party Girvi
 * @access  Private (third_party_girvi.approve)
 */
router.post(
  '/third-party/loans/:id/approve',
  requirePermission('third_party_girvi.approve'),
  validate({ params: thirdPartyGirviParamSchema }),
  thirdPartyGirviController.approveThirdPartyGirvi
);

/**
 * @route   POST /api/v1/girvi/third-party/loans/:id/close
 * @desc    Close Third-Party Girvi and release collateral
 * @access  Private (third_party_girvi.close)
 */
router.post(
  '/third-party/loans/:id/close',
  requirePermission('third_party_girvi.close'),
  validate({ params: thirdPartyGirviParamSchema, body: closeThirdPartyGirviSchema }),
  thirdPartyGirviController.closeThirdPartyGirvi
);

/**
 * @route   POST /api/v1/girvi/third-party/loans/:id/cancel
 * @desc    Cancel Third-Party Girvi
 * @access  Private (third_party_girvi.cancel)
 */
router.post(
  '/third-party/loans/:id/cancel',
  requirePermission('third_party_girvi.cancel'),
  validate({ params: thirdPartyGirviParamSchema, body: cancelThirdPartyGirviSchema }),
  thirdPartyGirviController.cancelThirdPartyGirvi
);

/**
 * @route   POST /api/v1/girvi/third-party/loans/:id/collaterals
 * @desc    Add collateral item to Third-Party Girvi
 * @access  Private (third_party_girvi.update)
 */
router.post(
  '/third-party/loans/:id/collaterals',
  requirePermission('third_party_girvi.update'),
  validate({ params: thirdPartyGirviParamSchema, body: thirdPartyCollateralSchema }),
  thirdPartyGirviController.addCollateral
);

/**
 * @route   POST /api/v1/girvi/third-party/collaterals/:collateralId/release
 * @desc    Release specific Third-Party Girvi collateral
 * @access  Private (third_party_girvi.release)
 */
router.post(
  '/third-party/collaterals/:collateralId/release',
  requirePermission('third_party_girvi.release'),
  thirdPartyGirviController.releaseCollateral
);

export default router;
