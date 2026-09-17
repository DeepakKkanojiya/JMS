import { Router } from 'express';
import { vendorController } from './vendor.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createVendorSchema,
  updateVendorSchema,
  vendorParamSchema,
  vendorQuerySchema,
} from './vendor.validation';

const router = Router();

// All vendor routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/vendors
 * @desc    Create a new vendor profile
 * @access  Private (vendor.create)
 */
router.post(
  '/',
  requirePermission('vendor.create'),
  validate({ body: createVendorSchema }),
  vendorController.createVendor
);

/**
 * @route   GET /api/v1/vendors
 * @desc    Get paginated vendor list with search filter
 * @access  Private (vendor.read)
 */
router.get(
  '/',
  requirePermission('vendor.read'),
  validate({ query: vendorQuerySchema }),
  vendorController.getVendors
);

/**
 * @route   GET /api/v1/vendors/:id
 * @desc    Get vendor profile details by ID
 * @access  Private (vendor.read)
 */
router.get(
  '/:id',
  requirePermission('vendor.read'),
  validate({ params: vendorParamSchema }),
  vendorController.getVendorById
);

/**
 * @route   PUT /api/v1/vendors/:id
 * @desc    Update vendor profile details
 * @access  Private (vendor.update)
 */
router.put(
  '/:id',
  requirePermission('vendor.update'),
  validate({ params: vendorParamSchema, body: updateVendorSchema }),
  vendorController.updateVendor
);

/**
 * @route   DELETE /api/v1/vendors/:id
 * @desc    Delete vendor profile
 * @access  Private (vendor.delete)
 */
router.delete(
  '/:id',
  requirePermission('vendor.delete'),
  validate({ params: vendorParamSchema }),
  vendorController.deleteVendor
);

export default router;
