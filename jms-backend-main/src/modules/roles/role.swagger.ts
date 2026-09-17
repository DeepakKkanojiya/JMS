/**
 * @openapi
 * components:
 *   schemas:
 *     CreateRoleRequest:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *       properties:
 *         name:
 *           type: string
 *           example: STORE_MANAGER
 *         displayName:
 *           type: string
 *           example: Store Manager
 *         description:
 *           type: string
 *           example: Manage daily store operations
 *     AssignPermissionsRequest:
 *       type: object
 *       required:
 *         - permissionIds
 *       properties:
 *         permissionIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 */

/**
 * @openapi
 * /api/v1/roles:
 *   post:
 *     summary: Create a new custom role
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleRequest'
 *     responses:
 *       201:
 *         description: Role created successfully
 *   get:
 *     summary: Get all roles
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles list
 * 
 * /api/v1/permissions:
 *   get:
 *     summary: Get all available permissions catalog
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions catalog
 */
