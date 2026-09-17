import { Router } from 'express';
import { customerDocumentController } from './customer-document.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createCustomerDocumentSchema,
  updateCustomerDocumentSchema,
  customerDocumentParamSchema,
} from './customer-document.validation';

const router = Router({ mergeParams: true });

// All customer document routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/customers/:customerId/documents
 * @desc    Add a new KYC document record to customer profile
 * @access  Private (customer.update)
 */
router.post(
  '/',
  requirePermission('customer.update'),
  validate({ params: customerDocumentParamSchema, body: createCustomerDocumentSchema }),
  customerDocumentController.createDocument
);

/**
 * @route   GET /api/v1/customers/:customerId/documents
 * @desc    Get all KYC documents for a customer
 * @access  Private (customer.read)
 */
router.get(
  '/',
  requirePermission('customer.read'),
  validate({ params: customerDocumentParamSchema }),
  customerDocumentController.getDocuments
);

/**
 * @route   GET /api/v1/customers/:customerId/documents/:documentId
 * @desc    Get customer document details by ID
 * @access  Private (customer.read)
 */
router.get(
  '/:documentId',
  requirePermission('customer.read'),
  validate({ params: customerDocumentParamSchema }),
  customerDocumentController.getDocumentById
);

/**
 * @route   PUT /api/v1/customers/:customerId/documents/:documentId
 * @desc    Update customer document details
 * @access  Private (customer.update)
 */
router.put(
  '/:documentId',
  requirePermission('customer.update'),
  validate({ params: customerDocumentParamSchema, body: updateCustomerDocumentSchema }),
  customerDocumentController.updateDocument
);

/**
 * @route   DELETE /api/v1/customers/:customerId/documents/:documentId
 * @desc    Delete customer document record
 * @access  Private (customer.update)
 */
router.delete(
  '/:documentId',
  requirePermission('customer.update'),
  validate({ params: customerDocumentParamSchema }),
  customerDocumentController.deleteDocument
);

export default router;
