import { Router } from 'express';
import { roleController } from './role.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { createRoleSchema, updateRoleSchema, assignPermissionsSchema, roleQuerySchema } from './role.validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/roles
 * @desc    Create a new custom ERP role
 * @access  Private (role.create)
 */
router.post('/', requirePermission('role.create'), validate(createRoleSchema), roleController.createRole);

/**
 * @route   GET /api/v1/roles
 * @desc    List all ERP roles with user counts and pagination
 * @access  Private (role.read)
 */
router.get('/', requirePermission('role.read'), validate({ query: roleQuerySchema }), roleController.getRoles);

/**
 * @route   GET /api/v1/roles/:id/permissions
 * @desc    View permissions assigned to a role
 * @access  Private (role.read)
 */
router.get('/:id/permissions', requirePermission('role.read'), roleController.getRolePermissions);

/**
 * @route   PUT /api/v1/roles/:id/permissions
 * @desc    Assign permissions to a role
 * @access  Private (role.assign_permission)
 */
router.put('/:id/permissions', requirePermission('role.assign_permission'), validate(assignPermissionsSchema), roleController.assignPermissions);

/**
 * @route   DELETE /api/v1/roles/:roleId/permissions/:permissionId
 * @desc    Remove single permission from a role
 * @access  Private (role.assign_permission)
 */
router.delete('/:roleId/permissions/:permissionId', requirePermission('role.assign_permission'), roleController.removeSinglePermission);

/**
 * @route   GET /api/v1/roles/:id
 * @desc    Get role details with assigned permissions
 * @access  Private (role.read)
 */
router.get('/:id', requirePermission('role.read'), roleController.getRoleById);

/**
 * @route   PUT /api/v1/roles/:id
 * @desc    Update role details
 * @access  Private (role.update)
 */
router.put('/:id', requirePermission('role.update'), validate(updateRoleSchema), roleController.updateRole);

/**
 * @route   DELETE /api/v1/roles/:id
 * @desc    Delete custom role
 * @access  Private (role.delete)
 */
router.delete('/:id', requirePermission('role.delete'), roleController.deleteRole);

export default router;
