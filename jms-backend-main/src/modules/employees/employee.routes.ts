import { Router } from 'express';
import { employeeController } from './employee.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeParamSchema,
  employeeQuerySchema,
} from './employee.validation';

const router = Router();

// All employee routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/employees
 * @desc    Create a new staff employee record
 * @access  Private (employee.create)
 */
router.post('/', requirePermission('employee.create'), validate(createEmployeeSchema), employeeController.createEmployee);

/**
 * @route   GET /api/v1/employees
 * @desc    Get paginated employee list with search & filters
 * @access  Private (employee.read)
 */
router.get('/', requirePermission('employee.read'), validate({ query: employeeQuerySchema }), employeeController.getEmployees);

/**
 * @route   GET /api/v1/employees/:id
 * @desc    Get employee profile details by ID
 * @access  Private (employee.read)
 */
router.get('/:id', requirePermission('employee.read'), validate({ params: employeeParamSchema }), employeeController.getEmployeeById);

/**
 * @route   PUT /api/v1/employees/:id
 * @desc    Update employee profile details
 * @access  Private (employee.update)
 */
router.put('/:id', requirePermission('employee.update'), validate({ params: employeeParamSchema, body: updateEmployeeSchema }), employeeController.updateEmployee);

/**
 * @route   DELETE /api/v1/employees/:id
 * @desc    Delete employee record
 * @access  Private (employee.delete)
 */
router.delete('/:id', requirePermission('employee.delete'), validate({ params: employeeParamSchema }), employeeController.deleteEmployee);

export default router;
