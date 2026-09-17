import { Router } from 'express';
import { rbacController } from '../controllers/rbac.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { allowRoles, ROLES } from '../modules/authorization';
import { validate } from '../middleware/validation.middleware';
import {
  paginationQuerySchema,
  uuidParamSchema,
  createUserSchema,
  customerUploadSchema,
} from '../validations';

const router = Router();

// Admin Only User Management Routes
router.get(
  '/users',
  authenticateToken,
  allowRoles(ROLES.ADMIN, ROLES.OWNER),
  validate({ query: paginationQuerySchema }),
  rbacController.getUsers
);

router.get(
  '/users/:id',
  authenticateToken,
  allowRoles(ROLES.ADMIN, ROLES.OWNER),
  validate({ params: uuidParamSchema }),
  rbacController.getUserById
);

router.post(
  '/users',
  authenticateToken,
  allowRoles(ROLES.ADMIN, ROLES.OWNER),
  validate(createUserSchema),
  rbacController.createUser
);

// Staff & Admin Customer Management Routes
router.get(
  '/customers',
  authenticateToken,
  allowRoles(ROLES.ADMIN, ROLES.OWNER, ROLES.STAFF),
  validate({ query: paginationQuerySchema }),
  rbacController.getCustomers
);

router.post(
  '/customer/upload',
  authenticateToken,
  allowRoles(ROLES.ADMIN, ROLES.OWNER, ROLES.STAFF),
  validate({ file: customerUploadSchema }),
  rbacController.uploadCustomerDocument
);

// Staff & Admin Inventory Management Routes
router.get(
  '/inventory',
  authenticateToken,
  allowRoles(ROLES.ADMIN, ROLES.OWNER, ROLES.STAFF),
  validate({ query: paginationQuerySchema }),
  rbacController.getInventory
);

// All Authenticated Users Routes
router.get(
  '/profile',
  authenticateToken,
  allowRoles(ROLES.ADMIN, ROLES.OWNER, ROLES.STAFF, ROLES.USER),
  rbacController.getProfile
);

// Error Simulation Test Endpoints
router.get('/test/db-error', rbacController.testDatabaseError);
router.get('/test/internal-error', rbacController.testInternalError);

export default router;
