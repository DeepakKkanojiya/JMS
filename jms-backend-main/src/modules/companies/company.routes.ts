import { Router } from 'express';
import { companyController } from './company.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createCompanySchema,
  updateCompanySchema,
  companyParamSchema,
  companyQuerySchema,
} from './company.validation';

const router = Router();

// All company routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/companies
 * @desc    Create a new enterprise company profile
 * @access  Private (company.create)
 */
router.post('/', requirePermission('company.create'), validate(createCompanySchema), companyController.createCompany);

/**
 * @route   GET /api/v1/companies
 * @desc    Get paginated company list with search
 * @access  Private (company.read)
 */
router.get('/', requirePermission('company.read'), validate({ query: companyQuerySchema }), companyController.getCompanies);

/**
 * @route   GET /api/v1/companies/:id
 * @desc    Get company profile by ID
 * @access  Private (company.read)
 */
router.get('/:id', requirePermission('company.read'), validate({ params: companyParamSchema }), companyController.getCompanyById);

/**
 * @route   PUT /api/v1/companies/:id
 * @desc    Update company profile
 * @access  Private (company.update)
 */
router.put('/:id', requirePermission('company.update'), validate({ params: companyParamSchema, body: updateCompanySchema }), companyController.updateCompany);

/**
 * @route   DELETE /api/v1/companies/:id
 * @desc    Delete company profile
 * @access  Private (company.delete)
 */
router.delete('/:id', requirePermission('company.delete'), validate({ params: companyParamSchema }), companyController.deleteCompany);

export default router;
