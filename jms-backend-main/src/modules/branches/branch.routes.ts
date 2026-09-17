import { Router } from 'express';
import { branchController } from './branch.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createBranchSchema,
  updateBranchSchema,
  branchParamSchema,
  branchQuerySchema,
} from './branch.validation';

const router = Router();

// All branch routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/branches
 * @desc    Create a new company branch showroom
 * @access  Private (branch.create)
 */
router.post('/', requirePermission('branch.create'), validate(createBranchSchema), branchController.createBranch);

/**
 * @route   GET /api/v1/branches
 * @desc    Get paginated branch list with search & company filter
 * @access  Private (branch.read)
 */
router.get('/', requirePermission('branch.read'), validate({ query: branchQuerySchema }), branchController.getBranches);

/**
 * @route   GET /api/v1/branches/:id
 * @desc    Get branch showroom profile by ID
 * @access  Private (branch.read)
 */
router.get('/:id', requirePermission('branch.read'), validate({ params: branchParamSchema }), branchController.getBranchById);

/**
 * @route   PUT /api/v1/branches/:id
 * @desc    Update branch showroom profile
 * @access  Private (branch.update)
 */
router.put('/:id', requirePermission('branch.update'), validate({ params: branchParamSchema, body: updateBranchSchema }), branchController.updateBranch);

/**
 * @route   DELETE /api/v1/branches/:id
 * @desc    Delete branch showroom
 * @access  Private (branch.delete)
 */
router.delete('/:id', requirePermission('branch.delete'), validate({ params: branchParamSchema }), branchController.deleteBranch);

export default router;
