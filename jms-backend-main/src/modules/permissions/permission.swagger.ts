/**
 * @openapi
 * components:
 *   schemas:
 *     CreatePermissionRequest:
 *       type: object
 *       required:
 *         - module
 *         - action
 *       properties:
 *         module:
 *           type: string
 *           example: customer
 *         action:
 *           type: string
 *           example: create
 *         permissionKey:
 *           type: string
 *           example: customer.create
 *         description:
 *           type: string
 *           example: Create customer profile
 */

/**
 * @openapi
 * /api/v1/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permission Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePermissionRequest'
 *     responses:
 *       201:
 *         description: Permission created successfully
 *   get:
 *     summary: Get permissions list with search and module filter
 *     tags: [Permission Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions list
 * 
 * /api/v1/permissions/modules/{module}:
 *   get:
 *     summary: Get permissions list by module name
 *     tags: [Permission Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module permission keys
 */
