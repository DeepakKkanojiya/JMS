import { Router } from 'express';
import { customerAddressController } from './customer-address.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createCustomerAddressSchema,
  updateCustomerAddressSchema,
  customerAddressParamSchema,
} from './customer-address.validation';

const router = Router({ mergeParams: true });

// All customer address routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/customers/:customerId/addresses
 * @desc    Add a new address to customer profile
 * @access  Private (customer.update)
 */
router.post(
  '/',
  requirePermission('customer.update'),
  validate({ params: customerAddressParamSchema, body: createCustomerAddressSchema }),
  customerAddressController.createAddress
);

/**
 * @route   GET /api/v1/customers/:customerId/addresses
 * @desc    Get all addresses for a customer
 * @access  Private (customer.read)
 */
router.get(
  '/',
  requirePermission('customer.read'),
  validate({ params: customerAddressParamSchema }),
  customerAddressController.getAddresses
);

/**
 * @route   GET /api/v1/customers/:customerId/addresses/:addressId
 * @desc    Get customer address profile details by ID
 * @access  Private (customer.read)
 */
router.get(
  '/:addressId',
  requirePermission('customer.read'),
  validate({ params: customerAddressParamSchema }),
  customerAddressController.getAddressById
);

/**
 * @route   PUT /api/v1/customers/:customerId/addresses/:addressId
 * @desc    Update customer address profile
 * @access  Private (customer.update)
 */
router.put(
  '/:addressId',
  requirePermission('customer.update'),
  validate({ params: customerAddressParamSchema, body: updateCustomerAddressSchema }),
  customerAddressController.updateAddress
);

/**
 * @route   DELETE /api/v1/customers/:customerId/addresses/:addressId
 * @desc    Delete customer address
 * @access  Private (customer.update)
 */
router.delete(
  '/:addressId',
  requirePermission('customer.update'),
  validate({ params: customerAddressParamSchema }),
  customerAddressController.deleteAddress
);

export default router;
