import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  resetPasswordSchema,
  changeRoleSchema,
  userQuerySchema,
  userParamSchema,
} from './user.validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get logged-in user profile with permissions
 * @access  Private (Logged-in User)
 */
router.get('/profile', userController.getUserProfile);

/**
 * @route   PATCH /api/v1/users/change-password
 * @desc    Logged-in user changes own password
 * @access  Private (Logged-in User)
 */
router.patch('/change-password', validate(changePasswordSchema), userController.changePassword);

/**
 * @route   POST /api/v1/users
 * @desc    Create a new ERP user
 * @access  Private (user.create)
 */
router.post('/', requirePermission('user.create'), validate(createUserSchema), userController.createUser);

/**
 * @route   GET /api/v1/users
 * @desc    Get paginated user list with search & filters
 * @access  Private (user.read)
 */
router.get('/', requirePermission('user.read'), validate({ query: userQuerySchema }), userController.getUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user details by ID
 * @access  Private (user.read)
 */
router.get('/:id', requirePermission('user.read'), validate({ params: userParamSchema }), userController.getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user profile
 * @access  Private (user.update)
 */
router.put('/:id', requirePermission('user.update'), validate({ params: userParamSchema, body: updateUserSchema }), userController.updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user account
 * @access  Private (user.delete)
 */
router.delete('/:id', requirePermission('user.delete'), validate({ params: userParamSchema }), userController.deleteUser);

/**
 * @route   PATCH /api/v1/users/:id/activate
 * @desc    Activate user account
 * @access  Private (user.update)
 */
router.patch('/:id/activate', requirePermission('user.update'), validate({ params: userParamSchema }), userController.activateUser);

/**
 * @route   PATCH /api/v1/users/:id/deactivate
 * @desc    Deactivate user account
 * @access  Private (user.update)
 */
router.patch('/:id/deactivate', requirePermission('user.update'), validate({ params: userParamSchema }), userController.deactivateUser);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Change user role
 * @access  Private (user.update)
 */
router.patch('/:id/role', requirePermission('user.update'), validate({ params: userParamSchema, body: changeRoleSchema }), userController.changeUserRole);

/**
 * @route   PATCH /api/v1/users/:id/reset-password
 * @desc    Admin reset user password
 * @access  Private (user.update)
 */
router.patch('/:id/reset-password', requirePermission('user.update'), validate({ params: userParamSchema, body: resetPasswordSchema }), userController.resetPassword);

export default router;
