import { Router } from 'express';
import { customerController } from './customer.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerParamSchema,
  customerQuerySchema,
  customerSearchQuerySchema,
} from './customer.validation';

const router = Router();

// All customer routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/customers
 * @desc    Create a new customer profile
 * @access  Private (customer.create)
 */
router.post('/', requirePermission('customer.create'), validate(createCustomerSchema), customerController.createCustomer);

/**
 * @route   GET /api/v1/customers
 * @desc    Get paginated customer list with search & filters
 * @access  Private (customer.read)
 */
router.get('/', requirePermission('customer.read'), validate({ query: customerQuerySchema }), customerController.getCustomers);

/**
 * @route   GET /api/v1/customers/search
 * @desc    Quick search customer by mobile, code, or name for billing/POS
 * @access  Private (customer.read)
 */
router.get('/search', requirePermission('customer.read'), validate({ query: customerSearchQuerySchema }), customerController.searchQuick);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer profile details by ID
 * @access  Private (customer.read)
 */
router.get('/:id', requirePermission('customer.read'), validate({ params: customerParamSchema }), customerController.getCustomerById);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer profile details
 * @access  Private (customer.update)
 */
router.put('/:id', requirePermission('customer.update'), validate({ params: customerParamSchema, body: updateCustomerSchema }), customerController.updateCustomer);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Delete customer profile
 * @access  Private (customer.delete)
 */
router.delete('/:id', requirePermission('customer.delete'), validate({ params: customerParamSchema }), customerController.deleteCustomer);

export default router;
