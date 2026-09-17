import { Router } from 'express';
import { approvalController } from './approval.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  approvalParamSchema,
  approvalDepositQuerySchema,
  reverseApprovalDepositSchema,
} from './approval.validation';

const router = Router();

router.use(authenticateToken);

/**
 * @route   GET /api/v1/approval-deposits
 * @desc    Global paginated approval deposit ledger
 * @access  Private (approval.deposit.read)
 */
router.get(
  '/',
  requirePermission('approval.deposit.read'),
  validate({ query: approvalDepositQuerySchema }),
  approvalController.listDeposits
);

/**
 * @route   GET /api/v1/approval-deposits/:id
 * @desc    Get approval deposit details by ID
 * @access  Private (approval.deposit.read)
 */
router.get(
  '/:id',
  requirePermission('approval.deposit.read'),
  validate({ params: approvalParamSchema }),
  approvalController.getDepositById
);

/**
 * @route   POST /api/v1/approval-deposits/:id/reverse
 * @desc    Reverse completed approval deposit payment
 * @access  Private (approval.deposit.reverse)
 */
router.post(
  '/:id/reverse',
  requirePermission('approval.deposit.reverse'),
  validate({ params: approvalParamSchema, body: reverseApprovalDepositSchema }),
  approvalController.reverseDeposit
);

export default router;
