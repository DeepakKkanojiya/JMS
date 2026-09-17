import { Router } from 'express';
import { permissionController } from './permission.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { createPermissionSchema, updatePermissionSchema, permissionQuerySchema } from './permission.validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/permissions/modules/:module
 * @desc    Get permissions list for a specific module
 * @access  Private (permission.read or role.read)
 */
router.get('/modules/:module', requirePermission('permission.read'), permissionController.getPermissionsByModule);

/**
 * @route   POST /api/v1/permissions
 * @desc    Create a new permission
 * @access  Private (permission.create)
 */
router.post('/', requirePermission('permission.create'), validate(createPermissionSchema), permissionController.createPermission);

/**
 * @route   GET /api/v1/permissions
 * @desc    Get permissions catalog with module/action filters and search
 * @access  Private (permission.read)
 */
router.get('/', requirePermission('permission.read'), validate({ query: permissionQuerySchema }), permissionController.getPermissions);

/**
 * @route   GET /api/v1/permissions/:id
 * @desc    Get permission details by ID
 * @access  Private (permission.read)
 */
router.get('/:id', requirePermission('permission.read'), permissionController.getPermissionById);

/**
 * @route   PUT /api/v1/permissions/:id
 * @desc    Update permission description
 * @access  Private (permission.update)
 */
router.put('/:id', requirePermission('permission.update'), validate(updatePermissionSchema), permissionController.updatePermission);

/**
 * @route   DELETE /api/v1/permissions/:id
 * @desc    Delete custom permission
 * @access  Private (permission.delete)
 */
router.delete('/:id', requirePermission('permission.delete'), permissionController.deletePermission);

export default router;
